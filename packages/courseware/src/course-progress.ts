import type { Course } from "./index";

type ProgressCourse = Pick<Course, "id" | "version" | "units">;

export type CourseProgressHistory = {
  reason: "legacy-partial" | "legacy-completion-unverified" | "course-version-changed" | "unsupported-record";
  courseVersion: string | null;
  claimedStatus: string | null;
  claimedLessonIds: string[];
};

/** Activity completion only. This is not an assessment attempt or evidence of mastery. */
export type CourseEnrollment = {
  schemaVersion: 1;
  courseId: string;
  courseVersion: string;
  requiredLessonIds: string[];
  status: "active" | "complete";
  completedLessons: Record<string, true>;
  history: CourseProgressHistory[];
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredIds(course: ProgressCourse): string[] {
  return [...new Set(course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)))];
}

function completionStatus(ids: string[], completed: Record<string, true>): CourseEnrollment["status"] {
  return ids.length > 0 && ids.every((id) => completed[id] === true) ? "complete" : "active";
}

function readHistory(value: unknown): CourseProgressHistory[] {
  if (!Array.isArray(value)) return [];
  const reasons = ["legacy-partial", "legacy-completion-unverified", "course-version-changed", "unsupported-record"];
  return value.filter((entry): entry is CourseProgressHistory =>
    record(entry) && typeof entry.reason === "string" && reasons.includes(entry.reason) &&
    (entry.courseVersion === null || typeof entry.courseVersion === "string") &&
    (entry.claimedStatus === null || typeof entry.claimedStatus === "string") &&
    Array.isArray(entry.claimedLessonIds) && entry.claimedLessonIds.every((id) => typeof id === "string")
  ).map((entry) => ({ ...entry, claimedLessonIds: [...entry.claimedLessonIds] }));
}

export function createCourseEnrollment(course: ProgressCourse): CourseEnrollment {
  return {
    schemaVersion: 1,
    courseId: course.id,
    courseVersion: course.version,
    requiredLessonIds: requiredIds(course),
    status: "active",
    completedLessons: {},
    history: []
  };
}

/** Validate stored claims against the enrolled curriculum; never infer an attempt. */
export function restoreCourseEnrollment(course: ProgressCourse, stored: unknown): CourseEnrollment | undefined {
  if (!record(stored) || !record(stored.completedLessons)) return undefined;
  const enrollment = createCourseEnrollment(course);
  const claimedIds = Object.entries(stored.completedLessons).filter(([, value]) => value === true).map(([id]) => id);
  const validClaims = Object.fromEntries(enrollment.requiredLessonIds.filter((id) => claimedIds.includes(id)).map((id) => [id, true as const]));
  const history = readHistory(stored.history);
  const sameRequiredSet = Array.isArray(stored.requiredLessonIds) &&
    stored.requiredLessonIds.length === enrollment.requiredLessonIds.length &&
    new Set(stored.requiredLessonIds).size === enrollment.requiredLessonIds.length &&
    enrollment.requiredLessonIds.every((id) => (stored.requiredLessonIds as unknown[]).includes(id));

  if (stored.schemaVersion === 1 && stored.courseId === course.id && stored.courseVersion === course.version && sameRequiredSet) {
    return { ...enrollment, completedLessons: validClaims, status: completionStatus(enrollment.requiredLessonIds, validClaims), history };
  }

  const legacy = stored.schemaVersion === undefined && stored.courseVersion === undefined;
  const ambiguousLegacy = legacy && (stored.status === "complete" || completionStatus(enrollment.requiredLessonIds, validClaims) === "complete");
  const reason: CourseProgressHistory["reason"] = legacy
    ? ambiguousLegacy ? "legacy-completion-unverified" : "legacy-partial"
    : stored.schemaVersion === 1 ? "course-version-changed" : "unsupported-record";
  // The old capstone bug inflated complete records. Partial records retain their
  // valid activity labels, with explicit legacy provenance, but create no events.
  const completedLessons = legacy && !ambiguousLegacy ? validClaims : {};
  const migration: CourseProgressHistory = {
    reason,
    courseVersion: typeof stored.courseVersion === "string" ? stored.courseVersion : null,
    claimedStatus: typeof stored.status === "string" ? stored.status : null,
    claimedLessonIds: claimedIds
  };
  return {
    ...enrollment,
    completedLessons,
    status: completionStatus(enrollment.requiredLessonIds, completedLessons),
    history: [...history, migration]
  };
}

export function completeEnrollmentLesson(course: ProgressCourse, stored: CourseEnrollment | undefined, lessonId: string): {
  enrollment: CourseEnrollment | undefined;
  lessonCompleted: boolean;
  courseCompleted: boolean;
} {
  if (!requiredIds(course).includes(lessonId)) {
    return { enrollment: stored, lessonCompleted: false, courseCompleted: false };
  }
  const current = restoreCourseEnrollment(course, stored) ?? createCourseEnrollment(course);
  if (current.completedLessons[lessonId]) {
    return { enrollment: current, lessonCompleted: false, courseCompleted: false };
  }
  const completedLessons = { ...current.completedLessons, [lessonId]: true as const };
  const status = completionStatus(current.requiredLessonIds, completedLessons);
  return {
    enrollment: { ...current, completedLessons, status },
    lessonCompleted: true,
    courseCompleted: current.status !== "complete" && status === "complete"
  };
}

export function getCourseProgressNotice(enrollment: CourseEnrollment | undefined): string | undefined {
  const latest = enrollment?.history.at(-1);
  if (!enrollment || !latest) return undefined;
  if (enrollment.status === "complete") {
    return "All required lessons in this version are complete. Earlier progress remains in history.";
  }
  if (latest.reason === "legacy-partial") {
    return "Earlier partial progress was kept as lesson activity. It has no saved assessment evidence.";
  }
  if (latest.reason === "legacy-completion-unverified") {
    return "Earlier course completion could include skipped lessons. Your old progress is kept in history; complete each lesson to confirm this version.";
  }
  return "Earlier progress belongs to a different or unrecognized course version. It is kept in history; complete each lesson to confirm this version.";
}
