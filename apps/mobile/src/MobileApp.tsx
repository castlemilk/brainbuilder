import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { buildLearningHome, quizForBite, scoreQuizAnswer, type LearningHome, type Quiz, type QuizResult } from "@brainbuilder/learning-model";
import {
  buildAlgorithmsDataStructuresCourse,
  buildRendererManifest,
  computeCourseCoverage,
  findLesson,
  getLessonLearningGuide,
  scoreCourseCheck,
  type Course,
  type CourseBlock,
  type CourseCheckResult,
  type CourseLesson,
  type DiagramBlock,
  type LabBlock,
  type QuizBlock,
  type SimulationBlock
} from "@brainbuilder/courseware";

const colors = {
  paper: "#f8f1e5",
  paperDeep: "#ebe0cf",
  ink: "#30261f",
  muted: "#796c61",
  line: "#d8cdbd",
  ember: "#ff563c",
  teal: "#12b7a6",
  violet: "#7c4dff",
  white: "#fffaf1"
};

type ApiState = "local" | "loading" | "synced" | "offline";
type TabLabel = "Home" | "Browse" | "Feed" | "Play" | "Library" | "You";
const learnerObjectives = [
  {
    id: "algorithms",
    label: "Algorithms and Data Structures",
    description: "Visualize algorithms, data structures, and complexity through short practice loops."
  },
  {
    id: "interview",
    label: "Interview prep",
    description: "Practice explaining invariants, tradeoffs, and edge cases under pressure."
  },
  {
    id: "daily-habit",
    label: "Daily micro habit",
    description: "Keep a commute-ready learning streak with audio, checks, and tactile games."
  }
] as const;

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

const learningHomePath = "/brainbuilder.learning.v1.LearningService/GetLearningHome";

function MobileApp() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [home, setHome] = useState(() => buildLearningHome("alex"));
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>({});
  const [selectedTab, setSelectedTab] = useState<TabLabel>("Home");
  const [apiState, setApiState] = useState<ApiState>(() => (apiUrl ? "loading" : "local"));
  const [liked, setLiked] = useState(false);
  const [savedBites, setSavedBites] = useState<Record<string, boolean>>({});
  const [selectedFeedBiteId, setSelectedFeedBiteId] = useState("binary-search-bite");
  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState("bubble-sort-lab");
  const course = useMemo(() => buildAlgorithmsDataStructuresCourse(), []);
  const courseLessons = useMemo(() => course.units.flatMap((unit) => unit.lessons), [course]);
  const [session, setSession] = useState<LearnerSession | null>(null);
  const [courseEnrollment, setCourseEnrollment] = useState<CourseEnrollment | undefined>(undefined);
  const [selectedCourseLessonId, setSelectedCourseLessonId] = useState("big-o-as-shape");
  const [courseResults, setCourseResults] = useState<Record<string, CourseCheckResult>>({});
  const scrollViewRef = useRef<ScrollView | null>(null);

  const selectedBite = home.feed.find((bite) => bite.id === selectedFeedBiteId) ?? home.feed[0];
  const quiz = quizForBite(home, selectedBite?.id);
  const quizResult = quiz ? quizResults[quiz.id] ?? null : null;
  const selectedBiteSaved = selectedBite ? (savedBites[selectedBite.id] ?? selectedBite.saved) : false;

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    let cancelled = false;
    setApiState("loading");
    fetch(`${apiUrl.replace(/\/$/, "")}${learningHomePath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connect-Protocol-Version": "1"
      },
      body: JSON.stringify({ userId: "alex" })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Learning API returned ${response.status}`);
        }
        return response.json() as Promise<LearningHome>;
      })
      .then((nextHome) => {
        if (!cancelled) {
          setHome(nextHome);
          setSavedBites({});
          setSelectedFeedBiteId(nextHome.feed[0]?.id ?? "binary-search-bite");
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

  function answerQuiz(optionId: string) {
    if (!quiz) {
      return;
    }
    setQuizResults((current) => ({
      ...current,
      [quiz.id]: scoreQuizAnswer(quiz.id, optionId)
    }));
  }

  function answerCourseQuiz(quizId: string, optionId: string) {
    setCourseResults((current) => ({
      ...current,
      [quizId]: scoreCourseCheck(course, quizId, optionId)
    }));
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
    requestAnimationFrame(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }));
  }

  function selectTab(tab: TabLabel) {
    setSelectedTab(tab);
    requestAnimationFrame(() => scrollViewRef.current?.scrollTo({ y: 0, animated: false }));
  }

  function enrollCourse() {
    setCourseEnrollment((current) => current ?? { status: "active", completedLessons: {} });
  }

  function completeCourseLesson(lessonId: string) {
    const lastLesson = courseLessons[courseLessons.length - 1];
    const completesCourse = lessonId === lastLesson?.id;
    setCourseEnrollment((current) => {
      const enrollment = current ?? { status: "active" as const, completedLessons: {} };
      const completedLessons = completesCourse
        ? Object.fromEntries(courseLessons.map((lesson) => [lesson.id, true as const]))
        : { ...enrollment.completedLessons, [lessonId]: true as const };
      return {
        status: completesCourse ? "complete" : "active",
        completedLessons
      };
    });
  }

  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 }
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header home={home} />
          <DailyGoal home={home} apiState={apiState} />
          {session ? <MobilePlanSummary session={session} /> : <MobileOnboarding onComplete={completeSignIn} />}
          {selectedTab === "Home" ? (
            <>
              <FeedCard home={home} bite={selectedBite} quiz={quiz} quizResult={quizResult} selectedBiteId={selectedBite?.id} liked={liked} saved={selectedBiteSaved} onSelectBite={setSelectedFeedBiteId} onAnswer={answerQuiz} onToggleLike={() => setLiked((value) => !value)} onToggleSave={() => selectedBite && setSavedBites((current) => ({ ...current, [selectedBite.id]: !(current[selectedBite.id] ?? selectedBite.saved) }))} />
              <PathMap home={home} />
              <SortingGame playground={home.playgrounds[0]} />
            </>
          ) : null}
          {selectedTab === "Browse" ? (
            <>
              <PathMap home={home} />
              <NativeCourse course={course} selectedLessonId={selectedCourseLessonId} enrollment={courseEnrollment} results={courseResults} onSelectLesson={setSelectedCourseLessonId} onEnroll={enrollCourse} onCompleteLesson={completeCourseLesson} onAnswer={answerCourseQuiz} />
            </>
          ) : null}
          {selectedTab === "Feed" ? <FeedCard home={home} bite={selectedBite} quiz={quiz} quizResult={quizResult} selectedBiteId={selectedBite?.id} liked={liked} saved={selectedBiteSaved} onSelectBite={setSelectedFeedBiteId} onAnswer={answerQuiz} onToggleLike={() => setLiked((value) => !value)} onToggleSave={() => selectedBite && setSavedBites((current) => ({ ...current, [selectedBite.id]: !(current[selectedBite.id] ?? selectedBite.saved) }))} /> : null}
          {selectedTab === "Play" ? <NativePlayground home={home} selectedPlaygroundId={selectedPlaygroundId} onSelectPlayground={setSelectedPlaygroundId} /> : null}
          {selectedTab === "Library" ? (
            <NativeLibrary
              home={home}
              savedBites={savedBites}
              onOpenBite={(biteId) => {
                setSelectedFeedBiteId(biteId);
                selectTab("Feed");
              }}
            />
          ) : null}
          {selectedTab === "You" ? <ProgressSummary home={home} apiState={apiState} session={session} course={course} enrollment={courseEnrollment} /> : null}
        </ScrollView>
        <BottomTabs selected={selectedTab} onSelect={selectTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Header({ home }: { home: LearningHome }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>brainbuilder</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Good morning, {home.user.name}
        </Text>
        <Text style={styles.subtitle}>Tiny lessons, quick checks, and games that fit between stops.</Text>
      </View>
      <View style={styles.streakPill}>
        <Ionicons name="flame" size={18} color={colors.ember} />
        <Text style={styles.streakText}>{home.stats.streakDays}</Text>
      </View>
    </View>
  );
}

function DailyGoal({ home, apiState }: { home: LearningHome; apiState: ApiState }) {
  const progress = home.stats.dailyGoalCompleted / home.stats.dailyGoalTarget;
  return (
    <View style={styles.goalPanel}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>Daily goal</Text>
        <Text style={styles.mutedText}>
          {home.stats.dailyGoalCompleted}/{home.stats.dailyGoalTarget}
        </Text>
      </View>
      <View style={styles.progressTrack} accessibilityLabel="Daily goal progress">
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.mutedText}>Continue: {home.paths[1]?.modules.find((module) => module.status === "current")?.title}</Text>
      <Text style={styles.syncText}>{mobileStatusLabel(apiState)}</Text>
    </View>
  );
}

function mobileStatusLabel(apiState: ApiState) {
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

function MobileOnboarding({ onComplete }: { onComplete: (session: LearnerSession) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedObjectives, setSelectedObjectives] = useState<LearnerObjectiveId[]>(["algorithms"]);
  const nameRef = useRef("");
  const emailRef = useRef("");
  const objectivesRef = useRef<LearnerObjectiveId[]>(["algorithms"]);

  function toggleObjective(objectiveId: LearnerObjectiveId) {
    setSelectedObjectives((current) => {
      const nextObjectives = current.includes(objectiveId)
        ? current.length === 1
          ? current
          : current.filter((id) => id !== objectiveId)
        : [...current, objectiveId];
      objectivesRef.current = nextObjectives;
      return nextObjectives;
    });
  }

  function submit() {
    const trimmedName = nameRef.current.trim();
    const trimmedEmail = emailRef.current.trim();
    if (!trimmedName || !trimmedEmail) {
      return;
    }
    onComplete({
      name: trimmedName,
      email: trimmedEmail,
      objectiveIds: objectivesRef.current.length ? objectivesRef.current : ["algorithms"]
    });
  }

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  return (
    <View style={[styles.card, styles.tealCard]}>
      <Text style={styles.eyebrow}>New learner</Text>
      <Text accessibilityRole="header" style={styles.cardTitle}>Build your learning plan</Text>
      <Text style={styles.prompt}>Choose a goal and turn the app into a guided loop of lessons, checks, diagrams, and games.</Text>
      <TextInput
        accessibilityLabel="Name"
        value={name}
        onChangeText={(value) => {
          nameRef.current = value;
          setName(value);
        }}
        placeholder="Name"
        placeholderTextColor={colors.muted}
        style={styles.textInput}
      />
      <TextInput
        accessibilityLabel="Email"
        value={email}
        onChangeText={(value) => {
          emailRef.current = value;
          setEmail(value);
        }}
        placeholder="Email"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.textInput}
      />
      <View style={styles.objectiveList}>
        {learnerObjectives.map((objective) => {
          const selected = selectedObjectives.includes(objective.id);
          return (
            <Pressable
              key={objective.id}
              accessibilityLabel={`${objective.label} objective`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => toggleObjective(objective.id)}
              style={({ pressed }) => [styles.objectiveButton, selected && styles.objectiveButtonActive, pressed && styles.pressed]}
            >
              <Text style={[styles.objectiveTitle, selected && styles.objectiveTitleActive]}>{objective.label}</Text>
              <Text style={[styles.objectiveDescription, selected && styles.objectiveDescriptionActive]}>{objective.description}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        testID="build-learning-plan"
        onPress={submit}
        disabled={!canSubmit}
        accessibilityLabel="Build learning plan"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        style={({ pressed }) => [styles.primaryAction, !canSubmit && styles.disabledAction, pressed && styles.pressed]}
      >
        <Text style={styles.primaryActionText}>Build learning plan</Text>
      </Pressable>
    </View>
  );
}

function MobilePlanSummary({ session }: { session: LearnerSession }) {
  const labels = learnerObjectives.filter((objective) => session.objectiveIds.includes(objective.id)).map((objective) => objective.label);
  return (
    <View accessibilityLabel={`Plan active for ${session.name}. Objectives locked in. ${labels.join(", ")}`} style={[styles.card, styles.violetCard]}>
      <Text style={styles.eyebrowViolet}>Plan active for {session.name}</Text>
      <Text style={styles.cardTitle}>Objectives locked in</Text>
      <View style={styles.objectiveChipRow}>
        {labels.map((label) => (
          <View key={label} style={styles.objectiveChip}>
            <Text style={styles.objectiveChipText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FeedCard({
  home,
  bite,
  quiz,
  quizResult,
  selectedBiteId,
  liked,
  saved,
  onSelectBite,
  onAnswer,
  onToggleLike,
  onToggleSave
}: {
  home: LearningHome;
  bite: LearningHome["feed"][number] | undefined;
  quiz: Quiz | undefined;
  quizResult: QuizResult | null;
  selectedBiteId: string | undefined;
  liked: boolean;
  saved: boolean;
  onSelectBite: (biteId: string) => void;
  onAnswer: (id: string) => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
}) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    setAudioPlaying(false);
    setSelectedOptionId(null);
  }, [bite?.id, quiz?.id]);

  if (!bite || !quiz) {
    return null;
  }

  return (
    <View style={[styles.card, styles.emberCard]}>
      <View style={styles.rowBetween}>
        <Text style={styles.eyebrowEmber}>Feed</Text>
        <View style={styles.iconRow}>
          <IconButton name={liked ? "heart" : "heart-outline"} label="Like bite" active={liked} onPress={onToggleLike} />
          <IconButton name={saved ? "bookmark" : "bookmark-outline"} label="Save bite" active={saved} onPress={onToggleSave} />
        </View>
      </View>
      <View style={styles.feedQueue}>
        {home.feed.map((item) => {
          const active = item.id === selectedBiteId;
          return (
            <Pressable key={item.id} onPress={() => onSelectBite(item.id)} accessibilityRole="button" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.feedQueueButton, active && styles.feedQueueButtonActive, pressed && styles.pressed]}>
              <Text style={[styles.feedQueueText, active && styles.feedQueueTextActive]}>{item.title}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.cardTitle}>{bite.title}</Text>
      <View style={styles.visual} accessibilityLabel="Binary search split diagram">
        <View style={styles.binaryRow}>
          {[4, 8, 12, 16, 20, 24, 28].map((value, index) => (
            <View key={value} style={[styles.numberCell, index === 3 && styles.numberCellActive]}>
              <Text style={styles.numberText}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.splitLine} />
        <Text style={styles.visualCaption}>split, compare, halve</Text>
      </View>
      <View style={styles.audioRow}>
        <IconButton name={audioPlaying ? "pause-circle" : "play-circle-outline"} label="Play audio lesson" active={audioPlaying} onPress={() => setAudioPlaying((value) => !value)} />
        <View style={styles.audioTrack}>
          <View style={[styles.audioFill, { width: audioPlaying ? "72%" : "18%" }]} />
        </View>
        <Text style={styles.mutedText}>0:{String(bite.durationSeconds).padStart(2, "0")}</Text>
      </View>
      <Text style={styles.prompt}>{bite.prompt}</Text>
      <Text style={styles.actionStatus}>
        {audioPlaying ? "Audio playing" : "Audio ready"} · {liked ? "Liked" : "Tap heart to like"} · {saved ? "Saved for later" : "Not saved"}
      </Text>
      <View style={styles.quizBox}>
        <Text style={styles.quizLabel}>quick check</Text>
        <Text style={styles.quizQuestion}>{quiz.question}</Text>
        {quiz.options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => {
              setSelectedOptionId(option.id);
              onAnswer(option.id);
            }}
            style={({ pressed }) => [styles.answerButton, selectedOptionId === option.id && styles.answerButtonSelected, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedOptionId === option.id }}
          >
            <Text style={styles.answerText}>{option.label}</Text>
          </Pressable>
        ))}
        <Text style={[styles.feedback, quizResult?.correct && styles.feedbackCorrect]}>
          {quizResult ? (quizResult.correct ? `Nice. +${quizResult.xpAwarded} XP` : quizResult.feedback) : "Answer to keep your streak alive."}
        </Text>
      </View>
    </View>
  );
}

function PathMap({ home }: { home: LearningHome }) {
  const path = home.paths[0];
  if (!path) {
    return null;
  }

  return (
    <View style={[styles.card, styles.violetCard]}>
      <Text style={styles.eyebrowViolet}>Journey map</Text>
      <Text style={styles.cardTitle}>{path.title}</Text>
      {path.modules.map((module) => (
        <View key={module.id} style={styles.moduleRow}>
          <View style={[styles.moduleDot, module.status === "complete" && styles.moduleDone]}>
            {module.status === "complete" ? <Ionicons name="checkmark" size={18} color={colors.white} /> : <View style={styles.innerDot} />}
          </View>
          <View style={[styles.modulePanel, module.status === "current" && styles.moduleCurrent]}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.mutedText}>{module.status}</Text>
          </View>
        </View>
      ))}
    </View>
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
    <View style={[styles.card, styles.violetCard]}>
      <Text style={styles.eyebrowViolet}>Play</Text>
      <Text style={styles.cardTitle}>{playground.title}</Text>
      <Text style={styles.prompt}>{playground.description}</Text>
      <View style={styles.barsBox}>
        {bars.map((bar, index) => (
          <Pressable
            key={`${bar}-${index}`}
            onPress={() => selectBar(index)}
            accessibilityRole="button"
            accessibilityLabel={`Select bar ${index + 1}`}
            style={({ pressed }) => [
              styles.bar,
              { height: `${bar}%`, backgroundColor: selected.includes(index) ? colors.violet : index % 2 === 0 ? colors.paperDeep : colors.teal },
              pressed && styles.pressed
            ]}
          />
        ))}
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.mutedText}>swaps: {swaps}</Text>
        <Text style={styles.mutedText}>compares: {compares}</Text>
        <Text style={styles.mutedText}>+{playground.xpReward} XP</Text>
      </View>
    </View>
  );
}

function NativePlayground({
  home,
  selectedPlaygroundId,
  onSelectPlayground
}: {
  home: LearningHome;
  selectedPlaygroundId: string;
  onSelectPlayground: (playgroundId: string) => void;
}) {
  const playground = home.playgrounds.find((item) => item.id === selectedPlaygroundId) ?? home.playgrounds[0];

  return (
    <>
      <View style={[styles.card, styles.violetCard]}>
        <Text style={styles.eyebrowViolet}>Practice arcade</Text>
        <Text style={styles.cardTitle}>Choose a tactile lab</Text>
        <Text style={styles.prompt}>Switch between games and keep feedback in the same mobile surface.</Text>
        <View style={styles.lessonSelector}>
          {home.playgrounds.map((item) => {
            const active = item.id === playground?.id;
            return (
              <Pressable key={item.id} onPress={() => onSelectPlayground(item.id)} accessibilityRole="button" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.lessonButton, active && styles.lessonButtonActive, pressed && styles.pressed]}>
                <Text style={[styles.lessonButtonText, active && styles.lessonButtonTextActive]}>{item.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {playground?.interaction === "trace-tree" ? <NativeTreeTraceGame playground={playground} /> : <SortingGame playground={playground} />}
    </>
  );
}

function NativeTreeTraceGame({ playground }: { playground: LearningHome["playgrounds"][number] }) {
  const [path, setPath] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const correctPath = ["8", "12", "14"];
  const solved = checked && correctPath.every((node, index) => path[index] === node);

  function toggleNode(node: string) {
    setChecked(false);
    setPath((current) => (current.includes(node) ? current.filter((item) => item !== node) : [...current, node].slice(-3)));
  }

  return (
    <View style={[styles.card, styles.violetCard]}>
      <Text style={styles.eyebrowViolet}>Play</Text>
      <Text style={styles.cardTitle}>{playground.title}</Text>
      <Text style={styles.prompt}>{playground.description}</Text>
      <View style={styles.treePracticeBox}>
        <View style={styles.treeRow}>
          <TreeNodeButton label="8" selected={path.includes("8")} onPress={() => toggleNode("8")} />
        </View>
        <View style={[styles.treeRow, styles.treeRowWide]}>
          <TreeNodeButton label="4" selected={path.includes("4")} onPress={() => toggleNode("4")} />
          <TreeNodeButton label="12" selected={path.includes("12")} onPress={() => toggleNode("12")} />
        </View>
        <View style={[styles.treeRow, styles.treeRowRight]}>
          <TreeNodeButton label="10" selected={path.includes("10")} onPress={() => toggleNode("10")} />
          <TreeNodeButton label="14" selected={path.includes("14")} onPress={() => toggleNode("14")} />
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable onPress={() => setChecked(true)} accessibilityRole="button" style={({ pressed }) => [styles.compactAction, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Check path</Text>
        </Pressable>
        <Text style={styles.mutedText}>Selected: {path.length ? path.join(" -> ") : "none"}</Text>
      </View>
      {checked ? <Text style={[styles.actionStatus, solved && styles.successStatus]}>{solved ? "That path has height 3." : "Trace 8 -> 12 -> 14 to feel the longest path."}</Text> : null}
      <Text style={styles.mutedText}>+{playground.xpReward} XP</Text>
    </View>
  );
}

function TreeNodeButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={`Tree node ${label}`} accessibilityRole="button" accessibilityState={{ selected }} style={({ pressed }) => [styles.treeNodeButton, selected && styles.treeNodeButtonSelected, pressed && styles.pressed]}>
      <Text style={[styles.treeNodeText, selected && styles.treeNodeTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function NativeLibrary({ home, savedBites, onOpenBite }: { home: LearningHome; savedBites: Record<string, boolean>; onOpenBite: (biteId: string) => void }) {
  const savedFeed = home.feed.filter((bite) => savedBites[bite.id] ?? bite.saved);

  return (
    <View style={[styles.card, styles.tealCard]}>
      <Text style={styles.eyebrow}>Library</Text>
      <Text style={styles.cardTitle}>Multimodal library</Text>
      <Text style={styles.prompt}>Saved commute lessons stay ready for reading, listening, watching, and a quick check.</Text>
      <Text style={styles.panelTitle}>Saved for later</Text>
      {savedFeed.length ? (
        savedFeed.map((bite) => (
          <Pressable key={bite.id} onPress={() => onOpenBite(bite.id)} accessibilityLabel={bite.title} accessibilityRole="button" style={({ pressed }) => [styles.savedLessonButton, pressed && styles.pressed]}>
            <Text style={styles.savedLessonTopic}>{bite.topic}</Text>
            <Text style={styles.moduleTitle}>{bite.title}</Text>
            <Text style={styles.mutedText}>{bite.durationSeconds}s · {bite.modes.join(" + ")}</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.feedback}>Save a feed bite to build a personal review shelf.</Text>
      )}
    </View>
  );
}

function ProgressSummary({
  home,
  apiState,
  session,
  course,
  enrollment
}: {
  home: LearningHome;
  apiState: ApiState;
  session: LearnerSession | null;
  course: Course;
  enrollment: CourseEnrollment | undefined;
}) {
  const lessonCount = course.units.flatMap((unit) => unit.lessons).length;
  const completedCount = enrollment ? Object.keys(enrollment.completedLessons).length : 0;
  const courseComplete = enrollment?.status === "complete";

  return (
    <View style={[styles.card, styles.tealCard]}>
      <Text style={styles.eyebrow}>You</Text>
      <Text style={styles.cardTitle}>{home.user.name}'s streak</Text>
      <Text style={styles.prompt}>
        {home.stats.streakDays} days active · {home.stats.xp.toLocaleString()} XP · {mobileStatusLabel(apiState)}
      </Text>
      {(session || enrollment) ? (
        <View style={styles.courseProgressPanel}>
          <Text style={styles.panelTitle}>{course.title}</Text>
          <Text style={styles.mutedText}>{completedCount}/{lessonCount} lessons complete</Text>
          <Text style={courseComplete ? styles.syncText : styles.actionStatus}>{courseComplete ? "Course complete" : "Course in progress"}</Text>
          {courseComplete ? <Text style={styles.syncText}>Certificate ready</Text> : null}
        </View>
      ) : null}
      {home.quests.map((quest) => (
        <View key={quest.id} style={styles.questRow}>
          <Text style={styles.moduleTitle}>{quest.label}</Text>
          <Text style={styles.mutedText}>
            {quest.completed}/{quest.target}
          </Text>
        </View>
      ))}
    </View>
  );
}

function NativeCourse({
  course,
  selectedLessonId,
  enrollment,
  results,
  onSelectLesson,
  onEnroll,
  onCompleteLesson,
  onAnswer
}: {
  course: Course;
  selectedLessonId: string;
  enrollment: CourseEnrollment | undefined;
  results: Record<string, CourseCheckResult>;
  onSelectLesson: (lessonId: string) => void;
  onEnroll: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onAnswer: (quizId: string, optionId: string) => void;
}) {
  const coverage = computeCourseCoverage(course);
  const rendererManifest = buildRendererManifest(course);
  const courseLessons = course.units.flatMap((unit) => unit.lessons);
  const selectedLesson = findLesson(course, selectedLessonId) ?? courseLessons[0];
  const lessonIndex = courseLessons.findIndex((lesson) => lesson.id === selectedLesson?.id);
  const lastLesson = courseLessons[courseLessons.length - 1];
  const completedCount = enrollment ? Object.keys(enrollment.completedLessons).length : 0;
  const lessonComplete = Boolean(selectedLesson && enrollment?.completedLessons[selectedLesson.id]);
  const courseComplete = enrollment?.status === "complete";
  const quizBlocks = selectedLesson?.blocks.filter((block): block is QuizBlock => block.kind === "quiz") ?? [];
  const hasPassedCheck = quizBlocks.length === 0 || quizBlocks.some((block) => results[block.id]?.correct);
  const isLastLesson = selectedLesson?.id === lastLesson?.id;

  return (
    <View style={[styles.card, styles.tealCard]}>
      <Text style={styles.eyebrow}>Course framework</Text>
      <Text style={styles.cardTitle}>{course.title}</Text>
      <Text style={styles.prompt}>{course.subtitle}</Text>
      <View style={styles.metricGrid}>
        <MetricPill label={`${coverage.unitCount} units`} />
        <MetricPill label={`${coverage.lessonCount} micro lessons`} />
        <MetricPill label={`${coverage.blockCount} blocks`} />
        <MetricPill label={`${coverage.assessmentCount} checks`} />
      </View>
      <View style={styles.rendererRow}>
        {rendererManifest.map((renderer) => (
          <View key={renderer.family} style={styles.rendererChip}>
            <Text style={styles.rendererText}>{renderer.family}</Text>
          </View>
        ))}
      </View>
      <View style={styles.lessonSelector}>
        {courseLessons.map((lesson) => {
          const active = lesson.id === selectedLesson?.id;
          return (
            <Pressable key={lesson.id} onPress={() => onSelectLesson(lesson.id)} accessibilityRole="button" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.lessonButton, active && styles.lessonButtonActive, pressed && styles.pressed]}>
              <Text style={[styles.lessonButtonText, active && styles.lessonButtonTextActive]}>{lesson.title}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.courseProgressPanel}>
        <Text style={styles.panelTitle}>{courseComplete ? "Course complete" : enrollment ? "Enrolled" : "Choose this course"}</Text>
        <Text style={styles.mutedText}>{completedCount}/{courseLessons.length} lessons complete</Text>
        {!enrollment ? (
          <Pressable onPress={onEnroll} accessibilityRole="button" style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
            <Text style={styles.primaryActionText}>Enroll in course</Text>
          </Pressable>
        ) : null}
        {enrollment && !courseComplete && !lessonComplete && selectedLesson ? (
          <Pressable
            onPress={() => onCompleteLesson(selectedLesson.id)}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasPassedCheck }}
            disabled={!hasPassedCheck}
            style={({ pressed }) => [styles.primaryAction, !hasPassedCheck && styles.disabledAction, pressed && styles.pressed]}
          >
            <Text style={styles.primaryActionText}>{isLastLesson ? "Complete course" : "Complete lesson"}</Text>
          </Pressable>
        ) : null}
        {lessonComplete && !courseComplete ? <Text style={styles.syncText}>Lesson complete. Next lesson {lessonIndex + 2} is ready.</Text> : null}
        {courseComplete ? <Text style={styles.syncText}>Certificate ready</Text> : null}
      </View>
      {selectedLesson ? <NativeCourseLesson lesson={selectedLesson} results={results} onAnswer={onAnswer} /> : null}
    </View>
  );
}

function MetricPill({ label }: { label: string }) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricText}>{label}</Text>
    </View>
  );
}

function NativeCourseLesson({ lesson, results, onAnswer }: { lesson: CourseLesson; results: Record<string, CourseCheckResult>; onAnswer: (quizId: string, optionId: string) => void }) {
  return (
    <View style={styles.nativeLessonPanel}>
      <Text style={styles.eyebrowViolet}>Native lesson</Text>
      <Text style={styles.cardTitle}>{lesson.title}</Text>
      <Text style={styles.prompt}>{lesson.summary}</Text>
      <View style={styles.outcomeRow}>
        {lesson.outcomes.map((outcome) => (
          <View key={outcome} style={styles.outcomePill}>
            <Text style={styles.outcomeText}>{outcome}</Text>
          </View>
        ))}
      </View>
      <NativeLessonGuide lesson={lesson} />
      {lesson.blocks.map((block) => (
        <NativeCourseBlock key={block.id} block={block} result={block.kind === "quiz" ? results[block.id] : undefined} onAnswer={onAnswer} />
      ))}
    </View>
  );
}

function NativeLessonGuide({ lesson }: { lesson: CourseLesson }) {
  const guide = getLessonLearningGuide(lesson);
  const cards = [
    ["Why", guide.why],
    ["Model", guide.mentalModel],
    ["Example", guide.workedExample],
    ["Practice", guide.practicePrompt]
  ] as const;

  return (
    <View style={styles.lessonGuidePanel}>
      <View style={styles.lessonGuideHeader}>
        <Text style={styles.microKind}>Learning loop</Text>
        <Text style={styles.stageCountPill}>{lesson.estimatedMinutes} min</Text>
      </View>
      <Text style={styles.panelTitle}>Predict, watch, try, explain</Text>
      <View style={styles.guideGrid}>
        {cards.map(([label, body]) => (
          <View key={label} style={styles.guideCell}>
            <Text style={styles.guideLabel}>{label}</Text>
            <Text style={styles.guideText}>{body}</Text>
          </View>
        ))}
      </View>
      <View style={styles.guideCell}>
        <Text style={styles.guideLabel}>Trap</Text>
        <Text style={styles.guideText}>{guide.commonTrap}</Text>
      </View>
      <Text style={styles.explainBackText}>Explain it back: {guide.explainBack}</Text>
    </View>
  );
}

function NativeCourseBlock({ block, result, onAnswer }: { block: CourseBlock; result?: CourseCheckResult; onAnswer: (quizId: string, optionId: string) => void }) {
  if (block.kind === "diagram") {
    return <NativeDiagramBlock block={block} />;
  }
  if (block.kind === "simulation") {
    return <NativeSimulationBlock block={block} />;
  }
  if (block.kind === "quiz") {
    return <NativeCourseQuiz block={block} result={result} onAnswer={onAnswer} />;
  }
  if (block.kind === "lab") {
    return <NativeLabBlock block={block} />;
  }
  if (block.kind === "code-trace") {
    return <NativeCodeTraceBlock block={block} />;
  }
  if (block.kind === "project") {
    return <NativeProjectBlock block={block} />;
  }
  if (block.kind === "reflection") {
    return <NativeReflectionBlock block={block} />;
  }
  if (block.kind === "text") {
    return (
      <View style={styles.microBlock}>
        <Text style={styles.microKind}>Read</Text>
        <Text style={styles.microTitle}>{block.title}</Text>
        <Text style={styles.mutedText}>{block.body[0]}</Text>
      </View>
    );
  }
  if (block.kind === "audio") {
    return (
      <View style={styles.microBlock}>
        <Text style={styles.microKind}>Listen</Text>
        <Text style={styles.microTitle}>{block.title}</Text>
        <Text style={styles.mutedText}>{block.durationSeconds}s brief</Text>
      </View>
    );
  }
  return null;
}

function NativeDiagramBlock({ block }: { block: DiagramBlock }) {
  if (block.id === "binary-search-window") {
    return <NativeBinarySearchWindow block={block} />;
  }
  if (block.id === "dp-grid-fill") {
    return <NativeDPGrid block={block} />;
  }

  return <NativeAnimatedStage block={block} />;
}

function NativeBinarySearchWindow({ block }: { block: DiagramBlock }) {
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
  const traceSteps = [
    { label: "Predict", note: "Start with every value in the possible window." },
    { label: "Compare", note: "Compare mid value 16, then move low because 20 is larger." },
    { label: "Discard", note: "Only discard values that cannot contain the target." },
    { label: "Converge", note: "Only 20 remains, so the invariant survived each cut." }
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
    const timeout = setTimeout(() => {
      setStep((current) => Math.min(current + 1, windows.length - 1));
    }, 520);
    return () => clearTimeout(timeout);
  }, [atEnd, autoPlaying, clampedStep, windows.length]);

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
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>D3-native fallback</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <Text style={styles.stageCountPill}>Search step {clampedStep + 1} of {windows.length}</Text>
      <View accessible accessibilityRole="image" accessibilityLabel={`Native binary search window. Window ${lo + 1}-${hi + 1}; target ${target}`} style={styles.nativeBinaryWindow}>
        <View style={styles.binaryRow}>
          {values.map((value, index) => {
            const active = index >= lo && index <= hi;
            const found = value === target && lo === hi;
            return (
              <View key={value} style={[styles.numberCell, active && styles.numberCellActive, found && styles.numberCellFound]}>
                <Text style={styles.numberText}>{value}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.visualCaption}>window {lo + 1}-{hi + 1}; target {target}</Text>
      </View>
      <View style={styles.stageChipGrid}>
        {traceSteps.map((traceStep, index) => (
          <Pressable
            key={traceStep.label}
            onPress={() => {
              setPlaying(true);
              setAutoPlaying(false);
              setStep(index);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: index === clampedStep }}
            style={({ pressed }) => [styles.stageChip, index === clampedStep && styles.stageChipActive, pressed && styles.pressed]}
          >
            <Text style={[styles.stageChipText, index === clampedStep && styles.stageChipTextActive]}>{index + 1}. {traceStep.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.syncText}>{traceSteps[clampedStep]?.note}</Text>
      <NativePlaybackControls
        playLabel="Play mobile search"
        nextLabel="Next search step"
        previousLabel="Previous search step"
        resetLabel="Reset search"
        playing={playing || autoPlaying}
        autoPlaying={autoPlaying}
        atStart={atStart}
        atEnd={atEnd}
        onPlay={toggleSearchPlayback}
        onNext={nextSearchStep}
        onPrevious={previousSearchStep}
        onReset={resetSearch}
      />
    </View>
  );
}

function NativeDPGrid({ block }: { block: DiagramBlock }) {
  const [filled, setFilled] = useState(0);
  const total = 20;
  const atStart = filled === 0;
  const atEnd = filled === total;

  return (
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>Native grid</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <Text style={styles.stageCountPill}>Cells {filled} of {total}</Text>
      <View accessible accessibilityRole="image" accessibilityLabel="Native DP grid fill" style={styles.nativeGrid}>
        {Array.from({ length: total }).map((_, index) => (
          <View key={index} style={[styles.gridCell, index < filled && styles.gridCellFilled]}>
            <Text style={[styles.gridCellText, index < filled && styles.gridCellTextFilled]}>{index + 1}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actionRow}>
        <Pressable onPress={() => setFilled((current) => Math.min(current + 1, total))} disabled={atEnd} accessibilityRole="button" accessibilityState={{ disabled: atEnd }} style={({ pressed }) => [styles.compactAction, atEnd && styles.playbackButtonDisabled, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Fill next cell</Text>
        </Pressable>
        <Pressable onPress={() => setFilled((current) => Math.max(current - 1, 0))} disabled={atStart} accessibilityRole="button" accessibilityState={{ disabled: atStart }} style={({ pressed }) => [styles.compactAction, atStart && styles.playbackButtonDisabled, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Back one cell</Text>
        </Pressable>
        <Pressable onPress={() => setFilled(0)} disabled={atStart} accessibilityRole="button" accessibilityState={{ disabled: atStart }} style={({ pressed }) => [styles.compactAction, atStart && styles.playbackButtonDisabled, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Reset grid</Text>
        </Pressable>
      </View>
      {filled > 0 ? <Text style={styles.syncText}>Dependencies satisfied for {filled} {filled === 1 ? "cell" : "cells"}.</Text> : null}
    </View>
  );
}

function NativeSimulationBlock({ block }: { block: SimulationBlock }) {
  if (block.id === "tree-rotation-3d") {
    return <NativeTreeRotation block={block} />;
  }

  return <NativeAnimatedStage block={block} />;
}

function NativeTreeRotation({ block }: { block: SimulationBlock }) {
  const [rotationStep, setRotationStep] = useState(0);

  return (
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>Three-native fallback</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <View accessible accessibilityRole="image" accessibilityLabel="Native tree rotation surface" style={styles.rotationSurface}>
        <View style={[styles.rotationGroup, { transform: [{ rotate: `${rotationStep * 8}deg` }] }]}>
          <View style={[styles.treeNode, styles.treeNodeRoot]} />
          <View style={[styles.treeNode, styles.treeNodeLeft]} />
          <View style={[styles.treeNode, styles.treeNodeRight]} />
          <View style={[styles.treeNode, styles.treeNodeLeaf]} />
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable onPress={() => setRotationStep((current) => current + 1)} accessibilityRole="button" style={({ pressed }) => [styles.compactAction, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Rotate left</Text>
        </Pressable>
        <Pressable onPress={() => setRotationStep((current) => current - 1)} accessibilityRole="button" style={({ pressed }) => [styles.compactAction, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Rotate right</Text>
        </Pressable>
        <Pressable onPress={() => setRotationStep(0)} disabled={rotationStep === 0} accessibilityRole="button" accessibilityState={{ disabled: rotationStep === 0 }} style={({ pressed }) => [styles.compactAction, rotationStep === 0 && styles.playbackButtonDisabled, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Reset rotation</Text>
        </Pressable>
      </View>
      {rotationStep !== 0 ? <Text style={styles.syncText}>Inorder preserved while height changes.</Text> : null}
    </View>
  );
}

function NativeCourseQuiz({ block, result, onAnswer }: { block: QuizBlock; result?: CourseCheckResult; onAnswer: (quizId: string, optionId: string) => void }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  return (
    <View style={styles.quizBox}>
      <Text style={styles.quizLabel}>course check</Text>
      <Text style={styles.quizQuestion}>{block.question}</Text>
      {block.options.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => {
            setSelectedOptionId(option.id);
            onAnswer(block.id, option.id);
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedOptionId === option.id }}
          style={({ pressed }) => [styles.answerButton, selectedOptionId === option.id && styles.answerButtonSelected, pressed && styles.pressed]}
        >
          <Text style={styles.answerText}>{option.label}</Text>
        </Pressable>
      ))}
      <Text style={[styles.feedback, result?.correct && styles.feedbackCorrect]}>{result ? result.feedback : "Choose an answer to unlock the next block."}</Text>
    </View>
  );
}

function NativeLabBlock({ block }: { block: LabBlock }) {
  return <NativeAnimatedStage block={block} />;
}

function NativeCodeTraceBlock({ block }: { block: Extract<CourseBlock, { kind: "code-trace" }> }) {
  const [traceStep, setTraceStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const clampedStep = Math.min(traceStep, block.tracePoints.length - 1);
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
    const timeout = setTimeout(() => {
      setTraceStep((current) => Math.min(current + 1, block.tracePoints.length - 1));
    }, 520);
    return () => clearTimeout(timeout);
  }, [atEnd, autoPlaying, block.tracePoints.length, clampedStep]);

  function nextTraceStep() {
    setPlaying(true);
    setAutoPlaying(false);
    setTraceStep((current) => Math.min(current + 1, block.tracePoints.length - 1));
  }

  function previousTraceStep() {
    setPlaying(true);
    setAutoPlaying(false);
    setTraceStep((current) => Math.max(current - 1, 0));
  }

  function resetTrace() {
    setPlaying(false);
    setAutoPlaying(false);
    setTraceStep(0);
  }

  function toggleTracePlayback() {
    setPlaying(true);
    setAutoPlaying((current) => {
      if (current) return false;
      if (atEnd) setTraceStep(0);
      return true;
    });
  }

  return (
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>Trace</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <Text style={styles.codeSnippet}>{block.code}</Text>
      <View style={styles.traceList}>
        {block.tracePoints.map((point, index) => (
          <Text key={point} style={[styles.tracePoint, index === clampedStep && styles.tracePointActive]}>
            {index + 1}. {point}
          </Text>
        ))}
      </View>
      <Text style={styles.syncText}>Trace state {clampedStep + 1}: {block.tracePoints[clampedStep]}</Text>
      <NativePlaybackControls
        playLabel="Play trace walkthrough"
        nextLabel="Next trace step"
        previousLabel="Previous trace step"
        resetLabel="Reset trace"
        playing={playing || autoPlaying}
        autoPlaying={autoPlaying}
        atStart={atStart}
        atEnd={atEnd}
        onPlay={toggleTracePlayback}
        onNext={nextTraceStep}
        onPrevious={previousTraceStep}
        onReset={resetTrace}
      />
    </View>
  );
}

function NativeProjectBlock({ block }: { block: Extract<CourseBlock, { kind: "project" }> }) {
  const [projectStage, setProjectStage] = useState(0);
  const clampedStage = Math.min(projectStage, block.deliverables.length - 1);

  return (
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>Project</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <Text style={styles.mutedText}>{block.brief}</Text>
      <View style={styles.traceList}>
        {block.deliverables.map((deliverable, index) => (
          <Text key={deliverable} style={[styles.tracePoint, index === clampedStage && styles.tracePointActive]}>
            {index + 1}. {deliverable}
          </Text>
        ))}
      </View>
      <Text style={styles.syncText}>Project stage {clampedStage + 1}: {block.deliverables[clampedStage]}</Text>
      <View style={styles.actionRow}>
        <Pressable onPress={() => setProjectStage((current) => Math.min(current + 1, block.deliverables.length - 1))} accessibilityRole="button" style={({ pressed }) => [styles.compactAction, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Advance project stage</Text>
        </Pressable>
        <Pressable onPress={() => setProjectStage(0)} accessibilityRole="button" style={({ pressed }) => [styles.compactAction, pressed && styles.pressed]}>
          <Text style={styles.answerText}>Reset project</Text>
        </Pressable>
      </View>
      <Text style={styles.mutedText}>+{block.xp} XP</Text>
    </View>
  );
}

function NativeReflectionBlock({ block }: { block: Extract<CourseBlock, { kind: "reflection" }> }) {
  return (
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>Reflect</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <Text style={styles.mutedText}>{block.prompt}</Text>
    </View>
  );
}

type NativeStageBlock = DiagramBlock | SimulationBlock | LabBlock;

function NativeAnimatedStage({ block }: { block: NativeStageBlock }) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const model = nativeStageModelForBlock(block);
  const clampedStage = Math.min(stage, model.steps.length - 1);
  const atStart = clampedStage === 0;
  const atEnd = clampedStage === model.steps.length - 1;
  const activeScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1]
  });

  useEffect(() => {
    pulse.setValue(0);
    Animated.timing(pulse, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true
    }).start();
  }, [clampedStage, pulse]);

  useEffect(() => {
    if (!autoPlaying) {
      return;
    }
    if (atEnd) {
      setAutoPlaying(false);
      return;
    }
    const timeout = setTimeout(() => {
      setStage((current) => Math.min(current + 1, model.steps.length - 1));
    }, 520);
    return () => clearTimeout(timeout);
  }, [atEnd, autoPlaying, clampedStage, model.steps.length]);

  function nextNativeStage() {
    setPlaying(true);
    setAutoPlaying(false);
    setStage((current) => Math.min(current + 1, model.steps.length - 1));
  }

  function previousNativeStage() {
    setPlaying(true);
    setAutoPlaying(false);
    setStage((current) => Math.max(current - 1, 0));
  }

  function resetNativeStage() {
    setPlaying(false);
    setAutoPlaying(false);
    setStage(0);
  }

  function toggleNativeStagePlayback() {
    setPlaying(true);
    setAutoPlaying((current) => {
      if (current) return false;
      if (atEnd) setStage(0);
      return true;
    });
  }

  return (
    <View style={styles.microBlock}>
      <Text style={styles.microKind}>{model.kicker}</Text>
      <Text style={styles.microTitle}>{block.title}</Text>
      <Text style={styles.mutedText}>{model.prompt}</Text>
      <View accessible accessibilityRole="image" accessibilityLabel={`Native animated stage ${block.title}`} style={styles.nativeStageSurface}>
        <View style={styles.nativeStageRail} />
        <View style={styles.nativeStageRow}>
          {model.steps.map((label, index) => {
            const active = index <= clampedStage;
            const NodeView = active ? Animated.View : View;
            return (
              <NodeView key={`${label}-${index}`} style={[styles.nativeStageNode, active && styles.nativeStageNodeActive, active && { transform: [{ scale: activeScale }] }]}>
                <Text style={[styles.nativeStageNodeText, active && styles.nativeStageNodeTextActive]}>{shortStageLabel(label)}</Text>
              </NodeView>
            );
          })}
        </View>
        <Text style={styles.visualCaption}>Stage {clampedStage + 1} of {model.steps.length}</Text>
      </View>
      <Text style={styles.syncText}>{model.feedback[clampedStage]}</Text>
      <NativePlaybackControls
        playLabel="Play native stage"
        nextLabel="Next native stage"
        previousLabel="Previous native stage"
        resetLabel="Reset native stage"
        playing={playing || autoPlaying}
        autoPlaying={autoPlaying}
        atStart={atStart}
        atEnd={atEnd}
        onPlay={toggleNativeStagePlayback}
        onNext={nextNativeStage}
        onPrevious={previousNativeStage}
        onReset={resetNativeStage}
      />
      <Text style={styles.actionStatus}>{model.invariant}</Text>
    </View>
  );
}

function NativePlaybackControls({
  playLabel,
  nextLabel,
  previousLabel,
  resetLabel,
  playing,
  autoPlaying,
  atStart,
  atEnd,
  onPlay,
  onNext,
  onPrevious,
  onReset
}: {
  playLabel: string;
  nextLabel: string;
  previousLabel: string;
  resetLabel: string;
  playing: boolean;
  autoPlaying: boolean;
  atStart: boolean;
  atEnd: boolean;
  onPlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}) {
  return (
    <View style={styles.playbackGrid}>
      <PlaybackButton label={playLabel} icon={autoPlaying ? "pause-circle" : "play-circle-outline"} active={playing} onPress={onPlay} />
      <PlaybackButton label={nextLabel} icon="play-skip-forward-outline" disabled={atEnd} onPress={onNext} />
      <PlaybackButton label={previousLabel} icon="play-skip-back-outline" disabled={atStart} onPress={onPrevious} />
      <PlaybackButton label={resetLabel} icon="refresh-outline" onPress={onReset} />
    </View>
  );
}

function PlaybackButton({ label, icon, active = false, disabled = false, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; active?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active, disabled }} style={({ pressed }) => [styles.playbackButton, active && styles.playbackButtonActive, disabled && styles.playbackButtonDisabled, pressed && !disabled && styles.pressed]}>
      <Ionicons name={icon} size={17} color={active ? colors.white : colors.ink} />
      <Text style={[styles.playbackButtonText, active && styles.playbackButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function nativeStageModelForBlock(block: NativeStageBlock) {
  const component = block.renderer.component;
  const visualSteps = nativeStepsForComponent(component, block);
  const dataFeedback = "data" in block && Array.isArray(block.data.feedback)
    ? block.data.feedback.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const dataInvariant = "data" in block && typeof block.data.invariant === "string" && block.data.invariant.trim().length > 0
    ? block.data.invariant
    : undefined;

  return {
    kicker: `${block.renderer.family} ${block.kind}`,
    prompt: "prompt" in block ? block.prompt : "task" in block ? block.task : block.successCriteria,
    steps: visualSteps,
    feedback: dataFeedback.length >= visualSteps.length ? dataFeedback : nativeFeedbackForComponent(component, visualSteps),
    invariant: "successCriteria" in block ? block.successCriteria : dataInvariant ?? block.renderer.fallback
  };
}

function nativeStepsForComponent(component: string, block: NativeStageBlock) {
  if (block.kind === "diagram" && Array.isArray(block.data.nodes)) {
    return block.data.nodes.filter((node): node is string => typeof node === "string").slice(0, 4);
  }
  if (component.includes("linked-list")) return ["save", "new", "rewire", "reachable"];
  if (component.includes("hash") || component.includes("bucket")) return ["insert", "pressure", "resize", "balanced"];
  if (component.includes("frontier")) return ["start", "frontier", "visit", "seen"];
  if (component.includes("dp-grid")) return ["base", "row", "wave", "answer"];
  if (component.includes("sorting")) return ["compare", "swap", "sorted", "verify"];
  if (component.includes("tree")) return ["before", "promote", "reattach", "ordered"];
  if (component.includes("binary-search") || component.includes("sliding-window")) return ["window", "compare", "discard", "target"];
  return ["input", "operation", "state", "output"];
}

function nativeFeedbackForComponent(component: string, steps: string[]) {
  if (component.includes("hash")) {
    return [
      "Insert a key and predict which bucket receives it.",
      "Collision pressure appears when keys crowd one bucket.",
      "Resize spreads the same keys across more buckets.",
      "Lookup stays reliable because the bucket contract survives."
    ];
  }
  if (component.includes("frontier")) {
    return ["Start from one node.", "Frontier discipline controls order.", "Visit neighbors without guessing.", "Mark seen nodes once."];
  }
  if (component.includes("linked-list")) {
    return ["Keep current reachable.", "Create the new node safely.", "Rewire next pointers in order.", "Every node remains reachable from head."];
  }
  if (component.includes("dp-grid")) {
    return ["Base cases are known.", "Early rows unlock later cells.", "The fill wave only touches ready cells.", "The answer reuses solved neighbors."];
  }
  if (component.includes("tree")) {
    return ["Read the before shape.", "Promote one child.", "Reattach the middle subtree.", "Sorted order is preserved."];
  }
  if (component.includes("binary-search") || component.includes("sliding-window")) {
    return ["Start with the full window.", "Compare the boundary or middle.", "Discard only impossible values.", "The target remains inside the window."];
  }
  return steps.map((label, index) => {
    if (index === 1) return "The operation changes the state while the invariant stays visible.";
    return `Stage ${index + 1}: ${label}. Predict the next state before advancing.`;
  });
}

function shortStageLabel(label: string) {
  return label.length > 9 ? label.slice(0, 9) : label;
}

function IconButton({ name, label, active = false, onPress }: { name: keyof typeof Ionicons.glyphMap; label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.iconButton, active && styles.iconButtonActive, pressed && styles.pressed]}>
      <Ionicons name={name} size={22} color={active ? colors.white : colors.ink} />
    </Pressable>
  );
}

function BottomTabs({ selected, onSelect }: { selected: TabLabel; onSelect: (tab: TabLabel) => void }) {
  const tabs: Array<{ label: TabLabel; icon: keyof typeof Ionicons.glyphMap }> = [
    { label: "Home", icon: "home-outline" },
    { label: "Browse", icon: "compass-outline" },
    { label: "Feed", icon: "school-outline" },
    { label: "Play", icon: "game-controller-outline" },
    { label: "Library", icon: "library-outline" },
    { label: "You", icon: "person-outline" }
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const active = selected === tab.label;
        return (
          <Pressable key={tab.label} onPress={() => onSelect(tab.label)} accessibilityLabel={`${tab.label} tab`} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.tabButton, active && styles.tabActive]}>
            <Ionicons name={tab.icon} size={20} color={active ? colors.white : colors.muted} />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 180
  },
  header: {
    alignItems: "flex-start",
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 26,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 18,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 16
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  eyebrowEmber: {
    color: colors.ember,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  eyebrowViolet: {
    color: colors.violet,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 35,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 38,
    marginTop: 6
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 280
  },
  streakPill: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.teal,
    borderRadius: 999,
    borderWidth: 2,
    flexDirection: "row",
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 12
  },
  streakText: {
    color: colors.ink,
    fontWeight: "800"
  },
  goalPanel: {
    backgroundColor: colors.white,
    borderColor: colors.teal,
    borderRadius: 22,
    borderWidth: 2,
    gap: 10,
    padding: 16
  },
  textInput: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 16,
    borderWidth: 2,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    minHeight: 50,
    paddingHorizontal: 14
  },
  objectiveList: {
    gap: 8
  },
  objectiveButton: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    gap: 4,
    minHeight: 68,
    justifyContent: "center",
    padding: 12
  },
  objectiveButtonActive: {
    backgroundColor: colors.violet
  },
  objectiveTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  objectiveTitleActive: {
    color: colors.white
  },
  objectiveDescription: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  objectiveDescriptionActive: {
    color: colors.white
  },
  objectiveChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  objectiveChip: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  objectiveChipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  progressTrack: {
    backgroundColor: colors.line,
    borderRadius: 999,
    height: 10,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.teal,
    borderRadius: 999,
    height: "100%"
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 26,
    borderWidth: 2,
    gap: 12,
    padding: 16,
    shadowColor: colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 14
  },
  emberCard: {
    borderColor: colors.ember
  },
  violetCard: {
    borderColor: colors.violet
  },
  tealCard: {
    borderColor: colors.teal
  },
  iconRow: {
    flexDirection: "row",
    gap: 8
  },
  feedQueue: {
    gap: 8
  },
  feedQueueButton: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  feedQueueButtonActive: {
    backgroundColor: "#ffe0d8",
    borderColor: colors.ember
  },
  feedQueueText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  feedQueueTextActive: {
    color: colors.ember
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 2,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  iconButtonActive: {
    backgroundColor: colors.teal
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 31
  },
  visual: {
    alignItems: "center",
    backgroundColor: colors.paperDeep,
    borderColor: colors.ink,
    borderRadius: 20,
    borderWidth: 2,
    minHeight: 220,
    justifyContent: "center",
    overflow: "hidden",
    padding: 16
  },
  binaryRow: {
    flexDirection: "row",
    gap: 7
  },
  numberCell: {
    alignItems: "center",
    backgroundColor: "#d8f4ee",
    borderColor: colors.ink,
    borderRadius: 10,
    borderWidth: 2,
    height: 40,
    justifyContent: "center",
    width: 38
  },
  numberCellActive: {
    backgroundColor: colors.ember
  },
  numberText: {
    color: colors.ink,
    fontWeight: "800"
  },
  splitLine: {
    backgroundColor: colors.ember,
    borderRadius: 99,
    height: 110,
    marginTop: -74,
    opacity: 0.78,
    width: 5
  },
  visualCaption: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12
  },
  audioRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  audioTrack: {
    backgroundColor: colors.line,
    borderRadius: 999,
    flex: 1,
    height: 10,
    overflow: "hidden"
  },
  audioFill: {
    backgroundColor: colors.ember,
    borderRadius: 999,
    height: "100%",
    width: "72%"
  },
  prompt: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  syncText: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: "800"
  },
  actionStatus: {
    color: colors.ember,
    fontSize: 13,
    fontWeight: "800"
  },
  successStatus: {
    color: colors.teal
  },
  quizBox: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 20,
    borderWidth: 2,
    gap: 10,
    padding: 12
  },
  quizLabel: {
    alignSelf: "flex-start",
    borderColor: colors.ember,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.ember,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  quizQuestion: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  answerButton: {
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  answerButtonSelected: {
    backgroundColor: "#ffe0d8",
    borderColor: colors.ember
  },
  answerText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: colors.teal,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800"
  },
  disabledAction: {
    opacity: 0.5
  },
  feedback: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 2,
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    padding: 12
  },
  feedbackCorrect: {
    backgroundColor: "#eee7ff",
    borderColor: colors.violet,
    color: colors.violet
  },
  moduleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  moduleDot: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  moduleDone: {
    backgroundColor: colors.violet
  },
  innerDot: {
    backgroundColor: colors.line,
    borderRadius: 999,
    height: 12,
    width: 12
  },
  modulePanel: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    padding: 12
  },
  moduleCurrent: {
    backgroundColor: "#eee7ff",
    borderColor: colors.violet
  },
  moduleTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  questRow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12
  },
  savedLessonButton: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    gap: 4,
    minHeight: 68,
    justifyContent: "center",
    padding: 12
  },
  savedLessonTopic: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  barsBox: {
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    height: 230,
    justifyContent: "center",
    padding: 14
  },
  bar: {
    borderColor: colors.ink,
    borderRadius: 14,
    borderWidth: 2,
    minHeight: 48,
    width: 44
  },
  treePracticeBox: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 20,
    borderWidth: 2,
    gap: 16,
    minHeight: 230,
    justifyContent: "center",
    padding: 16
  },
  treeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  },
  treeRowWide: {
    justifyContent: "space-around"
  },
  treeRowRight: {
    gap: 34,
    justifyContent: "flex-end",
    paddingRight: 24
  },
  treeNodeButton: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 2,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  treeNodeButtonSelected: {
    backgroundColor: colors.violet
  },
  treeNodeText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  treeNodeTextSelected: {
    color: colors.white
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  metricPill: {
    backgroundColor: colors.white,
    borderColor: colors.teal,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  metricText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  rendererRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  rendererChip: {
    backgroundColor: colors.paperDeep,
    borderColor: colors.ink,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  rendererText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  courseProgressPanel: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    gap: 8,
    padding: 12
  },
  lessonSelector: {
    gap: 8
  },
  lessonButton: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  lessonButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.ink
  },
  lessonButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  lessonButtonTextActive: {
    color: colors.white
  },
  nativeLessonPanel: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 22,
    borderWidth: 2,
    gap: 12,
    padding: 14
  },
  outcomeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  outcomePill: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  outcomeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  lessonGuidePanel: {
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    gap: 10,
    padding: 12
  },
  lessonGuideHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  guideGrid: {
    gap: 8
  },
  guideCell: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  guideLabel: {
    color: colors.teal,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  guideText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  explainBackText: {
    backgroundColor: "#eee7ff",
    borderColor: colors.violet,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.violet,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    padding: 10
  },
  microBlock: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12
  },
  microKind: {
    color: colors.violet,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  microTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  codeSnippet: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 14,
    borderWidth: 2,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
    padding: 10
  },
  traceList: {
    gap: 6
  },
  tracePoint: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    padding: 9
  },
  tracePointActive: {
    backgroundColor: "#eee7ff",
    borderColor: colors.violet,
    color: colors.violet
  },
  nativeStageSurface: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    minHeight: 148,
    justifyContent: "center",
    overflow: "hidden",
    padding: 12
  },
  nativeStageRail: {
    backgroundColor: colors.line,
    borderRadius: 999,
    height: 5,
    left: 26,
    position: "absolute",
    right: 26,
    top: 65
  },
  nativeStageRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center"
  },
  nativeStageNode: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 2,
    height: 54,
    justifyContent: "center",
    width: 64
  },
  nativeStageNodeActive: {
    backgroundColor: colors.teal
  },
  nativeStageNodeText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "800"
  },
  nativeStageNodeTextActive: {
    color: colors.white
  },
  stageCountPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  stageChipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  stageChip: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  stageChipActive: {
    backgroundColor: colors.ember,
    borderColor: colors.ink
  },
  stageChipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  stageChipTextActive: {
    color: colors.white
  },
  playbackGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  playbackButton: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 6,
    minHeight: 48,
    minWidth: "47%",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  playbackButtonActive: {
    backgroundColor: colors.ember
  },
  playbackButtonDisabled: {
    opacity: 0.42
  },
  playbackButtonText: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  playbackButtonTextActive: {
    color: colors.white
  },
  nativeBinaryWindow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    gap: 10,
    minHeight: 132,
    justifyContent: "center",
    padding: 12
  },
  numberCellFound: {
    backgroundColor: colors.teal
  },
  nativeGrid: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    padding: 12
  },
  gridCell: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 10,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    width: 44
  },
  gridCellFilled: {
    backgroundColor: colors.teal
  },
  gridCellText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  gridCellTextFilled: {
    color: colors.white
  },
  rotationSurface: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderRadius: 18,
    borderWidth: 2,
    height: 200,
    justifyContent: "center",
    overflow: "hidden"
  },
  rotationGroup: {
    height: 150,
    position: "relative",
    width: 210
  },
  treeNode: {
    backgroundColor: colors.violet,
    borderColor: colors.ink,
    borderRadius: 999,
    borderWidth: 2,
    height: 42,
    position: "absolute",
    width: 42
  },
  treeNodeRoot: {
    left: 84,
    top: 6
  },
  treeNodeLeft: {
    backgroundColor: colors.ember,
    left: 32,
    top: 72
  },
  treeNodeRight: {
    backgroundColor: colors.teal,
    left: 136,
    top: 72
  },
  treeNodeLeaf: {
    backgroundColor: colors.paperDeep,
    left: 116,
    top: 108
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  compactAction: {
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  },
  tabs: {
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderRadius: 24,
    borderWidth: 2,
    bottom: 12,
    flexDirection: "row",
    gap: 4,
    left: 12,
    padding: 7,
    position: "absolute",
    right: 12
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 18,
    flex: 1,
    minHeight: 58,
    justifyContent: "center"
  },
  tabActive: {
    backgroundColor: colors.teal
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3
  },
  tabTextActive: {
    color: colors.white
  }
});

export default MobileApp;
