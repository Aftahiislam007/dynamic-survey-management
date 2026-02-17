# Dynamic Survey Management System - Project Features

## Admin Features

- **Login**  
  Secure JWT-based authentication (username + password).  
  Default seeded admin: `admin` / `admin123`

- **Create a new survey**  
  - Set title (required) and description (optional)  
  - Survey is immediately available to Officers after creation

- **Manage survey fields dynamically**  
  - Add multiple fields to any survey  
  - Supported types: Text input, Checkbox, Radio button, Select dropdown  
  - Each field supports: label, required/optional flag, configurable options (for checkbox/radio/select)  
  - Full CRUD: Add, Edit, Delete fields  
  - Field validation rules (minLength, maxLength, pattern, min/max selections)

- **View list of all surveys**  
  - Paginated list with title, description, creation date, number of fields

- **View submissions for any survey**  
  - Paginated list of all submissions  
  - Detailed view of each submission showing:  
    - Submitter (Officer username)  
    - Submission timestamp  
    - All field labels + submitted values (text, selected options, checkbox arrays)  
  - Clean tabular display with proper formatting

## Officer Features

- **Login**  
  Secure JWT authentication.  
  Default seeded officer: `officer` / `officer123`

- **View available surveys**  
  - See list of all active surveys created by Admins  
  - Display: title, description, number of fields

- **Fill and submit a survey**  
  - Dynamic form rendering based on survey fields  
  - Fields rendered correctly according to type:  
    - Text → input  
    - Checkbox → multiple checkboxes  
    - Radio → radio group  
    - Select → dropdown  
  - Required fields enforced  
  - Real-time client-side validation (min/max length, pattern, min/max selections)  
  - Server-side re-validation for security  
  - Successful submission redirects back to survey list

## General / Shared Features

- **Role-Based Access Control (RBAC)**  
  - Admins can access admin panel only  
  - Officers can access officer panel only  
  - Unauthorized access returns 403 Forbidden

- **API Security**  
  - All endpoints (except login) protected by JWT  
  - Role checks via custom `@Roles()` decorator and `RolesGuard`

- **Pagination**  
  - Applied to survey list and submissions list (query params: `page` & `limit`)

- **API Documentation**  
  - Interactive Swagger UI available at `/api-docs`

- **Dynamic Form Handling**  
  - Fields fetched from API and rendered dynamically  
  - Validation rules applied both client-side (Yup) and server-side

- **Docker Support**  
  - Full containerized setup with PostgreSQL, backend, and frontend  
  - `docker compose up --build` launches everything
