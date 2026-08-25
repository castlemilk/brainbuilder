package httpapi

import (
	"context"
	"errors"
	"net/http"

	"connectrpc.com/connect"
	learningv1 "github.com/benebsworth/brainbuilder/backend/gen/learning/v1"
	"github.com/benebsworth/brainbuilder/backend/gen/learning/v1/learningv1connect"
	"github.com/benebsworth/brainbuilder/backend/internal/catalog"
)

const readMaxBytes = 1 << 20

type catalogService interface {
	LearningHome(ctx context.Context, userID string) (catalog.LearningHome, error)
	AnswerQuiz(ctx context.Context, quizID string, selectedOptionID string) (catalog.QuizResult, error)
}

type learningHandler struct {
	catalog catalogService
}

func NewHandler(catalogSvc catalogService) http.Handler {
	mux := http.NewServeMux()
	path, handler := learningv1connect.NewLearningServiceHandler(
		&learningHandler{catalog: catalogSvc},
		connect.WithReadMaxBytes(readMaxBytes),
	)
	mux.Handle(path, handler)
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if _, err := w.Write([]byte(`{"ok":true}`)); err != nil {
			return
		}
	})
	return withCORS(mux)
}

func (h *learningHandler) GetLearningHome(ctx context.Context, req *connect.Request[learningv1.GetLearningHomeRequest]) (*connect.Response[learningv1.LearningHome], error) {
	home, err := h.catalog.LearningHome(ctx, req.Msg.GetUserId())
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(toProtoHome(home)), nil
}

func (h *learningHandler) AnswerQuiz(ctx context.Context, req *connect.Request[learningv1.AnswerQuizRequest]) (*connect.Response[learningv1.AnswerQuizResponse], error) {
	result, err := h.catalog.AnswerQuiz(ctx, req.Msg.GetQuizId(), req.Msg.GetSelectedOptionId())
	if err != nil {
		if errors.Is(err, catalog.ErrQuizNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&learningv1.AnswerQuizResponse{
		Correct:    result.Correct,
		XpAwarded:  int32(result.XPAwarded),
		Feedback:   result.Feedback,
		StreakSafe: result.StreakSafe,
	}), nil
}

func toProtoHome(home catalog.LearningHome) *learningv1.LearningHome {
	return &learningv1.LearningHome{
		User:        toProtoLearner(home.User),
		Stats:       toProtoStats(home.Stats),
		Topics:      mapSlice(home.Topics, toProtoTopic),
		Feed:        mapSlice(home.Feed, toProtoFeedBite),
		Quizzes:     mapSlice(home.Quizzes, toProtoQuiz),
		Paths:       mapSlice(home.Paths, toProtoPath),
		Playgrounds: mapSlice(home.Playgrounds, toProtoPlayground),
		Quests:      mapSlice(home.Quests, toProtoQuest),
		League:      mapSlice(home.League, toProtoLeagueEntry),
	}
}

func toProtoLearner(user catalog.Learner) *learningv1.Learner {
	return &learningv1.Learner{
		Id:        user.ID,
		Name:      user.Name,
		Level:     int32(user.Level),
		Archetype: user.Archetype,
	}
}

func toProtoStats(stats catalog.Stats) *learningv1.LearnerStats {
	return &learningv1.LearnerStats{
		StreakDays:         int32(stats.StreakDays),
		BestStreakDays:     int32(stats.BestStreakDays),
		Xp:                 int32(stats.XP),
		DailyGoalCompleted: int32(stats.DailyGoalDone),
		DailyGoalTarget:    int32(stats.DailyGoalTarget),
		Hearts:             int32(stats.Hearts),
	}
}

func toProtoTopic(topic catalog.Topic) *learningv1.Topic {
	return &learningv1.Topic{
		Id:       topic.ID,
		Label:    topic.Label,
		Selected: topic.Selected,
	}
}

func toProtoFeedBite(bite catalog.FeedBite) *learningv1.FeedBite {
	return &learningv1.FeedBite{
		Id:              bite.ID,
		Topic:           bite.Topic,
		Title:           bite.Title,
		Prompt:          bite.Prompt,
		DurationSeconds: int32(bite.DurationSeconds),
		Modes:           append([]string(nil), bite.Modes...),
		Saved:           bite.Saved,
	}
}

func toProtoQuiz(quiz catalog.Quiz) *learningv1.Quiz {
	return &learningv1.Quiz{
		Id:              quiz.ID,
		Question:        quiz.Question,
		Options:         mapSlice(quiz.Options, toProtoQuizOption),
		CorrectOptionId: quiz.CorrectOptionID,
		Feedback:        quiz.Feedback,
	}
}

func toProtoQuizOption(option catalog.QuizOption) *learningv1.QuizOption {
	return &learningv1.QuizOption{
		Id:    option.ID,
		Label: option.Label,
	}
}

func toProtoPath(path catalog.Path) *learningv1.LearningPath {
	return &learningv1.LearningPath{
		Id:       path.ID,
		Title:    path.Title,
		Subtitle: path.Subtitle,
		Accent:   path.Accent,
		Progress: path.Progress,
		Modules:  mapSlice(path.Modules, toProtoModule),
	}
}

func toProtoModule(module catalog.Module) *learningv1.PathModule {
	return &learningv1.PathModule{
		Id:       module.ID,
		Title:    module.Title,
		Status:   module.Status,
		Progress: module.Progress,
	}
}

func toProtoPlayground(playground catalog.Playground) *learningv1.Playground {
	return &learningv1.Playground{
		Id:          playground.ID,
		Title:       playground.Title,
		Concept:     playground.Concept,
		Interaction: playground.Interaction,
		Description: playground.Description,
		XpReward:    int32(playground.XPReward),
	}
}

func toProtoQuest(quest catalog.Quest) *learningv1.Quest {
	return &learningv1.Quest{
		Id:        quest.ID,
		Label:     quest.Label,
		Completed: int32(quest.Completed),
		Target:    int32(quest.Target),
	}
}

func toProtoLeagueEntry(entry catalog.LeagueEntry) *learningv1.LeagueEntry {
	return &learningv1.LeagueEntry{
		Rank: int32(entry.Rank),
		Name: entry.Name,
		Xp:   int32(entry.XP),
		Self: entry.Self,
	}
}

func mapSlice[S any, T any](items []S, mapItem func(S) T) []T {
	out := make([]T, 0, len(items))
	for _, item := range items {
		out = append(out, mapItem(item))
	}
	return out
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
