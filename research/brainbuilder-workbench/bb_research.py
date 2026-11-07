#!/usr/bin/env python3
"""A small, offline, evidence-first market-research workbench (Python 3.10+).

This program makes no network requests. Sources are discovered and checked by a
researcher, then imported with provenance. Captured thread counts are not market
prevalence, willingness-to-pay validation, or learning-effectiveness estimates.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import io
import json
from pathlib import Path
import re
import sqlite3
import sys
from datetime import date, datetime, timezone
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


VERSION = "0.1.0"
SCHEMA_VERSION = 1
KINDS = ("customer_signal", "competitor_claim", "learning_research", "founder_hypothesis")
SOURCE_TYPES = (
    "reddit", "forum", "app_review", "official_product", "research_paper",
    "interview", "support_ticket", "other",
)
ACCESS = ("full_text", "abstract", "snippet", "metadata", "not_reviewed")
QUALITY = ("high", "medium", "low", "unclear")
REVIEW = ("unreviewed", "verified", "rejected")
REVIEWER_TYPES = ("human", "assistant", "unknown")
RELATIONS = ("supports", "contradicts", "context", "unclassified")
TRACKING_PARAMS = {"fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid", "igshid"}
EVIDENCE_FIELDS = (
    "evidence_id", "source_url", "title", "evidence_kind", "source_type", "retrieved_at",
    "thread_url", "published_at", "content_access", "provenance_notes", "segment",
    "problem", "job_to_be_done", "observation", "inference", "quote", "workaround",
    "willingness_to_pay", "negative_evidence", "evidence_quality", "review_status",
    "reviewer_type", "reviewed_by", "reviewed_at", "tags", "hypothesis_ids",
)
REQUIRED = ("source_url", "title", "evidence_kind", "source_type", "retrieved_at", "observation")
TEXT_FIELDS = (
    "source_url", "title", "evidence_kind", "source_type", "retrieved_at", "thread_url",
    "published_at", "content_access", "provenance_notes", "segment", "problem",
    "job_to_be_done", "observation", "inference", "quote", "workaround",
    "willingness_to_pay", "negative_evidence", "evidence_quality", "review_status",
    "reviewer_type", "reviewed_by", "reviewed_at",
)
STORED_FIELDS = ("evidence_id",) + TEXT_FIELDS + ("canonical_url", "thread_key", "tags", "fingerprint")


class ResearchError(ValueError):
    """Invalid input, unsupported state, or an intentional import guard."""


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_date(value: str, name: str, *, optional: bool = False) -> str:
    if value == "" and optional:
        return ""
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise ResearchError(f"{name} must use YYYY-MM-DD; omit it if the date is unknown")
    try:
        date.fromisoformat(value)
    except ValueError as exc:
        raise ResearchError(f"Invalid calendar date for {name}: {value}") from exc
    return value


def canonicalize_url(raw: str) -> str:
    """Remove tracking, normalize ordering/hosts, preserve meaningful parameters.

    Reddit permalink titles are not identifiers; post/comment IDs are. All other
    hosts retain their paths and query values. We do not infer parent threads for
    arbitrary forum comments: provide thread_url when that relationship is known.
    """
    raw = raw.strip()
    try:
        parts = urlsplit(raw)
        port = parts.port
    except ValueError as exc:
        raise ResearchError(f"Invalid URL: {raw}") from exc
    if parts.scheme.lower() not in ("http", "https") or not parts.hostname:
        raise ResearchError("Source and thread URLs must be absolute http(s) URLs")
    if parts.username is not None or parts.password is not None:
        raise ResearchError("Source URLs must not contain credentials")
    if any(ord(c) < 32 for c in raw):
        raise ResearchError("URLs must not contain control characters")
    scheme = parts.scheme.lower()
    host = parts.hostname.lower().encode("idna").decode("ascii")
    if host == "reddit.com" or re.fullmatch(r"(?:www|old|new|m|np|[a-z]{2}(?:-[a-z]{2})?)\.reddit\.com", host):
        host = "reddit.com"
        scheme = "https"
    path = parts.path or "/"
    if host == "reddit.com":
        match = re.match(r"^/(?:r/[^/]+/)?comments/([A-Za-z0-9]+)(?:/[^/]+)?(?:/([A-Za-z0-9]+))?/?$", path)
        if match:
            post, comment = match.groups()
            path = "/comments/" + post.lower() + ("/_/" + comment.lower() if comment else "")
    if path != "/":
        path = path.rstrip("/")
    query = sorted(
        (key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not key.lower().startswith("utm_") and key.lower() not in TRACKING_PARAMS
        and not (host == "reddit.com" and key.lower() in ("sort", "context", "depth", "limit", "show", "st", "sh"))
    )
    netloc = f"[{host}]" if ":" in host else host
    if port and not ((scheme == "https" and port == 443) or (scheme == "http" and port == 80)):
        netloc += f":{port}"
    return urlunsplit((scheme, netloc, path, urlencode(query), ""))


def independent_thread_key(source_url: str, thread_url: str = "") -> str:
    canonical = canonicalize_url(thread_url or source_url)
    parts = urlsplit(canonical)
    if parts.hostname == "reddit.com":
        match = re.match(r"^/comments/([A-Za-z0-9]+)(?:/|$)", parts.path)
        if match:
            return "https://reddit.com/comments/" + match.group(1).lower()
    if parts.hostname in ("github.com", "www.github.com"):
        match = re.match(r"^/([^/]+/[^/]+/(?:issues|pull)/\d+)(?:/|$)", parts.path)
        if match:
            return "https://github.com/" + match.group(1)
    return canonical


def list_field(value: Any, name: str) -> list[str]:
    if value is None or value == "":
        return []
    if isinstance(value, str):
        if value.lstrip().startswith("["):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as exc:
                raise ResearchError(f"{name} contains invalid JSON") from exc
        else:
            value = value.split(";")
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        raise ResearchError(f"{name} must be a list of strings or a semicolon-separated string")
    return sorted(set(v.strip() for v in value if v.strip()))


def normalize_record(raw: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raise ResearchError("Each evidence row must be an object")
    unknown = set(raw) - set(EVIDENCE_FIELDS)
    if unknown:
        raise ResearchError("Unknown evidence field(s): " + ", ".join(sorted(unknown)))
    for key in REQUIRED:
        if not isinstance(raw.get(key), str) or not raw[key].strip():
            raise ResearchError(f"{key} is required and must be non-empty text")
    row: dict[str, Any] = {}
    defaults = {
        "content_access": "not_reviewed", "evidence_quality": "unclear",
        "review_status": "unreviewed", "reviewer_type": "unknown",
    }
    for field in TEXT_FIELDS:
        value = raw.get(field)
        if value is None or value == "":
            value = defaults.get(field, "")
        if not isinstance(value, str):
            raise ResearchError(f"{field} must be text, not {type(value).__name__}")
        row[field] = value.strip()
    for key, allowed in (
        ("evidence_kind", KINDS), ("source_type", SOURCE_TYPES), ("content_access", ACCESS),
        ("evidence_quality", QUALITY), ("review_status", REVIEW), ("reviewer_type", REVIEWER_TYPES),
    ):
        if row[key] not in allowed:
            raise ResearchError(f"{key} must be one of: {', '.join(allowed)}")
    parse_date(row["retrieved_at"], "retrieved_at")
    parse_date(row["published_at"], "published_at", optional=True)
    parse_date(row["reviewed_at"], "reviewed_at", optional=True)
    if row["review_status"] == "verified":
        if not row["reviewed_by"] or not row["reviewed_at"] or row["reviewer_type"] == "unknown":
            raise ResearchError("verified rows require reviewed_by, reviewed_at and reviewer_type (human or assistant)")
        if row["content_access"] == "not_reviewed":
            raise ResearchError("A source cannot be verified while content_access is not_reviewed")
    row["canonical_url"] = canonicalize_url(row["source_url"])
    row["thread_key"] = independent_thread_key(row["source_url"], row["thread_url"])
    row["tags"] = json.dumps(list_field(raw.get("tags"), "tags"), ensure_ascii=False)
    row["hypothesis_ids"] = list_field(raw.get("hypothesis_ids"), "hypothesis_ids")
    normalized_observation = " ".join(row["observation"].split()).casefold()
    material = json.dumps([row["canonical_url"], row["evidence_kind"], normalized_observation], ensure_ascii=False)
    row["fingerprint"] = hashlib.sha256(material.encode()).hexdigest()
    evidence_id = raw.get("evidence_id") or "ev_" + row["fingerprint"][:16]
    if not isinstance(evidence_id, str) or not re.fullmatch(r"[A-Za-z0-9_.:-]{1,100}", evidence_id):
        raise ResearchError("evidence_id must be 1–100 letters, numbers, dots, colons, underscores or hyphens")
    row["evidence_id"] = evidence_id
    return row


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY,
    source_url TEXT NOT NULL, title TEXT NOT NULL, evidence_kind TEXT NOT NULL,
    source_type TEXT NOT NULL, retrieved_at TEXT NOT NULL,
    thread_url TEXT NOT NULL DEFAULT '', published_at TEXT NOT NULL DEFAULT '',
    content_access TEXT NOT NULL DEFAULT 'not_reviewed', provenance_notes TEXT NOT NULL DEFAULT '',
    segment TEXT NOT NULL DEFAULT '', problem TEXT NOT NULL DEFAULT '', job_to_be_done TEXT NOT NULL DEFAULT '',
    observation TEXT NOT NULL, inference TEXT NOT NULL DEFAULT '', quote TEXT NOT NULL DEFAULT '',
    workaround TEXT NOT NULL DEFAULT '', willingness_to_pay TEXT NOT NULL DEFAULT '',
    negative_evidence TEXT NOT NULL DEFAULT '', evidence_quality TEXT NOT NULL DEFAULT 'unclear',
    review_status TEXT NOT NULL DEFAULT 'unreviewed', reviewer_type TEXT NOT NULL DEFAULT 'unknown',
    reviewed_by TEXT NOT NULL DEFAULT '', reviewed_at TEXT NOT NULL DEFAULT '',
    canonical_url TEXT NOT NULL, thread_key TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]',
    fingerprint TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_evidence_thread ON evidence(thread_key);
CREATE INDEX IF NOT EXISTS idx_evidence_kind ON evidence(evidence_kind);
CREATE TABLE IF NOT EXISTS evidence_revisions (
    revision_id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id TEXT NOT NULL, changed_at TEXT NOT NULL, previous_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS hypotheses (
    hypothesis_id TEXT PRIMARY KEY,
    statement TEXT NOT NULL, segment TEXT NOT NULL DEFAULT '', job_to_be_done TEXT NOT NULL DEFAULT '',
    riskiest_assumption TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'proposed',
    decision_rule TEXT NOT NULL DEFAULT '', next_test TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS evidence_hypotheses (
    evidence_id TEXT NOT NULL REFERENCES evidence(evidence_id),
    hypothesis_id TEXT NOT NULL REFERENCES hypotheses(hypothesis_id),
    relationship TEXT NOT NULL DEFAULT 'unclassified',
    PRIMARY KEY (evidence_id, hypothesis_id)
);
CREATE TABLE IF NOT EXISTS query_log (
    query_id TEXT PRIMARY KEY, performed_at TEXT NOT NULL, channel TEXT NOT NULL,
    query TEXT NOT NULL, search_url TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'completed',
    results_returned INTEGER, results_reviewed INTEGER, included_threads INTEGER,
    notes TEXT NOT NULL DEFAULT '', reviewer TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
"""


def connect_db(path: str | Path) -> sqlite3.Connection:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    version = conn.execute("PRAGMA user_version").fetchone()[0]
    if version not in (0, SCHEMA_VERSION):
        conn.close()
        raise ResearchError(f"Database schema {version} is incompatible with schema {SCHEMA_VERSION}")
    conn.executescript(SCHEMA_SQL)
    conn.execute(f"PRAGMA user_version={SCHEMA_VERSION}")
    conn.commit()
    return conn


def load_rows(path: str | Path) -> list[dict[str, Any]]:
    path = Path(path)
    suffix = path.suffix.lower()
    with path.open(encoding="utf-8-sig", newline="") as handle:
        if suffix == ".csv":
            reader = csv.DictReader(handle)
            if not reader.fieldnames:
                raise ResearchError("CSV input needs a header row")
            if len(reader.fieldnames) != len(set(reader.fieldnames)):
                raise ResearchError("CSV input has duplicate header names")
            rows = list(reader)
        elif suffix in (".jsonl", ".ndjson"):
            rows = []
            for line_number, line in enumerate(handle, 1):
                if line.strip():
                    try:
                        rows.append(json.loads(line))
                    except json.JSONDecodeError as exc:
                        raise ResearchError(f"Invalid JSON at line {line_number}: {exc.msg}") from exc
        elif suffix == ".json":
            try:
                rows = json.load(handle)
            except json.JSONDecodeError as exc:
                raise ResearchError(f"Invalid JSON: {exc.msg}") from exc
            if isinstance(rows, dict) and set(rows) == {"records"}:
                rows = rows["records"]
        else:
            raise ResearchError("Input must be .json, .jsonl, .ndjson or .csv")
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        raise ResearchError("Input must be an array of objects, JSONL objects, or CSV records")
    return rows


def ingest(conn: sqlite3.Connection, rows: list[dict[str, Any]], *, update: bool = False) -> dict[str, Any]:
    normalized: list[dict[str, Any]] = []
    for number, raw in enumerate(rows, 1):
        try:
            normalized.append(normalize_record(raw))
        except ResearchError as exc:
            raise ResearchError(f"Evidence row {number}: {exc}") from exc
    seen: dict[str, str] = {}
    for row in normalized:
        eid = row["evidence_id"]
        payload = json.dumps({k: row[k] for k in STORED_FIELDS}, sort_keys=True)
        if eid in seen and seen[eid] != payload:
            raise ResearchError(f"Conflicting records for evidence_id {eid} in the same input file")
        seen[eid] = payload
    known_hypotheses = {r[0] for r in conn.execute("SELECT hypothesis_id FROM hypotheses")}
    missing = sorted({h for row in normalized for h in row["hypothesis_ids"]} - known_hypotheses)
    if missing:
        raise ResearchError("Import hypotheses before linking these IDs: " + ", ".join(missing))
    counts: dict[str, Any] = {"received": len(rows), "inserted": 0, "updated": 0, "unchanged": 0, "existing_needs_update": 0, "ids": []}
    now = utc_now()
    with conn:
        for row in normalized:
            existing_id = conn.execute("SELECT * FROM evidence WHERE evidence_id=?", (row["evidence_id"],)).fetchone()
            duplicate = conn.execute("SELECT * FROM evidence WHERE fingerprint=?", (row["fingerprint"],)).fetchone()
            if existing_id and duplicate and existing_id["evidence_id"] != duplicate["evidence_id"]:
                raise ResearchError(f"Update for {row['evidence_id']} duplicates existing evidence {duplicate['evidence_id']}")
            existing = existing_id or duplicate
            if existing:
                actual_id = existing["evidence_id"]
                row["evidence_id"] = actual_id
                changed = any(existing[field] != row[field] for field in STORED_FIELDS)
                if changed and update:
                    conn.execute("INSERT INTO evidence_revisions(evidence_id,changed_at,previous_json) VALUES(?,?,?)", (actual_id, now, json.dumps(dict(existing), ensure_ascii=False)))
                    fields = [field for field in STORED_FIELDS if field != "evidence_id"]
                    conn.execute("UPDATE evidence SET " + ",".join(f"{field}=?" for field in fields) + ",updated_at=? WHERE evidence_id=?", [row[field] for field in fields] + [now, actual_id])
                    counts["updated"] += 1
                elif changed:
                    if existing_id and existing_id["fingerprint"] != row["fingerprint"]:
                        raise ResearchError(f"Existing ID {actual_id} has different content; use --update after reviewing the change")
                    counts["existing_needs_update"] += 1
                else:
                    counts["unchanged"] += 1
            else:
                actual_id = row["evidence_id"]
                columns = STORED_FIELDS + ("created_at", "updated_at")
                conn.execute("INSERT INTO evidence (" + ",".join(columns) + ") VALUES (" + ",".join("?" for _ in columns) + ")", [row[field] for field in STORED_FIELDS] + [now, now])
                counts["inserted"] += 1
            for hid in row["hypothesis_ids"]:
                conn.execute("INSERT OR IGNORE INTO evidence_hypotheses(evidence_id,hypothesis_id) VALUES(?,?)", (actual_id, hid))
            counts["ids"].append(actual_id)
    return counts


HYPOTHESIS_FIELDS = ("hypothesis_id", "statement", "segment", "job_to_be_done", "riskiest_assumption", "status", "decision_rule", "next_test", "notes")


def import_hypotheses(conn: sqlite3.Connection, rows: list[dict[str, Any]], *, update: bool = False) -> dict[str, int]:
    prepared = []
    for number, raw in enumerate(rows, 1):
        if set(raw) - set(HYPOTHESIS_FIELDS):
            raise ResearchError(f"Hypothesis row {number} has unknown fields")
        row = {}
        for field in HYPOTHESIS_FIELDS:
            value = raw.get(field) or ("proposed" if field == "status" else "")
            if not isinstance(value, str):
                raise ResearchError(f"Hypothesis {field} must be text")
            row[field] = value.strip()
        if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,100}", row["hypothesis_id"]) or not row["statement"]:
            raise ResearchError(f"Hypothesis row {number} needs a valid hypothesis_id and a statement")
        if row["status"] not in ("proposed", "testing", "supported", "rejected", "paused"):
            raise ResearchError(f"Hypothesis row {number} has invalid status")
        prepared.append(row)
    counts = {"inserted": 0, "updated": 0, "unchanged": 0}
    with conn:
        for row in prepared:
            existing = conn.execute("SELECT * FROM hypotheses WHERE hypothesis_id=?", (row["hypothesis_id"],)).fetchone()
            if existing:
                if all(existing[field] == row[field] for field in HYPOTHESIS_FIELDS):
                    counts["unchanged"] += 1
                elif update:
                    fields = HYPOTHESIS_FIELDS[1:]
                    conn.execute("UPDATE hypotheses SET " + ",".join(f"{f}=?" for f in fields) + ",updated_at=? WHERE hypothesis_id=?", [row[f] for f in fields] + [utc_now(), row["hypothesis_id"]])
                    counts["updated"] += 1
                else:
                    raise ResearchError(f"Hypothesis {row['hypothesis_id']} differs; use --update deliberately")
            else:
                fields = HYPOTHESIS_FIELDS + ("created_at", "updated_at")
                now = utc_now()
                conn.execute("INSERT INTO hypotheses (" + ",".join(fields) + ") VALUES (" + ",".join("?" for _ in fields) + ")", [row[f] for f in HYPOTHESIS_FIELDS] + [now, now])
                counts["inserted"] += 1
    return counts


QUERY_FIELDS = ("query_id", "performed_at", "channel", "query", "search_url", "status", "results_returned", "results_reviewed", "included_threads", "notes", "reviewer")


def normalize_query(raw: dict[str, Any]) -> dict[str, Any]:
    if set(raw) - set(QUERY_FIELDS):
        raise ResearchError("Query log has unknown fields: " + ", ".join(sorted(set(raw) - set(QUERY_FIELDS))))
    row: dict[str, Any] = {}
    for field in QUERY_FIELDS:
        value = raw.get(field)
        if field in ("results_returned", "results_reviewed", "included_threads"):
            if value is None or value == "":
                row[field] = None
            elif isinstance(value, bool) or not re.fullmatch(r"\d+", str(value)):
                raise ResearchError(f"{field} must be a nonnegative integer or empty/unknown")
            else:
                row[field] = int(value)
        else:
            value = value or ("completed" if field == "status" else "")
            if not isinstance(value, str):
                raise ResearchError(f"Query {field} must be text")
            row[field] = value.strip()
    parse_date(row["performed_at"], "performed_at")
    if not row["channel"] or not row["query"]:
        raise ResearchError("Query logs need channel and query")
    if row["status"] not in ("planned", "completed", "blocked"):
        raise ResearchError("Query status must be planned, completed or blocked")
    if row["search_url"]:
        canonicalize_url(row["search_url"])
    for earlier, later in (("results_returned", "results_reviewed"), ("results_reviewed", "included_threads")):
        if row[earlier] is not None and row[later] is not None and row[later] > row[earlier]:
            raise ResearchError(f"{later} cannot exceed {earlier} for one query log")
    if row["status"] == "planned" and any(row[field] is not None for field in ("results_returned", "results_reviewed", "included_threads")):
        raise ResearchError("Planned queries cannot claim performed-work counts")
    if not row["query_id"]:
        material = json.dumps([row["performed_at"], row["channel"], row["query"]])
        row["query_id"] = "q_" + hashlib.sha256(material.encode()).hexdigest()[:16]
    return row


def import_queries(conn: sqlite3.Connection, rows: list[dict[str, Any]], *, update: bool = False) -> dict[str, int]:
    prepared = [normalize_query(row) for row in rows]
    counts = {"inserted": 0, "updated": 0, "unchanged": 0}
    with conn:
        for row in prepared:
            existing = conn.execute("SELECT * FROM query_log WHERE query_id=?", (row["query_id"],)).fetchone()
            if existing:
                if all(existing[field] == row[field] for field in QUERY_FIELDS):
                    counts["unchanged"] += 1
                elif update:
                    fields = QUERY_FIELDS[1:]
                    conn.execute("UPDATE query_log SET " + ",".join(f"{f}=?" for f in fields) + " WHERE query_id=?", [row[f] for f in fields] + [row["query_id"]])
                    counts["updated"] += 1
                else:
                    raise ResearchError(f"Query {row['query_id']} differs; use --update deliberately")
            else:
                fields = QUERY_FIELDS + ("created_at",)
                conn.execute("INSERT INTO query_log (" + ",".join(fields) + ") VALUES (" + ",".join("?" for _ in fields) + ")", [row[f] for f in QUERY_FIELDS] + [utc_now()])
                counts["inserted"] += 1
    return counts


def link_evidence(conn: sqlite3.Connection, evidence_id: str, hypothesis_id: str, relationship: str) -> None:
    if relationship not in RELATIONS:
        raise ResearchError("Invalid evidence relationship")
    if not conn.execute("SELECT 1 FROM evidence WHERE evidence_id=?", (evidence_id,)).fetchone():
        raise ResearchError(f"Unknown evidence_id: {evidence_id}")
    if not conn.execute("SELECT 1 FROM hypotheses WHERE hypothesis_id=?", (hypothesis_id,)).fetchone():
        raise ResearchError(f"Unknown hypothesis_id: {hypothesis_id}")
    with conn:
        conn.execute("INSERT INTO evidence_hypotheses VALUES(?,?,?) ON CONFLICT(evidence_id,hypothesis_id) DO UPDATE SET relationship=excluded.relationship", (evidence_id, hypothesis_id, relationship))


def import_links(conn: sqlite3.Connection, rows: list[dict[str, Any]]) -> dict[str, int]:
    evidence_ids = {r[0] for r in conn.execute("SELECT evidence_id FROM evidence")}
    hypothesis_ids = {r[0] for r in conn.execute("SELECT hypothesis_id FROM hypotheses")}
    prepared = []
    for number, row in enumerate(rows, 1):
        if set(row) - {"evidence_id", "hypothesis_id", "relationship"}:
            raise ResearchError(f"Link row {number} has unknown fields")
        eid, hid, relation = row.get("evidence_id"), row.get("hypothesis_id"), row.get("relationship", "unclassified")
        if eid not in evidence_ids or hid not in hypothesis_ids or relation not in RELATIONS:
            raise ResearchError(f"Link row {number} needs existing evidence/hypothesis IDs and a valid relationship")
        prepared.append((eid, hid, relation))
    with conn:
        conn.executemany("INSERT INTO evidence_hypotheses VALUES(?,?,?) ON CONFLICT(evidence_id,hypothesis_id) DO UPDATE SET relationship=excluded.relationship", prepared)
    return {"links_applied": len(prepared)}


def read_evidence(conn: sqlite3.Connection, *, as_of: str, stale_days: int = 90) -> list[dict[str, Any]]:
    parse_date(as_of, "as_of")
    if stale_days < 1:
        raise ResearchError("stale_days must be positive")
    anchor = date.fromisoformat(as_of)
    rows = []
    for record in conn.execute("SELECT * FROM evidence ORDER BY evidence_kind, problem, evidence_id"):
        row = dict(record)
        age = (anchor - date.fromisoformat(row["retrieved_at"])).days
        row["capture_age_days"] = age
        row["stale"] = age > stale_days
        row["future_capture_date"] = age < 0
        row["tags"] = json.loads(row["tags"])
        row["hypothesis_ids"] = [r[0] for r in conn.execute("SELECT hypothesis_id FROM evidence_hypotheses WHERE evidence_id=? ORDER BY hypothesis_id", (row["evidence_id"],))]
        rows.append(row)
    return rows


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    customer = [r for r in rows if r["evidence_kind"] == "customer_signal" and r["review_status"] != "rejected"]
    checked = [r for r in customer if r["review_status"] == "verified"]
    human = [r for r in checked if r["reviewer_type"] == "human"]
    problems = []
    for problem in sorted({r["problem"] or "Uncoded" for r in customer}):
        relevant = [r for r in customer if (r["problem"] or "Uncoded") == problem]
        problems.append({
            "problem": problem,
            "distinct_customer_threads": len({r["thread_key"] for r in relevant}),
            "source_checked_threads": len({r["thread_key"] for r in relevant if r["review_status"] == "verified"}),
            "human_checked_threads": len({r["thread_key"] for r in relevant if r["review_status"] == "verified" and r["reviewer_type"] == "human"}),
            "full_text_threads": len({r["thread_key"] for r in relevant if r["content_access"] == "full_text"}),
            "observations": len(relevant),
        })
    problems.sort(key=lambda r: (-r["distinct_customer_threads"], r["problem"]))
    return {
        "total_observations": len(rows),
        "by_kind": {kind: sum(r["evidence_kind"] == kind for r in rows) for kind in KINDS},
        "distinct_customer_threads": len({r["thread_key"] for r in customer}),
        "source_checked_customer_threads": len({r["thread_key"] for r in checked}),
        "human_checked_customer_threads": len({r["thread_key"] for r in human}),
        "rejected_observations": sum(r["review_status"] == "rejected" for r in rows),
        "stale_observations": sum(r["stale"] for r in rows),
        "future_capture_dates": sum(r["future_capture_date"] for r in rows),
        "problems": problems,
        "interpretation": "Counts describe this deliberately collected corpus only. They are not market prevalence or independent people. Several observations in one thread count once per problem; problem rows can overlap.",
    }


def csv_safe(value: Any) -> str:
    """Neutralize spreadsheet formulas; JSON export preserves exact raw strings."""
    if value is None:
        return ""
    if isinstance(value, (list, dict)):
        value = json.dumps(value, ensure_ascii=False)
    text = str(value)
    if text.lstrip(" \t\r\n").startswith(("=", "+", "-", "@")) or text.startswith(("\t", "\r")):
        return "'" + text
    return text


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str] | tuple[str, ...]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: csv_safe(row.get(field)) for field in fields})


STYLE = """
:root{--bg:#f4f2ed;--ink:#20242c;--muted:#606774;--line:#dedfdc;--purple:#5c438c;--paper:#fff;--green:#21644a;--amber:#91651a}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}main{max-width:1400px;margin:auto;padding:40px 28px 72px}header{border-bottom:1px solid var(--line);padding-bottom:24px}h1{font-size:36px;line-height:1.14;margin:10px 0 14px;letter-spacing:-1.3px}h2{font-size:22px;letter-spacing:-.4px;margin:32px 0 14px}h3{font-size:17px;margin:0 0 6px}p{margin:8px 0}.eyebrow{letter-spacing:.14em;text-transform:uppercase;font-size:11px;font-weight:750;color:var(--purple)}.muted{color:var(--muted)}.note{border-left:3px solid var(--purple);padding:12px 16px;background:#eeebf5;max-width:1040px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0}.metric{border:1px solid var(--line);border-radius:12px;padding:18px;background:var(--paper)}.metric b{display:block;font-size:30px;line-height:1.1}.metric span{font-size:13px;color:var(--muted)}.toolbar{display:flex;gap:10px;flex-wrap:wrap;position:sticky;top:0;background:var(--bg);z-index:2;padding:12px 0 18px}input,select{font:inherit;border:1px solid #b9bdc2;background:#fff;border-radius:7px;padding:10px 12px;color:var(--ink)}input{flex:1;min-width:220px}a{color:#4a3586;text-underline-offset:3px}a:hover{color:#2d1b56}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px;background:#fff}table{border-collapse:collapse;width:100%;font-size:13px}th{text-align:left;background:#eae8e3;font-weight:650}td,th{padding:12px 14px;border-bottom:1px solid var(--line);vertical-align:top}td.num{font-variant-numeric:tabular-nums;text-align:right}tr:last-child td{border-bottom:none}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.card{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:20px;overflow-wrap:anywhere}.card[hidden]{display:none}.card p{font-size:14px}.meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.badge{display:inline-block;background:#eeeaf6;color:#51357d;padding:3px 7px;border-radius:5px;font-size:11px;font-weight:600}.badge.customer_signal{background:#e4efe8;color:var(--green)}.badge.competitor_claim{background:#f8edd9;color:var(--amber)}.badge.learning_research{background:#e8edf8;color:#294575}.badge.stale{background:#fbe4df;color:#8a3827}.label{font-weight:650;color:#444e5c}.card footer{font-size:12px;border-top:1px solid var(--line);margin-top:14px;padding-top:12px;color:var(--muted)}details{margin-top:12px}summary{cursor:pointer;font-weight:600;font-size:13px}code{font-size:.9em}blockquote{border-left:2px solid #cfc6df;margin:10px 0;padding:0 12px;color:#4f5661}.empty{padding:22px;border:1px dashed #b9bdc2;border-radius:10px;background:#fff}button{font:inherit;background:var(--purple);color:white;border:0;border-radius:7px;padding:10px 14px;cursor:pointer}.print-note{font-size:12px;color:var(--muted);margin-top:34px}@media(max-width:850px){.metrics{grid-template-columns:repeat(2,1fr)}.cards{grid-template-columns:1fr}main{padding:24px 16px}h1{font-size:29px}.toolbar{position:static}}@media print{body{background:white}.toolbar{display:none}.cards{display:block}.card{break-inside:avoid;margin:12px 0}a{color:inherit}.card[hidden]{display:none}.table-wrap{overflow:visible}}
"""


STYLE += """
.section-nav{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 6px}.section-nav a{display:inline-block;padding:7px 12px;border:1px solid var(--line);border-radius:7px;background:var(--paper);font-size:13px;font-weight:600;text-decoration:none}.section-nav a:hover,.section-nav a:focus-visible{border-color:var(--purple);background:#eeebf5}header[id],h2[id]{scroll-margin-top:92px}.coverage-details{padding:14px 16px;border:1px solid var(--line);border-radius:10px;background:var(--paper)}.coverage-details>summary{font-size:14px;color:var(--purple)}.coverage-details[open]>summary{margin-bottom:14px}.coverage-details .table-wrap{max-width:100%;overflow:auto}
"""


def escape(value: Any) -> str:
    return html.escape(str(value), quote=True)


def table_html(rows: list[dict[str, Any]], fields: list[tuple[str, str]]) -> str:
    if not rows:
        return '<div class="empty">No records captured yet.</div>'
    head = "".join("<th>" + escape(label) + "</th>" for _, label in fields)
    body = "".join("<tr>" + "".join("<td>" + escape("Unknown" if row.get(key) is None else row.get(key, "")) + "</td>" for key, _ in fields) + "</tr>" for row in rows)
    return '<div class="table-wrap"><table><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table></div>"


def report_html(rows: list[dict[str, Any]], summary: dict[str, Any], hypotheses: list[dict[str, Any]], links: list[dict[str, Any]], queries: list[dict[str, Any]], *, as_of: str, stale_days: int) -> str:
    cards = []
    for row in rows:
        kind = row["evidence_kind"]
        badges = '<span class="badge ' + escape(kind) + '">' + escape(kind.replace("_", " ")) + "</span>"
        badges += '<span class="badge">' + escape(row["content_access"].replace("_", " ")) + "</span>"
        badges += '<span class="badge">' + escape(row["review_status"] + " · " + row["reviewer_type"]) + "</span>"
        if row["stale"]:
            badges += '<span class="badge stale">capture needs refresh</span>'
        if row["future_capture_date"]:
            badges += '<span class="badge stale">capture date after report date</span>'
        content = '<p><span class="label">Observed:</span> ' + escape(row["observation"]) + "</p>"
        for field, label in (("inference", "Interpretation"), ("workaround", "Workaround"), ("willingness_to_pay", "Payment evidence"), ("negative_evidence", "Counterevidence")):
            if row[field]:
                content += '<p><span class="label">' + label + ":</span> " + escape(row[field]) + "</p>"
        details = ""
        if row["quote"]:
            details += "<blockquote>" + escape(row["quote"]) + "</blockquote>"
        details += '<p><span class="label">Independent thread:</span> ' + escape(row["thread_key"]) + "</p>"
        details += '<p><span class="label">Provenance:</span> ' + escape(row["provenance_notes"] or "Not specified") + "</p>"
        details += '<p><span class="label">Review:</span> ' + escape(" · ".join(filter(None, (row["reviewed_by"], row["reviewed_at"]))) or "No reviewer recorded") + "</p>"
        details += '<p><span class="label">Hypotheses:</span> ' + escape(", ".join(row["hypothesis_ids"]) or "Not linked") + "</p>"
        searchable = " ".join(str(row.get(k, "")) for k in ("title", "observation", "inference", "segment", "problem", "workaround", "willingness_to_pay", "negative_evidence", "tags", "evidence_id"))
        card = (
            '<article class="card" data-kind="' + escape(kind) + '" data-review="' + escape(row["review_status"]) + '" data-segment="' + escape(row["segment"] or "Uncoded") + '" data-search="' + escape(searchable.casefold()) + '">'
            '<div class="meta">' + badges + '</div><h3><a rel="noreferrer noopener" target="_blank" href="' + escape(row["source_url"]) + '">' + escape(row["title"]) + "</a></h3>"
            '<p class="muted">' + escape((row["segment"] or "Uncoded segment") + " · " + (row["problem"] or "Uncoded problem")) + "</p>" + content
            + "<details><summary>Source details and caveats</summary>" + details + "</details>"
            + "<footer>" + escape(row["evidence_id"]) + " · Captured " + escape(row["retrieved_at"]) + " · Published " + escape(row["published_at"] or "unknown") + " · Quality " + escape(row["evidence_quality"]) + "</footer></article>"
        )
        cards.append(card)
    kinds_options = '<option value="">All evidence kinds</option>' + "".join('<option value="' + escape(k) + '">' + escape(k.replace("_", " ")) + "</option>" for k in KINDS)
    review_options = '<option value="">All review states</option>' + "".join('<option value="' + escape(k) + '">' + escape(k) + "</option>" for k in REVIEW)
    segment_options = '<option value="">All segments</option>' + "".join('<option value="' + escape(k) + '">' + escape(k) + "</option>" for k in sorted({r["segment"] or "Uncoded" for r in rows}))
    hypothesis_rows = []
    evidence_by_id = {r["evidence_id"]: r for r in rows}
    for hypothesis in hypotheses:
        hrow = dict(hypothesis)
        for relation in RELATIONS:
            related = [evidence_by_id[link["evidence_id"]] for link in links if link["hypothesis_id"] == hypothesis["hypothesis_id"] and link["relationship"] == relation and link["evidence_id"] in evidence_by_id]
            customer = [r for r in related if r["evidence_kind"] == "customer_signal" and r["review_status"] != "rejected"]
            hrow[relation + "_threads"] = len({r["thread_key"] for r in customer})
        hypothesis_rows.append(hrow)
    problem_table = table_html(summary["problems"], [("problem", "Coded problem"), ("distinct_customer_threads", "Captured customer threads"), ("source_checked_threads", "Source checked"), ("human_checked_threads", "Human checked"), ("full_text_threads", "Full-text access"), ("observations", "Observations")])
    hypothesis_table = table_html(hypothesis_rows, [("hypothesis_id", "ID"), ("statement", "Hypothesis"), ("status", "State"), ("supports_threads", "Supporting customer threads"), ("contradicts_threads", "Contradicting customer threads"), ("decision_rule", "Predeclared decision rule"), ("next_test", "Next test")])
    query_table = table_html(queries, [("performed_at", "Date"), ("channel", "Channel"), ("query", "Query"), ("status", "Status"), ("results_returned", "Results returned"), ("results_reviewed", "Unique sources screened"), ("included_threads", "Included threads"), ("notes", "Limits / notes")])
    stats = "".join('<div class="metric"><b>' + str(value) + '</b><span>' + label + "</span></div>" for value, label in (
        (summary["distinct_customer_threads"], "distinct captured customer threads"),
        (summary["source_checked_customer_threads"], "customer threads with a source check"),
        (summary["human_checked_customer_threads"], "customer threads with a human check"),
        (summary["total_observations"], "observations across all evidence kinds"),
    ))
    script = """
const cards = Array.from(document.querySelectorAll('.card'));
const search = document.getElementById('search');
const kind = document.getElementById('kind');
const review = document.getElementById('review');
const segment = document.getElementById('segment');
function filterCards(){
  const words=search.value.toLocaleLowerCase().trim().split(/\\s+/).filter(Boolean);
  let visible=0;
  for(const card of cards){
    const match=words.every(w=>card.dataset.search.includes(w))&&(!kind.value||card.dataset.kind===kind.value)&&(!review.value||card.dataset.review===review.value)&&(!segment.value||card.dataset.segment===segment.value);
    card.hidden=!match;if(match)visible++;
  }
  document.getElementById('visible').textContent=visible+' of '+cards.length+' observations shown. Summary tables above use the complete captured corpus.';
}
[search,kind,review,segment].forEach(el=>el.addEventListener('input',filterCards));
document.getElementById('reset').addEventListener('click',()=>{search.value='';kind.value='';review.value='';segment.value='';filterCards();});
filterCards();
"""
    return """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Brainbuilder · Research workbench</title><style>""" + STYLE + '</style></head><body><main><header id="overview">' \
        + '<div class="eyebrow">Brainbuilder / Research workbench / v' + VERSION + "</div><h1>What people need to keep learning.</h1>" \
        + '<p class="muted">Exploratory evidence, explicit uncertainty, and tests that can change the product decision. Report date: ' + escape(as_of) + ".</p>" \
        + '<p class="note">' + escape(summary["interpretation"]) + " Source checked means the source was inspected; it does not establish representative demand or willingness to pay.</p></header>" \
        + '<nav class="section-nav" aria-label="Report sections"><a href="#overview">Overview</a><a href="#evidence">Evidence</a><a href="#hypotheses">Hypotheses</a><a href="#search-log">Search log</a></nav>' \
        + '<section class="metrics">' + stats + "</section><h2>Problems found in the captured customer corpus</h2>" + problem_table \
        + '<p class="muted">Competitor marketing, learning research, founder hypotheses, and rejected records are excluded from customer-thread counts. Problem rows can overlap. A discussion thread is not a unique person.</p>' \
        + '<h2 id="hypotheses">Hypotheses and next decisions</h2>' + hypothesis_table \
        + '<h2 id="search-log">Search coverage and missing evidence</h2><details class="coverage-details"><summary>View ' + str(len(queries)) + ' search records and coverage notes</summary>' + query_table \
        + '<p class="muted">Unknown values are deliberately not treated as zero. Do not sum included-thread counts across searches: the same thread can be found by several queries. A search log is not proof of exhaustive coverage.</p></details>' \
        + '<h2 id="evidence">Evidence ledger</h2><div class="toolbar"><input id="search" type="search" placeholder="Search need, workaround, quote context…" aria-label="Search evidence"><select id="kind" aria-label="Evidence kind">' + kinds_options \
        + '</select><select id="review" aria-label="Review state">' + review_options + '</select><select id="segment" aria-label="Segment">' + segment_options \
        + '</select><button id="reset" type="button">Reset</button></div><p id="visible" class="muted" aria-live="polite"></p><section class="cards">' \
        + ("".join(cards) if cards else '<div class="empty">Import source-backed observations to begin. This report contains no synthetic production evidence.</div>') \
        + '</section><p class="print-note">Freshness flags use capture age over ' + str(stale_days) + " days, not publication age or proof a claim remains valid. " + str(summary["stale_observations"]) \
        + " observations are flagged for refresh; " + str(summary["future_capture_dates"]) + " have a capture date after this report date. No network requests, tracking, or external libraries are used by this report.</p></main><script>" + script + "</script></body></html>"


def export_bundle(conn: sqlite3.Connection, out: str | Path, *, as_of: str, stale_days: int = 90) -> dict[str, Any]:
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    rows = read_evidence(conn, as_of=as_of, stale_days=stale_days)
    summary = summarize(rows)
    hypotheses = [dict(r) for r in conn.execute("SELECT * FROM hypotheses ORDER BY hypothesis_id")]
    links = [dict(r) for r in conn.execute("SELECT * FROM evidence_hypotheses ORDER BY hypothesis_id,evidence_id")]
    queries = [dict(r) for r in conn.execute("SELECT * FROM query_log ORDER BY performed_at,query_id")]
    revisions = [dict(r) for r in conn.execute("SELECT * FROM evidence_revisions ORDER BY revision_id")]
    export_fields = list(EVIDENCE_FIELDS) + ["canonical_url", "thread_key", "capture_age_days", "stale", "future_capture_date"]
    write_csv(out / "evidence.csv", rows, export_fields)
    # Exact unescaped strings, intentionally re-importable; derived fields stay in CSV.
    clean = [{key: row[key] for key in EVIDENCE_FIELDS} for row in rows]
    (out / "evidence.json").write_text(json.dumps(clean, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(out / "problem_counts.csv", summary["problems"], ["problem", "distinct_customer_threads", "source_checked_threads", "human_checked_threads", "full_text_threads", "observations"])
    write_csv(out / "hypotheses.csv", hypotheses, HYPOTHESIS_FIELDS)
    write_csv(out / "hypothesis_links.csv", links, ["evidence_id", "hypothesis_id", "relationship"])
    write_csv(out / "query_log.csv", queries, QUERY_FIELDS)
    for filename, records, fields in (("hypotheses.json", hypotheses, HYPOTHESIS_FIELDS), ("query_log.json", queries, QUERY_FIELDS)):
        (out / filename).write_text(json.dumps([{key: row[key] for key in fields} for row in records], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "hypothesis_links.json").write_text(json.dumps(links, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "evidence_revisions.json").write_text(json.dumps(revisions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "summary.json").write_text(json.dumps({"as_of": as_of, "stale_days": stale_days, **summary}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out / "report.html").write_text(report_html(rows, summary, hypotheses, links, queries, as_of=as_of, stale_days=stale_days), encoding="utf-8")
    files = ["evidence.csv", "evidence.json", "problem_counts.csv", "hypotheses.csv", "hypotheses.json", "hypothesis_links.csv", "hypothesis_links.json", "query_log.csv", "query_log.json", "evidence_revisions.json", "summary.json", "report.html"]
    return {"directory": str(out.resolve()), "files": files, "summary": summary}


def build_query_queue(matrix: Path, out: Path) -> dict[str, Any]:
    rows = load_rows(matrix)
    planned = []
    for row in rows:
        if not row.get("query"):
            raise ResearchError("Every query-matrix row needs query text")
        planned.append({**row, "search_url": "https://www.google.com/search?" + urlencode({"q": row["query"]}), "status": "planned"})
    fields = list(rows[0]) if rows else ["query"]
    for field in ("search_url", "status"):
        if field not in fields:
            fields.append(field)
    out.parent.mkdir(parents=True, exist_ok=True)
    write_csv(out, planned, fields)
    return {"planned_queries": len(planned), "path": str(out.resolve()), "executed_queries": 0}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--db", default="data/research.sqlite", help="SQLite path (default: data/research.sqlite)")
    p.add_argument("--version", action="version", version=VERSION)
    subs = p.add_subparsers(dest="command", required=True)
    subs.add_parser("init", help="Create an empty database")
    for command, description in (("ingest", "Import evidence JSON/JSONL/CSV"), ("import-hypotheses", "Import hypothesis JSON/JSONL/CSV"), ("import-queries", "Import observed search coverage JSON/JSONL/CSV")):
        part = subs.add_parser(command, help=description)
        part.add_argument("file")
        part.add_argument("--update", action="store_true", help="Deliberately update matching IDs; evidence updates are revisioned")
    link = subs.add_parser("link", help="Link one evidence item to a hypothesis")
    link.add_argument("evidence_id")
    link.add_argument("hypothesis_id")
    link.add_argument("--relation", choices=RELATIONS, default="unclassified")
    links = subs.add_parser("import-links", help="Import evidence-to-hypothesis links")
    links.add_argument("file")
    log = subs.add_parser("log-query", help="Record one completed, blocked, or planned search")
    for field in ("performed-at", "channel", "query"):
        log.add_argument("--" + field, required=True)
    for field in ("query-id", "search-url", "notes", "reviewer"):
        log.add_argument("--" + field, default="")
    log.add_argument("--status", choices=("completed", "planned", "blocked"), default="completed")
    for field in ("results-returned", "results-reviewed", "included-threads"):
        log.add_argument("--" + field, type=int)
    log.add_argument("--update", action="store_true")
    for command, description in (("status", "Show corpus counts and limits"), ("export", "Write HTML, CSV and JSON outputs")):
        part = subs.add_parser(command, help=description)
        part.add_argument("--as-of", default=date.today().isoformat())
        part.add_argument("--stale-days", type=int, default=90)
        if command == "export":
            part.add_argument("--out", default="reports/latest")
    queries = subs.add_parser("queries", help="Generate search links; does not execute searches")
    queries.add_argument("--matrix", default="config/query_matrix.csv")
    queries.add_argument("--out", default="reports/search_queue.csv")
    return p


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    conn = None
    try:
        if args.command == "queries":
            result = build_query_queue(Path(args.matrix), Path(args.out))
        else:
            conn = connect_db(args.db)
            if args.command == "init":
                result = {"database": str(Path(args.db).resolve()), "schema_version": SCHEMA_VERSION}
            elif args.command == "ingest":
                result = ingest(conn, load_rows(args.file), update=args.update)
            elif args.command == "import-hypotheses":
                result = import_hypotheses(conn, load_rows(args.file), update=args.update)
            elif args.command == "import-queries":
                result = import_queries(conn, load_rows(args.file), update=args.update)
            elif args.command == "link":
                link_evidence(conn, args.evidence_id, args.hypothesis_id, args.relation)
                result = {"evidence_id": args.evidence_id, "hypothesis_id": args.hypothesis_id, "relationship": args.relation}
            elif args.command == "import-links":
                result = import_links(conn, load_rows(args.file))
            elif args.command == "log-query":
                raw = {field: getattr(args, field) for field in QUERY_FIELDS}
                result = import_queries(conn, [raw], update=args.update)
            elif args.command == "status":
                result = {"as_of": args.as_of, "stale_days": args.stale_days, **summarize(read_evidence(conn, as_of=args.as_of, stale_days=args.stale_days))}
            elif args.command == "export":
                result = export_bundle(conn, args.out, as_of=args.as_of, stale_days=args.stale_days)
            else:
                raise ResearchError("Unknown command")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (ResearchError, OSError, sqlite3.Error) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
