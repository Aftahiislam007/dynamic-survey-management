import { apiClient } from './client';
import { Survey, CreateSurveyDto, UpdateSurveyDto, SurveyListResponse, SurveyStatus } from '@/types/survey';
import { PaginationParams } from '@/types/api';

export const surveyService = {
  async create(data: CreateSurveyDto): Promise<Survey> {
    const response = await apiClient.post<Survey>('/surveys', data);
    return response.data.data;
  },

  async getAll(params?: PaginationParams): Promise<SurveyListResponse> {
    const response = await apiClient.get<SurveyListResponse>('/surveys', { params });
    return response.data;
  },

  async getActive(): Promise<Survey[]> {
    const response = await apiClient.get('/surveys/get-active');
    return response.data.data;
  },

  async getById(id: number): Promise<Survey> {
    const response = await apiClient.get<Survey>(`/surveys/${id}`);
    return response.data.data;
  },

  async getByStatus(status: SurveyStatus): Promise<Survey[]> {
    const response = await apiClient.get(`/surveys/status/${status}`);
    return response.data.data;
  },

  async update(id: number, data: UpdateSurveyDto): Promise<Survey> {
    const response = await apiClient.put<Survey>(`/surveys/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: number, status: SurveyStatus): Promise<Survey> {
    const response = await apiClient.patch<Survey>(`/surveys/update-status/${id}`, { status });
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/surveys/${id}`);
  },
};