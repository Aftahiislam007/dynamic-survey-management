export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    OFFICER_LOGIN: '/auth/officer-login',
    REGISTER: '/auth/admin-registration',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh',
  },
  SURVEYS: {
    BASE: '/surveys',
    ACTIVE: '/surveys/get-active',
    STATUS: '/surveys/status',
  },
  FIELDS: {
    BASE: '/fields',
  },
  SUBMISSIONS: {
    BASE: '/submissions',
  },
  USERS: {
    BASE: '/user',
    OFFICERS: '/user/get-officers',
  },
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refresh_token',
};

export const ROUTES = {
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SURVEYS: '/admin/surveys',
    CREATE_SURVEY: '/admin/surveys/create',
    EDIT_SURVEY: '/admin/surveys/[id]',
    SUBMISSIONS: '/admin/submissions',
  },
  OFFICER: {
    DASHBOARD: '/officer/dashboard',
    SURVEYS: '/officer/surveys',
    SUBMIT_SURVEY: '/officer/surveys/[id]',
  },
  AUTH: {
    LOGIN: '/login',
  },
};

export const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text Input' },
  { value: 'TEXTAREA', label: 'Text Area' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'RADIO', label: 'Radio Button' },
  { value: 'SELECT', label: 'Select Dropdown' },
];

export const SURVEY_STATUS = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'INACTIVE', label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-red-100 text-red-800' },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};