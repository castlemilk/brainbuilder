package httpapi_test

import (
	"context"
	"net/http/httptest"
	"testing"

	"connectrpc.com/connect"
	"github.com/benebsworth/brainbuilder/backend/gen/learning/v1"
	"github.com/benebsworth/brainbuilder/backend/gen/learning/v1/learningv1connect"
	"github.com/benebsworth/brainbuilder/backend/internal/catalog"
	"github.com/benebsworth/brainbuilder/backend/internal/httpapi"
)

func TestLearningServiceConnectRoundTrip(t *testing.T) {
	t.Parallel()

	handler := httpapi.NewHandler(catalog.NewService())
	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)

	client := learningv1connect.NewLearningServiceClient(server.Client(), server.URL)
	home, err := client.GetLearningHome(context.Background(), connect.NewRequest(&learningv1.GetLearningHomeRequest{
		UserId: "alex",
	}))
	if err != nil {
		t.Fatalf("GetLearningHome returned error: %v", err)
	}
	if home.Msg.GetUser().GetName() != "Alex" {
		t.Fatalf("user name = %q, want Alex", home.Msg.GetUser().GetName())
	}
	if got := len(home.Msg.GetFeed()); got < 2 {
		t.Fatalf("feed length = %d, want at least 2", got)
	}
	if got := len(home.Msg.GetQuizzes()); got < len(home.Msg.GetFeed()) {
		t.Fatalf("quiz length = %d, want at least one quiz per feed bite", got)
	}

	answer, err := client.AnswerQuiz(context.Background(), connect.NewRequest(&learningv1.AnswerQuizRequest{
		QuizId:           "binary-search-sorted",
		SelectedOptionId: "binary-search",
	}))
	if err != nil {
		t.Fatalf("AnswerQuiz returned error: %v", err)
	}
	if !answer.Msg.GetCorrect() || answer.Msg.GetXpAwarded() != 10 || !answer.Msg.GetStreakSafe() {
		t.Fatalf("answer = %+v, want correct with 10 XP and safe streak", answer.Msg)
	}

	treeAnswer, err := client.AnswerQuiz(context.Background(), connect.NewRequest(&learningv1.AnswerQuizRequest{
		QuizId:           "tree-height-choice",
		SelectedOptionId: "tree-height",
	}))
	if err != nil {
		t.Fatalf("AnswerQuiz tree question returned error: %v", err)
	}
	if !treeAnswer.Msg.GetCorrect() || treeAnswer.Msg.GetXpAwarded() != 8 || !treeAnswer.Msg.GetStreakSafe() {
		t.Fatalf("tree answer = %+v, want correct with 8 XP and safe streak", treeAnswer.Msg)
	}
}
