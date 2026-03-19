# Profile App Walkthrough

This document outlines the finished Profile Application built for the 2nd-year engineering students' 2-day session. 
**[UPDATED]** The frontend has been successfully migrated to a React (Vite) Single Page Application!

## Architecture & Features

- **Frontend (React)**: A robust Single Page Application scaffolded with Vite and React. Uses **Tailwind CSS** for a beautiful, Shadcn-inspired UI and `lucide-react` for iconography. Data fetching and AI interactions are handled internally using `axios` components with full state and lifecycle management.
- **Backend API (Node.js)**: A Node.js + Express server hosting two core endpoints `/api/profile` and `/api/chat`.
- **Database (MySQL)**: Detailed MySQL schema spanning user profile, education, skills, and achievements. (Ensure `Sanjay@123` or your own password is correct in [backend/db.js](file:///Users/sanjaykishorsanil/Documents/Projects/TEST/profile_app/backend/db.js)).
- **AI Integration**: Integrated Google Gemini API serving as an AI persona of the student, guarded by prompt engineering safety checks to reject violent or irrelevant questions.

## Setup & Running Instructions

### 1. Database Setup
Ensure you have MySQL installed and running locally on port 3306.
If you haven't yet, run the initialization script from the terminal to create the database and mock data:
```bash
cd /Users/sanjaykishorsanil/Documents/Projects/TEST/profile_app
mysql -u root -p"Sanjay@123" < database/init.sql
```

### 2. Start the Backend API (Terminal 1)
Open a terminal instance, navigate to the `profile_app` folder, and start the API:
```bash
cd /Users/sanjaykishorsanil/Documents/Projects/TEST/profile_app
npm install cors dotenv express mysql2 @google/generative-ai
node backend/server.js
```
*The server will run on http://localhost:3000.*

### 3. Start the React Frontend (Terminal 2)
Open a **new** terminal instance, navigate to the `frontend` directory, install packages, and start the development server:
```bash
cd /Users/sanjaykishorsanil/Documents/Projects/TEST/profile_app/frontend
npm install
npm run dev
```
*Vite will start the React server (usually at http://localhost:5173).* 
**All API requests made by the React app will automatically proxy to the Node API on port 3000.**

### 4. View the App
Open your browser and navigate to the address Vite provides in the terminal (e.g. `http://localhost:5173`).

## Visual Demonstrations
Here is the AI generated local profile image placeholder used dynamically within the React UI (saved locally in `frontend/public/profile.jpg`):
![AI Profile Avatar](/Users/sanjaykishorsanil/.gemini/antigravity/brain/e618bcc3-3f31-4c63-acab-cb2d4a6144e5/profile_avatar_1773897950294.png)
