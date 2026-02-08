import { apiClient } from './client';
import { Field, CreateFieldDto, UpdateFieldDto } from '@/types/field';

export const fieldService = {
  async create(surveyId: string, data: CreateFieldDto): Promise<Field> {
    const response = await apiClient.post<Field>(`/fields/${surveyId}`, data);
    return response.data.data;
  },

  async getAll(surveyId: string): Promise<Field[]> {
    const response = await apiClient.get<Field[]>(`/fields/${surveyId}`);
    return response.data.data;
  },

  async getById(id: number): Promise<Field> {
    const response = await apiClient.get<Field>(`/fields/detail/${id}`);
    return response.data.data;
  },

  async update(id: number, data: UpdateFieldDto): Promise<Field> {
    const response = await apiClient.patch<Field>(`/fields/update/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/fields/delete/${id}`);
  },
};