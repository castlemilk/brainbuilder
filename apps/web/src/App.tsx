import {
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  CirclePause,
  CirclePlay,
  Compass,
  Flame,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Library as LibraryIcon,
  Search,
  RotateCcw,
  StepBack,
  StepForward,
  Target,
  Trophy,
  UserPlus,
} from "lucide-react";
import { scaleLinear } from "d3-scale";
import { Children, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent, type ReactNode } from "react";
import * as THREE from "three";
import {
  buildAlgorithmsDataStructuresCourse,
  computeCourseCoverage,
  findLesson,
  getLessonLearningGuide,
  scoreCourseCheck,
  type Course,
  type CourseBlock,
  type CourseCheckResult,
  type CourseLesson,
  type DiagramBlock,
  type LessonLearningGuide,
  type QuizBlock,
  type SimulationBlock
} from "@brainbuilder/courseware";
import { buildLearningHome, quizForBite, scoreLearningQuiz, type LearningHome, type LearningMode, type QuizResult } from "@brainbuilder/learning-model";
import { answerQuiz as submitQuizAnswer, fetchLearningHome } from "./lib/api";

const navItems = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "browse", label: "Browse", path: "/browse", icon: Compass },
  { id: "feed", label: "Feed", path: "/feed", icon: GraduationCap },
  { id: "play", label: "Play", path: "/play", icon: Gamepad2 },
  { id: "library", label: "Library", path: "/library", icon: LibraryIcon },
  { id: "progress", label: "You", path: "/progress", icon: Trophy }
] as const;

const learnerObjectives = [
  {
    id: "algorithms",
    label: "Algorithms and Data Structures",
    description: "Build visual intuition for complexity, data structures, and algorithm traces."
  },
  {
    id: "interview",
    label: "Interview prep",
    description: "Practice choosing approaches, explaining tradeoffs, and checking edge cases."
  },
  {
    id: "daily-habit",
    label: "Daily micro habit",
    description: "Use short lessons, audio, and checks while commuting or between tasks."
  }
] as const;

const learnerSessionStorageKey = "brainbuilder.learner-session";
const courseEnrollmentStorageKey = "brainbuilder.course-enrollments";

function useNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(() => (typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 767px)").matches : false));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isNarrow;
}

type NavId = (typeof navItems)[number]["id"];
type ApiState = "local" | "loading" | "synced" | "offline";
type LibraryMode = "Read" | "Listen" | "Watch";
type CustomLearningKind = "topic" | "book" | "skill";
type LearnerObjectiveId = (typeof learnerObjectives)[number]["id"];
type LearnerSession = {
  name: string;
  email: string;
  objectiveIds: LearnerObjectiveId[];
};
type CourseEnrollment = {
  status: "active" | "complete";
  completedLessons: Record<string, true>;
};
type CustomLearningDraft = {
  title: string;
  kind: CustomLearningKind;
  mode: LearningMode;
};
type CustomLearningSurface = {
  topic: LearningHome["topics"][number];
  path: LearningHome["paths"][number];
  bite: LearningHome["feed"][number];
  quiz: LearningHome["quizzes"][number];
  playground: LearningHome["playgrounds"][number];
};
type AppRoute =
  | { name: "home" }
  | { name: "signin" }
  | { name: "browse" }
  | { name: "topic"; topicId: string }
  | { name: "course"; courseId: string; lessonId?: string }
  | { name: "feed"; biteId?: string }
  | { name: "play"; labId?: string }
  | { name: "library" }
  | { name: "progress" };

type Navigate = (to: string) => void;

function readRoute(): AppRoute {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(window.location.search);

  if (pathname === "/signin") {
    return { name: "signin" };
  }
  if (pathname === "/browse") {
    return { name: "browse" };
  }
  if (pathname.startsWith("/topics/")) {
    return { name: "topic", topicId: decodeURIComponent(pathname.slice("/topics/".length)) };
  }
  if (pathname.startsWith("/courses/")) {
    const parts = pathname.split("/").filter(Boolean);
    return {
      name: "course",
      courseId: decodeURIComponent(parts[1] ?? ""),
      lessonId: parts[2] === "lessons" && parts[3] ? decodeURIComponent(parts[3]) : undefined
    };
  }
  if (pathname === "/feed") {
    return { name: "feed", biteId: params.get("bite") ?? undefined };
  }
  if (pathname === "/play") {
    return { name: "play", labId: params.get("lab") ?? undefined };
  }
  if (pathname === "/library") {
    return { name: "library" };
  }
  if (pathname === "/progress") {
    return { name: "progress" };
  }
  return { name: "home" };
}

function navIdForRoute(route: AppRoute): NavId {
  if (route.name === "signin") {
    return "home";
  }
  if (route.name === "topic" || route.name === "course") {
    return "browse";
  }
  return route.name;
}

function readStoredState<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStoredState<T>(key: string, value: T | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage is a progressive enhancement for this prototype.
  }
}

function courseLessons(course: Course) {
  return course.units.flatMap((unit) => unit.lessons);
}

function App() {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const [route, setRoute] = useState<AppRoute>(() => readRoute());
  const [home, setHome] = useState<LearningHome>(() => buildLearningHome("alex"));
  const course = useMemo(() => buildAlgorithmsDataStructuresCourse(), []);
  const [session, setSession] = useState<LearnerSession | null>(() => readStoredState<LearnerSession>(learnerSessionStorageKey));
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment>>(() => readStoredState<Record<string, CourseEnrollment>>(courseEnrollmentStorageKey) ?? {});
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});
  const [courseResults, setCourseResults] = useState<Record<string, CourseCheckResult>>({});
  const [quizStatus, setQuizStatus] = useState<"idle" | "checking">("idle");
  const [apiState, setApiState] = useState<ApiState>(() => (apiUrl ? "loading" : "local"));
  const [searchQuery, setSearchQuery] = useState("");
  const [topicSelections, setTopicSelections] = useState<Record<string, boolean>>({});
  const [likedBites, setLikedBites] = useState<Record<string, boolean>>({});
  const [savedBites, setSavedBites] = useState<Record<string, boolean>>({});
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("Listen");
  const [libraryChecked, setLibraryChecked] = useState(false);

  useEffect(() => {
    function syncRoute() {
      setRoute(readRoute());
    }
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    writeStoredState(learnerSessionStorageKey, session);
  }, [session]);

  useEffect(() => {
    writeStoredState(courseEnrollmentStorageKey, enrollments);
  }, [enrollments]);

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    let cancelled = false;
    setApiState("loading");
    fetchLearningHome(apiUrl, "alex")
      .then((nextHome) => {
        if (!cancelled) {
          setHome(nextHome);
          setApiState("synced");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiState("offline");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const topics = home.topics.map((topic) => ({
    ...topic,
    selected: Boolean(topicSelections[topic.id])
  }));
  const activeNav = navIdForRoute(route);
  const quiz = route.name === "feed" ? quizForBite(home, route.biteId) : quizForBite(home, undefined);
  const quizResult = quiz ? quizResults[quiz.id] ?? null : null;

  function navigate(to: string) {
    if (`${window.location.pathname}${window.location.search}` !== to) {
      window.history.pushState({}, "", to);
    }
    setRoute(readRoute());
    requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      if (main && typeof main.scrollTo === "function") {
        main.scrollTo({ top: 0 });
      } else if (main) {
        main.scrollTop = 0;
      }
      if (window.scrollY > 0 && typeof window.scrollTo === "function") {
        window.scrollTo({ top: 0 });
      }
    });
  }

  function toggleTopic(topicID: string) {
    setTopicSelections((current) => {
      const topic = topics.find((item) => item.id === topicID);
      return {
        ...current,
        [topicID]: !(topic?.selected ?? false)
      };
    });
  }

  function createCustomLearningPath(draft: CustomLearningDraft) {
    const surface = buildCustomLearningSurface(draft);
    setHome((current) => upsertCustomLearningSurface(current, surface));
    setTopicSelections((current) => ({ ...current, [surface.topic.id]: true }));
    setSearchQuery("");
    navigate(`/topics/${surface.path.id}`);
  }

  function completeSignIn(nextSession: LearnerSession) {
    setSession(nextSession);
    setHome((current) => ({
      ...current,
      user: {
        ...current.user,
        name: nextSession.name
      }
    }));
    navigate("/browse");
  }

  function enrollCourse(courseId: string) {
    setEnrollments((current) => {
      if (current[courseId]) {
        return current;
      }
      return {
        ...current,
        [courseId]: {
          status: "active",
          completedLessons: {}
        }
      };
    });
  }

  function completeCourseLesson(courseId: string, lessonId: string) {
    const lessons = courseLessons(course);
    const lastLesson = lessons[lessons.length - 1];
    const completesCourse = lessonId === lastLesson?.id;
    const alreadyComplete = Boolean(enrollments[courseId]?.completedLessons[lessonId]);

    setEnrollments((current) => {
      const currentEnrollment = current[courseId] ?? { status: "active" as const, completedLessons: {} };
      const completedLessons = completesCourse
        ? Object.fromEntries(lessons.map((lesson) => [lesson.id, true as const]))
        : { ...currentEnrollment.completedLessons, [lessonId]: true as const };
      const status = completesCourse || Object.keys(completedLessons).length >= lessons.length ? "complete" : "active";

      return {
        ...current,
        [courseId]: {
          status,
          completedLessons
        }
      };
    });

    if (!alreadyComplete) {
      setHome((current) => ({
        ...current,
        stats: {
          ...current.stats,
          xp: current.stats.xp + (completesCourse ? 50 : 14),
          dailyGoalCompleted: Math.min(current.stats.dailyGoalTarget, current.stats.dailyGoalCompleted + 1)
        },
        quests: current.quests.map((quest) => (quest.id === "daily-lessons" ? { ...quest, completed: Math.min(quest.target, quest.completed + 1) } : quest))
      }));
    }
  }

  async function answerQuiz(optionId: string) {
    if (!quiz) {
      return;
    }
    const activeQuiz = quiz;
    const alreadyCorrect = Boolean(quizResults[activeQuiz.id]?.correct);

    function applyResult(result: QuizResult) {
      setQuizResults((current) => ({ ...current, [activeQuiz.id]: result }));
      if (result.correct && !alreadyCorrect) {
        setHome((current) => ({
          ...current,
          stats: {
            ...current.stats,
            xp: current.stats.xp + result.xpAwarded,
            dailyGoalCompleted: Math.min(current.stats.dailyGoalTarget, current.stats.dailyGoalCompleted + 1)
          },
          quests: current.quests.map((quest) => (quest.id === "quiz-check" ? { ...quest, completed: Math.min(quest.target, quest.completed + 1) } : quest))
        }));
      }
    }

    setQuizStatus("checking");
    try {
      const result = activeQuiz.id.startsWith("custom-") ? scoreLearningQuiz(home, activeQuiz.id, optionId) : await submitQuizAnswer(apiUrl, activeQuiz.id, optionId);
      applyResult(result);
    } catch {
      setApiState(apiUrl ? "offline" : "local");
      applyResult(scoreLearningQuiz(home, activeQuiz.id, optionId));
    } finally {
      setQuizStatus("idle");
    }
  }

  function answerCourseCheck(quizId: string, optionId: string) {
    const result = scoreCourseCheck(course, quizId, optionId);
    const alreadyCorrect = Boolean(courseResults[quizId]?.correct);
    setCourseResults((current) => ({ ...current, [quizId]: result }));
    if (result.correct && !alreadyCorrect) {
      setHome((current) => ({
        ...current,
        stats: {
          ...current.stats,
          xp: current.stats.xp + result.xpAwarded,
          dailyGoalCompleted: Math.min(current.stats.dailyGoalTarget, current.stats.dailyGoalCompleted + 1)
        },
        quests: current.quests.map((quest) => (quest.id === "daily-lessons" ? { ...quest, completed: Math.min(quest.target, quest.completed + 1) } : quest))
      }));
    }
  }

  const routeContent = renderRoute({
    route,
    home,
    course,
    session,
    enrollment: enrollments[course.id],
    topics,
    query: searchQuery,
    quiz,
    quizResult,
    quizStatus,
    likedBites,
    savedBites,
    audioPlaying,
    libraryMode,
    libraryChecked,
    courseResults,
    onNavigate: navigate,
    onQueryChange: setSearchQuery,
    onToggleTopic: toggleTopic,
    onCreateCustomLearning: createCustomLearningPath,
    onCompleteSignIn: completeSignIn,
    onEnrollCourse: enrollCourse,
    onCompleteLesson: completeCourseLesson,
    onAnswer: answerQuiz,
    onToggleLike: (biteId) => setLikedBites((current) => ({ ...current, [biteId]: !current[biteId] })),
    onToggleSave: (bite) => setSavedBites((current) => ({ ...current, [bite.id]: !(current[bite.id] ?? bite.saved) })),
    onToggleAudio: () => setAudioPlaying((current) => !current),
    onLibraryModeChange: setLibraryMode,
    onLibraryCheck: () => setLibraryChecked(true),
    onAnswerCourseCheck: answerCourseCheck
  });

  return (
    <div className="app-shell">
      <SideNav active={activeNav} onNavigate={navigate} apiState={apiState} />
      <main id="main-content" className="mx-auto flex min-h-0 w-full max-w-[1240px] flex-col gap-5 overflow-y-auto pb-2 lg:overflow-visible lg:pb-0">
        {routeContent}
      </main>
      <RightRail home={home} onNavigate={navigate} />
      <BottomNav active={activeNav} onNavigate={navigate} />
    </div>
  );
}

function renderRoute({
  route,
  home,
  course,
  session,
  enrollment,
  topics,
  query,
  quiz,
  quizResult,
  quizStatus,
  likedBites,
  savedBites,
  audioPlaying,
  libraryMode,
  libraryChecked,
  courseResults,
  onNavigate,
  onQueryChange,
  onToggleTopic,
  onCreateCustomLearning,
  onCompleteSignIn,
  onEnrollCourse,
  onCompleteLesson,
  onAnswer,
  onToggleLike,
  onToggleSave,
  onToggleAudio,
  onLibraryModeChange,
  onLibraryCheck,
  onAnswerCourseCheck
}: {
  route: AppRoute;
  home: LearningHome;
  course: Course;
  session: LearnerSession | null;
  enrollment: CourseEnrollment | undefined;
  topics: LearningHome["topics"];
  query: string;
  quiz: LearningHome["quizzes"][number] | undefined;
  quizResult: QuizResult | null;
  quizStatus: "idle" | "checking";
  likedBites: Record<string, boolean>;
  savedBites: Record<string, boolean>;
  audioPlaying: boolean;
  libraryMode: LibraryMode;
  libraryChecked: boolean;
  courseResults: Record<string, CourseCheckResult>;
  onNavigate: Navigate;
  onQueryChange: (query: string) => void;
  onToggleTopic: (topicID: string) => void;
  onCreateCustomLearning: (draft: CustomLearningDraft) => void;
  onCompleteSignIn: (session: LearnerSession) => void;
  onEnrollCourse: (courseId: string) => void;
  onCompleteLesson: (courseId: string, lessonId: string) => void;
  onAnswer: (optionId: string) => void;
  onToggleLike: (biteId: string) => void;
  onToggleSave: (bite: LearningHome["feed"][number]) => void;
  onToggleAudio: () => void;
  onLibraryModeChange: (mode: LibraryMode) => void;
  onLibraryCheck: () => void;
  onAnswerCourseCheck: (quizId: string, optionId: string) => void;
}) {
  if (route.name === "signin") {
    return <SignInPage session={session} onComplete={onCompleteSignIn} />;
  }
  if (route.name === "browse") {
    return <BrowsePage home={home} course={course} session={session} topics={topics} query={query} onQueryChange={onQueryChange} onToggleTopic={onToggleTopic} onCreateCustomLearning={onCreateCustomLearning} onNavigate={onNavigate} />;
  }
  if (route.name === "topic") {
    return <TopicPage home={home} topicId={route.topicId} onNavigate={onNavigate} />;
  }
  if (route.name === "course") {
    if (route.lessonId) {
      return <CourseLessonPage course={course} lessonId={route.lessonId} enrollment={enrollment} results={courseResults} onNavigate={onNavigate} onEnroll={onEnrollCourse} onCompleteLesson={onCompleteLesson} onAnswer={onAnswerCourseCheck} />;
    }
    return <CoursePage course={course} enrollment={enrollment} onNavigate={onNavigate} onEnroll={onEnrollCourse} />;
  }
  if (route.name === "feed") {
    return (
      <FeedPage
        home={home}
        biteId={route.biteId}
        quiz={quiz}
        quizResult={quizResult}
        quizStatus={quizStatus}
        likedBites={likedBites}
        savedBites={savedBites}
        audioPlaying={audioPlaying}
        onNavigate={onNavigate}
        onAnswer={onAnswer}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
        onToggleAudio={onToggleAudio}
      />
    );
  }
  if (route.name === "play") {
    return <PlayPage home={home} labId={route.labId} onNavigate={onNavigate} />;
  }
  if (route.name === "library") {
    return <LibraryPage home={home} savedBites={savedBites} mode={libraryMode} checked={libraryChecked} onNavigate={onNavigate} onModeChange={onLibraryModeChange} onCheck={onLibraryCheck} />;
  }
  if (route.name === "progress") {
    return <ProgressPage home={home} course={course} session={session} enrollment={enrollment} />;
  }
  return <HomePage home={home} session={session} onNavigate={onNavigate} />;
}

function SignInPage({ session, onComplete }: { session: LearnerSession | null; onComplete: (session: LearnerSession) => void }) {
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [selectedObjectives, setSelectedObjectives] = useState<LearnerObjectiveId[]>(session?.objectiveIds.length ? session.objectiveIds : ["algorithms"]);

  function toggleObjective(objectiveId: LearnerObjectiveId) {
    setSelectedObjectives((current) => {
      if (current.includes(objectiveId)) {
        return current.length === 1 ? current : current.filter((id) => id !== objectiveId);
      }
      return [...current, objectiveId];
    });
  }

  function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      return;
    }
    onComplete({
      name: trimmedName,
      email: trimmedEmail,
      objectiveIds: selectedObjectives.length ? selectedObjectives : ["algorithms"]
    });
  }

  return (
    <section className="grid gap-5">
      <header className="rounded-[28px] border-2 border-ink bg-paper/95 p-5 shadow-sketch md:p-6">
        <p className="flex items-center gap-2 text-sm font-bold uppercase text-teal">
          <UserPlus aria-hidden="true" size={18} />
          New learner
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold leading-none md:text-5xl">Build your learning plan</h1>
        <p className="mt-3 max-w-[68ch] text-sm leading-6 text-muted md:text-base">
          Start with a name, a learning objective, and a path that can move from quick lessons into diagrams, games, checks, and completion.
        </p>
      </header>
      <form onSubmit={submitPlan} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section className="rounded-[26px] border-2 border-teal bg-paper/95 p-4 shadow-sketch md:p-5">
          <p className="text-sm font-bold uppercase text-teal">Account</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-12 rounded-2xl border-2 border-ink bg-white/70 px-4 text-base font-bold outline-none placeholder:text-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[oklch(var(--ring))]"
                placeholder="Jordan"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-12 rounded-2xl border-2 border-ink bg-white/70 px-4 text-base font-bold outline-none placeholder:text-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[oklch(var(--ring))]"
                placeholder="learner@example.com"
              />
            </label>
          </div>
          <div className="mt-5 grid gap-3">
            <p className="text-sm font-bold uppercase text-violet">Objectives</p>
            {learnerObjectives.map((objective) => {
              const selected = selectedObjectives.includes(objective.id);
              return (
                <button
                  key={objective.id}
                  type="button"
                  aria-label={`${objective.label} objective`}
                  aria-pressed={selected}
                  onClick={() => toggleObjective(objective.id)}
                  className={`min-h-16 rounded-[20px] border-2 border-ink px-4 py-3 text-left transition active:translate-y-0.5 ${
                    selected ? "bg-violet text-white" : "bg-white/55 hover:bg-violet/10"
                  }`}
                >
                  <span className="block text-base font-bold">{objective.label}</span>
                  <span className={`mt-1 block text-sm leading-5 ${selected ? "text-white/85" : "text-muted"}`}>{objective.description}</span>
                </button>
              );
            })}
          </div>
          <button type="submit" disabled={!name.trim() || !email.trim()} className="mt-5 min-h-12 rounded-full border-2 border-ink bg-teal px-5 text-sm font-bold text-white transition-transform active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50">
            Build learning plan
          </button>
        </section>
        <aside className="grid content-start gap-4 rounded-[26px] border-2 border-ember bg-paper/95 p-4 shadow-sketch md:p-5">
          <p className="text-sm font-bold uppercase text-ember">Program preview</p>
          <h2 className="font-display text-3xl font-bold">Your first path</h2>
          <div className="grid gap-2">
            {["Find a course", "Enroll and start", "Watch the model move", "Play a tactile lab", "Pass the check", "Complete the course"].map((step, index) => (
              <div key={step} className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-line bg-white/50 p-3 text-sm font-bold">
                <span className="grid size-8 place-items-center rounded-full border-2 border-ink bg-paper">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </aside>
      </form>
    </section>
  );
}

function SideNav({ active, onNavigate, apiState }: { active: NavId; onNavigate: Navigate; apiState: ApiState }) {
  return (
    <aside className="sticky top-5 hidden h-[calc(100dvh-40px)] flex-col justify-between rounded-[22px] border-2 border-ink bg-paper/80 p-4 shadow-sketch lg:flex">
      <div>
        <RouteLink to="/" onNavigate={onNavigate} className="block whitespace-nowrap font-display text-lg font-bold leading-none text-teal">
          brainbuilder
        </RouteLink>
        <nav className="mt-8 grid gap-2" aria-label="Main">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <RouteLink
                key={item.id}
                to={item.path}
                onNavigate={onNavigate}
                aria-current={selected ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold transition ${
                  selected ? "bg-teal text-white" : "text-ink hover:bg-teal/10"
                }`}
              >
                <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
                {item.label}
              </RouteLink>
            );
          })}
        </nav>
      </div>
      <div className="rounded-2xl border border-line bg-white/50 p-3 text-sm">
        <div className="flex items-center gap-2 font-bold">
          <Flame aria-hidden="true" size={18} className="text-ember" />
          12
        </div>
        <p className="mt-1 text-muted">{statusLabel(apiState)}</p>
      </div>
    </aside>
  );
}

function statusLabel(apiState: ApiState) {
  if (apiState === "synced") {
    return "Synced to API";
  }
  if (apiState === "loading") {
    return "Syncing live learning data";
  }
  if (apiState === "offline") {
    return "Using local cache";
  }
  return "Ready offline";
}

function HomePage({ home, session, onNavigate }: { home: LearningHome; session: LearnerSession | null; onNavigate: Navigate }) {
  const currentPath = home.paths.find((path) => path.modules.some((module) => module.status === "current")) ?? home.paths[0];
  const bite = home.feed[0];
  const playground = home.playgrounds[0];

  return (
    <>
      <Header home={home} session={session} onNavigate={onNavigate} />
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-violet">Today&apos;s learning rail</p>
              <h2 className="font-display text-3xl font-bold">Pick up where your brain left off.</h2>
            </div>
            <RouteLink to="/browse" onNavigate={onNavigate} className="rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold hover:bg-teal hover:text-white">
              Browse
            </RouteLink>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {home.paths.map((path) => (
              <PathSummaryCard key={path.id} path={path} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {bite ? (
            <article className="rounded-[26px] border-2 border-ember bg-paper/95 p-4 shadow-sketch">
              <p className="text-sm font-bold uppercase text-ember">Next bite</p>
              <h2 className="font-display text-3xl font-bold">{bite.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{bite.prompt}</p>
              <RouteLink to={`/feed?bite=${bite.id}`} onNavigate={onNavigate} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ember px-4 py-2 text-sm font-bold text-white">
                Start bite <ChevronRight aria-hidden="true" size={16} />
              </RouteLink>
            </article>
          ) : null}
          {playground ? (
            <article className="rounded-[26px] border-2 border-ink bg-white/55 p-4 shadow-sketch">
              <p className="text-sm font-bold uppercase text-violet">Practice unlocked</p>
              <h2 className="font-display text-3xl font-bold">{playground.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{playground.description}</p>
              <RouteLink to={`/play?lab=${playground.id}`} onNavigate={onNavigate} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold hover:bg-violet hover:text-white">
                Play lab <ChevronRight aria-hidden="true" size={16} />
              </RouteLink>
            </article>
          ) : null}
        </div>
      </section>
      {currentPath ? <PathMap path={currentPath} /> : null}
    </>
  );
}

function Header({ home, session, onNavigate }: { home: LearningHome; session: LearnerSession | null; onNavigate: Navigate }) {
  return (
    <header className="grid gap-4 rounded-[26px] border-2 border-ink bg-paper/90 p-4 shadow-sketch md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] md:p-6">
      <div>
        <p className="text-sm font-bold uppercase text-teal">Learn anything</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-[0.95] md:text-6xl">Good morning, {home.user.name}</h1>
        <p className="mt-4 max-w-[58ch] text-base leading-7 text-muted">
          Build a paved path from tiny lessons, quick checks, and tactile games. Start where your curiosity is warm.
        </p>
      </div>
      <div className="grid content-between gap-3 rounded-[22px] border-2 border-teal bg-white/55 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Daily goal</span>
          <span className="rounded-full border border-line px-3 py-1 text-sm font-bold">
            {home.stats.dailyGoalCompleted}/{home.stats.dailyGoalTarget}
          </span>
        </div>
        <div aria-label="Daily goal progress" className="h-3 rounded-full bg-line/60">
          <div className="h-full rounded-full bg-teal" style={{ width: `${(home.stats.dailyGoalCompleted / home.stats.dailyGoalTarget) * 100}%` }} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Flame aria-hidden="true" className="text-ember" size={18} />
          {home.stats.streakDays}-day streak
        </div>
        {session ? (
          <p className="rounded-2xl border border-teal bg-teal/10 px-3 py-2 text-sm font-bold text-teal">Plan active for {session.name}</p>
        ) : (
          <RouteLink to="/signin" onNavigate={onNavigate} className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-ink bg-paper px-4 text-sm font-bold hover:bg-teal hover:text-white">
            Sign in
          </RouteLink>
        )}
      </div>
    </header>
  );
}

function BrowsePage({
  home,
  course,
  session,
  topics,
  query,
  onQueryChange,
  onToggleTopic,
  onCreateCustomLearning,
  onNavigate
}: {
  home: LearningHome;
  course: Course;
  session: LearnerSession | null;
  topics: LearningHome["topics"];
  query: string;
  onQueryChange: (query: string) => void;
  onToggleTopic: (topicID: string) => void;
  onCreateCustomLearning: (draft: CustomLearningDraft) => void;
  onNavigate: Navigate;
}) {
  const [customTitle, setCustomTitle] = useState("");
  const [customKind, setCustomKind] = useState<CustomLearningKind>("topic");
  const [customMode, setCustomMode] = useState<LearningMode>("visual");
  const activeTopicLabels = topics.filter((topic) => topic.selected).map((topic) => topic.label);
  const selectedObjectiveLabels = learnerObjectives.filter((objective) => session?.objectiveIds.includes(objective.id)).map((objective) => objective.label);
  const results = useMemo(() => searchLearning(home, query, activeTopicLabels), [home, query, activeTopicLabels.join("|")]);
  const normalized = query.trim();
  const resultCount = results.paths.length + results.feed.length + results.playgrounds.length;
  const coverage = computeCourseCoverage(course);
  const topicSummary = activeTopicLabels.length === 1 ? `topic ${activeTopicLabels[0]}` : `topics ${activeTopicLabels.join(" + ")}`;
  const resultSummary = normalized
    ? `${resultCount} ${resultCount === 1 ? "result" : "results"} for "${normalized}"`
    : activeTopicLabels.length
      ? `${resultCount} ${resultCount === 1 ? "result" : "results"} for ${topicSummary}`
      : `${resultCount} learning routes ready`;

  function submitCustomLearning(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customTitle.trim()) {
      return;
    }
    onCreateCustomLearning({ title: customTitle, kind: customKind, mode: customMode });
    setCustomTitle("");
  }

  return (
    <section className="grid gap-5">
      <PageIntro eyebrow="Browse" title="Browse learning" copy="Search across paths, bite-sized lessons, and tactile labs. Results open into full learning surfaces instead of collapsing into this page." />
      {session ? (
        <section className="rounded-[24px] border-2 border-violet bg-paper/95 p-4 shadow-sketch md:p-5" aria-label="Learner objectives">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase text-violet">
                <Target aria-hidden="true" size={18} />
                Learning plan for {session.name}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold">Objectives locked in</h2>
            </div>
            <span className="rounded-full border-2 border-violet bg-violet/10 px-3 py-2 text-sm font-bold">{selectedObjectiveLabels.length} active</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedObjectiveLabels.map((label) => (
              <span key={label} className="rounded-full border-2 border-ink bg-white/55 px-4 py-2 text-sm font-bold">
                {label}
              </span>
            ))}
          </div>
        </section>
      ) : null}
      <div className="soft-panel rounded-[24px] p-4 md:p-5">
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border-2 border-teal bg-paper px-3 text-muted focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-[3px] focus-within:outline-[oklch(var(--ring))]">
          <Search aria-hidden="true" size={20} />
          <span className="sr-only">Search all learning</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted focus-visible:outline-none"
            placeholder='Search "trees", "finance", "Atomic Habits"...'
          />
        </label>
        <p className="mt-3 text-sm font-bold text-teal">{resultSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              aria-label={`${topic.label} topic`}
              aria-pressed={topic.selected}
              onClick={() => onToggleTopic(topic.id)}
              className={`rounded-full border-2 border-ink px-4 py-2 text-sm font-bold transition active:translate-y-0.5 ${
                topic.selected ? "bg-teal text-white" : "bg-paper hover:bg-teal/10"
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
        <form aria-label="Build custom learning path" onSubmit={submitCustomLearning} className="mt-5 grid gap-3 rounded-[22px] border-2 border-ink bg-white/50 p-4">
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <label className="grid gap-2">
              <span className="text-sm font-bold uppercase text-ember">Build anything</span>
              <input
                type="text"
                aria-label="Custom learning goal"
                value={customTitle}
                onChange={(event) => setCustomTitle(event.target.value)}
                className="min-h-12 rounded-2xl border-2 border-ink bg-paper px-4 text-base font-bold outline-none placeholder:text-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[oklch(var(--ring))]"
                placeholder="A book, topic, or skill"
              />
            </label>
            <button type="submit" disabled={!customTitle.trim()} className="min-h-12 rounded-full border-2 border-ink bg-ember px-5 text-sm font-bold text-white transition-transform active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50">
              Build custom path
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["topic", "book", "skill"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                aria-pressed={customKind === kind}
                onClick={() => setCustomKind(kind)}
                className={`min-h-10 rounded-full border-2 border-ink px-4 text-sm font-bold capitalize ${customKind === kind ? "bg-teal text-white" : "bg-paper"}`}
              >
                {kind}
              </button>
            ))}
            {(["text", "audio", "visual", "interactive"] as LearningMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={customMode === mode}
                onClick={() => setCustomMode(mode)}
                className={`min-h-10 rounded-full border-2 border-ink px-4 text-sm font-bold capitalize ${customMode === mode ? "bg-violet text-white" : "bg-paper"}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </form>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="grid gap-5">
          <section className="rounded-[24px] border-2 border-teal bg-paper/95 p-4 shadow-sketch">
            <p className="text-sm font-bold uppercase text-teal">Course framework</p>
            <h2 className="mt-1 font-display text-3xl font-bold">{course.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{course.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
              <span className="rounded-full border border-line bg-white/50 px-3 py-1">{coverage.unitCount} units</span>
              <span className="rounded-full border border-line bg-white/50 px-3 py-1">{coverage.lessonCount} micro lessons</span>
              <span className="rounded-full border border-line bg-white/50 px-3 py-1">{coverage.assessmentCount} checks</span>
            </div>
            <RouteLink to={`/courses/${course.id}`} onNavigate={onNavigate} aria-label={`Open ${course.title} course`} className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-teal px-4 py-2 text-sm font-bold text-white">
              Open course <ChevronRight aria-hidden="true" size={16} />
            </RouteLink>
          </section>
          <ResultGroup title="Paths" empty="No guided paths match that search.">
            {results.paths.map((path) => (
              <RouteLink key={path.id} to={`/topics/${path.id}`} onNavigate={onNavigate} aria-label={`Open ${path.title}`} className="block rounded-[22px] border-2 border-ink bg-paper/95 p-4 shadow-sketch hover:-translate-y-0.5 hover:bg-white">
                <p className="text-sm font-bold uppercase text-violet">Guided path</p>
                <h2 className="mt-1 font-display text-3xl font-bold">{path.title}</h2>
                <p className="mt-1 text-sm text-muted">{path.subtitle}</p>
                <ProgressBar value={path.progress} accent={path.accent} />
              </RouteLink>
            ))}
          </ResultGroup>
        </div>
        <div className="grid gap-5">
          <ResultGroup title="Bites" empty="No quick lessons match that search.">
            {results.feed.map((bite) => (
              <RouteLink key={bite.id} to={`/feed?bite=${bite.id}`} onNavigate={onNavigate} className="block rounded-[20px] border-2 border-ember bg-paper/95 p-4 hover:bg-ember/10">
                <p className="text-sm font-bold text-ember">{bite.topic}</p>
                <h2 className="mt-1 text-xl font-bold">{bite.title}</h2>
                <p className="mt-1 text-sm text-muted">{bite.durationSeconds}s · {bite.modes.join(" + ")}</p>
              </RouteLink>
            ))}
          </ResultGroup>
          <ResultGroup title="Labs" empty="No practice labs match that search.">
            {results.playgrounds.map((playground) => (
              <RouteLink key={playground.id} to={`/play?lab=${playground.id}`} onNavigate={onNavigate} className="block rounded-[20px] border-2 border-violet bg-paper/95 p-4 hover:bg-violet/10">
                <p className="text-sm font-bold uppercase text-violet">Interactive</p>
                <h2 className="mt-1 text-xl font-bold">{playground.title}</h2>
                <p className="mt-1 text-sm text-muted">{playground.description}</p>
              </RouteLink>
            ))}
          </ResultGroup>
        </div>
      </div>
    </section>
  );
}

function CoursePage({
  course,
  enrollment,
  onNavigate,
  onEnroll
}: {
  course: Course;
  enrollment: CourseEnrollment | undefined;
  onNavigate: Navigate;
  onEnroll: (courseId: string) => void;
}) {
  const coverage = computeCourseCoverage(course);
  const lessons = courseLessons(course);
  const firstLesson = lessons[0];
  const firstOpenLesson = lessons.find((lessonItem) => !enrollment?.completedLessons[lessonItem.id]) ?? firstLesson;
  const completedCount = enrollment ? Object.keys(enrollment.completedLessons).length : 0;
  const complete = enrollment?.status === "complete";

  return (
    <section className="grid gap-5">
      <header className="rounded-[28px] border-2 border-ink bg-paper/95 p-5 shadow-sketch md:p-6">
        <p className="text-sm font-bold uppercase text-teal">Course framework</p>
        <h1 className="mt-1 font-display text-4xl font-bold leading-none md:text-6xl">{course.title}</h1>
        <p className="mt-3 max-w-[72ch] text-sm leading-6 text-muted md:text-base">{course.subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          <span className="rounded-full border-2 border-teal bg-teal/10 px-3 py-1">{coverage.unitCount} units</span>
          <span className="rounded-full border-2 border-ember bg-ember/10 px-3 py-1">{coverage.lessonCount} micro lessons</span>
          <span className="rounded-full border-2 border-violet bg-violet/10 px-3 py-1">{coverage.blockCount} content blocks</span>
          <span className="rounded-full border-2 border-ink bg-white/45 px-3 py-1">{coverage.assessmentCount} checks and labs</span>
        </div>
      </header>
      <section className={`rounded-[24px] border-2 bg-paper/95 p-4 shadow-sketch md:p-5 ${complete ? "border-violet" : enrollment ? "border-teal" : "border-ember"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-sm font-bold uppercase ${complete ? "text-violet" : enrollment ? "text-teal" : "text-ember"}`}>Enrollment</p>
            <h2 className="mt-1 font-display text-3xl font-bold">{complete ? "Course complete" : enrollment ? "Enrolled" : "Choose this learning path"}</h2>
            <p className="mt-2 text-sm font-bold text-muted">{completedCount}/{lessons.length} lessons complete</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!enrollment ? (
              <button type="button" onClick={() => onEnroll(course.id)} className="min-h-12 rounded-full border-2 border-ink bg-teal px-5 text-sm font-bold text-white transition-transform active:scale-[0.96]">
                Enroll in course
              </button>
            ) : null}
            {enrollment && firstOpenLesson ? (
              <RouteLink to={`/courses/${course.id}/lessons/${firstOpenLesson.id}`} onNavigate={onNavigate} className="inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-paper px-5 text-sm font-bold hover:bg-teal hover:text-white">
                Start first lesson
              </RouteLink>
            ) : null}
          </div>
        </div>
        {complete ? <p className="mt-3 rounded-2xl border border-violet bg-violet/10 px-3 py-2 text-sm font-bold text-violet">Certificate ready</p> : null}
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(290px,360px)]">
        <section className="grid gap-4">
          {course.units.map((unit, unitIndex) => (
            <article key={unit.id} className="rounded-[26px] border-2 border-ink bg-paper/95 p-4 shadow-sketch">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase text-violet">Unit {unitIndex + 1}</p>
                  <h2 className="font-display text-3xl font-bold">{unit.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{unit.summary}</p>
                </div>
                <span className="rounded-full border border-line bg-white/50 px-3 py-1 text-sm font-bold">{unit.lessons.length} lessons</span>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {unit.lessons.map((lessonItem) => (
                  <RouteLink key={lessonItem.id} to={`/courses/${course.id}/lessons/${lessonItem.id}`} onNavigate={onNavigate} className="rounded-2xl border border-line bg-white/45 p-3 text-sm font-bold hover:border-teal hover:bg-teal/10">
                    {lessonItem.title}
                  </RouteLink>
                ))}
              </div>
            </article>
          ))}
        </section>
        <aside className="grid content-start gap-4">
          <section className="rounded-[24px] border-2 border-teal bg-paper/95 p-4 shadow-sketch">
            <h2 className="font-display text-3xl font-bold">Renderer kit</h2>
            <p className="mt-1 text-sm text-muted">Course blocks declare renderer families with fallbacks for web, native, and reduced-motion surfaces.</p>
            <div className="mt-4 grid gap-2">
              {course.rendererCapabilities.map((renderer) => (
                <div key={renderer.family} className="rounded-2xl border border-line bg-white/45 p-3">
                  <p className="font-bold">{renderer.family}</p>
                  <p className="text-sm text-muted">{renderer.component}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[24px] border-2 border-ember bg-paper/95 p-4 shadow-sketch">
            <h2 className="font-display text-3xl font-bold">Coverage</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {coverage.blockKinds.map((kind) => (
                <span key={kind} className="rounded-full border border-line bg-white/50 px-3 py-1 text-sm font-bold">{kind}</span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function CourseLessonPage({
  course,
  lessonId,
  enrollment,
  results,
  onNavigate,
  onEnroll,
  onCompleteLesson,
  onAnswer
}: {
  course: Course;
  lessonId: string;
  enrollment: CourseEnrollment | undefined;
  results: Record<string, CourseCheckResult>;
  onNavigate: Navigate;
  onEnroll: (courseId: string) => void;
  onCompleteLesson: (courseId: string, lessonId: string) => void;
  onAnswer: (quizId: string, optionId: string) => void;
}) {
  const selectedLesson = findLesson(course, lessonId);
  const lessons = courseLessons(course);
  const showMobileLessonPreview = useNarrowViewport();

  if (!selectedLesson) {
    return (
      <section className="rounded-[26px] border-2 border-ink bg-paper/95 p-5 shadow-sketch">
        <p className="text-sm font-bold uppercase text-ember">Lesson not found</p>
        <h1 className="font-display text-4xl font-bold">Course lesson unavailable</h1>
        <RouteLink to={`/courses/${course.id}`} onNavigate={onNavigate} className="mt-4 inline-flex rounded-full border-2 border-ink bg-teal px-4 py-2 text-sm font-bold text-white">
          Back to course
        </RouteLink>
      </section>
    );
  }

  const lessonIndex = lessons.findIndex((lessonItem) => lessonItem.id === selectedLesson.id);
  const nextLesson = lessons[lessonIndex + 1];
  const isLastLesson = lessonIndex === lessons.length - 1;
  const quizBlocks = selectedLesson.blocks.filter((block): block is QuizBlock => block.kind === "quiz");
  const hasPassedCheck = quizBlocks.length === 0 || quizBlocks.some((block) => results[block.id]?.correct);
  const completedCount = enrollment ? Object.keys(enrollment.completedLessons).length : 0;
  const lessonComplete = Boolean(enrollment?.completedLessons[selectedLesson.id]);
  const courseComplete = enrollment?.status === "complete";
  const primaryBlock = selectedLesson.blocks.find((block) => ["diagram", "simulation", "code-trace", "lab", "project"].includes(block.kind));
  const secondaryBlocks = primaryBlock ? selectedLesson.blocks.filter((block) => block.id !== primaryBlock.id) : selectedLesson.blocks;

  return (
    <section className="lesson-page grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <header className="lesson-hero min-w-0 rounded-[28px] border-2 border-ink bg-paper/95 p-4 shadow-sketch md:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-teal">Course lesson</p>
            <h1 className="mt-1 text-wrap break-words font-display text-4xl font-bold leading-none md:text-5xl">{selectedLesson.title}</h1>
            <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted md:text-base">{selectedLesson.summary}</p>
            <div className="lesson-outcome-strip mt-3 flex flex-wrap gap-2">
              {selectedLesson.outcomes.map((outcome) => (
                <span key={outcome} className="rounded-full border border-line bg-white/50 px-3 py-1 text-sm font-bold">{outcome}</span>
              ))}
            </div>
          </div>
          <div className="lesson-progress-card min-w-0 rounded-[20px] border-2 border-ink bg-white/55 p-3 text-sm font-bold shadow-[3px_4px_0_oklch(var(--ink)/0.1)]">
            <p className={`uppercase ${courseComplete ? "text-violet" : enrollment ? "text-teal" : "text-ember"}`}>{courseComplete ? "Completed" : enrollment ? "Enrolled" : "Track to save progress"}</p>
            <p className="mt-1 text-2xl font-black">{completedCount}/{lessons.length}</p>
            <p className="text-muted">{completedCount}/{lessons.length} lessons complete</p>
          </div>
        </div>
      </header>
      <div className="lesson-studio grid min-w-0 gap-4 xl:grid-cols-2">
        {showMobileLessonPreview ? (
          <div className="min-w-0 xl:hidden">
            <LessonTeachingPreview lesson={selectedLesson} />
          </div>
        ) : null}
        {primaryBlock ? (
          <div className="min-w-0 xl:order-1">
            <CourseBlockView block={primaryBlock} result={primaryBlock.kind === "quiz" ? results[primaryBlock.id] : undefined} onAnswer={onAnswer} />
          </div>
        ) : null}
        <div className="min-w-0 xl:order-2">
          <LessonTeachingContent lesson={selectedLesson} ariaLabel={showMobileLessonPreview ? "Lesson teaching details" : "Lesson teaching notes"} />
        </div>
      </div>
      <section className={`lesson-action-strip rounded-[24px] border-2 bg-paper/95 p-4 shadow-sketch ${courseComplete ? "border-violet" : enrollment ? "border-teal" : "border-ember"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-bold uppercase ${courseComplete ? "text-violet" : enrollment ? "text-teal" : "text-ember"}`}>{courseComplete ? "Course complete" : enrollment ? "Enrolled course" : "Track this course"}</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{lessonComplete || courseComplete ? "Lesson complete" : isLastLesson ? "Capstone checkpoint" : "Lesson checkpoint"}</h2>
            {!hasPassedCheck && enrollment ? <p className="mt-2 text-sm font-bold text-ember">Pass the quick check to unlock lesson completion.</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {!enrollment ? (
              <button type="button" onClick={() => onEnroll(course.id)} className="min-h-12 rounded-full border-2 border-ink bg-teal px-5 text-sm font-bold text-white transition-transform active:scale-[0.96]">
                Enroll in course
              </button>
            ) : null}
            {enrollment && !courseComplete && !lessonComplete ? (
              <button
                type="button"
                onClick={() => onCompleteLesson(course.id, selectedLesson.id)}
                disabled={!hasPassedCheck}
                className="min-h-12 rounded-full border-2 border-ink bg-teal px-5 text-sm font-bold text-white transition-transform active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLastLesson ? "Complete course" : "Complete lesson"}
              </button>
            ) : null}
            {enrollment && lessonComplete && nextLesson && !courseComplete ? (
              <RouteLink to={`/courses/${course.id}/lessons/${nextLesson.id}`} onNavigate={onNavigate} className="inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-paper px-5 text-sm font-bold hover:bg-teal hover:text-white">
                Next lesson
              </RouteLink>
            ) : null}
            {courseComplete ? (
              <RouteLink to="/progress" onNavigate={onNavigate} className="inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-violet px-5 text-sm font-bold text-white">
                View completion
              </RouteLink>
            ) : null}
          </div>
        </div>
        {courseComplete ? <p className="mt-3 rounded-2xl border border-violet bg-violet/10 px-3 py-2 text-sm font-bold text-violet">Certificate ready</p> : null}
      </section>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
        {secondaryBlocks.map((block) => (
          <CourseBlockView key={block.id} block={block} result={block.kind === "quiz" ? results[block.id] : undefined} onAnswer={onAnswer} />
        ))}
      </div>
      <aside className="course-map-rail soft-panel rounded-[24px] p-4" aria-label="Course map">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Course map</h2>
          <span className="rounded-full border border-line bg-white/55 px-3 py-1 text-xs font-bold uppercase text-muted">{lessons.length} lessons</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {lessons.map((lessonItem, index) => (
            <RouteLink
              key={lessonItem.id}
              to={`/courses/${course.id}/lessons/${lessonItem.id}`}
              onNavigate={onNavigate}
              className={`min-w-[190px] rounded-2xl border px-3 py-3 text-sm font-bold ${lessonItem.id === selectedLesson.id ? "border-teal bg-teal/10 text-teal" : enrollment?.completedLessons[lessonItem.id] || courseComplete ? "border-violet bg-violet/10 text-violet" : "border-line bg-white/45 text-ink"}`}
            >
              <span className="block text-xs uppercase opacity-70">Lesson {index + 1}</span>
              {lessonItem.title}
            </RouteLink>
          ))}
        </div>
      </aside>
    </section>
  );
}

function lessonFlowLabel(block: CourseBlock) {
  switch (block.kind) {
    case "text":
      return "Read the idea";
    case "audio":
      return "Audio brief";
    case "diagram":
      return "Watch the model";
    case "simulation":
      return "Try the interaction";
    case "code-trace":
      return "Trace the code";
    case "quiz":
      return "Quick check";
    case "lab":
      return "Practice lab";
    case "project":
      return "Build and explain";
    default:
      return "Learning step";
  }
}

function LessonTeachingPreview({ lesson }: { lesson: CourseLesson }) {
  const blockFlow = lesson.blocks.slice(0, 3).map((block, index) => ({
    id: block.id,
    title: lessonFlowLabel(block),
    label: block.modality,
    index: index + 1
  }));

  return (
    <section className="lesson-flow-preview min-w-0 rounded-[24px] border-2 border-ink bg-paper/95 p-3 shadow-sketch" aria-label="Lesson teaching notes">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-teal">Predict, watch, try</p>
          <h2 className="font-display text-2xl font-bold">Loop preview</h2>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-bold text-muted">{lesson.estimatedMinutes} min</span>
      </div>
      <p className="lesson-preview-body mt-2 text-sm font-bold leading-5 text-muted">{lesson.summary}</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Lesson flow">
        {blockFlow.map((step) => (
          <a key={step.id} href={`#${step.id}`} className="min-w-[150px] rounded-2xl border border-line bg-white/65 px-3 py-2 text-xs font-bold text-ink">
            <span className="block uppercase text-muted">Step {step.index} · {step.label}</span>
            <span className="block truncate">{step.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function LessonTeachingContent({ lesson, ariaLabel = "Lesson teaching notes" }: { lesson: CourseLesson; ariaLabel?: string }) {
  const guide = getLessonLearningGuide(lesson);
  const sections = teachingSectionsForGuide(guide, lesson.id);
  const blockFlow = lesson.blocks.map((block, index) => ({
    id: block.id,
    title: lessonFlowLabel(block),
    label: block.modality,
    index: index + 1
  }));

  return (
    <section className="lesson-flow-board min-w-0 rounded-[26px] p-4 md:p-5" aria-label={ariaLabel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-teal">Predict, watch, try, explain</p>
          <h2 className="mt-1 text-wrap-balance font-display text-3xl font-bold">Learning loop</h2>
        </div>
        <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-sm font-bold text-muted">{lesson.estimatedMinutes} min</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3" aria-label="Lesson flow">
        {blockFlow.map((step) => (
          <a key={step.id} href={`#${step.id}`} className="lesson-flow-step rounded-2xl border border-line bg-white/60 px-3 py-2 text-sm font-bold text-ink">
            <span className="block text-xs uppercase text-muted">Step {step.index} · {step.label}</span>
            <span className="block truncate">{step.title}</span>
          </a>
        ))}
      </div>
      <div className="lesson-guide-grid mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
        {sections.map((section, index) => (
          <article key={section.title} className={`algorithm-teaching-card lesson-guide-card min-w-0 rounded-[22px] p-4 ${section.tone === "ember" ? "lesson-guide-card-ember" : section.tone === "violet" ? "lesson-guide-card-violet" : "lesson-guide-card-teal"}`} style={{ "--i": index } as CSSProperties}>
            <p className={`text-xs font-bold uppercase ${section.tone === "ember" ? "text-ember" : section.tone === "violet" ? "text-violet" : "text-teal"}`}>{section.kicker}</p>
            <h3 className="mt-1 text-wrap-balance font-display text-2xl font-bold">{section.title}</h3>
            <p className="mt-2 text-pretty text-sm leading-6 text-muted">{section.body}</p>
          </article>
        ))}
      </div>
      <div className="lesson-explain-back mt-4 rounded-[20px] border-2 border-ink bg-white/65 p-4 shadow-[3px_4px_0_oklch(var(--ink)/0.1)]">
        <p className="text-xs font-bold uppercase text-violet">Explain it back</p>
        <p className="mt-1 text-pretty text-sm font-bold leading-6 text-ink">{guide.explainBack}</p>
      </div>
    </section>
  );
}

function teachingSectionsForGuide(guide: LessonLearningGuide, lessonId: string) {
  const noticeTitle =
    lessonId === "tree-rotations" ? "What rotation preserves" :
    lessonId === "dp-table-fill" ? "Dependency rule" :
    "What to notice";

  return [
    {
      kicker: "why",
      title: noticeTitle,
      tone: "teal",
      body: guide.why
    },
    {
      kicker: "mental model",
      title: "Plain-English model",
      tone: "violet",
      body: guide.mentalModel
    },
    {
      kicker: "worked trace",
      title: "Worked example",
      tone: "ember",
      body: guide.workedExample
    },
    {
      kicker: "debug habit",
      title: "Mistake to avoid",
      tone: "violet",
      body: guide.commonTrap
    },
    {
      kicker: "practice",
      title: "Practice move",
      tone: "teal",
      body: guide.practicePrompt
    }
  ] as const;
}

function CourseBlockView({
  block,
  result,
  onAnswer
}: {
  block: CourseBlock;
  result?: CourseCheckResult;
  onAnswer: (quizId: string, optionId: string) => void;
}) {
  if (block.kind === "text") {
    return (
      <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-ink bg-paper/95 p-4 shadow-sketch">
        <p className="text-sm font-bold uppercase text-teal">Read</p>
        <h2 className="font-display text-3xl font-bold">{block.title}</h2>
        {block.body.map((paragraph) => <p key={paragraph} className="mt-2 text-sm leading-6 text-muted">{paragraph}</p>)}
      </article>
    );
  }
  if (block.kind === "audio") {
    return (
      <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-ember bg-paper/95 p-4 shadow-sketch">
        <p className="text-sm font-bold uppercase text-ember">Listen</p>
        <h2 className="font-display text-3xl font-bold">{block.title}</h2>
        <p className="mt-2 text-sm text-muted">{block.durationSeconds}s brief</p>
        <p className="mt-3 text-sm leading-6 text-muted">{block.script}</p>
      </article>
    );
  }
  if (block.kind === "diagram") {
    return <DiagramBlockView block={block} />;
  }
  if (block.kind === "simulation") {
    return <SimulationBlockView block={block} />;
  }
  if (block.kind === "code-trace") {
    return <CodeTraceStage block={block} />;
  }
  if (block.kind === "quiz") {
    return <CourseQuizBlock block={block} result={result} onAnswer={onAnswer} />;
  }
  if (block.kind === "lab") {
    return <LabBlockView block={block} />;
  }
  if (block.kind === "project") {
    return <ProjectStage block={block} />;
  }
  return (
    <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-ink bg-paper/95 p-4 shadow-sketch">
      <p className="text-sm font-bold uppercase text-teal">Reflect</p>
      <h2 className="font-display text-3xl font-bold">{block.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
    </article>
  );
}

function DiagramBlockView({ block }: { block: DiagramBlock }) {
  if (block.id === "binary-search-window") {
    return <D3BinarySearchWindow block={block} />;
  }
  if (block.id === "dp-grid-fill") {
    return <DPGridVisual block={block} />;
  }

  return <AnimatedLearningStage block={block} />;
}

function D3BinarySearchWindow({ block }: { block: DiagramBlock }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const values = Array.isArray(block.data.values) ? block.data.values.filter((value): value is number => typeof value === "number") : [4, 8, 12, 16, 20, 24, 28];
  const target = typeof block.data.target === "number" ? block.data.target : 20;
  const windows = [
    [0, values.length - 1],
    [Math.floor(values.length / 2), values.length - 1],
    [Math.floor(values.length / 2) + 1, values.length - 2],
    [values.indexOf(target), values.indexOf(target)]
  ];
  const clampedStep = Math.min(step, windows.length - 1);
  const [lo, hi] = windows[clampedStep] ?? [0, values.length - 1];
  const x = scaleLinear().domain([0, values.length - 1]).range([54, 366]);
  const traceSteps = [
    { label: "Predict", note: "Start with all seven values in the active window." },
    { label: "Compare", note: "Compare mid value 16. Since 20 is larger, everything left of 16 can be discarded." },
    { label: "Discard", note: "Move low right and compare inside the remaining sorted window." },
    { label: "Converge", note: "Only 20 remains, so the invariant has survived every cut." }
  ];
  const atStart = clampedStep === 0;
  const atEnd = clampedStep === windows.length - 1;

  useEffect(() => {
    if (!autoPlaying) {
      return;
    }
    if (atEnd) {
      setAutoPlaying(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, windows.length - 1));
    }, 520);
    return () => window.clearTimeout(timeout);
  }, [atEnd, autoPlaying, windows.length, clampedStep]);

  function nextSearchStep() {
    setPlaying(true);
    setAutoPlaying(false);
    setStep((current) => Math.min(current + 1, windows.length - 1));
  }

  function previousSearchStep() {
    setPlaying(true);
    setAutoPlaying(false);
    setStep((current) => Math.max(current - 1, 0));
  }

  function resetSearch() {
    setPlaying(false);
    setAutoPlaying(false);
    setStep(0);
  }

  function toggleSearchPlayback() {
    setPlaying(true);
    setAutoPlaying((current) => {
      if (current) return false;
      if (atEnd) setStep(0);
      return true;
    });
  }

  return (
    <article id={block.id} className="lesson-diagram-card scroll-mt-5 rounded-[24px] border-2 border-ember bg-paper/95 p-4 shadow-sketch">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-ember">D3 guided trace</p>
          <h2 className="font-display text-3xl font-bold">{block.title}</h2>
        </div>
        <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-sm font-bold">Step {clampedStep + 1} of {windows.length}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
      <svg
        role="img"
        aria-label="D3 binary search window"
        data-animated-diagram="binary-search"
        data-playing={playing || autoPlaying}
        data-step={clampedStep}
        data-step-label={traceSteps[clampedStep]?.label}
        data-invariant="target remains inside the active sorted window"
        viewBox="0 0 420 190"
        className="animated-lesson-diagram lesson-visual mt-4 min-h-[220px] w-full rounded-[20px] border-2 border-ink"
      >
        <line x1="54" y1="94" x2="366" y2="94" stroke="oklch(var(--ink))" strokeWidth="4" strokeLinecap="round" />
        {values.map((value, index) => {
          const active = index >= lo && index <= hi;
          const found = value === target && lo === hi;
          return (
            <g key={value} transform={`translate(${x(index)} 94)`} className={active ? "binary-node-active" : "binary-node-muted"}>
              <circle data-active={active} data-found={found} r="22" fill={found ? "oklch(var(--teal))" : active ? "oklch(var(--ember) / 0.76)" : "oklch(var(--paper-deep))"} stroke="oklch(var(--ink))" strokeWidth="3" />
              <text y="6" textAnchor="middle" fontSize="15" fontWeight="800" fill={found ? "white" : "oklch(var(--ink))"}>{value}</text>
            </g>
          );
        })}
        <path d={`M ${x(lo)} 124 L ${x(hi)} 124`} stroke="oklch(var(--teal))" strokeWidth="8" strokeLinecap="round" opacity="0.8" className="search-window-pulse" />
        <text x="210" y="155" textAnchor="middle" fontSize="16" fontWeight="800" fill="oklch(var(--ink))">
          low {lo + 1} - high {hi + 1}; target {target}
        </text>
      </svg>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {traceSteps.map((traceStep, index) => (
          <button
            key={traceStep.label}
            type="button"
            aria-pressed={index === clampedStep}
            onClick={() => {
              setPlaying(true);
              setAutoPlaying(false);
              setStep(index);
            }}
            className={`rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${index === clampedStep ? "border-ember bg-ember text-white" : "border-line bg-white/60 text-ink hover:border-ink"}`}
          >
            <span className="block text-xs uppercase opacity-75">Step {index + 1}</span>
            {traceStep.label}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-2xl border border-line bg-white/70 px-3 py-2 text-sm font-bold text-ink">{traceSteps[clampedStep]?.note}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <button type="button" aria-pressed={autoPlaying} onClick={toggleSearchPlayback} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-ember px-4 py-2 text-sm font-bold text-white">
          {autoPlaying ? <CirclePause aria-hidden="true" size={18} /> : <CirclePlay aria-hidden="true" size={18} />}
          Play full search walkthrough
        </button>
        <button type="button" onClick={nextSearchStep} disabled={atEnd} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepForward aria-hidden="true" size={18} />
          Next search step
        </button>
        <button type="button" onClick={previousSearchStep} disabled={atStart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepBack aria-hidden="true" size={18} />
          Previous search step
        </button>
        <button type="button" onClick={resetSearch} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold">
          <RotateCcw aria-hidden="true" size={18} />
          Reset search
        </button>
      </div>
    </article>
  );
}

function DPGridVisual({ block }: { block: DiagramBlock }) {
  const [filled, setFilled] = useState(0);
  const [wave, setWave] = useState(0);
  const total = 20;
  const atStart = filled === 0;
  const atEnd = filled === total;

  return (
    <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-teal bg-paper/95 p-4 shadow-sketch">
      <p className="text-sm font-bold uppercase text-teal">SVG grid</p>
      <h2 className="font-display text-3xl font-bold">{block.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
      <p className="mt-3 inline-flex rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-bold text-teal">Cells {filled} of {total}</p>
      <svg
        role="img"
        aria-label="DP grid fill"
        data-animated-diagram="dp-grid"
        data-wave={wave}
        viewBox="0 0 360 220"
        className="animated-lesson-diagram lesson-visual mt-4 min-h-[220px] w-full rounded-[20px] border-2 border-ink"
      >
        {Array.from({ length: total }).map((_, index) => {
          const row = Math.floor(index / 5);
          const column = index % 5;
          const active = index < filled;
          const inWave = wave > 0 && index < 5;
          return (
            <g key={index} className={inWave ? "dp-wave-cell" : undefined} style={{ "--i": index } as CSSProperties}>
              <rect data-filled={active} x={42 + column * 56} y={28 + row * 42} width="46" height="32" rx="8" fill={active ? "oklch(var(--teal) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="2" />
              <text x={65 + column * 56} y={49 + row * 42} textAnchor="middle" fontSize="13" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{index + 1}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setWave(1); setFilled((current) => Math.max(current, 5)); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-teal px-4 py-2 text-sm font-bold text-white">
          <CirclePlay aria-hidden="true" size={16} />
          Play fill wave
        </button>
        <button type="button" onClick={() => { setWave(0); setFilled((current) => Math.min(current + 1, total)); }} disabled={atEnd} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepForward aria-hidden="true" size={16} />
          Fill next cell
        </button>
        <button type="button" onClick={() => { setWave(0); setFilled((current) => Math.max(current - 1, 0)); }} disabled={atStart} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepBack aria-hidden="true" size={16} />
          Back one cell
        </button>
        <button type="button" onClick={() => { setWave(0); setFilled(0); }} disabled={atStart} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <RotateCcw aria-hidden="true" size={16} />
          Reset grid
        </button>
      </div>
      {filled > 0 ? <p className="mt-2 text-sm font-bold text-teal">Dependencies satisfied for {filled} {filled === 1 ? "cell" : "cells"}.</p> : null}
    </article>
  );
}

function SimulationBlockView({ block }: { block: SimulationBlock }) {
  if (block.id === "tree-rotation-3d") {
    return <ThreeTreeRotation block={block} />;
  }

  return <AnimatedLearningStage block={block} />;
}

function ThreeTreeRotation({ block }: { block: SimulationBlock }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationStep, setRotationStep] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window.WebGLRenderingContext === "undefined") {
      return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const width = Math.max(canvas.clientWidth, 320);
    const height = Math.max(canvas.clientHeight, 260);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 6);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const group = new THREE.Group();
    const material = new THREE.MeshNormalMaterial();
    const nodes = [
      [-1.6, 0.2, 0],
      [0, 1.2, 0],
      [1.6, 0.2, 0],
      [0.8, -1, 0]
    ];
    for (const [xPos, yPos, zPos] of nodes) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), material);
      sphere.position.set(xPos, yPos, zPos);
      group.add(sphere);
    }
    group.rotation.z = rotationStep * 0.32;
    scene.add(group);

    renderer.render(scene, camera);
    return () => renderer.dispose();
  }, [rotationStep]);

  return (
    <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-violet bg-paper/95 p-4 shadow-sketch">
      <p className="text-sm font-bold uppercase text-violet">Three simulation</p>
      <h2 className="font-display text-3xl font-bold">{block.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{block.successCriteria}</p>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Three tree rotation scene"
        data-renderer="three"
        data-animated-diagram="tree-rotation"
        data-rotation={rotationStep}
        className="animated-lesson-diagram course-three-scene mt-4 min-h-[280px] w-full rounded-[20px] border-2 border-ink"
      />
      <div className="mt-3 grid gap-2 rounded-2xl border border-line bg-white/55 p-3 text-sm font-bold md:grid-cols-3">
        <span>1. promote the right child</span>
        <span>2. slide the old root left</span>
        <span>3. keep the middle subtree ordered</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setRotationStep((current) => current + 1)} className="rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold">
          Rotate left
        </button>
        <button type="button" onClick={() => setRotationStep((current) => current - 1)} className="rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold">
          Rotate right
        </button>
        <button type="button" onClick={() => setRotationStep(0)} disabled={rotationStep === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <RotateCcw aria-hidden="true" size={16} />
          Reset rotation
        </button>
      </div>
      {rotationStep !== 0 ? <p className="mt-2 text-sm font-bold text-violet">Rotation applied. Inorder preserved: sorted order still reads 1, 2, 3, 4, 5.</p> : null}
    </article>
  );
}

function CourseQuizBlock({ block, result, onAnswer }: { block: QuizBlock; result?: CourseCheckResult; onAnswer: (quizId: string, optionId: string) => void }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  return (
    <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-ember bg-paper/95 p-4 shadow-sketch">
      <p className="text-sm font-bold uppercase text-ember">Check</p>
      <h2 className="font-display text-3xl font-bold">{block.question}</h2>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {block.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selectedOptionId === option.id}
            onClick={() => {
              setSelectedOptionId(option.id);
              onAnswer(block.id, option.id);
            }}
            className={`rounded-2xl border-2 border-ink px-3 py-2 text-left text-sm font-bold hover:bg-ember hover:text-white ${selectedOptionId === option.id ? "bg-ember text-white" : "bg-paper"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className={`mt-3 rounded-2xl border-2 p-3 text-sm font-bold ${result?.correct ? "border-teal bg-teal/10 text-teal" : "border-line bg-white/45 text-muted"}`}>
        {result ? result.feedback : `Worth ${block.xp} XP`}
      </p>
    </article>
  );
}

function LabBlockView({ block }: { block: Extract<CourseBlock, { kind: "lab" }> }) {
  return <AnimatedLearningStage block={block} />;
}

type AnimatedStageBlock =
  | DiagramBlock
  | SimulationBlock
  | Extract<CourseBlock, { kind: "lab" }>
  | Extract<CourseBlock, { kind: "code-trace" }>
  | Extract<CourseBlock, { kind: "project" }>;

type StageTone = "teal" | "ember" | "violet";
type StageVisualKind = "concept" | "list" | "bucket" | "graph" | "grid" | "bars" | "tree" | "search";

type LearningStageModel = {
  id: string;
  title: string;
  kicker: string;
  prompt: string;
  tone: StageTone;
  visual: StageVisualKind;
  steps: string[];
  feedback: string[];
  controls: string[];
  invariant: string;
};

function AnimatedLearningStage({ block }: { block: AnimatedStageBlock }) {
  const model = stageModelForBlock(block);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const clampedStep = Math.min(step, model.steps.length - 1);
  const atStart = clampedStep === 0;
  const atEnd = clampedStep === model.steps.length - 1;

  useEffect(() => {
    if (!autoPlaying) {
      return;
    }
    if (atEnd) {
      setAutoPlaying(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, model.steps.length - 1));
    }, 520);
    return () => window.clearTimeout(timeout);
  }, [atEnd, autoPlaying, clampedStep, model.steps.length]);

  function nextStage() {
    setPlaying(true);
    setAutoPlaying(false);
    setStep((current) => Math.min(current + 1, model.steps.length - 1));
  }

  function previousStage() {
    setPlaying(true);
    setAutoPlaying(false);
    setStep((current) => Math.max(current - 1, 0));
  }

  function resetStage() {
    setPlaying(false);
    setAutoPlaying(false);
    setStep(0);
  }

  function toggleStagePlayback() {
    setPlaying(true);
    setAutoPlaying((current) => {
      if (current) return false;
      if (atEnd) setStep(0);
      return true;
    });
  }

  return (
    <article id={model.id} className={`scroll-mt-5 rounded-[24px] border-2 bg-paper/95 p-4 shadow-sketch ${toneBorderClass(model.tone)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-bold uppercase ${toneTextClass(model.tone)}`}>{model.kicker}</p>
          <h2 className="font-display text-3xl font-bold">{model.title}</h2>
        </div>
        <span className="rounded-full border border-line bg-white/55 px-3 py-1 text-sm font-bold">Stage {clampedStep + 1} of {model.steps.length}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{model.prompt}</p>
      <StageVisual model={model} step={clampedStep} playing={playing} />
      <p className={`mt-3 rounded-2xl border px-3 py-2 text-sm font-bold ${toneFeedbackClass(model.tone)}`}>
        {model.feedback[clampedStep] ?? model.feedback[0]}
      </p>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {model.steps.map((stageLabel, index) => (
          <button
            key={`${stageLabel}-${index}`}
            type="button"
            aria-pressed={index === clampedStep}
            onClick={() => {
              setPlaying(true);
              setAutoPlaying(false);
              setStep(index);
            }}
            className={`rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${index === clampedStep ? `${toneButtonClass(model.tone)} border-ink` : "border-line bg-white/60 text-ink hover:border-ink"}`}
          >
            <span className="block text-xs uppercase opacity-75">Stage {index + 1}</span>
            {stageLabel}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <button type="button" aria-pressed={autoPlaying} onClick={toggleStagePlayback} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-bold ${toneButtonClass(model.tone)}`}>
          {autoPlaying ? <CirclePause aria-hidden="true" size={18} /> : <CirclePlay aria-hidden="true" size={18} />}
          Play stage walkthrough
        </button>
        <button type="button" onClick={nextStage} disabled={atEnd} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepForward aria-hidden="true" size={18} />
          Next stage
        </button>
        <button type="button" onClick={previousStage} disabled={atStart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepBack aria-hidden="true" size={18} />
          Previous stage
        </button>
        <button type="button" onClick={resetStage} className="rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold">
          <span className="inline-flex items-center justify-center gap-2">
            <RotateCcw aria-hidden="true" size={18} />
          Reset stage
          </span>
        </button>
      </div>
      <p className="mt-3 text-xs font-bold uppercase text-muted">Invariant: {model.invariant}</p>
    </article>
  );
}

function CodeTraceStage({ block }: { block: Extract<CourseBlock, { kind: "code-trace" }> }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const clampedStep = Math.min(step, block.tracePoints.length - 1);
  const atStart = clampedStep === 0;
  const atEnd = clampedStep === block.tracePoints.length - 1;

  useEffect(() => {
    if (!autoPlaying) {
      return;
    }
    if (atEnd) {
      setAutoPlaying(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, block.tracePoints.length - 1));
    }, 520);
    return () => window.clearTimeout(timeout);
  }, [atEnd, autoPlaying, block.tracePoints.length, clampedStep]);

  function nextTraceStep() {
    setPlaying(true);
    setAutoPlaying(false);
    setStep((current) => Math.min(current + 1, block.tracePoints.length - 1));
  }

  function previousTraceStep() {
    setPlaying(true);
    setAutoPlaying(false);
    setStep((current) => Math.max(current - 1, 0));
  }

  function resetTrace() {
    setPlaying(false);
    setAutoPlaying(false);
    setStep(0);
  }

  function toggleTracePlayback() {
    setPlaying(true);
    setAutoPlaying((current) => {
      if (current) return false;
      if (atEnd) setStep(0);
      return true;
    });
  }

  return (
    <article id={block.id} className="scroll-mt-5 rounded-[24px] border-2 border-violet bg-paper/95 p-4 shadow-sketch">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-violet">Trace</p>
          <h2 className="font-display text-3xl font-bold">{block.title}</h2>
        </div>
        <span className="rounded-full border border-line bg-white/70 px-3 py-1 text-sm font-bold">Trace step {clampedStep + 1} of {block.tracePoints.length}</span>
      </div>
      <pre
        data-animated-stage={block.id}
        data-stage-step={clampedStep}
        data-playing={playing || autoPlaying}
        data-invariant="trace each state transition before the next line"
        className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white/55 p-3 text-sm"
      >
        <code>{block.code}</code>
      </pre>
      <ol className="mt-3 grid gap-2">
        {block.tracePoints.map((point, index) => (
          <li key={point} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${index === clampedStep ? "border-violet bg-violet/10 text-violet" : "border-line bg-white/45"}`}>
            {index + 1}. {point}
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-2xl border border-line bg-white/55 px-3 py-2 text-sm font-bold text-violet">
        Trace state {clampedStep + 1}: {block.tracePoints[clampedStep]}.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <button type="button" aria-pressed={autoPlaying} onClick={toggleTracePlayback} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-violet px-4 py-2 text-sm font-bold text-white">
          {autoPlaying ? <CirclePause aria-hidden="true" size={18} /> : <CirclePlay aria-hidden="true" size={18} />}
          Play trace walkthrough
        </button>
        <button type="button" onClick={nextTraceStep} disabled={atEnd} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepForward aria-hidden="true" size={18} />
          Next trace step
        </button>
        <button type="button" onClick={previousTraceStep} disabled={atStart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold disabled:opacity-45">
          <StepBack aria-hidden="true" size={18} />
          Previous trace step
        </button>
        <button type="button" onClick={resetTrace} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold">
          <RotateCcw aria-hidden="true" size={18} />
          Reset trace
        </button>
      </div>
    </article>
  );
}

function ProjectStage({ block }: { block: Extract<CourseBlock, { kind: "project" }> }) {
  return <AnimatedLearningStage block={block} />;
}

function StageVisual({ model, step, playing }: { model: LearningStageModel; step: number; playing: boolean }) {
  const stepLabel = model.steps[step] ?? model.steps[0];
  return (
    <svg
      role="img"
      aria-label={`${model.title} animated stage`}
      data-animated-stage={model.id}
      data-stage-step={step}
      data-playing={playing}
      data-invariant={model.invariant}
      viewBox="0 0 420 230"
      className="animated-stage-visual lesson-visual mt-4 min-h-[230px] w-full rounded-[20px] border-2 border-ink"
    >
      {model.visual === "list" ? <LinkedListStageSvg step={step} /> : null}
      {model.visual === "bucket" ? <BucketStageSvg step={step} /> : null}
      {model.visual === "graph" ? <GraphStageSvg step={step} /> : null}
      {model.visual === "grid" ? <GridStageSvg step={step} /> : null}
      {model.visual === "bars" ? <BarsStageSvg step={step} /> : null}
      {model.visual === "tree" ? <TreeStageSvg step={step} /> : null}
      {model.visual === "search" ? <SearchStageSvg step={step} /> : null}
      {model.visual === "concept" ? <ConceptStageSvg steps={model.steps} step={step} tone={model.tone} /> : null}
      <text x="210" y="212" textAnchor="middle" fontSize="15" fontWeight="800" fill="oklch(var(--ink))">
        {stepLabel}
      </text>
    </svg>
  );
}

function ConceptStageSvg({ steps, step, tone }: { steps: string[]; step: number; tone: StageTone }) {
  return (
    <g>
      <path d="M78 112 C150 52 258 52 342 112" fill="none" stroke="oklch(var(--ink) / 0.22)" strokeWidth="7" strokeLinecap="round" />
      {steps.map((label, index) => {
        const active = index <= step;
        const xPos = 70 + index * 92;
        const yPos = index % 2 === 0 ? 112 : 82;
        return (
          <g key={`${label}-${index}`} transform={`translate(${xPos} ${yPos})`} className={active ? "stage-node-active" : "stage-node-idle"} style={{ "--i": index } as CSSProperties}>
            <circle r="30" fill={active ? `oklch(var(--${tone}) / 0.72)` : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="3" />
            <text y="5" textAnchor="middle" fontSize="11" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{label.slice(0, 10)}</text>
          </g>
        );
      })}
    </g>
  );
}

function LinkedListStageSvg({ step }: { step: number }) {
  const labels = ["head", "current", "new", "next"];
  return (
    <g>
      {labels.map((label, index) => {
        const active = index <= step;
        return (
          <g key={label} transform={`translate(${58 + index * 96} 106)`} className={active ? "stage-node-active" : "stage-node-idle"}>
            <rect x="-34" y="-24" width="68" height="48" rx="14" fill={active ? "oklch(var(--teal) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="3" />
            <text y="5" textAnchor="middle" fontSize="12" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{label}</text>
            {index < labels.length - 1 ? <path d="M40 0 H76" stroke="oklch(var(--ink))" strokeWidth="4" strokeLinecap="round" markerEnd="url(#stage-arrow)" /> : null}
          </g>
        );
      })}
      <StageArrowMarker />
    </g>
  );
}

function BucketStageSvg({ step }: { step: number }) {
  const buckets = [1, 4, 2, 0, 3];
  return (
    <g>
      {buckets.map((height, index) => {
        const active = index <= Math.min(step + 1, buckets.length - 1);
        return (
          <g key={index} transform={`translate(${58 + index * 74} 172)`} className={active ? "stage-node-active" : "stage-node-idle"}>
            <rect x="-24" y={-height * 24 - 22} width="48" height={height * 24 + 22} rx="11" fill={active ? "oklch(var(--ember) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="3" />
            <text y="-4" textAnchor="middle" fontSize="13" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{height}</text>
            <text y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="oklch(var(--muted))">b{index}</text>
          </g>
        );
      })}
    </g>
  );
}

function GraphStageSvg({ step }: { step: number }) {
  const nodes = [
    ["A", 86, 84],
    ["B", 164, 55],
    ["C", 164, 134],
    ["D", 252, 55],
    ["E", 252, 134]
  ] as const;
  const edges = [[0, 1], [0, 2], [1, 3], [2, 4]];
  return (
    <g>
      {edges.map(([from, to]) => (
        <line key={`${from}-${to}`} x1={nodes[from][1]} y1={nodes[from][2]} x2={nodes[to][1]} y2={nodes[to][2]} stroke="oklch(var(--ink) / 0.25)" strokeWidth="5" strokeLinecap="round" />
      ))}
      {nodes.map(([label, xPos, yPos], index) => {
        const active = index <= step + 1;
        return (
          <g key={label} transform={`translate(${xPos} ${yPos})`} className={active ? "stage-node-active" : "stage-node-idle"}>
            <circle r="25" fill={active ? "oklch(var(--teal) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="3" />
            <text y="5" textAnchor="middle" fontSize="15" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{label}</text>
          </g>
        );
      })}
    </g>
  );
}

function GridStageSvg({ step }: { step: number }) {
  const filled = Math.min(20, (step + 1) * 5);
  return (
    <g>
      {Array.from({ length: 20 }).map((_, index) => {
        const row = Math.floor(index / 5);
        const column = index % 5;
        const active = index < filled;
        return (
          <g key={index} className={active ? "stage-node-active" : "stage-node-idle"} style={{ "--i": index } as CSSProperties}>
            <rect x={48 + column * 62} y={34 + row * 38} width="48" height="30" rx="9" fill={active ? "oklch(var(--teal) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="2" />
            <text x={72 + column * 62} y={54 + row * 38} textAnchor="middle" fontSize="12" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{index + 1}</text>
          </g>
        );
      })}
    </g>
  );
}

function BarsStageSvg({ step }: { step: number }) {
  const heights = [58, 96, 72, 122, 44, 108];
  return (
    <g>
      {heights.map((height, index) => {
        const active = index <= Math.min(step + 2, heights.length - 1);
        return (
          <rect
            key={index}
            x={58 + index * 50}
            y={172 - height}
            width="34"
            height={height}
            rx="10"
            fill={active ? "oklch(var(--violet) / 0.72)" : "oklch(98% 0.018 85)"}
            stroke="oklch(var(--ink))"
            strokeWidth="3"
            className={active ? "stage-node-active" : "stage-node-idle"}
          />
        );
      })}
    </g>
  );
}

function TreeStageSvg({ step }: { step: number }) {
  const nodes = [
    ["3", 210, 46],
    ["2", 132, 116],
    ["5", 288, 116],
    ["1", 90, 172],
    ["4", 246, 172]
  ] as const;
  return (
    <g>
      <path d="M210 72 L132 98 M210 72 L288 98 M132 140 L90 154 M288 140 L246 154" stroke="oklch(var(--ink) / 0.25)" strokeWidth="5" strokeLinecap="round" />
      {nodes.map(([label, xPos, yPos], index) => {
        const active = index <= step + 1;
        return (
          <g key={label} transform={`translate(${xPos} ${yPos})`} className={active ? "stage-node-active" : "stage-node-idle"}>
            <circle r="24" fill={active ? "oklch(var(--violet) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="3" />
            <text y="6" textAnchor="middle" fontSize="15" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{label}</text>
          </g>
        );
      })}
    </g>
  );
}

function SearchStageSvg({ step }: { step: number }) {
  const values = [4, 8, 12, 16, 20, 24, 28];
  const lo = step === 0 ? 0 : step === 1 ? 3 : 4;
  const hi = step < 3 ? 6 : 4;
  return (
    <g>
      {values.map((value, index) => {
        const active = index >= lo && index <= hi;
        return (
          <g key={value} transform={`translate(${58 + index * 50} 106)`} className={active ? "stage-node-active" : "stage-node-idle"}>
            <circle r="22" fill={active ? "oklch(var(--ember) / 0.72)" : "oklch(98% 0.018 85)"} stroke="oklch(var(--ink))" strokeWidth="3" />
            <text y="5" textAnchor="middle" fontSize="13" fontWeight="800" fill={active ? "white" : "oklch(var(--ink))"}>{value}</text>
          </g>
        );
      })}
      <path d={`M ${58 + lo * 50} 144 L ${58 + hi * 50} 144`} stroke="oklch(var(--teal))" strokeWidth="8" strokeLinecap="round" opacity="0.8" className="search-window-pulse" />
    </g>
  );
}

function StageArrowMarker() {
  return (
    <defs>
      <marker id="stage-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(var(--ink))" />
      </marker>
    </defs>
  );
}

function stageModelForBlock(block: AnimatedStageBlock): LearningStageModel {
  if (block.kind === "code-trace") {
    return {
      id: block.id,
      title: block.title,
      kicker: "Trace",
      prompt: "Step through the code as a sequence of named state changes.",
      tone: "violet",
      visual: "concept",
      steps: block.tracePoints,
      feedback: block.tracePoints.map((point, index) => `Trace ${index + 1}: ${point}. Keep the invariant visible before the next line runs.`),
      controls: ["step trace"],
      invariant: "state changes are named before execution continues"
    };
  }

  if (block.kind === "project") {
    return {
      id: block.id,
      title: block.title,
      kicker: "Project",
      prompt: block.brief,
      tone: "violet",
      visual: "concept",
      steps: block.deliverables,
      feedback: block.deliverables.map((item, index) => `Project stage ${index + 1}: ${item}. Ship the explanation only when this part is concrete.`),
      controls: ["advance"],
      invariant: "every deliverable must explain a learner-visible decision"
    };
  }

  const component = block.renderer.component;
  const visual = visualKindForComponent(component);
  const steps = stepsForBlock(block, visual);
  const dataFeedback = "data" in block && Array.isArray(block.data.feedback)
    ? block.data.feedback.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const dataInvariant = "data" in block && typeof block.data.invariant === "string" && block.data.invariant.trim().length > 0
    ? block.data.invariant
    : undefined;

  return {
    id: block.id,
    title: block.title,
    kicker: `${block.renderer.family} ${block.kind}`,
    prompt: "prompt" in block ? block.prompt : "task" in block ? block.task : block.successCriteria,
    tone: toneForRenderer(block.renderer.family),
    visual,
    steps,
    feedback: dataFeedback.length >= steps.length ? dataFeedback : feedbackForComponent(component, steps),
    controls: "controls" in block ? block.controls : "xp" in block ? ["try", "check", "reset"] : ["advance"],
    invariant: "successCriteria" in block ? block.successCriteria : dataInvariant ?? block.renderer.fallback
  };
}

function visualKindForComponent(component: string): StageVisualKind {
  if (component.includes("linked-list")) return "list";
  if (component.includes("bucket") || component.includes("hash-collision")) return "bucket";
  if (component.includes("frontier")) return "graph";
  if (component.includes("dp-grid")) return "grid";
  if (component.includes("sorting") || component.includes("partition")) return "bars";
  if (component.includes("tree-rotation") || component.includes("heap")) return "tree";
  if (component.includes("binary-search") || component.includes("sliding-window")) return "search";
  return "concept";
}

function stepsForBlock(block: Exclude<AnimatedStageBlock, Extract<CourseBlock, { kind: "code-trace" | "project" }>>, visual: StageVisualKind) {
  if (block.kind === "diagram" && Array.isArray(block.data.nodes)) {
    return block.data.nodes.filter((node): node is string => typeof node === "string").slice(0, 4);
  }
  if (visual === "list") return ["save current", "create node", "rewire next", "restore reachability"];
  if (visual === "bucket") return ["insert key", "collision pressure", "resize buckets", "rebalance lookup"];
  if (visual === "graph") return ["enqueue start", "expand frontier", "visit neighbors", "mark seen"];
  if (visual === "grid") return ["base cases", "first row", "dependency wave", "final answer"];
  if (visual === "bars") return ["compare", "swap or partition", "grow sorted region", "verify order"];
  if (visual === "tree") return ["before shape", "promote child", "reattach subtree", "sorted order"];
  if (visual === "search") return ["full window", "compare middle", "discard impossible side", "target remains"];
  return ["input", "operation", "state", "output"];
}

function feedbackForComponent(component: string, steps: string[]) {
  if (component.includes("hash-collision")) {
    return [
      "Insert a key and predict which bucket receives it.",
      "Collision pressure is now visible: more than one key is crowding the same bucket.",
      "Resize spreads the same keys across more address space.",
      "Lookup stays reliable because the bucket contract survived the move."
    ];
  }
  if (component.includes("frontier")) {
    return [
      "Start with one node in the frontier.",
      "The frontier expands according to queue or stack discipline.",
      "Neighbors are visited only after the structure exposes them.",
      "Every node is marked once, so traversal does not loop forever."
    ];
  }
  if (component.includes("linked-list")) {
    return [
      "Hold the current pointer before touching next.",
      "Create the new node while the old next is still reachable.",
      "Point the new node at the old next.",
      "Reconnect current to the new node without dropping the chain."
    ];
  }
  if (component.includes("dp-grid")) {
    return [
      "Base cells are known before larger subproblems ask for them.",
      "The first dependency row is ready.",
      "The wave moves only into cells whose prerequisites are solved.",
      "The final cell can now reuse solved neighbors instead of recomputing."
    ];
  }
  if (component.includes("sorting")) {
    return [
      "Compare only the values that can change the ordering decision.",
      "Swap when the pair violates the desired order.",
      "The sorted region grows and the unknown region shrinks.",
      "The array is sorted because every adjacent contract survived."
    ];
  }
  if (component.includes("tree-rotation")) {
    return [
      "Start with the local subtree shape.",
      "Promote one child without changing inorder order.",
      "Reattach the middle subtree where the values still belong.",
      "Height changes, but sorted order is preserved."
    ];
  }
  if (component.includes("binary-search") || component.includes("sliding-window")) {
    return [
      "Start with the whole possible window.",
      "Compare the middle or boundary value.",
      "Discard only the side that cannot contain the answer.",
      "The target remains inside the active window."
    ];
  }
  return steps.map((label, index) => {
    if (index === 1) return "The operation changes the state while the invariant stays visible.";
    return `Stage ${index + 1}: ${label}. Predict the next state before advancing.`;
  });
}

function toneForRenderer(renderer: string): StageTone {
  if (renderer === "anime" || renderer === "d3") return "ember";
  if (renderer === "three" || renderer === "skia") return "violet";
  return "teal";
}

function toneBorderClass(tone: StageTone) {
  return tone === "ember" ? "border-ember" : tone === "violet" ? "border-violet" : "border-teal";
}

function toneTextClass(tone: StageTone) {
  return tone === "ember" ? "text-ember" : tone === "violet" ? "text-violet" : "text-teal";
}

function toneButtonClass(tone: StageTone) {
  return tone === "ember" ? "bg-ember text-white" : tone === "violet" ? "bg-violet text-white" : "bg-teal text-white";
}

function toneFeedbackClass(tone: StageTone) {
  return tone === "ember" ? "border-ember bg-ember/10 text-ember" : tone === "violet" ? "border-violet bg-violet/10 text-violet" : "border-teal bg-teal/10 text-teal";
}

function labelForControl(control: string) {
  return control.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dedupeStageControls(controls: string[]) {
  const seen = new Set<string>();
  return controls.filter((control) => {
    const normalized = labelForControl(control).toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function TopicPage({ home, topicId, onNavigate }: { home: LearningHome; topicId: string; onNavigate: Navigate }) {
  const path = home.paths.find((item) => item.id === topicId) ?? home.paths.find((item) => slugify(item.title) === topicId);
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>(() => path?.modules.find((module) => module.status === "current")?.id ?? path?.modules[0]?.id);
  const [mode, setMode] = useState<LearningMode>("visual");

  useEffect(() => {
    setActiveModuleId(path?.modules.find((module) => module.status === "current")?.id ?? path?.modules[0]?.id);
  }, [path?.id]);

  if (!path) {
    return (
      <section className="rounded-[26px] border-2 border-ink bg-paper/95 p-5 shadow-sketch">
        <p className="text-sm font-bold uppercase text-ember">Topic not found</p>
        <h1 className="font-display text-4xl font-bold">Build a custom path</h1>
        <p className="mt-2 text-muted">Search or browse to start from an available paved path.</p>
        <RouteLink to="/browse" onNavigate={onNavigate} className="mt-4 inline-flex rounded-full border-2 border-ink bg-teal px-4 py-2 text-sm font-bold text-white">
          Browse learning
        </RouteLink>
      </section>
    );
  }

  const activeModule = path.modules.find((module) => module.id === activeModuleId) ?? path.modules[0];
  const relatedBite = relatedBiteForModule(home, activeModule, path);
  const relatedPlayground = relatedPlaygroundForModule(home, activeModule, path);

  return (
    <section className="grid gap-5">
      <div className="rounded-[28px] border-2 border-ink bg-paper/95 p-5 shadow-sketch md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-violet">Topic path</p>
            <h1 className="font-display text-5xl font-bold leading-none">{path.title}</h1>
            <p className="mt-3 max-w-[64ch] text-muted">{path.subtitle}. Move through modules, open the bite, then practice the concept with feedback.</p>
          </div>
          <span className="rounded-full border-2 border-violet px-4 py-2 text-sm font-bold">{Math.round(path.progress * 100)}% complete</span>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
        <div className="rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch">
          <p className="text-sm font-bold uppercase text-violet">Module ladder</p>
          <div className="mt-4 grid gap-3">
            {path.modules.map((module) => (
              <button
                key={module.id}
                type="button"
                aria-label={`${module.title} module`}
                aria-pressed={activeModule?.id === module.id}
                onClick={() => setActiveModuleId(module.id)}
                className={`grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-2xl border-2 p-3 text-left ${
                  activeModule?.id === module.id ? "border-violet bg-violet/10" : "border-ink bg-white/45 hover:bg-white"
                }`}
              >
                <span
                  className={`grid size-10 place-items-center rounded-full border-2 border-ink ${
                    module.status === "complete" ? "bg-violet text-white" : module.status === "current" ? "bg-paper text-violet" : "bg-paper text-muted"
                  }`}
                >
                  {module.status === "complete" ? <Check aria-hidden="true" size={18} /> : <Circle aria-hidden="true" size={16} />}
                </span>
                <span>
                  <span className="block font-bold">{module.title}</span>
                  <span className="text-sm text-muted">{module.status} · {Math.round(module.progress * 100)}%</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5">
          <section className="rounded-[26px] border-2 border-ember bg-paper/95 p-4 shadow-sketch">
            <p className="text-sm font-bold uppercase text-ember">Micro lesson queue</p>
            <h2 className="font-display text-3xl font-bold">{activeModule?.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {relatedBite?.prompt ?? "This module is ready for a custom micro lesson."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["text", "audio", "visual", "interactive"] as LearningMode[]).map((learningMode) => (
                <button
                  key={learningMode}
                  type="button"
                  aria-pressed={mode === learningMode}
                  onClick={() => setMode(learningMode)}
                  className={`rounded-full border-2 border-ink px-4 py-2 text-sm font-bold capitalize ${mode === learningMode ? "bg-ember text-white" : "bg-paper"}`}
                >
                  {learningMode}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm font-bold text-ember">Mode ready: {mode}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedBite ? (
                <RouteLink to={`/feed?bite=${relatedBite.id}`} onNavigate={onNavigate} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ember px-4 py-2 text-sm font-bold text-white">
                  Open micro lesson <ChevronRight aria-hidden="true" size={16} />
                </RouteLink>
              ) : null}
              {relatedPlayground ? (
                <RouteLink to={`/play?lab=${relatedPlayground.id}`} onNavigate={onNavigate} aria-label={`Practice ${relatedPlayground.title}`} className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold hover:bg-violet hover:text-white">
                  Practice {relatedPlayground.title} <ChevronRight aria-hidden="true" size={16} />
                </RouteLink>
              ) : null}
            </div>
          </section>
          <PathMap path={path} />
        </div>
      </div>
    </section>
  );
}

function FeedPage({
  home,
  biteId,
  quiz,
  quizResult,
  quizStatus,
  likedBites,
  savedBites,
  audioPlaying,
  onNavigate,
  onAnswer,
  onToggleLike,
  onToggleSave,
  onToggleAudio
}: {
  home: LearningHome;
  biteId?: string;
  quiz: LearningHome["quizzes"][number] | undefined;
  quizResult: QuizResult | null;
  quizStatus: "idle" | "checking";
  likedBites: Record<string, boolean>;
  savedBites: Record<string, boolean>;
  audioPlaying: boolean;
  onNavigate: Navigate;
  onAnswer: (id: string) => void;
  onToggleLike: (biteId: string) => void;
  onToggleSave: (bite: LearningHome["feed"][number]) => void;
  onToggleAudio: () => void;
}) {
  const bite = home.feed.find((item) => item.id === biteId) ?? home.feed[0];
  const selectedIndex = Math.max(0, home.feed.findIndex((item) => item.id === bite?.id));
  const nextBite = home.feed[(selectedIndex + 1) % home.feed.length];

  return (
    <section className="grid gap-5">
      <PageIntro eyebrow="Feed" title="Learning feed" copy="A focused stream for one lesson at a time, with audio, save state, and quick checks staying in context." />
      <div className="grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="soft-panel rounded-[24px] p-4">
          <h2 className="font-bold">Bite queue</h2>
          <div className="mt-3 grid gap-2">
            {home.feed.map((item) => (
              <RouteLink
                key={item.id}
                to={`/feed?bite=${item.id}`}
                onNavigate={onNavigate}
                className={`rounded-2xl border px-3 py-3 text-sm font-bold ${item.id === bite?.id ? "border-ember bg-ember/10 text-ember" : "border-line bg-white/45 text-ink"}`}
              >
                {item.title}
              </RouteLink>
            ))}
          </div>
          {nextBite ? (
            <RouteLink to={`/feed?bite=${nextBite.id}`} onNavigate={onNavigate} className="mt-4 inline-flex w-full justify-center rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold hover:bg-ember hover:text-white">
              Next bite
            </RouteLink>
          ) : null}
        </aside>
        <FeedPanel
          bite={bite}
          quiz={quiz}
          quizResult={quizResult}
          quizStatus={quizStatus}
          liked={bite ? Boolean(likedBites[bite.id]) : false}
          saved={bite ? (savedBites[bite.id] ?? bite.saved) : false}
          audioPlaying={audioPlaying}
          onAnswer={onAnswer}
          onToggleLike={() => bite && onToggleLike(bite.id)}
          onToggleSave={() => bite && onToggleSave(bite)}
          onToggleAudio={onToggleAudio}
        />
      </div>
    </section>
  );
}

function FeedPanel({
  bite,
  quiz,
  quizResult,
  quizStatus,
  liked,
  saved,
  audioPlaying,
  onAnswer,
  onToggleLike,
  onToggleSave,
  onToggleAudio
}: {
  bite: LearningHome["feed"][number] | undefined;
  quiz: LearningHome["quizzes"][number] | undefined;
  quizResult: QuizResult | null;
  quizStatus: "idle" | "checking";
  liked: boolean;
  saved: boolean;
  audioPlaying: boolean;
  onAnswer: (id: string) => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onToggleAudio: () => void;
}) {
  if (!bite || !quiz) {
    return null;
  }

  return (
    <section className="grid gap-4 rounded-[26px] border-2 border-ember bg-paper/95 p-4 shadow-sketch 2xl:grid-cols-[minmax(0,1fr)_240px]" aria-labelledby="feed-heading">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-ember">{bite.topic}</p>
            <h2 id="feed-heading" className="font-display text-3xl font-bold">
              {bite.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onToggleLike} aria-pressed={liked} className={`grid size-12 place-items-center rounded-full border-2 border-ink ${liked ? "bg-ember text-white" : "bg-white/70 hover:bg-ember/10"}`} aria-label="Like bite">
              <Heart aria-hidden="true" size={19} />
            </button>
            <button type="button" onClick={onToggleSave} aria-pressed={saved} className={`grid size-12 place-items-center rounded-full border-2 border-ink ${saved ? "bg-teal text-white" : "bg-white/70 hover:bg-ember/10"}`} aria-label="Save bite">
              <Bookmark aria-hidden="true" size={19} />
            </button>
          </div>
        </div>
        <div className="lesson-visual mt-4 grid min-h-[270px] place-items-center rounded-[22px] border-2 border-ink">
          <BinarySearchVisual />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={onToggleAudio} aria-pressed={audioPlaying} className={`grid size-12 place-items-center rounded-full border-2 border-ink ${audioPlaying ? "bg-ember text-white" : "bg-white"}`} aria-label="Play audio lesson">
            <CirclePlay aria-hidden="true" size={22} />
          </button>
          <div className="h-3 flex-1 rounded-full bg-line">
            <div className={`h-full rounded-full bg-ember transition-all ${audioPlaying ? "w-[72%]" : "w-[18%]"}`} />
          </div>
          <span className="text-sm text-muted">0:{String(bite.durationSeconds).padStart(2, "0")}</span>
        </div>
        <p className="mt-2 text-sm font-bold text-ember">{audioPlaying ? "Audio playing" : "Audio ready"} · {saved ? "Saved for later" : "Tap save to keep this bite"}</p>
        <p className="mt-3 text-sm leading-6 text-muted">{bite.prompt}</p>
      </div>
      <div className="rounded-[20px] border-2 border-ink bg-white/55 p-3">
        <p className="rounded-full border border-ember px-3 py-2 text-sm font-bold text-ember">quick check</p>
        <h3 className="mt-4 text-lg font-bold">{quiz.question}</h3>
        <div className="mt-3 grid gap-2">
          {quiz.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={quizStatus === "checking"}
              onClick={() => onAnswer(option.id)}
              className="rounded-2xl border-2 border-ink bg-paper px-3 py-2 text-left font-bold transition hover:-translate-y-0.5 hover:bg-ember hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={`mt-3 rounded-2xl border-2 p-3 text-sm font-bold ${quizResult?.correct ? "border-violet bg-violet/10 text-violet" : "border-line bg-paper text-muted"}`}>
          {quizStatus === "checking" ? "Checking answer..." : quizResult ? (quizResult.correct ? `Nice. +${quizResult.xpAwarded} XP` : quizResult.feedback) : "Answer to keep your streak alive."}
        </div>
      </div>
    </section>
  );
}

function PlayPage({ home, labId, onNavigate }: { home: LearningHome; labId?: string; onNavigate: Navigate }) {
  const playground = home.playgrounds.find((item) => item.id === labId) ?? home.playgrounds[0];

  return (
    <section className="play-page grid min-w-0 gap-4">
      <header className="min-w-0 rounded-[28px] border-2 border-ink bg-paper/95 p-4 shadow-sketch md:p-5">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-violet">Play</p>
            <h1 className="mt-1 font-display text-4xl font-bold leading-none md:text-5xl">Practice arcade</h1>
            <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted md:text-base">Concepts become tactile. Pick a lab, make a move, and get immediate feedback from the model.</p>
          </div>
          <div className="min-w-0 rounded-[20px] border-2 border-violet bg-violet/10 px-4 py-3 text-sm font-bold text-violet">
            {home.playgrounds.length} live labs · tap to play
          </div>
        </div>
        <nav className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1" aria-label="Practice labs">
          {home.playgrounds.map((item) => (
            <RouteLink
              key={item.id}
              to={`/play?lab=${item.id}`}
              onNavigate={onNavigate}
              className={`min-w-[190px] rounded-2xl border-2 px-4 py-3 text-sm font-bold ${item.id === playground?.id ? "border-violet bg-violet text-white" : "border-ink bg-paper hover:bg-violet/10"}`}
            >
              <span className="block text-xs uppercase opacity-75">{item.interaction.replace("-", " ")}</span>
              {item.title}
            </RouteLink>
          ))}
        </nav>
      </header>
      {playground?.interaction === "trace-tree" ? <TreeTraceGame playground={playground} /> : playground?.interaction === "fill-table" ? <FillTableGame playground={playground} /> : <SortingGame playground={playground} />}
    </section>
  );
}

function LibraryPage({
  home,
  savedBites,
  mode,
  checked,
  onNavigate,
  onModeChange,
  onCheck
}: {
  home: LearningHome;
  savedBites: Record<string, boolean>;
  mode: LibraryMode;
  checked: boolean;
  onNavigate: Navigate;
  onModeChange: (mode: LibraryMode) => void;
  onCheck: () => void;
}) {
  const savedFeed = home.feed.filter((bite) => savedBites[bite.id] ?? bite.saved);
  const focusBite = savedFeed[0] ?? home.feed[0];

  return (
    <section className="grid gap-5">
      <PageIntro eyebrow="Library" title="Multimodal library" copy="Switch between reading, listening, and visual walkthroughs without losing the current concept." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="grid gap-5">
          <div className="soft-panel rounded-[24px] p-5">
            <p className="text-sm font-bold uppercase text-teal">Concept shelf</p>
            <h2 className="font-display text-4xl font-bold">{focusBite?.topic ?? "Saved learning"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{focusBite?.prompt ?? "Save a bite from the feed to keep a personal review shelf here."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["Read", "Listen", "Watch"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={mode === item}
                  onClick={() => onModeChange(item)}
                  className={`rounded-full border-2 border-ink px-4 py-2 text-sm font-bold ${mode === item ? "bg-teal text-white" : "bg-paper"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="lesson-visual mt-5 grid min-h-[260px] place-items-center rounded-[22px] border-2 border-ink">
              <BookOpen aria-hidden="true" size={68} className="text-teal" />
            </div>
            <p className="mt-3 text-sm font-bold text-teal">{mode === "Read" ? "Text notes open" : mode === "Listen" ? "Audio brief ready" : "Visual walkthrough ready"}</p>
          </div>
          <section className="rounded-[24px] border-2 border-teal bg-paper/95 p-4 shadow-sketch">
            <h2 className="font-display text-3xl font-bold">Saved for later</h2>
            <div className="mt-3 grid gap-2">
              {savedFeed.length ? (
                savedFeed.map((bite) => (
                  <RouteLink key={bite.id} to={`/feed?bite=${bite.id}`} onNavigate={onNavigate} aria-label={`Open ${bite.title}`} className="rounded-2xl border-2 border-ink bg-white/55 p-3 text-left hover:bg-teal/10">
                    <span className="block text-sm font-bold text-teal">{bite.topic}</span>
                    <span className="block text-lg font-bold">{bite.title}</span>
                    <span className="block text-sm text-muted">{bite.durationSeconds}s · {bite.modes.join(" + ")}</span>
                  </RouteLink>
                ))
              ) : (
                <p className="rounded-2xl border border-line bg-white/45 p-4 text-sm font-bold text-muted">No saved lessons yet. Save any feed bite to build a review shelf.</p>
              )}
            </div>
          </section>
        </div>
        <div className="rounded-[26px] border-2 border-ink bg-paper/95 p-4 shadow-sketch">
          <p className="text-sm font-bold uppercase text-ember">Understanding check</p>
          <h2 className="font-display text-3xl font-bold">Trace height</h2>
          <p className="mt-2 text-sm text-muted">Height of this tree?</p>
          <div className="mt-4 rounded-2xl border-2 border-teal bg-teal/10 p-3">
            <TreeMiniVisual />
            <button type="button" onClick={onCheck} className="mt-3 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold" aria-label="Check tree height">
              Submit answer
            </button>
            {checked ? <p className="mt-2 text-sm font-bold text-teal">Tree height is 3. Count the longest root-to-leaf path.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressPage({
  home,
  course,
  session,
  enrollment
}: {
  home: LearningHome;
  course: Course;
  session: LearnerSession | null;
  enrollment: CourseEnrollment | undefined;
}) {
  const lessons = courseLessons(course);
  const completedCount = enrollment ? Object.keys(enrollment.completedLessons).length : 0;
  const complete = enrollment?.status === "complete";
  const selectedObjectiveLabels = learnerObjectives.filter((objective) => session?.objectiveIds.includes(objective.id)).map((objective) => objective.label);

  return (
    <section className="grid gap-5">
      <PageIntro eyebrow="You" title="Your learning momentum" copy="A single place for streaks, quests, XP, and league progress." />
      <div className="grid gap-5 xl:grid-cols-3">
        <MetricCard label="XP" value={home.stats.xp.toLocaleString()} tone="teal" />
        <MetricCard label="Current streak" value={`${home.stats.streakDays} days`} tone="ember" />
        <MetricCard label="Hearts" value={String(home.stats.hearts)} tone="violet" />
      </div>
      {(session || enrollment) ? (
        <section className={`rounded-[26px] border-2 bg-paper/95 p-4 shadow-sketch md:p-5 ${complete ? "border-violet" : "border-teal"}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={`text-sm font-bold uppercase ${complete ? "text-violet" : "text-teal"}`}>{session ? `Learning program for ${session.name}` : "Learning program"}</p>
              <h2 className="mt-1 font-display text-3xl font-bold">{course.title}</h2>
              <p className="mt-2 text-sm font-bold text-muted">{completedCount}/{lessons.length} lessons complete</p>
            </div>
            <span className={`rounded-full border-2 px-3 py-2 text-sm font-bold ${complete ? "border-violet bg-violet/10 text-violet" : "border-teal bg-teal/10 text-teal"}`}>
              {complete ? "Course complete" : enrollment ? "Course in progress" : "Plan ready"}
            </span>
          </div>
          {selectedObjectiveLabels.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedObjectiveLabels.map((label) => (
                <span key={label} className="rounded-full border border-line bg-white/55 px-3 py-1 text-sm font-bold">
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          {complete ? <p className="mt-3 rounded-2xl border border-violet bg-violet/10 px-3 py-2 text-sm font-bold text-violet">Certificate ready</p> : null}
        </section>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section className="rounded-[26px] border-2 border-ink bg-paper/95 p-4 shadow-sketch">
          <h2 className="font-display text-3xl font-bold">Daily quests</h2>
          <div className="mt-4 grid gap-3">
            {home.quests.map((quest) => (
              <div key={quest.id} className="rounded-2xl border border-line bg-white/45 p-4">
                <div className="flex justify-between gap-3 text-sm font-bold">
                  <span>{quest.label}</span>
                  <span>{quest.completed}/{quest.target}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-line">
                  <div className="h-full rounded-full bg-violet" style={{ width: `${(quest.completed / quest.target) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch">
          <h2 className="font-display text-3xl font-bold">Diamond League</h2>
          <div className="mt-4 grid gap-2">
            {home.league.map((entry) => (
              <div key={entry.rank} className={`flex justify-between rounded-xl border px-3 py-2 text-sm ${entry.self ? "border-violet bg-violet/10 font-bold" : "border-line bg-white/45"}`}>
                <span>
                  {entry.rank}. {entry.name}
                </span>
                <span>{entry.xp}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function BinarySearchVisual() {
  return (
    <svg role="img" aria-label="Binary search halves a sorted list" viewBox="0 0 420 210" className="h-full max-h-[230px] w-full max-w-[520px]">
      <rect x="28" y="54" width="364" height="82" rx="20" fill="oklch(98% 0.02 85)" stroke="oklch(var(--ink))" strokeWidth="4" />
      {[0, 1, 2, 3, 4, 5, 6].map((item) => (
        <g key={item}>
          <rect x={50 + item * 47} y="78" width="34" height="36" rx="8" fill={item < 3 ? "oklch(var(--teal) / 0.22)" : item === 3 ? "oklch(var(--ember) / 0.72)" : "oklch(var(--violet) / 0.2)"} stroke="oklch(var(--ink))" strokeWidth="2" />
          <text x={67 + item * 47} y="101" textAnchor="middle" fontSize="16" fontWeight="800" fill="oklch(var(--ink))">
            {item * 4 + 4}
          </text>
        </g>
      ))}
      <path d="M210 25v160" stroke="oklch(var(--ember))" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 12" />
      <text x="210" y="198" textAnchor="middle" fontSize="18" fontWeight="800" fill="oklch(var(--ink))">
        split, compare, halve
      </text>
    </svg>
  );
}

function PathMap({ path }: { path: LearningHome["paths"][number] | undefined }) {
  if (!path) {
    return null;
  }

  return (
    <section className="rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch" aria-labelledby={`path-heading-${path.id}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-violet">Journey map</p>
          <h2 id={`path-heading-${path.id}`} className="font-display text-3xl font-bold">
            {path.title}
          </h2>
        </div>
        <span className="rounded-full border-2 border-violet px-3 py-2 text-sm font-bold">{Math.round(path.progress * 100)}%</span>
      </div>
      <div className="relative mt-8 grid gap-4">
        <div className="absolute left-[21px] top-6 h-[calc(100%-48px)] w-1 rounded-full bg-line" aria-hidden="true" />
        {path.modules.map((module) => (
          <div key={module.id} className="relative grid grid-cols-[46px_minmax(0,1fr)] items-center gap-3">
            <div
              className={`z-10 grid size-11 place-items-center rounded-full border-2 border-ink ${
                module.status === "complete" ? "bg-violet text-white" : module.status === "current" ? "bg-paper ring-4 ring-violet/25" : "bg-paper text-muted"
              }`}
            >
              {module.status === "complete" ? <Check aria-hidden="true" size={20} /> : <Circle aria-hidden="true" size={18} />}
            </div>
            <div className={`rounded-2xl border-2 px-4 py-3 ${module.status === "current" ? "border-violet bg-violet/10" : "border-ink bg-white/45"}`}>
              <h3 className="text-lg font-bold">{module.title}</h3>
              <p className="text-sm text-muted">{module.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SortingGame({ playground }: { playground: LearningHome["playgrounds"][number] | undefined }) {
  const [bars, setBars] = useState([42, 74, 56, 96, 34]);
  const [selected, setSelected] = useState<number[]>([]);
  const [swaps, setSwaps] = useState(0);
  const compares = useMemo(() => Math.max(swaps + 2, 3), [swaps]);

  if (!playground) {
    return null;
  }

  function selectBar(index: number) {
    const next = selected.includes(index) ? selected.filter((item) => item !== index) : [...selected, index].slice(-2);
    if (next.length === 2) {
      setBars((current) => {
        const copy = [...current];
        const [first, second] = next;
        if (first === undefined || second === undefined) {
          return current;
        }
        [copy[first], copy[second]] = [copy[second], copy[first]];
        return copy;
      });
      setSwaps((value) => value + 1);
      setSelected([]);
      return;
    }
    setSelected(next);
  }

  return (
    <div className="min-w-0 rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch md:p-5">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(260px,380px)_minmax(0,1fr)] xl:items-stretch">
        <div className="grid min-w-0 content-between gap-4 rounded-[22px] border-2 border-ink bg-white/45 p-4">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-violet">Sorting lab</p>
            <h2 className="mt-1 font-display text-3xl font-bold">{playground.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{playground.description}</p>
          </div>
          <div className="grid gap-2 text-sm font-bold">
            <div className="flex items-center justify-between rounded-2xl border border-line bg-paper px-3 py-2">
              <span>swaps: {swaps}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-paper px-3 py-2">
              <span>compares: {compares}</span>
            </div>
            <div className="rounded-2xl border-2 border-violet bg-violet/10 px-3 py-2 text-violet">+{playground.xpReward} XP on completion</div>
          </div>
        </div>
        <div className="lesson-visual flex min-h-[340px] min-w-0 items-end justify-center gap-4 rounded-[22px] border-2 border-ink bg-white/45 p-5">
          {bars.map((height, index) => (
            <button
              key={`${height}-${index}`}
              type="button"
              aria-label={`Select bar ${index + 1}`}
              aria-pressed={selected.includes(index)}
              onClick={() => selectBar(index)}
              className={`w-14 rounded-t-[22px] border-2 border-ink transition-transform hover:-translate-y-1 ${
                selected.includes(index) ? "bg-violet" : index % 2 === 0 ? "bg-paper-deep" : "bg-teal"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeTraceGame({ playground }: { playground: LearningHome["playgrounds"][number] }) {
  const [path, setPath] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const correctPath = ["8", "12", "14"];
  const solved = checked && correctPath.every((node, index) => path[index] === node);

  function toggleNode(node: string) {
    setChecked(false);
    setPath((current) => (current.includes(node) ? current.filter((item) => item !== node) : [...current, node].slice(-3)));
  }

  return (
    <div className="rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch">
      <p className="text-sm font-bold uppercase text-violet">Play</p>
      <h2 className="font-display text-3xl font-bold">{playground.title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{playground.description}</p>
      <div className="lesson-visual mt-4 grid min-h-[280px] place-items-center rounded-[20px] border-2 border-ink p-4">
        <div className="grid w-full max-w-[420px] grid-rows-3 gap-4">
          <div className="flex justify-center">
            <TreeNode label="8" selected={path.includes("8")} onClick={() => toggleNode("8")} />
          </div>
          <div className="flex justify-around">
            <TreeNode label="4" selected={path.includes("4")} onClick={() => toggleNode("4")} />
            <TreeNode label="12" selected={path.includes("12")} onClick={() => toggleNode("12")} />
          </div>
          <div className="flex justify-end gap-8 pr-8">
            <TreeNode label="10" selected={path.includes("10")} onClick={() => toggleNode("10")} />
            <TreeNode label="14" selected={path.includes("14")} onClick={() => toggleNode("14")} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setChecked(true)} className="rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold" aria-label="Check traced tree path">
          Check path
        </button>
        <span className="text-sm font-bold text-muted">Selected: {path.length ? path.join(" -> ") : "none"}</span>
      </div>
      {checked ? <p className={`mt-2 text-sm font-bold ${solved ? "text-teal" : "text-ember"}`}>{solved ? "That path has height 3." : "Trace 8 -> 12 -> 14 to feel the longest path."}</p> : null}
    </div>
  );
}

function FillTableGame({ playground }: { playground: LearningHome["playgrounds"][number] }) {
  const [filled, setFilled] = useState(0);
  const cards = ["Cue", "Example", "Practice", "Teach-back"];
  const complete = filled >= cards.length;

  return (
    <div className="rounded-[26px] border-2 border-violet bg-paper/95 p-4 shadow-sketch">
      <p className="text-sm font-bold uppercase text-violet">Play</p>
      <h2 className="font-display text-3xl font-bold">{playground.title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{playground.description}</p>
      <div className="mt-4 grid gap-3 rounded-[20px] border-2 border-ink bg-white/45 p-4 md:grid-cols-2">
        {cards.map((card, index) => {
          const active = index < filled;
          return (
            <div key={card} className={`min-h-24 rounded-2xl border-2 border-ink p-3 transition-transform ${active ? "bg-teal/15" : "bg-paper"}`}>
              <p className="text-sm font-bold uppercase text-violet">Card {index + 1}</p>
              <h3 className="mt-1 text-xl font-bold">{card}</h3>
              <p className="mt-2 text-sm font-bold text-muted">{active ? `${card} ready` : "Waiting for your next move"}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setFilled((value) => Math.min(cards.length, value + 1))} disabled={complete} className="rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold transition-transform active:scale-[0.96] disabled:opacity-50" aria-label="Fill next practice card">
          {complete ? "Practice loop complete" : "Fill next practice card"}
        </button>
        <button type="button" onClick={() => setFilled(0)} className="rounded-full border-2 border-ink bg-white/55 px-4 py-2 text-sm font-bold">
          Reset loop
        </button>
        <span className="text-sm font-bold text-muted">{filled}/{cards.length} cards · +{playground.xpReward} XP</span>
      </div>
      {filled > 0 ? <p className="mt-2 text-sm font-bold text-teal">Tie the idea to a concrete next action.</p> : null}
    </div>
  );
}

function TreeNode({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`grid size-14 place-items-center rounded-full border-2 border-ink text-lg font-bold ${selected ? "bg-violet text-white" : "bg-paper"}`}>
      {label}
    </button>
  );
}

function TreeMiniVisual() {
  return (
    <div aria-hidden="true" className="grid place-items-center gap-2">
      <div className="grid size-10 place-items-center rounded-full border-2 border-ink bg-paper font-bold">8</div>
      <div className="flex gap-10">
        <div className="grid size-10 place-items-center rounded-full border-2 border-ink bg-paper font-bold">4</div>
        <div className="grid size-10 place-items-center rounded-full border-2 border-ink bg-paper font-bold">12</div>
      </div>
      <div className="ml-24 grid size-10 place-items-center rounded-full border-2 border-ink bg-paper font-bold">14</div>
    </div>
  );
}

function RightRail({ home, onNavigate }: { home: LearningHome; onNavigate: Navigate }) {
  return (
    <aside className="sticky top-5 hidden h-[calc(100dvh-40px)] flex-col gap-4 rounded-[22px] border-2 border-ink bg-paper/85 p-4 shadow-sketch lg:flex">
      <section className="rounded-2xl border-2 border-ember bg-ember/10 p-4">
        <div className="flex items-center gap-2 font-bold">
          <Flame aria-hidden="true" className="text-ember" size={20} />
          {home.stats.streakDays}-day streak
        </div>
        <p className="mt-1 text-sm text-muted">Best: {home.stats.bestStreakDays} days</p>
      </section>
      <section className="rounded-2xl border border-line bg-white/45 p-4">
        <h2 className="font-bold">This week</h2>
        <div className="mt-3 h-3 rounded-full bg-line">
          <div className="h-full w-[68%] rounded-full bg-teal" />
        </div>
        <p className="mt-2 text-sm text-muted">XP · {home.stats.xp.toLocaleString()}</p>
      </section>
      <section className="rounded-2xl border border-line bg-white/45 p-4">
        <h2 className="flex items-center gap-2 font-bold">
          <Trophy aria-hidden="true" size={18} className="text-violet" />
          Diamond League
        </h2>
        <div className="mt-3 grid gap-2">
          {home.league.slice(0, 4).map((entry) => (
            <div key={entry.rank} className={`flex justify-between rounded-xl border px-3 py-2 text-sm ${entry.self ? "border-violet bg-violet/10 font-bold" : "border-line"}`}>
              <span>
                {entry.rank}. {entry.name}
              </span>
              <span>{entry.xp}</span>
            </div>
          ))}
        </div>
      </section>
      <RouteLink to="/progress" onNavigate={onNavigate} className="mt-auto inline-flex justify-center rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold hover:bg-violet hover:text-white">
        Open progress
      </RouteLink>
    </aside>
  );
}

function BottomNav({ active, onNavigate }: { active: NavId; onNavigate: Navigate }) {
  return (
    <nav className="z-20 mx-auto grid w-full max-w-[540px] grid-cols-6 gap-1 rounded-[22px] border-2 border-ink bg-paper/95 p-2 shadow-sketch lg:hidden" aria-label="Mobile main">
      {navItems.map((item) => {
        const Icon = item.icon;
        const selected = active === item.id;
        return (
          <button key={item.id} type="button" onClick={() => onNavigate(item.path)} className={`grid min-h-14 min-w-0 place-items-center rounded-2xl px-1 text-[0.68rem] font-bold sm:text-xs ${selected ? "bg-teal text-white" : "text-muted"}`} aria-label={`${item.label} tab`} aria-pressed={selected}>
            <Icon aria-hidden="true" size={20} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="rounded-[28px] border-2 border-ink bg-paper/95 p-5 shadow-sketch md:p-6">
      <p className="text-sm font-bold uppercase text-teal">{eyebrow}</p>
      <h1 className="mt-1 font-display text-4xl font-bold leading-none md:text-5xl">{title}</h1>
      <p className="mt-3 max-w-[68ch] text-sm leading-6 text-muted md:text-base">{copy}</p>
    </header>
  );
}

function ResultGroup({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const hasChildren = Children.count(children) > 0;
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-3xl font-bold">{title}</h2>
      {hasChildren ? children : <p className="rounded-2xl border border-line bg-white/45 p-4 text-sm font-bold text-muted">{empty}</p>}
    </section>
  );
}

function PathSummaryCard({ path, onNavigate }: { path: LearningHome["paths"][number]; onNavigate: Navigate }) {
  return (
    <article className="rounded-[20px] border-2 border-ink bg-white/45 p-4">
      <p className="text-sm text-muted">Continue</p>
      <h3 className="mt-1 text-xl font-bold">{path.title}</h3>
      <p className="mt-1 text-sm text-muted">{path.subtitle}</p>
      <ProgressBar value={path.progress} accent={path.accent} />
      <RouteLink to={`/topics/${path.id}`} onNavigate={onNavigate} aria-label={`Open ${path.title}`} className="mt-4 inline-flex rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold hover:bg-teal hover:text-white">
        Open
      </RouteLink>
    </article>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "teal" | "ember" | "violet" }) {
  const toneClass = tone === "teal" ? "border-teal text-teal" : tone === "ember" ? "border-ember text-ember" : "border-violet text-violet";
  return (
    <article className={`rounded-[24px] border-2 bg-paper/95 p-5 shadow-sketch ${toneClass}`}>
      <p className="text-sm font-bold uppercase">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold text-ink">{value}</p>
    </article>
  );
}

function ProgressBar({ value, accent }: { value: number; accent: LearningHome["paths"][number]["accent"] }) {
  const color = accent === "violet" ? "bg-violet" : accent === "ember" ? "bg-ember" : "bg-teal";
  return (
    <div className="mt-4 h-3 rounded-full bg-line/70">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 100}%` }} />
    </div>
  );
}

function RouteLink({
  to,
  onNavigate,
  className,
  children,
  ...props
}: {
  to: string;
  onNavigate: Navigate;
  className?: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    onNavigate(to);
  }

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

function buildCustomLearningSurface(draft: CustomLearningDraft): CustomLearningSurface {
  const title = draft.title.trim();
  const slug = slugify(title) || "custom-learning";
  const id = `custom-${slug}`;
  const readableKind = draft.kind.toLowerCase();
  const modes = uniqueModes([draft.mode, "text", "audio", "visual", "interactive"]);

  return {
    topic: {
      id,
      label: title,
      selected: false
    },
    path: {
      id,
      title,
      subtitle: `Custom ${readableKind} path · 4 micro lessons`,
      accent: draft.kind === "book" ? "ember" : draft.kind === "skill" ? "violet" : "teal",
      progress: 0.1,
      modules: [
        { id: `${id}-foundations`, title: "Foundations", status: "complete", progress: 1 },
        { id: `${id}-key-ideas`, title: "Key Ideas", status: "current", progress: 0.25 },
        { id: `${id}-practice-loop`, title: "Practice Loop", status: "locked", progress: 0 },
        { id: `${id}-teach-back`, title: "Teach Back", status: "locked", progress: 0 }
      ]
    },
    bite: {
      id: `${id}-bite`,
      topic: title,
      title: `${title} in one focused sprint`,
      prompt: `Turn ${title} into one useful mental model, one example, and one practice loop you can use today.`,
      durationSeconds: 55,
      modes,
      saved: true
    },
    quiz: {
      id: `${id}-quiz`,
      question: `What is the best next step for ${title}?`,
      options: [
        { id: "teach-back", label: "Teach it back with one example" },
        { id: "collect-quotes", label: "Collect more quotes before acting" },
        { id: "skip-practice", label: "Skip practice until later" }
      ],
      correctOptionId: "teach-back",
      feedback: `Right. Teaching ${title} back turns the idea into a usable model.`
    },
    playground: {
      id: `${id}-lab`,
      title: `Build ${title} recall loop`,
      concept: slug,
      interaction: "fill-table",
      description: `Fill a cue, example, practice, and teach-back loop for ${title}.`,
      xpReward: 10
    }
  };
}

function upsertCustomLearningSurface(home: LearningHome, surface: CustomLearningSurface): LearningHome {
  return {
    ...home,
    topics: upsertById(home.topics, surface.topic),
    paths: upsertById(home.paths, surface.path),
    feed: upsertById(home.feed, surface.bite),
    quizzes: upsertById(home.quizzes, surface.quiz),
    playgrounds: upsertById(home.playgrounds, surface.playground)
  };
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  return [item, ...items.filter((current) => current.id !== item.id)];
}

function uniqueModes(modes: LearningMode[]) {
  return modes.filter((mode, index) => modes.indexOf(mode) === index);
}

function searchLearning(home: LearningHome, query: string, topicFilters: string[] = []) {
  const normalized = query.trim().toLowerCase();
  const normalizedTopics = topicFilters.map((topic) => topic.toLowerCase());
  const matchesQuery = (...values: string[]) => {
    const text = values.join(" ").toLowerCase();
    return normalized === "" || text.includes(normalized);
  };
  const matchesTopic = (...itemTopics: string[]) =>
    normalizedTopics.length === 0 || normalizedTopics.some((topic) => itemTopics.some((itemTopic) => itemTopic.toLowerCase() === topic));

  return {
    paths: home.paths.filter((path) => matchesQuery(path.title, path.subtitle, ...path.modules.map((module) => module.title)) && matchesTopic(topicForPath(path))),
    feed: home.feed.filter((bite) => matchesQuery(bite.title, bite.topic, bite.prompt, ...bite.modes) && matchesTopic(bite.topic)),
    playgrounds: home.playgrounds.filter((playground) => matchesQuery(playground.title, playground.concept, playground.interaction, playground.description) && matchesTopic(topicForPlayground(playground)))
  };
}

function topicForPath(path: LearningHome["paths"][number]) {
  if (path.id.startsWith("custom-")) {
    return path.title;
  }
  if (path.title.toLowerCase().includes("algorithm")) {
    return "Algorithms";
  }
  return path.title;
}

function topicForPlayground(playground: LearningHome["playgrounds"][number]) {
  if (playground.concept === "sorting") {
    return "Algorithms";
  }
  if (playground.concept === "trees") {
    return "Data Structures";
  }
  return playground.concept;
}

function relatedBiteForModule(home: LearningHome, module: LearningHome["paths"][number]["modules"][number] | undefined, path?: LearningHome["paths"][number]) {
  if (path?.id.startsWith("custom-")) {
    return home.feed.find((bite) => bite.id === `${path.id}-bite`) ?? home.feed[0];
  }
  if (!module) {
    return home.feed[0];
  }
  const title = module.title.toLowerCase();
  if (title.includes("tree")) {
    return home.feed.find((bite) => bite.id === "trees-bite") ?? home.feed[0];
  }
  return home.feed[0];
}

function relatedPlaygroundForModule(home: LearningHome, module: LearningHome["paths"][number]["modules"][number] | undefined, path?: LearningHome["paths"][number]) {
  if (path?.id.startsWith("custom-")) {
    return home.playgrounds.find((playground) => playground.id === `${path.id}-lab`) ?? home.playgrounds[0];
  }
  if (!module) {
    return home.playgrounds[0];
  }
  const title = module.title.toLowerCase();
  if (title.includes("tree")) {
    return home.playgrounds.find((playground) => playground.id === "tree-height-lab") ?? home.playgrounds[0];
  }
  if (title.includes("sort")) {
    return home.playgrounds.find((playground) => playground.id === "bubble-sort-lab") ?? home.playgrounds[0];
  }
  return home.playgrounds[0];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default App;
