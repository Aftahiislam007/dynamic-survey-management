# Survey Management System - Frontend

A dynamic survey management system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Admin Panel:**
  - Create, edit, delete surveys
  - Add dynamic fields (text, checkbox, radio, select)
  - View survey submissions
  - Dashboard with analytics

- **Officer Panel:**
  - View available surveys
  - Submit survey responses
  - Track submission history

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **State Management:** Zustand
- **API Client:** Axios
- **Form Handling:** React Hook Form + Zod
- **UI Components:** Custom components with Lucide React icons
- **Notifications:** React Hot Toast

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API (NestJS) running on `http://localhost:3001`

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd survey-management-system

# Install dependencies
npm install