"""Integrity tests use synthetic fixtures only; no examples enter the real corpus."""

import csv
import json
from pathlib import Path
import tempfile
import unittest

import bb_research as bb


def example(**changes):
    row = {
        "source_url": "https://www.reddit.com/r/example/comments/abc123/synthetic_test/",
        "title": "SYNTHETIC TEST ONLY",
        "evidence_kind": "customer_signal",
        "source_type": "reddit",
        "retrieved_at": "2026-11-07",
        "observation": "Synthetic test observation; never use as research evidence.",
        "problem": "test_problem",
        "content_access": "full_text",
    }
    row.update(changes)
    return row


class WorkbenchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.conn = bb.connect_db(self.root / "research.sqlite")

    def tearDown(self):
        self.conn.close()
        self.temp.cleanup()

    def test_localized_reddit_and_comment_threads_collapse(self):
        a = "https://hr.reddit.com/r/test/comments/abc123/title/?sort=new&utm_source=mail"
        b = "https://old.reddit.com/r/test/comments/abc123/other_title/comment9/?context=3"
        self.assertEqual(bb.canonicalize_url(a), "https://reddit.com/comments/abc123")
        self.assertEqual(bb.independent_thread_key(a), bb.independent_thread_key(b))
        self.assertNotEqual(bb.canonicalize_url(a), bb.canonicalize_url(b))

    def test_meaningful_query_preserved(self):
        self.assertEqual(bb.canonicalize_url("https://news.ycombinator.com/item?id=42&utm_medium=x"), "https://news.ycombinator.com/item?id=42")
        self.assertNotEqual(bb.independent_thread_key("https://news.ycombinator.com/item?id=42"), bb.independent_thread_key("https://news.ycombinator.com/item?id=43"))

    def test_url_rejects_executable_schemes_and_credentials(self):
        for value in ("javascript:alert(1)", "data:text/html,a", "https://user:secret@example.com/path"):
            with self.assertRaises(bb.ResearchError):
                bb.normalize_record(example(source_url=value))

    def test_reimport_is_idempotent(self):
        first = bb.ingest(self.conn, [example()])
        second = bb.ingest(self.conn, [example()])
        self.assertEqual(first["inserted"], 1)
        self.assertEqual(second["unchanged"], 1)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM evidence").fetchone()[0], 1)

    def test_invalid_batch_is_atomic(self):
        with self.assertRaises(bb.ResearchError):
            bb.ingest(self.conn, [example(), example(source_url="javascript:alert(1)")])
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM evidence").fetchone()[0], 0)

    def test_revision_guard_preserves_previous_evidence(self):
        row = example(evidence_id="test_1")
        bb.ingest(self.conn, [row])
        changed = {**row, "observation": "Changed synthetic test observation."}
        with self.assertRaises(bb.ResearchError):
            bb.ingest(self.conn, [changed])
        result = bb.ingest(self.conn, [changed], update=True)
        self.assertEqual(result["updated"], 1)
        previous = json.loads(self.conn.execute("SELECT previous_json FROM evidence_revisions").fetchone()[0])
        self.assertEqual(previous["observation"], row["observation"])

    def test_demand_denominators_exclude_competitors_and_same_thread(self):
        rows = [
            example(),
            example(source_url="https://old.reddit.com/r/example/comments/abc123/title/cmt999/", observation="Second synthetic comment in the same thread."),
            example(source_url="https://example.com/marketing", evidence_kind="competitor_claim", source_type="official_product", observation="Synthetic marketing claim."),
            example(source_url="https://example.com/paper", evidence_kind="learning_research", source_type="research_paper", observation="Synthetic study description."),
            example(source_url="https://reddit.com/comments/other123", review_status="rejected", observation="Excluded synthetic signal."),
        ]
        bb.ingest(self.conn, rows)
        summary = bb.summarize(bb.read_evidence(self.conn, as_of="2026-11-07"))
        self.assertEqual(summary["total_observations"], 5)
        self.assertEqual(summary["distinct_customer_threads"], 1)
        self.assertEqual(summary["source_checked_customer_threads"], 0)
        self.assertEqual(summary["problems"][0]["observations"], 2)

    def test_assistant_source_check_is_not_human_review(self):
        bb.ingest(self.conn, [example(review_status="verified", reviewer_type="assistant", reviewed_by="test", reviewed_at="2026-11-07")])
        summary = bb.summarize(bb.read_evidence(self.conn, as_of="2026-11-07"))
        self.assertEqual(summary["source_checked_customer_threads"], 1)
        self.assertEqual(summary["human_checked_customer_threads"], 0)
        with self.assertRaises(bb.ResearchError):
            bb.normalize_record(example(review_status="verified"))

    def test_invalid_or_unknown_dates(self):
        with self.assertRaises(bb.ResearchError):
            bb.normalize_record(example(retrieved_at="2026-02-30"))
        normalized = bb.normalize_record(example(published_at=None))
        self.assertEqual(normalized["published_at"], "")

    def test_unknown_query_counts_are_not_zero(self):
        bb.import_queries(self.conn, [{"performed_at": "2026-11-07", "query": "synthetic query", "channel": "test", "notes": "Count not recorded"}])
        row = self.conn.execute("SELECT * FROM query_log").fetchone()
        self.assertIsNone(row["results_returned"])
        self.assertIsNone(row["included_threads"])
        with self.assertRaises(bb.ResearchError):
            bb.normalize_query({"performed_at": "2026-11-07", "query": "synthetic query", "channel": "test", "results_returned": 4, "results_reviewed": 5})

    def test_html_and_csv_untrusted_text_is_escaped(self):
        payload = "<script>alert('test')</script>"
        bb.ingest(self.conn, [example(title=payload, observation="=HYPERLINK(\"https://example.com\",\"synthetic\")", inference=payload)])
        out = self.root / "report"
        bb.export_bundle(self.conn, out, as_of="2026-11-07")
        page = (out / "report.html").read_text()
        self.assertNotIn(payload, page)
        self.assertIn("&lt;script&gt;", page)
        with (out / "evidence.csv").open(newline="") as handle:
            row = next(csv.DictReader(handle))
        self.assertTrue(row["observation"].startswith("'="))
        # The canonical JSON preserves exact data and can be re-imported.
        restored = bb.load_rows(out / "evidence.json")
        self.assertTrue(restored[0]["observation"].startswith("="))
        self.assertEqual(bb.ingest(self.conn, restored)["unchanged"], 1)

    def test_links_validate_before_mutation(self):
        result = bb.ingest(self.conn, [example()])
        eid = result["ids"][0]
        bb.import_hypotheses(self.conn, [{"hypothesis_id": "H-test", "statement": "Synthetic hypothesis only."}])
        with self.assertRaises(bb.ResearchError):
            bb.import_links(self.conn, [{"evidence_id": eid, "hypothesis_id": "H-test", "relationship": "supports"}, {"evidence_id": "missing", "hypothesis_id": "H-test"}])
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM evidence_hypotheses").fetchone()[0], 0)
        bb.import_links(self.conn, [{"evidence_id": eid, "hypothesis_id": "H-test", "relationship": "contradicts"}])
        self.assertEqual(self.conn.execute("SELECT relationship FROM evidence_hypotheses").fetchone()[0], "contradicts")

    def test_csv_and_jsonl_ingest_contract(self):
        csvpath = self.root / "input.csv"
        row = example(tags="retention;audio")
        with csvpath.open("w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(row))
            writer.writeheader()
            writer.writerow(row)
        bb.ingest(self.conn, bb.load_rows(csvpath))
        jsonl = self.root / "input.jsonl"
        jsonl.write_text(json.dumps(row) + "\n\n")
        self.assertEqual(bb.ingest(self.conn, bb.load_rows(jsonl))["unchanged"], 1)

    def test_stale_is_capture_age_not_paper_age(self):
        bb.ingest(self.conn, [example(published_at="2006-01-01")])
        current = bb.read_evidence(self.conn, as_of="2026-11-07", stale_days=90)[0]
        old_capture = bb.read_evidence(self.conn, as_of="2027-03-01", stale_days=90)[0]
        self.assertFalse(current["stale"])
        self.assertTrue(old_capture["stale"])


if __name__ == "__main__":
    unittest.main()
