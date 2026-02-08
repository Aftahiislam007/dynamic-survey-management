import { User } from "./auth";
import { Survey } from "./survey";

export interface Submission {
  id: number;
  surveyId: number;
  submittedBy: number;
  answers: Record<string, any>;
  submittedAt: string;
  user?: User;
  survey?: Survey;
}

export interface CreateSubmissionDto {
  answers: Record<string, any>;
}

export interface SubmissionListResponse {
  data: Submission[];
  total: number;
  page: number;
  limit: number;
}