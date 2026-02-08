import { apiClient } from './client';
import { Submission, CreateSubmissionDto, SubmissionListResponse } from '@/types/submission';
import { PaginationParams } from '@/types/api';

export const submissionService = {
  async create(surveyId: number, data: CreateSubmissionDto): Promise<Submission> {
    const response = await apiClient.post<Submission>(`/submissions/${surveyId}`, data);
    return response.data.data;
  },

  async getAll(surveyId: number, params?: PaginationParams): Promise<SubmissionListResponse> {
    const response = await apiClient.get<SubmissionListResponse>(`/submissions/${surveyId}`, { params });
    return response.data;
  },

  async getById(id: number): Promise<Submission> {
    const response = await apiClient.get<Submission>(`/submissions/detail/${id}`);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/submissions/delete/${id}`);
  },
};