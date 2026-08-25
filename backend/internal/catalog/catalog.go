package catalog

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

var ErrQuizNotFound = errors.New("quiz not found")

type Service struct{}

type Learner struct {
	ID        string
	Name      string
	Level     int
	Archetype string
}

type Stats struct {
	StreakDays      int
	BestStreakDays  int
	XP              int
	DailyGoalDone   int
	DailyGoalTarget int
	Hearts          int
}

type Topic struct {
	ID       string
	Label    string
	Selected bool
}

type FeedBite struct {
	ID              string
	Topic           string
	Title           string
	Prompt          string
	DurationSeconds int
	Modes           []string
	Saved           bool
}

type Quiz struct {
	ID              string
	Question        string
	Options         []QuizOption
	CorrectOptionID string
	Feedback        string
}

type QuizOption struct {
	ID    string
	Label string
}

type Path struct {
	ID       string
	Title    string
	Subtitle string
	Accent   string
	Progress float32
	Modules  []Module
}

type Module struct {
	ID       string
	Title    string
	Status   string
	Progress float32
}

type Playground struct {
	ID          string
	Title       string
	Concept     string
	Interaction string
	Description string
	XPReward    int
}

type Quest struct {
	ID        string
	Label     string
	Completed int
	Target    int
}

type LeagueEntry struct {
	Rank int
	Name string
	XP   int
	Self bool
}

type LearningHome struct {
	User        Learner
	Stats       Stats
	Topics      []Topic
	Feed        []FeedBite
	Quizzes     []Quiz
	Paths       []Path
	Playgrounds []Playground
	Quests      []Quest
	League      []LeagueEntry
}

type QuizResult struct {
	Correct    bool
	XPAwarded  int
	Feedback   string
	StreakSafe bool
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) LearningHome(ctx context.Context, userID string) (LearningHome, error) {
	if err := ctx.Err(); err != nil {
		return LearningHome{}, fmt.Errorf("build learning home: %w", err)
	}

	name := "Curious learner"
	if strings.EqualFold(strings.TrimSpace(userID), "alex") {
		name = "Alex"
	}

	return LearningHome{
		User: Learner{
			ID:        userID,
			Name:      name,
			Level:     7,
			Archetype: "Curious mind",
		},
		Stats: Stats{
			StreakDays:      12,
			BestStreakDays:  21,
			XP:              1240,
			DailyGoalDone:   3,
			DailyGoalTarget: 5,
			Hearts:          5,
		},
		Topics: []Topic{
			{ID: "algorithms", Label: "Algorithms", Selected: true},
			{ID: "space", Label: "Space"},
			{ID: "finance", Label: "Finance", Selected: true},
			{ID: "design", Label: "Design"},
			{ID: "history", Label: "History"},
			{ID: "biology", Label: "Biology", Selected: true},
		},
		Feed: []FeedBite{
			{
				ID:              "binary-search-bite",
				Topic:           "Algorithms",
				Title:           "Why binary search is O(log n)",
				Prompt:          "Picture the split: each answer cuts the remaining search space in half.",
				DurationSeconds: 30,
				Modes:           []string{"audio", "text", "visual"},
				Saved:           true,
			},
			{
				ID:              "trees-bite",
				Topic:           "Data Structures",
				Title:           "Binary trees in one commute stop",
				Prompt:          "Tap each node to hear why tree height controls the search path.",
				DurationSeconds: 72,
				Modes:           []string{"audio", "visual", "interactive"},
			},
		},
		Quizzes: []Quiz{binarySearchQuiz(), treeHeightQuiz()},
		Paths: []Path{
			{
				ID:       "algorithms-101",
				Title:    "Algorithms 101",
				Subtitle: "18 levels · beginner-friendly",
				Accent:   "violet",
				Progress: 0.4,
				Modules: []Module{
					{ID: "big-o", Title: "Big-O basics", Status: "complete", Progress: 1},
					{ID: "searching", Title: "Searching", Status: "complete", Progress: 1},
					{ID: "sorting", Title: "Sorting", Status: "current", Progress: 0.35},
					{ID: "recursion", Title: "Recursion", Status: "locked"},
				},
			},
			{
				ID:       "data-structures",
				Title:    "Data Structures",
				Subtitle: "8 modules · 3.5 hours · curated",
				Accent:   "teal",
				Progress: 0.55,
				Modules: []Module{
					{ID: "arrays", Title: "Arrays", Status: "complete", Progress: 1},
					{ID: "linked-lists", Title: "Linked lists", Status: "complete", Progress: 1},
					{ID: "trees", Title: "Trees", Status: "current", Progress: 0.6},
					{ID: "graphs", Title: "Graphs", Status: "locked"},
					{ID: "hashing", Title: "Hashing", Status: "locked"},
				},
			},
		},
		Playgrounds: []Playground{
			{
				ID:          "bubble-sort-lab",
				Title:       "Sort it: bubble sort",
				Concept:     "sorting",
				Interaction: "swap-bars",
				Description: "Drag or tap two bars, compare them, and watch the sequence settle.",
				XPReward:    15,
			},
			{
				ID:          "tree-height-lab",
				Title:       "Trace tree height",
				Concept:     "trees",
				Interaction: "trace-tree",
				Description: "Follow a search path through a tree and feel why height matters.",
				XPReward:    12,
			},
		},
		Quests: []Quest{
			{ID: "daily-lessons", Label: "Finish 3 lessons", Completed: 2, Target: 3},
			{ID: "quiz-check", Label: "Keep your quiz streak alive", Completed: 1, Target: 1},
		},
		League: []LeagueEntry{
			{Rank: 1, Name: "Sam", XP: 920},
			{Rank: 2, Name: "Priya", XP: 880},
			{Rank: 3, Name: "You", XP: 815, Self: true},
			{Rank: 4, Name: "Leo", XP: 790},
			{Rank: 5, Name: "Mei", XP: 760},
		},
	}, nil
}

func (s *Service) AnswerQuiz(ctx context.Context, quizID string, selectedOptionID string) (QuizResult, error) {
	if err := ctx.Err(); err != nil {
		return QuizResult{}, fmt.Errorf("answer quiz: %w", err)
	}
	quiz, ok := quizByID(quizID)
	if !ok {
		return QuizResult{}, fmt.Errorf("%s: %w", quizID, ErrQuizNotFound)
	}

	correct := selectedOptionID == quiz.CorrectOptionID
	if !correct {
		return QuizResult{
			Correct:    false,
			XPAwarded:  0,
			Feedback:   incorrectFeedbackForQuiz(quizID),
			StreakSafe: false,
		}, nil
	}

	return QuizResult{
		Correct:    true,
		XPAwarded:  xpForQuiz(quizID),
		Feedback:   quiz.Feedback,
		StreakSafe: true,
	}, nil
}

func (h LearningHome) HasPathModule(pathID string, moduleID string) bool {
	for _, path := range h.Paths {
		if path.ID != pathID {
			continue
		}
		for _, module := range path.Modules {
			if module.ID == moduleID {
				return true
			}
		}
	}
	return false
}

func (h LearningHome) HasPlayground(concept string, interaction string) bool {
	for _, playground := range h.Playgrounds {
		if playground.Concept == concept && playground.Interaction == interaction {
			return true
		}
	}
	return false
}

func binarySearchQuiz() Quiz {
	return Quiz{
		ID:       "binary-search-sorted",
		Question: "Which is faster on sorted data?",
		Options: []QuizOption{
			{ID: "binary-search", Label: "Binary search"},
			{ID: "linear-scan", Label: "Linear scan"},
		},
		CorrectOptionID: "binary-search",
		Feedback:        "Binary search wins on sorted data because it halves the search space each step.",
	}
}

func treeHeightQuiz() Quiz {
	return Quiz{
		ID:       "tree-height-choice",
		Question: "What controls the longest tree search path?",
		Options: []QuizOption{
			{ID: "tree-height", Label: "Tree height"},
			{ID: "leaf-color", Label: "Leaf color"},
			{ID: "node-labels", Label: "The exact node labels"},
		},
		CorrectOptionID: "tree-height",
		Feedback:        "Tree height controls the longest root-to-leaf search path, so balanced trees keep lookups short.",
	}
}

func quizByID(quizID string) (Quiz, bool) {
	for _, quiz := range []Quiz{binarySearchQuiz(), treeHeightQuiz()} {
		if quiz.ID == quizID {
			return quiz, true
		}
	}
	return Quiz{}, false
}

func xpForQuiz(quizID string) int {
	if quizID == treeHeightQuiz().ID {
		return 8
	}
	return 10
}

func incorrectFeedbackForQuiz(quizID string) string {
	if quizID == treeHeightQuiz().ID {
		return "Not yet. Count the longest root-to-leaf path; that height is what bounds tree search work."
	}
	return "Linear scan checks items one by one. On sorted data, binary search can skip half the list after every comparison."
}
