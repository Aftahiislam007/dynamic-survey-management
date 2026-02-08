export interface Field {
  id: number;
  surveyId: number;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export enum FieldType {
  TEXT = 'TEXT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SELECT = 'SELECT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER'
}

export interface CreateFieldDto {
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
}

export interface UpdateFieldDto {
  label?: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  order?: number;
}