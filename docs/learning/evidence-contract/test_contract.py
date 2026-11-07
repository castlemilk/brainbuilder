"""Focused semantic counterexamples; no application or external services used."""

import copy
import json
import unittest

from check_contract import (
    ContractError,
    DEFAULT_FIXTURES,
    assistance_reason,
    check,
    delay_context,
    evaluate_report,
    exclusion_reason,
    instant,
    latest_assessment,
    validate,
)


class EvidenceContractTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(DEFAULT_FIXTURES.read_text(encoding="utf-8"))

    def observation(self, name):
        return next(item for item in self.data["observations"] if item["id"] == "fixture-" + name)

    def report(self, name):
        return next(item for item in self.data["reports"] if item["id"] == name)

    def test_all_explicit_worked_expectations(self):
        results = check(self.data)
        self.assertEqual((len(self.data["observations"]), len(self.data["traces"]), len(results)), (50, 6, 10))

    def test_listening_cannot_carry_correctness(self):
        self.observation("b-listened")["correct"] = True
        with self.assertRaisesRegex(ContractError, "fields forbidden"):
            validate(self.data)

    def test_private_thinking_cannot_carry_an_assessment(self):
        self.observation("b-private-had-it")["assessments"] = copy.deepcopy(self.observation("b-correct")["assessments"])
        with self.assertRaisesRegex(ContractError, "fields forbidden"):
            validate(self.data)

    def test_private_partly_is_not_assessed_partial(self):
        self.observation("b-private-partly")["private_rating"] = "partial"
        with self.assertRaisesRegex(ContractError, "invalid private self-report"):
            validate(self.data)

    def test_unresolved_states_cannot_carry_a_final_outcome(self):
        for name in ("b-uncertain", "b-manual-pending", "b-pending", "b-disputed"):
            with self.subTest(name=name):
                data = copy.deepcopy(self.data)
                item = next(item for item in data["observations"] if item["id"] == "fixture-" + name)
                item["assessments"][-1]["outcome"] = "correct"
                with self.assertRaisesRegex(ContractError, "unresolved assessment"):
                    validate(data)

    def test_partial_and_incorrect_remain_in_primary_denominator(self):
        result = evaluate_report(self.data, self.report("R02-first-responses"))
        self.assertEqual((result["numerator"], result["denominator"]), (1, 3))
        self.assertEqual(result["outcomes"], {"correct": 1, "partial": 1, "incorrect": 1})

    def test_a_correct_retry_cannot_replace_the_first_incorrect_response(self):
        result = evaluate_report(self.data, self.report("R02-first-responses"))
        self.assertIn("fixture-b-incorrect", result["eligible_ids"])
        self.assertEqual(result["excluded"]["fixture-b-retry-correct"], "retry_same_opportunity")

    def test_duplicate_delivery_does_not_add_credit(self):
        report = self.report("R02-first-responses")
        before = evaluate_report(self.data, report)
        trace = next(item for item in self.data["traces"] if item["id"] == report["trace_id"])
        trace["observation_ids"].extend(["fixture-b-correct"] * 3)
        after = evaluate_report(self.data, report)
        self.assertEqual(after["eligible_ids"], before["eligible_ids"])
        self.assertEqual((after["numerator"], after["denominator"]), (1, 3))
        self.assertEqual(after["duplicate_deliveries"], before["duplicate_deliveries"] + 3)

    def test_conflicting_canonical_identity_is_rejected(self):
        conflict = copy.deepcopy(self.observation("b-correct"))
        conflict["assessments"][0]["outcome"] = "incorrect"
        self.data["observations"].append(conflict)
        with self.assertRaisesRegex(ContractError, "IDs collide"):
            validate(self.data)

    def test_prompt_source_and_rubric_versions_must_resolve(self):
        for field, value in (("prompt_ref", "recall@missing-version"), ("source_ref", "source@missing-version")):
            with self.subTest(field=field):
                data = copy.deepcopy(self.data)
                item = next(item for item in data["observations"] if item["id"] == "fixture-b-correct")
                item[field] = value
                with self.assertRaisesRegex(ContractError, "unknown .* version"):
                    validate(data)
        self.observation("b-correct")["assessments"][0]["rubric_ref"] = "rubric@missing-version"
        with self.assertRaisesRegex(ContractError, "unknown rubric version"):
            validate(self.data)

    def test_hint_reveal_and_worked_example_are_all_assistance(self):
        for name in ("b-hint", "b-reveal", "b-worked-example"):
            with self.subTest(name=name):
                self.assertEqual(assistance_reason(self.data, self.observation(name)), "assisted")

    def test_after_locked_answer_feedback_is_not_retroactive_assistance(self):
        item = self.observation("b-correct")
        self.assertIsNone(assistance_reason(self.data, item))
        item["assistance"]["events"][0]["at"] = item["occurred_at"]
        self.assertEqual(assistance_reason(self.data, item), "assisted")

    def test_private_reveal_survives_a_typed_mode_switch(self):
        item = self.observation("b-after-private")
        self.assertEqual(item["assistance"]["events"], [])
        self.assertEqual(assistance_reason(self.data, item), "assisted")

    def test_unknown_assistance_is_not_no_assistance(self):
        self.assertEqual(assistance_reason(self.data, self.observation("b-assistance-unknown")), "assistance_unknown")

    def test_late_manual_assessment_does_not_change_submission_delay(self):
        item = self.observation("m-response")
        self.assertEqual(delay_context(self.data, item)["elapsed_seconds"], 270)
        self.assertEqual(evaluate_report(self.data, self.report("R06-late-grade-is-not-delay"))["denominator"], 0)
        self.assertEqual(latest_assessment(item, instant("2026-10-02T12:00:00Z"))["status"], "manual_review")
        self.assertEqual(latest_assessment(item, instant("2026-10-09T12:00:00Z"))["outcome"], "partial")
        latest = latest_assessment(item, instant("2026-10-10T12:00:00Z"))
        self.assertEqual((latest["outcome"], latest["rubric_ref"]), ("correct", "recall-rubric@draft-2"))

    def test_manual_revision_cannot_erase_its_predecessor(self):
        self.observation("m-response")["assessments"][-1]["supersedes"] = None
        with self.assertRaisesRegex(ContractError, "revision chain broken"):
            validate(self.data)

    def test_actual_interval_cannot_be_rounded_to_seven_days(self):
        self.observation("d-clean")["delay"]["declared_elapsed_seconds"] = 604800
        with self.assertRaisesRegex(ContractError, "actual timestamps"):
            validate(self.data)

    def test_recorded_repractice_must_remain_visible(self):
        item = self.observation("d-practiced")
        context = delay_context(self.data, item)
        self.assertEqual((context["elapsed_seconds"], context["since_latest_recorded_practice_seconds"]), (617400, 95400))
        item["delay"]["declared_intervening_ids"] = []
        with self.assertRaisesRegex(ContractError, "intervening practice omitted"):
            validate(self.data)

    def test_unknown_history_cannot_claim_no_recorded_repractice(self):
        item = self.observation("d-unknown-history")
        self.assertIsNone(exclusion_reason(self.data, item, self.report("R07-delayed-contexts")))
        self.assertEqual(exclusion_reason(self.data, item, self.report("R08-no-recorded-repractice")), "intervening_history_unknown")

    def test_unknown_clock_cannot_supply_a_known_interval(self):
        item = self.observation("d-clock-uncertain")
        self.assertIsNone(delay_context(self.data, item)["elapsed_seconds"])
        item["delay"]["declared_elapsed_seconds"] = 617400
        with self.assertRaisesRegex(ContractError, "actual timestamps"):
            validate(self.data)

    def test_offsets_are_not_calendar_day_arithmetic(self):
        item = self.observation("tz-response")
        self.assertEqual(delay_context(self.data, item)["elapsed_seconds"], 90000)
        item["delay"]["declared_elapsed_seconds"] = 86400
        with self.assertRaisesRegex(ContractError, "actual timestamps"):
            validate(self.data)

    def test_unqualified_local_timestamp_is_rejected(self):
        self.observation("tz-response")["occurred_at"] = "2026-11-01T12:00:00"
        with self.assertRaisesRegex(ContractError, "Timezone-qualified"):
            validate(self.data)

    def test_new_prompt_version_does_not_make_a_scenario_fresh(self):
        item = self.observation("app-repeat")
        self.assertEqual(item["prompt_ref"], "application@draft-2")
        self.assertEqual(exclusion_reason(self.data, item, self.report("R10-fresh-application")), "prior_scenario_exposure")
        item["freshness"]["declared_prior_family_ids"] = []
        with self.assertRaisesRegex(ContractError, "prior scenario exposure omitted"):
            validate(self.data)

    def test_unresolved_first_response_order_does_not_select_by_id(self):
        original = self.observation("b-incorrect")
        retry = self.observation("b-retry-correct")
        retry["started_at"], retry["occurred_at"] = original["started_at"], original["occurred_at"]
        validate(self.data)
        for item in (original, retry):
            self.assertEqual(exclusion_reason(self.data, item, self.report("R02-first-responses")), "opportunity_order_unknown")

    def test_zero_denominator_stays_unknown_not_zero_percent(self):
        result = evaluate_report(self.data, self.report("R01-exposure-private"))
        self.assertEqual(result["denominator"], 0)
        self.assertIsNone(result["ratio"])

    def test_a_misleading_worked_denominator_fails_the_checker(self):
        self.report("R02-first-responses")["expected"]["denominator"] = 2
        with self.assertRaisesRegex(ContractError, "denominator differs"):
            check(self.data)

    def test_real_data_and_unknown_contract_versions_are_not_accepted(self):
        self.data["fixture_only"] = False
        with self.assertRaisesRegex(ContractError, "synthetic fixtures only"):
            validate(self.data)
        self.data["fixture_only"] = True
        self.data["contract_version"] = "2.0.0"
        with self.assertRaisesRegex(ContractError, "Unsupported product contract version"):
            validate(self.data)


if __name__ == "__main__":
    unittest.main()
