import { describe, expect, it } from "vitest";
import { buildAlgorithmsDataStructuresCourse } from "./index";
import { completeEnrollmentLesson, createCourseEnrollment, getCourseProgressNotice, restoreCourseEnrollment } from "./course-progress";

const course = buildAlgorithmsDataStructuresCourse();
const ids = course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id));
const allClaims = Object.fromEntries(ids.map((id) => [id, true as const]));

describe("versioned course activity completion", () => {
  it("records only the final lesson when it is completed first", () => {
    const result = completeEnrollmentLesson(course, createCourseEnrollment(course), ids.at(-1)!);
    expect(result.enrollment?.completedLessons).toEqual({ [ids.at(-1)!]: true });
    expect(result.enrollment?.status).toBe("active");
    expect(result.lessonCompleted).toBe(true);
    expect(result.courseCompleted).toBe(false);
  });

  it.each([
    { name: "forward", order: ids },
    { name: "reverse", order: [...ids].reverse() },
    { name: "rotated", order: [...ids.slice(10), ...ids.slice(0, 10)] }
  ])("completes exactly once in $name order and ignores repeated actions", ({ order }) => {
    let enrollment = createCourseEnrollment(course);
    let lessonAwards = 0;
    let courseAwards = 0;
    for (const [index, id] of order.entries()) {
      const result = completeEnrollmentLesson(course, enrollment, id);
      enrollment = result.enrollment!;
      lessonAwards += Number(result.lessonCompleted);
      courseAwards += Number(result.courseCompleted);
      expect(Object.keys(enrollment.completedLessons)).toHaveLength(index + 1);
      expect(enrollment.status).toBe(index === ids.length - 1 ? "complete" : "active");
      const duplicate = completeEnrollmentLesson(course, enrollment, id);
      expect(duplicate.enrollment).toEqual(enrollment);
      expect(duplicate.lessonCompleted).toBe(false);
      expect(duplicate.courseCompleted).toBe(false);
    }
    expect(lessonAwards).toBe(ids.length);
    expect(courseAwards).toBe(1);
  });

  it("rejects unknown lesson IDs without enrolling or awarding anything", () => {
    expect(completeEnrollmentLesson(course, undefined, "obsolete-lesson")).toEqual({
      enrollment: undefined, lessonCompleted: false, courseCompleted: false
    });
    const enrollment = createCourseEnrollment(course);
    expect(completeEnrollmentLesson(course, enrollment, "toString").enrollment).toBe(enrollment);
  });

  it("derives status from the required set, not a stored status or the number of keys", () => {
    const stored = {
      ...createCourseEnrollment(course), status: "complete",
      completedLessons: { ...Object.fromEntries(ids.slice(1).map((id) => [id, true])), obsolete: true, [ids[0]]: "true" }
    };
    const restored = restoreCourseEnrollment(course, stored)!;
    expect(restored.status).toBe("active");
    expect(Object.keys(restored.completedLessons)).toHaveLength(ids.length - 1);
    expect(restored.completedLessons.obsolete).toBeUndefined();
    const result = completeEnrollmentLesson(course, restored, ids[0]);
    expect(result.courseCompleted).toBe(true);
    expect(result.enrollment?.status).toBe("complete");
  });

  it.each(["active", "complete"])("archives ambiguous legacy all-complete records with status %s without inventing attempts", (status) => {
    const restored = restoreCourseEnrollment(course, { status, completedLessons: allClaims })!;
    expect(restored.status).toBe("active");
    expect(restored.completedLessons).toEqual({});
    expect(restored.history).toEqual([{
      reason: "legacy-completion-unverified", courseVersion: null, claimedStatus: status, claimedLessonIds: ids
    }]);
    expect(getCourseProgressNotice(restored)).toMatch(/could include skipped lessons/);
    expect(restoreCourseEnrollment(course, JSON.parse(JSON.stringify(restored)))).toEqual(restored);
    const confirmed = completeEnrollmentLesson(course, restored, ids.at(-1)!);
    expect(Object.keys(confirmed.enrollment!.completedLessons)).toHaveLength(1);
    expect(confirmed.courseCompleted).toBe(false);
    expect(confirmed.enrollment!.history).toEqual(restored.history);
    expect(restored).not.toHaveProperty("attempts");
  });

  it("keeps valid partial legacy activity with explicit unknown-basis provenance", () => {
    const restored = restoreCourseEnrollment(course, { status: "active", completedLessons: { [ids[0]]: true, obsolete: true } })!;
    expect(restored.completedLessons).toEqual({ [ids[0]]: true });
    expect(restored.status).toBe("active");
    expect(restored.history[0]).toMatchObject({ reason: "legacy-partial", courseVersion: null, claimedLessonIds: [ids[0], "obsolete"] });
    expect(getCourseProgressNotice(restored)).toMatch(/no saved assessment evidence/);
    expect(completeEnrollmentLesson(course, restored, ids[0]).lessonCompleted).toBe(false);
  });

  it("archives explicit legacy complete claims even when their lesson map is partial", () => {
    const restored = restoreCourseEnrollment(course, { status: "complete", completedLessons: { [ids[0]]: true } })!;
    expect(restored.completedLessons).toEqual({});
    expect(restored.history[0].reason).toBe("legacy-completion-unverified");
  });

  it.each([
    { courseVersion: "older-version" },
    { requiredLessonIds: ids.slice(1) },
    { requiredLessonIds: [...ids.slice(1), ids[1]] },
    { courseId: "different-course" },
    { schemaVersion: 99 }
  ])("does not transfer claims across an incompatible enrollment: %j", (change) => {
    const stored = { ...createCourseEnrollment(course), completedLessons: allClaims, ...change };
    const restored = restoreCourseEnrollment(course, stored)!;
    expect(restored.status).toBe("active");
    expect(restored.completedLessons).toEqual({});
    expect(restored.history[0].claimedLessonIds).toEqual(ids);
    expect(restoreCourseEnrollment(course, restored)?.history).toHaveLength(1);
  });

  it("accepts reordered requirements within the same version and preserves complete status", () => {
    const stored = { ...createCourseEnrollment(course), requiredLessonIds: [...ids].reverse(), completedLessons: allClaims };
    expect(restoreCourseEnrollment(course, stored)?.status).toBe("complete");
  });

  it.each([null, [], "invalid", {}, { completedLessons: [] }])("handles malformed storage: %j", (stored) => {
    expect(restoreCourseEnrollment(course, stored)).toBeUndefined();
  });

  it("does not treat an empty curriculum as a completed course", () => {
    const empty = { ...course, units: [] };
    expect(restoreCourseEnrollment(empty, createCourseEnrollment(empty))?.status).toBe("active");
  });
});
