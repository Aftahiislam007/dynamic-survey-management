import { Field } from "./field";

export interface Survey {
  id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  fields: Field[];
  submissionsCount: number;
}

export enum SurveyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface CreateSurveyDto {
  title: string;
  description?: string;
  status?: SurveyStatus;
}

export interface UpdateSurveyDto {
  title?: string;
  description?: string;
  status?: SurveyStatus;
}

export interface SurveyListResponse {
  data: Survey[];
  total: number;
  page: number;
  limit: number;
}