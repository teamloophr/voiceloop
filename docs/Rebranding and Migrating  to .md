# Developer Instructions: Rebranding and Migrating `human-light-mode` to `Teamloop`

**Objective:** Transform the existing `human-light-mode` frontend template into the foundational UI for the `Teamloop` application. This involves a complete branding change and setting the stage for backend integration.

## Phase 1: Core Branding Changes

This phase focuses on changing all user-facing and internal identifiers from `human-light-mode` to `Teamloop`.

### 1. Update `package.json`:
This is the heart of the project's identity.
- Open `package.json`.
- Change the `"name"` field from `"human-light-mode"` to `"teamloop"`.
- Update the `"description"`, `"author"`, and `"repository"` fields to reflect the new project details.

### 2. Find and Replace Project-Wide:
Use your code editor's "Find and Replace in Files" feature to catch all instances. This ensures consistency.
- Search for `human-light-mode` (case-insensitive) and replace with `Teamloop`.
- Search for `Human Light Mode` (case-insensitive) and replace with `Teamloop`.
- **Review each change carefully** before confirming to avoid accidentally renaming a critical library or variable that coincidentally contains the name.

### 3. Replace Visual Assets:
- **Logo:** Locate the existing logo file (likely in `public/` or `src/assets/`). Replace it with the new `Teamloop` logo file. Ensure the new file has the same name and extension, or update the import path in the header/navigation components.
- **Favicon:** Replace the `favicon.ico` or equivalent file in the `public/` directory with the new `Teamloop` favicon.

### 4. Update Public HTML and Metadata:
- Open `public/index.html` (for Create React App) or `app/layout.tsx` (for Next.js).
- Change the `<title>` tag to "Teamloop".
- Update any meta tags (e.g., `og:title`, `og:description`) to reflect the new brand.

### 5. Update UI Text:
- Manually search the codebase (especially in component files within `src/components/` or `app/`) for any visible text that mentions the old brand name and update it. This includes headers, footers, and about pages.

## Phase 2: Technical Migrations & Setup

This phase prepares the rebranded application for the new backend, database, and voice features.

### 1. Clean Up Unnecessary Components:
The template likely has placeholder pages or components (e.g., generic "About Us," "Pricing" pages).
- **Identify and delete** any components or pages that are not required for the `Teamloop` MVP (Employee Management, Dashboard).
- This simplifies the codebase and removes dead weight.

### 2. Install New Dependencies:
Open your terminal in the project root and install the libraries needed for `Teamloop`'s functionality.
```bash
# For API calls and state management
npm install axios react-query

# For handling dates (PTO, attendance)
npm install date-fns

# For charts and data visualization on the dashboard
npm install chart.js react-chartjs-2

# If you need a component library for forms, modals, etc.
npm install @mui/material @emotion/react @emotion/styled
```

### 3. Set Up Environment Variables:
Create a `.env.local` file in the project root. This is critical for keeping API keys and other secrets out of the code.
- Add placeholders for the APIs defined in your roadmap.

```plaintext
# .env.local

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# VoiceLoop Service API Keys (Examples)
NEXT_PUBLIC_WHISPER_API_KEY="your_whisper_key_here"
NEXT_PUBLIC_POLLY_API_KEY="your_aws_polly_key_here"

# Auth0 or other auth provider details
NEXT_PUBLIC_AUTH0_DOMAIN="your_auth0_domain"
NEXT_PUBLIC_AUTH0_CLIENT_ID="your_auth0_client_id"
```
**Important:** Add `.env.local` to your `.gitignore` file immediately.

### 4. Create New Folder Structure:
Organize your `src/` or `app/` directory to match the new application structure.
- Create a `src/services` directory for API call functions (e.g., `authService.js`, `employeeService.js`).
- Create a `src/hooks` directory for custom hooks (e.g., `useAuth.js`, `useEmployees.js`).
- Create a `src/pages` or `app/` sub-directory for each major feature:
  - `/dashboard`
  - `/employees`
  - `/login`
  - `/profile`

### 5. Stub Out API Service Functions:
In the newly created `src/services` directory, create files with placeholder functions for your API endpoints. This allows the frontend to be built even before the backend is ready.

*Example: `src/services/employeeService.js`*
```javascript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getEmployees = async () => {
  // const response = await axios.get(`${API_URL}/employees`);
  // return response.data;
  console.log("Fetching employees...");
  return []; // Return mock data for now
};

export const createEmployee = async (employeeData) => {
  // const response = await axios.post(`${API_URL}/employees`, employeeData);
  // return response.data;
  console.log("Creating employee:", employeeData);
  return { id: 'new-id', ...employeeData }; // Return mock response
};
```

By following these instructions, a developer can systematically convert the generic template into a well-structured, correctly branded foundation for the `Teamloop` application, ready for feature development.


