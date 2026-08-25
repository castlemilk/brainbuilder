package catalog_test

import (
	"context"
	"testing"

	"github.com/benebsworth/brainbuilder/backend/internal/catalog"
)

func TestServiceLearningHomeIncludesCoreSurfaces(t *testing.T) {
	t.Parallel()

	svc := catalog.NewService()
	home, err := svc.LearningHome(context.Background(), "alex")
	if err != nil {
		t.Fatalf("LearningHome returned error: %v", err)
	}

	if home.User.Name != "Alex" {
		t.Fatalf("user name = %q, want Alex", home.User.Name)
	}
	if len(home.Feed) < 2 {
		t.Fatalf("feed length = %d, want at least 2", len(home.Feed))
	}
	if len(home.Quizzes) < len(home.Feed) {
		t.Fatalf("quiz length = %d, want at least one contextual quiz for each feed bite", len(home.Quizzes))
	}
	if !home.HasPathModule("algorithms-101", "sorting") {
		t.Fatalf("expected algorithms path to include sorting module")
	}
	if !home.HasPlayground("sorting", "swap-bars") {
		t.Fatalf("expected sorting swap-bars playground")
	}
}

func TestServiceScoresQuizAnswers(t *testing.T) {
	t.Parallel()

	svc := catalog.NewService()

	got, err := svc.AnswerQuiz(context.Background(), "binary-search-sorted", "binary-search")
	if err != nil {
		t.Fatalf("AnswerQuiz returned error: %v", err)
	}
	if !got.Correct || got.XPAwarded != 10 || !got.StreakSafe {
		t.Fatalf("correct answer = %+v, want correct with 10 XP and safe streak", got)
	}

	got, err = svc.AnswerQuiz(context.Background(), "binary-search-sorted", "linear-scan")
	if err != nil {
		t.Fatalf("AnswerQuiz returned error: %v", err)
	}
	if got.Correct || got.XPAwarded != 0 || got.StreakSafe {
		t.Fatalf("wrong answer = %+v, want incorrect with no XP and unsafe streak", got)
	}

	got, err = svc.AnswerQuiz(context.Background(), "tree-height-choice", "tree-height")
	if err != nil {
		t.Fatalf("AnswerQuiz tree question returned error: %v", err)
	}
	if !got.Correct || got.XPAwarded != 8 || !got.StreakSafe {
		t.Fatalf("tree answer = %+v, want correct with 8 XP and safe streak", got)
	}
}
