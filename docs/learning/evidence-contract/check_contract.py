#!/usr/bin/env python3
"""Check synthetic BB-LRN-004 examples; never grade, persist, or ingest learners.

Python 3.10+, standard library only. The fixture shape is illustrative, not an
application event/API schema. See contract-v1.0.0.md for the product semantics.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys


VERSION = "1.0.0"
DEFAULT_FIXTURES = Path(__file__).with_name("worked-traces-v1.0.0.json")


class ContractError(ValueError):
    """A fixture contradicts the stated product contract."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def instant(value: str) -> datetime:
    require(isinstance(value, str), "Timestamp must be a string")
    require(
        re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})", value)
        is not None,
        f"Timezone-qualified timestamp required: {value!r}",
    )
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError as exc:
        raise ContractError(f"Invalid timestamp: {value!r}") from exc


def seconds(later: datetime, earlier: datetime) -> int | float:
    value = (later - earlier).total_seconds()
    return int(value) if value.is_integer() else value


def observations(data: dict) -> dict[str, dict]:
    return {item["id"]: item for item in data["observations"]}


def prompt(data: dict, item: dict) -> dict:
    return data["catalog"]["prompts"][item["prompt_ref"]]


def relevant_practice_points(item: dict) -> list[datetime]:
    """Recorded practice, including later feedback attached to an earlier check."""
    points = []
    if item["kind"] in {"exposure", "private_practice"} or item.get("response_state") == "submitted":
        points.append(instant(item["occurred_at"]))
    points.extend(instant(event["at"]) for event in item.get("assistance", {}).get("events", []))
    return points


def delay_context(data: dict, item: dict) -> dict | None:
    delay = item.get("delay")
    if delay is None:
        return None
    by_id = observations(data)
    anchor = by_id.get(delay["anchor_id"])
    result = {
        "anchor_id": delay["anchor_id"],
        "elapsed_seconds": None,
        "since_latest_recorded_practice_seconds": None,
        "intervening_ids": [],
        "history_status": delay["history_status"],
        "outside_practice": delay["outside_practice"],
    }
    if anchor is None or item["clock_status"] != "comparable" or anchor["clock_status"] != "comparable":
        return result
    anchor_at = instant(anchor["occurred_at"])
    start = instant(item["started_at"])
    submitted = instant(item["occurred_at"])
    latest = anchor_at
    for other in data["observations"]:
        if other["id"] == item["id"] or other["origin"] != "learner":
            continue
        if other["learner_id"] != item["learner_id"] or other["concept_id"] not in delay["relevance_concepts"]:
            continue
        # These fixtures use comparable times for recorded intervening practice.
        # Incomplete histories stay explicitly incomplete even when no row matches.
        points = [at for at in relevant_practice_points(other) if anchor_at < at < start]
        if points:
            result["intervening_ids"].append(other["id"])
            latest = max(latest, *points)
    result["intervening_ids"].sort()
    result["elapsed_seconds"] = seconds(submitted, anchor_at)
    result["since_latest_recorded_practice_seconds"] = seconds(submitted, latest)
    return result


def prior_scenario_ids(data: dict, item: dict) -> list[str]:
    family = prompt(data, item)["family_id"]
    return sorted(
        other["id"]
        for other in data["observations"]
        if other["id"] != item["id"]
        and other["origin"] == "learner"
        and other["learner_id"] == item["learner_id"]
        and "prompt_ref" in other
        and prompt(data, other)["family_id"] == family
        and instant(other["started_at"]) < instant(item["started_at"])
    )


def validate(data: dict) -> None:
    require(data.get("contract_version") == VERSION, "Unsupported product contract version")
    require(data.get("fixture_only") is True, "This checker accepts synthetic fixtures only")
    require(data.get("source_baseline") == "abf70fa012356038ffa5a2c4092584d452724e5e", "Unexpected reviewed source baseline")
    catalogs = data["catalog"]
    for name in ("sources", "prompts", "rubrics"):
        require(bool(catalogs[name]), f"Empty {name} catalog")
        for ref, value in catalogs[name].items():
            require(bool(value.get("id")) and bool(value.get("version")), f"{ref}: immutable identity/version required")
    for ref, value in catalogs["prompts"].items():
        require(value["source_ref"] in catalogs["sources"], f"{ref}: unknown source version")
        require(value["kind"] in {"recall", "recognition", "application"}, f"{ref}: unknown prompt kind")
        require(value["format"] in {"free_text", "choice"}, f"{ref}: unknown response format")
        require(value["kind"] != "recognition" or value["format"] == "choice", f"{ref}: recognition format mismatch")
        require(value["kind"] not in {"recall", "application"} or value["format"] == "free_text", f"{ref}: produced response required")
    for ref, value in catalogs["rubrics"].items():
        require(value["source_ref"] in catalogs["sources"], f"{ref}: unknown rubric source version")
        require(bool(value["prompt_families"]), f"{ref}: rubric must name its supported prompt family")

    ids = [item["id"] for item in data["observations"]]
    require(len(ids) == len(set(ids)), "Canonical observation IDs collide; conflicting copies must not overwrite")
    common = {"id", "learner_id", "opportunity_id", "kind", "concept_id", "origin", "source_ref", "started_at", "occurred_at", "clock_status", "note"}
    extras = {
        "exposure": {"mode", "coverage"},
        "private_practice": {"prompt_ref", "private_rating", "assistance"},
        "response": {"prompt_ref", "response_state", "response_text", "skip_reason", "assistance", "assessments", "check_timing", "delay", "freshness"},
    }
    for item in data["observations"]:
        ident = item["id"]
        require(ident.startswith("fixture-"), f"{ident}: fixture identity required")
        require(item["learner_id"].startswith("fixture-"), f"{ident}: fictional learner identity required")
        kind = item["kind"]
        require(kind in extras, f"{ident}: unknown observation kind")
        require(not (set(item) - common - extras[kind]), f"{ident}: fields forbidden for {kind}: {sorted(set(item) - common - extras[kind])}")
        require(item["origin"] in {"learner", "demo"}, f"{ident}: unknown modeled origin")
        require(item["source_ref"] in catalogs["sources"], f"{ident}: unknown source version")
        require(item["clock_status"] in {"comparable", "uncertain"}, f"{ident}: clock status required")
        start, ended = instant(item["started_at"]), instant(item["occurred_at"])
        require(ended >= start, f"{ident}: activity ends before it starts")
        if kind == "exposure":
            require(item["mode"] in {"read", "listened"}, f"{ident}: exposure mode invalid")
            require(item["coverage"] in {"partial", "completed", "unknown"}, f"{ident}: exposure coverage invalid")
            continue
        require(bool(item.get("opportunity_id")), f"{ident}: stable opportunity required across mode/resume changes")
        require(item["prompt_ref"] in catalogs["prompts"], f"{ident}: unknown prompt version")
        p = prompt(data, item)
        require(p["source_ref"] == item["source_ref"], f"{ident}: prompt/source version mismatch")
        require(p["concept_id"] == item["concept_id"], f"{ident}: prompt/concept mismatch")
        assistance = item["assistance"]
        require(assistance["status"] in {"known", "unknown"}, f"{ident}: assistance completeness must be explicit")
        require(isinstance(assistance["events"], list), f"{ident}: assistance events must be a list")
        for event in assistance["events"]:
            require(event["kind"] in {"hint", "answer_reveal", "worked_example", "source_view"}, f"{ident}: unknown assistance kind")
            require(instant(event["at"]) >= start, f"{ident}: assistance predates this recorded activity")
            require(event["source_ref"] in catalogs["sources"], f"{ident}: assistance source version missing")
        if kind == "private_practice":
            require(item["private_rating"] in {"had_it", "partly", "need_another_pass", "not_sure_yet", "not_reported"}, f"{ident}: invalid private self-report")
            continue
        require(item["response_state"] in {"submitted", "skipped", "no_response"}, f"{ident}: invalid response state")
        require(item["check_timing"] in {"immediate", "delayed"}, f"{ident}: planned check timing required")
        history = item["assessments"]
        if item["response_state"] != "submitted":
            require(not history and "response_text" not in item, f"{ident}: no submitted response means no assessment/outcome")
            require(bool(item.get("skip_reason")), f"{ident}: preserve skip/nonresponse reason")
        else:
            require(bool(history), f"{ident}: unassessed submission must explicitly be pending")
        previous = None
        for assessment in history:
            require(not (set(assessment) - {"id", "at", "status", "method", "rubric_ref", "outcome", "supersedes", "reason"}), f"{ident}: unexpected assessment field")
            require(assessment["status"] in {"pending", "manual_review", "uncertain", "final", "disputed"}, f"{ident}: invalid assessment state")
            require(assessment["method"] in {"none", "automatic", "human"}, f"{ident}: invalid assessment method")
            require(assessment["rubric_ref"] in catalogs["rubrics"], f"{ident}: unknown rubric version")
            rubric = catalogs["rubrics"][assessment["rubric_ref"]]
            require(p["family_id"] in rubric["prompt_families"], f"{ident}: rubric does not cover prompt family")
            require(instant(assessment["at"]) >= ended, f"{ident}: assessment predates submitted response")
            require(assessment.get("supersedes") == (previous["id"] if previous else None), f"{ident}: assessment revision chain broken")
            if previous:
                require(instant(assessment["at"]) > instant(previous["at"]), f"{ident}: assessment revisions are not ordered")
                require(bool(assessment.get("reason")), f"{ident}: revision reason required")
            if assessment["status"] == "final":
                require(assessment.get("outcome") in {"correct", "partial", "incorrect"}, f"{ident}: final outcome missing")
                require(assessment["method"] != "none", f"{ident}: final assessment needs an assessor method")
                if previous and previous["status"] == "manual_review":
                    require(assessment["method"] == "human", f"{ident}: a manual-review resolution must identify human assessment")
            else:
                require("outcome" not in assessment, f"{ident}: unresolved assessment cannot carry objective correctness")
            previous = assessment
        delay = item.get("delay")
        if item["check_timing"] == "delayed":
            require(delay is not None, f"{ident}: delayed check needs interval provenance, even when unknown")
        if delay is not None:
            require(delay["history_status"] in {"complete_recorded_app_history", "unknown"}, f"{ident}: invalid history coverage")
            require(delay["outside_practice"] in {"unknown", "reported_none", "reported_some"}, f"{ident}: invalid outside-practice context")
            require(item["concept_id"] in delay["relevance_concepts"], f"{ident}: relevant history must include its own concept")
            if delay["anchor_id"] is not None:
                anchor = observations(data).get(delay["anchor_id"])
                require(anchor is not None, f"{ident}: unknown anchor observation")
                require(anchor["learner_id"] == item["learner_id"] and anchor["origin"] == "learner", f"{ident}: anchor belongs to a different learner or demo")
                require(anchor["concept_id"] in delay["relevance_concepts"], f"{ident}: anchor outside relevance scope")
                if item["clock_status"] == anchor["clock_status"] == "comparable":
                    require(instant(anchor["occurred_at"]) < start, f"{ident}: anchor must precede the check")
            actual = delay_context(data, item)
            require(delay["declared_elapsed_seconds"] == actual["elapsed_seconds"], f"{ident}: declared elapsed interval differs from actual timestamps")
            require(sorted(delay["declared_intervening_ids"]) == actual["intervening_ids"], f"{ident}: intervening practice omitted or invented")
        if p["kind"] == "application":
            fresh = item.get("freshness")
            require(fresh is not None, f"{ident}: application needs novelty context")
            require(fresh["history_status"] in {"complete_recorded_app_history", "unknown"}, f"{ident}: invalid novelty coverage")
            require(sorted(fresh["declared_prior_family_ids"]) == prior_scenario_ids(data, item), f"{ident}: prior scenario exposure omitted or invented")

    trace_ids = [trace["id"] for trace in data["traces"]]
    require(len(trace_ids) == len(set(trace_ids)), "Trace IDs must be unique")
    for trace in data["traces"]:
        require(bool(trace["observation_ids"]), f"{trace['id']}: empty trace")
        require(all(ref in observations(data) for ref in trace["observation_ids"]), f"{trace['id']}: unknown observation reference")


def latest_assessment(item: dict, as_of: datetime) -> dict | None:
    eligible = [value for value in item["assessments"] if instant(value["at"]) <= as_of]
    return eligible[-1] if eligible else None


def assistance_reason(data: dict, item: dict) -> str | None:
    """Carry assistance across private/typed mode switches within an opportunity."""
    ended = instant(item["occurred_at"])
    related = [other for other in data["observations"] if other["origin"] == "learner" and other["learner_id"] == item["learner_id"] and other.get("opportunity_id") == item["opportunity_id"] and instant(other["started_at"]) <= ended]
    events = [event for other in related for event in other.get("assistance", {}).get("events", []) if instant(event["at"]) <= ended]
    # Separate source-reading records during the answer cannot be washed away by a mode change.
    source_during_answer = any(other["kind"] == "exposure" and other["origin"] == "learner" and other["learner_id"] == item["learner_id"] and other["concept_id"] == item["concept_id"] and instant(item["started_at"]) <= instant(other["occurred_at"]) <= ended for other in data["observations"])
    if events or source_during_answer:
        return "assisted"
    if any(other.get("assistance", {}).get("status") == "unknown" for other in related):
        return "assistance_unknown"
    return None


def exclusion_reason(data: dict, item: dict, report: dict) -> str | None:
    as_of = instant(report["as_of"])
    if item["origin"] == "demo":
        return "demo"
    if instant(item["occurred_at"]) > as_of:
        return "not_yet_observed"
    if item["kind"] == "exposure":
        return "exposure_only"
    if item["kind"] == "private_practice":
        return "private_self_report"
    if item["response_state"] != "submitted":
        return item["response_state"]
    responses = [other for other in data["observations"] if other["kind"] == "response" and other["origin"] == "learner" and other["learner_id"] == item["learner_id"] and other["opportunity_id"] == item["opportunity_id"]]
    first_time = min(instant(other["occurred_at"]) for other in responses)
    first = [other for other in responses if instant(other["occurred_at"]) == first_time]
    if instant(item["occurred_at"]) == first_time and len(first) > 1:
        return "opportunity_order_unknown"
    if first[0]["id"] != item["id"]:
        return "retry_same_opportunity"
    assessment = latest_assessment(item, as_of)
    if assessment is None:
        return "assessment_pending"
    if assessment["status"] != "final":
        return "assessment_" + assessment["status"]
    p = prompt(data, item)
    measure = report["measure"]
    if measure in {"unassisted_recall", "delayed_unassisted_recall"} and p["kind"] != "recall":
        return "recognition_not_produced_recall" if p["kind"] == "recognition" else "application_is_separate"
    if measure == "fresh_application" and p["kind"] != "application":
        return "not_application"
    assisted = assistance_reason(data, item)
    if assisted:
        return assisted
    if measure == "delayed_unassisted_recall":
        if item["check_timing"] != "delayed":
            return "not_a_delayed_opportunity"
        context = delay_context(data, item)
        if context is None or context["elapsed_seconds"] is None:
            return "interval_unknown"
        interval = report["interval_window_seconds"]
        if not interval["min"] <= context["elapsed_seconds"] <= interval["max"]:
            return "outside_declared_interval_window"
        if report["require_no_recorded_intervening_practice"]:
            if context["history_status"] != "complete_recorded_app_history":
                return "intervening_history_unknown"
            if context["intervening_ids"]:
                return "recorded_intervening_practice"
    if measure == "fresh_application":
        if p["author_context_relation"] != "new_context":
            return "not_a_new_context_prompt"
        if item["freshness"]["history_status"] != "complete_recorded_app_history":
            return "scenario_history_unknown"
        if prior_scenario_ids(data, item):
            return "prior_scenario_exposure"
    return None


def evaluate_report(data: dict, report: dict) -> dict:
    require(report["measure"] in {"unassisted_recall", "delayed_unassisted_recall", "fresh_application"}, "Unknown measure")
    instant(report["as_of"])
    if report["measure"] == "delayed_unassisted_recall":
        window = report["interval_window_seconds"]
        require(0 < window["min"] <= window["max"], "A delayed reporting window must be explicit and positive")
        require(isinstance(report["require_no_recorded_intervening_practice"], bool), "Recorded-practice filter must be explicit")
    by_id = observations(data)
    trace = next((value for value in data["traces"] if value["id"] == report["trace_id"]), None)
    require(trace is not None, "Report references an unknown trace")
    unique = list(dict.fromkeys(trace["observation_ids"]))
    eligible, correct, excluded, outcomes, contexts = [], [], {}, {"correct": 0, "partial": 0, "incorrect": 0}, {}
    for ident in unique:
        item = by_id[ident]
        reason = exclusion_reason(data, item, report)
        if item.get("delay"):
            contexts[ident] = delay_context(data, item)
        if reason:
            excluded[ident] = reason
            continue
        eligible.append(ident)
        outcome = latest_assessment(item, instant(report["as_of"]))["outcome"]
        outcomes[outcome] += 1
        if outcome == "correct":
            correct.append(ident)
    return {
        "id": report["id"],
        "unit": "primary_check_opportunity",
        "numerator": len(correct),
        "denominator": len(eligible),
        "ratio": f"{len(correct)}/{len(eligible)}" if eligible else None,
        "eligible_ids": sorted(eligible),
        "correct_ids": sorted(correct),
        "outcomes": outcomes,
        "excluded": excluded,
        "duplicate_deliveries": len(trace["observation_ids"]) - len(unique),
        "unique_records_considered": len(unique),
        "sampled_concepts": sorted({by_id[ident]["concept_id"] for ident in eligible}),
        "delay_contexts": contexts,
    }


def check(data: dict) -> list[dict]:
    validate(data)
    report_ids = [value["id"] for value in data["reports"]]
    require(len(report_ids) == len(set(report_ids)), "Report IDs must be unique")
    results = []
    required = {"numerator", "denominator", "eligible_ids", "correct_ids", "outcomes", "excluded", "duplicate_deliveries", "ratio"}
    for report in data["reports"]:
        result = evaluate_report(data, report)
        expected = report["expected"]
        require(required <= set(expected), f"{report['id']}: incomplete worked expectation")
        for key, value in expected.items():
            require(result.get(key) == value, f"{report['id']}: {key} differs; expected {value!r}, observed {result.get(key)!r}")
        results.append(result)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("fixtures", nargs="?", type=Path, default=DEFAULT_FIXTURES)
    parser.add_argument("--json", action="store_true", help="Print evaluated synthetic reports, including exclusions and intervals")
    args = parser.parse_args()
    try:
        data = json.loads(args.fixtures.read_text(encoding="utf-8"))
        results = check(data)
    except (OSError, json.JSONDecodeError, ContractError, KeyError, TypeError) as exc:
        print(f"Evidence-contract check failed: {exc}", file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps({"fixture_only": True, "contract_version": VERSION, "reports": results}, indent=2, ensure_ascii=False))
    else:
        print(f"PASS: synthetic contract {VERSION}; {len(data['observations'])} observations, {len(data['traces'])} traces, {len(results)} report snapshots.")
        for result in results:
            label = result["ratio"] if result["ratio"] else "no eligible checks (0 denominator)"
            print(f"  {result['id']}: {label}; {len(result['excluded'])} excluded; {result['duplicate_deliveries']} duplicate delivery copies.")
        print("These are fixture outcomes, not learner results or evidence of learning efficacy.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
