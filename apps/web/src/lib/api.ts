import { buildLearningHome, scoreQuizAnswer, type LearningHome, type QuizResult } from "@brainbuilder/learning-model";

type FetchLike = typeof fetch;

const learningHomePath = "/brainbuilder.learning.v1.LearningService/GetLearningHome";
const answerQuizPath = "/brainbuilder.learning.v1.LearningService/AnswerQuiz";

export async function fetchLearningHome(apiUrl: string | undefined, userId = "alex", fetcher: FetchLike = fetch): Promise<LearningHome> {
  if (!apiUrl) {
    return buildLearningHome(userId);
  }

  const response = await fetcher(`${apiUrl.replace(/\/$/, "")}${learningHomePath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Connect-Protocol-Version": "1"
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error(`Learning API returned ${response.status}`);
  }

  return (await response.json()) as LearningHome;
}

export async function answerQuiz(apiUrl: string | undefined, quizId: string, selectedOptionId: string, fetcher: FetchLike = fetch): Promise<QuizResult> {
  if (!apiUrl) {
    return scoreQuizAnswer(quizId, selectedOptionId);
  }

  const response = await fetcher(`${apiUrl.replace(/\/$/, "")}${answerQuizPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Connect-Protocol-Version": "1"
    },
    body: JSON.stringify({ quizId, selectedOptionId })
  });

  if (!response.ok) {
    throw new Error(`Quiz API returned ${response.status}`);
  }

  return (await response.json()) as QuizResult;
}
