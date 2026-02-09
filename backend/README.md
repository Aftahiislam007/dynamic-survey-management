# Dynamic Survey Management System - Backend

A robust, production-ready backend API built with NestJS for managing dynamic surveys, custom fields, and user submissions. The system supports role-based access control, JWT authentication, and comprehensive survey management capabilities.

## Table of Contents
- [Project Setup Instructions](#project-setup-instructions)
- [Tech Stack](#tech-stack)
- [Design Decisions](#design-decisions)
- [Assumptions & Limitations](#assumptions--limitations)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## Project Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- PostgreSQL (v15 or higher)
- Redis (optional, for queue management)

### Installation Steps

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   API_URL=http://localhost
   PORT=3001
   API_GLOBAL_PREFIX=api

   # Database Configuration (PostgreSQL)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=dynamicSurvey

   # JWT Configuration
   JWT_ACCESS_SECRET=your_secure_secret_key
   JWT_ACCESS_EXPIRATION=24h
   JWT_REFRESH_SECRET=your_refresh_secret_key
   JWT_REFRESH_EXPIRATION=30d

   # Rate Limiting
   RATE_LIMITER_TIME_TO_LEAVE=6000
   RATE_LIMITER_MAX_TRY=60

   # Email Configuration
   USER_EMAIL=your_email@gmail.com
   EMAIL_APP_PASS=your_app_password

   # Optional: Redis Configuration
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0

   # Pagination
   DEFAULT_PAGE_SIZE=25

   # Authentication
   DISABLE_AUTH=false  # Set to 'true' for development without auth
   ```

3. **Database Setup**
   ```bash
   # Run database migrations (auto-sync is enabled)
   npm run start:dev
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```
   Server will be available at `http://localhost:3001`
   Swagger API Documentation: `http://localhost:3001/docs`

### Available Scripts
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Tech Stack

### Core Framework & Runtime
- **NestJS** (v11.0.1) - Progressive Node.js framework for building efficient, scalable server-side applications
- **Node.js** - JavaScript runtime
- **Express** - HTTP server framework (via @nestjs/platform-express)

### Database & ORM
- **PostgreSQL** (v15) - Relational database
- **TypeORM** (v0.3.28) - ORM for database interactions
  - Automatic schema synchronization
  - Entity-based data modeling
  - Built-in migration support

### Authentication & Authorization
- **JWT** (JSON Web Tokens) - Stateless authentication
  - @nestjs/jwt - JWT implementation
  - @nestjs/passport - Passport.js integration
  - passport-jwt - JWT strategy

### Validation & Transformation
- **class-validator** (v0.14.3) - Decorator-based validation
- **class-transformer** (v0.5.1) - Data transformation and serialization

### API & Documentation
- **Swagger/OpenAPI** (@nestjs/swagger) - Auto-generated API documentation
- **swagger-ui-express** - Interactive API explorer

### Performance & Middleware
- **Compression** (v1.8.1) - HTTP compression middleware
- **Morgan** (v1.10.1) - HTTP request logger
- **Throttler** (@nestjs/throttler) - Rate limiting
- **nestjs-pino** (v4.5.0) - Structured logging

### Security & Utilities
- **bcrypt** (v6.0.0) - Password hashing
- **slugify** (v1.6.6) - URL-friendly slug generation
- **jsonwebtoken** (v9.0.3) - JWT token creation and verification

### Development Tools
- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Design Decisions

### 1. **Modular Architecture**
The application is organized into feature modules for better scalability and maintainability:
- **Auth Module** - Authentication, login, token management
- **Users Module** - User management, roles, permissions
- **Surveys Module** - Survey CRUD, publishing, lifecycle management
- **Fields Module** - Dynamic field management (text, multiple choice, etc.)
- **Submissions Module** - Survey response collection and management

**Rationale**: Separation of concerns allows independent testing, scaling, and team collaboration. Each module has its own controllers, services, DTOs, and entities.

### 2. **JWT-Based Authentication**
- Stateless authentication using Bearer tokens
- Access tokens (24-hour expiration) for API requests
- Refresh tokens (30-day expiration) for token renewal
- Optional bypass mode (`DISABLE_AUTH=true`) for development

**Rationale**: JWT enables scalability across multiple servers without session state. Stateless auth simplifies horizontal scaling.

### 3. **Role-Based Access Control (RBAC)**
- Custom `@AllowedUserTypes()` decorator for route protection
- `AccessControlGuard` for permission validation
- User types: `admin`, `officer`, `user`

**Rationale**: Decorator-based approach keeps authorization logic declarative and maintainable at route level.

### 4. **TypeORM with Auto-Sync**
- Entities define database schema
- `synchronize: true` in development for automatic schema updates
- Entity relationships defined through decorators

**Rationale**: Eliminates manual migrations during development while providing type safety. Entity-driven development reduces schema/code mismatches.

### 5. **Comprehensive Logging & Monitoring**
- Pino-based structured logging with request/response tracking
- Morgan HTTP request logging
- Logger middleware for custom request context
- Swagger integration for API documentation

**Rationale**: Production-grade logging for debugging, monitoring, and audit trails.

### 6. **Global Error Handling**
- Centralized validation using `ValidationPipe` at the global level
- DTO-based input validation with `class-validator`
- Custom error responses with meaningful messages

**Rationale**: Ensures consistent error responses across the API. DTO validation prevents invalid data at the controller layer.

### 7. **Rate Limiting**
- Configurable per-IP rate limiting
- Prevents abuse and DDoS attacks
- Customizable thresholds via environment variables

**Rationale**: Protects API from being overwhelmed. Configurable limits allow adjustment based on usage patterns.

### 8. **Static File Serving**
- Uploaded files served from `/uploads` directory
- Configurable upload path via `ServeStaticModule`
- Integrated with file upload handling

**Rationale**: Simplifies file management. Separates file storage from application logic.

### 9. **Custom Base Entity**
- All entities extend `CustomBaseEntity`
- Provides common fields: `id`, `createdAt`, `updatedAt`
- Ensures consistency across the database schema

**Rationale**: DRY principle - reduces repetitive timestamp and ID logic across entities.

### 10. **Email Service Integration**
- Gmail SMTP integration for email notifications
- Configurable via environment variables
- Supports sending notifications and alerts

**Rationale**: External email service avoids storing/managing SMTP state server-side.

## Assumptions & Limitations

### Assumptions

1. **PostgreSQL Database**
   - System assumes PostgreSQL is available and accessible
   - Connection pooling handled by pg driver
   - Database user has full permissions for the survey database

2. **Environment Variables Available**
   - All required env vars are set before server startup
   - JWT secrets are strong and securely managed in production

3. **Single-Tenant Architecture**
   - System designed for single organization deployment
   - No multi-tenant isolation or data segregation implemented

4. **User Authentication Required**
   - Most operations require valid JWT token
   - Token validation happens at guard level

5. **Synchronous Database Operations**
   - No queue/async job handling for long-running operations
   - Direct database writes without message queue

### Limitations

1. **No Database Migrations**
   - `migrationsRun: false` - migrations not auto-applied
   - Schema synchronization relies on `synchronize: true` (dev only)
   - Production deployments require manual migration strategy

2. **File Upload Constraints**
   - Body parser limit: 50MB (configurable but fixed)
   - Files stored locally on server filesystem
   - No cloud storage integration (AWS S3, Azure Blob, etc.)

3. **Authentication**
   - No refresh token rotation
   - No token blacklist/revocation mechanism
   - Sessions don't track concurrent logins

4. **Rate Limiting**
   - Global rate limit (doesn't distinguish between API endpoints)
   - No per-user or per-resource rate limiting

5. **Logging**
   - Logs written to console and file
   - No log aggregation (ELK stack, Datadog, etc.)
   - Limited log retention strategy

6. **Email Service**
   - Gmail-specific configuration
   - No email queue or retry mechanism
   - Failed emails not logged persistently

7. **Error Handling**
   - Limited custom error codes
   - No internationalization (i18n) for error messages

8. **No WebSocket Support**
   - Real-time updates not supported
   - Polling required for live data updates

9. **Database Connection**
   - No connection pooling configuration
   - Single host database (no replication)

10. **CORS Policy**
    - All origins allowed (`origin: '*'`)
    - Should be restricted in production

## API Documentation

Once the server is running, interactive API documentation is available at:
```
http://localhost:3001/docs
```

The Swagger UI provides:
- Complete API endpoint listing
- Request/response schemas
- Authentication setup
- Try-it-out functionality for endpoints

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Root controller
│   ├── app.service.ts         # Root service
│   ├── main.ts                # Application entry point
│   ├── common/                # Shared across modules
│   │   ├── guards/            # Auth & access control guards
│   │   ├── middleware/        # Logger middleware
│   │   └── entity/            # Base entity class
│   ├── config/                # Configuration services
│   │   ├── jwt.config.ts      # JWT configuration
│   │   └── number-transformer.config.ts
│   ├── database/              # Database configuration
│   │   ├── data-source.ts     # TypeORM data source
│   │   └── ormconfig.service.ts
│   ├── decorators/            # Custom decorators
│   │   └── allowed-user-types.decorator.ts
│   ├── helpers/               # Utility functions
│   │   ├── pagination.helper.ts
│   │   ├── slugify.helper.ts
│   │   └── number.check.helper.ts
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── surveys/           # Survey management
│   │   ├── fields/            # Dynamic fields
│   │   └── submissions/       # Survey responses
│   ├── shared/                # Shared constants & errors
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── test/                      # E2E tests
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── nest-cli.json              # NestJS CLI config
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```