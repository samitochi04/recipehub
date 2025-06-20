# Recipe Sharing Platform - Project Plan

## Project Overview
A Recipe Sharing Platform where users can discover, share, and save recipes. The application will feature user authentication, recipe creation with photos, ingredient listings, cooking instructions, ratings, and comments.

## Technology Stack
- **Frontend**: React (JSX) with Vite and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL in Docker container
- **No TypeScript, only javascript** will be used as specified

## Project Structure
```
arch_n_tiers/
├── client/                  # React frontend
├── server/                  # Node.js backend
├── docker/                  # Docker configuration
├── uploads/                 # Stored recipe images
└── README.md
```

## Setup Instructions

### 1. Database Setup (PostgreSQL in Docker)

1. Create Docker configuration
   - Create a docker-compose.yml for PostgreSQL
   - Set up initialization scripts for database schema

2. Database schema design:
   - Users table
   - Recipes table
   - Ingredients table
   - Comments table
   - Ratings table
   - Favorites table

### 2. Backend Setup (Node.js with Express)

1. Initialize Node.js project
   - Install Express and other dependencies
   - Set up project structure

2. Create RESTful API endpoints:
   - User authentication (signup, login, logout)
   - CRUD operations for recipes
   - Comments and ratings management
   - Image upload handling
   - Recipe search and filtering

3. Connect to PostgreSQL database:
   - Set up connection pool
   - Create data models and queries

### 3. Frontend Setup (React)

1. Initialize React project with Vite
   - Set up project structure
   - Install necessary dependencies

2. Create UI components:
   - Login/Signup forms
   - Recipe browsing interface with filters
   - Recipe detail view with comments and ratings
   - Recipe creation/editing form with image upload
   - User profile page with saved recipes

3. Implement state management:
   - Use Context API for global state
   - Handle API interactions with Axios

## Implementation Plan

### Week 1: Setup and Database
- Set up development environment
- Configure Docker with PostgreSQL
- Design and implement database schema
- Create basic Express server structure

### Week 2: Backend Development
- Implement user authentication
- Create recipe CRUD operations
- Set up image upload functionality
- Implement comments and ratings system

### Week 3: Frontend Development
- Build React application structure
- Create recipe browsing and detail components
- Implement recipe creation form
- Design user profile interface

### Week 4: Integration and Features
- Connect frontend to backend
- Implement search and filtering
- Add favorites functionality
- Testing and debugging

## Key Features

1. **Recipe Discovery**
   - Browse recipes with thumbnail images
   - Filter by cuisine, prep time, ingredients
   - Search by keywords

2. **Recipe Creation**
   - Step-by-step instructions
   - Ingredient lists with measurements
   - Cooking time and difficulty level
   - Photo upload

3. **Social Features**
   - Comment on recipes
   - Rate recipes (5-star system)
   - Save favorite recipes
   - View user profiles

## Running the Application

1. Start the database:
```bash
cd docker
docker-compose up -d
```

2. Start the backend:
```bash
cd server
npm install
npm start
```

3. Start the frontend:
```bash
cd client
npm install
npm start
```

## Future Enhancements
- Meal planning calendar
- Nutritional information calculation
- Shopping list generation from recipes
- Social sharing functionality

## Project Setup Requirements

Before we start coding, please set up the following:

### 1. Development Environment

1. **Node.js and npm**
   - Install Node.js (LTS version recommended, v16.x or newer)
   - Verify installation with `node -v` and `npm -v`

2. **Docker and Docker Compose**
   - Install Docker Desktop (for Windows/Mac) or Docker Engine (for Linux)
   - Verify installation with `docker -v` and `docker-compose -v`

3. **Code Editor**
   - Install VS Code or your preferred editor

### 2. Initial Project Structure

Create the following folder structure:
```
arch_n_tiers/
├── client/
├── server/
├── docker/
└── uploads/
```

### 3. Docker Configuration

Create a docker-compose.yml file in the docker directory:

```bash
mkdir -p docker/init
touch docker/docker-compose.yml
touch docker/init/init.sql
```

### 4. Backend Initial Setup

```bash
cd server
npm init -y
npm install express pg cors dotenv bcrypt jsonwebtoken multer
npm install nodemon --save-dev
```

### 5. Frontend Initial Setup

```bash
# Create a Vite project with React
npm create vite@latest client -- --template react
cd client

# Install dependencies
npm install

# Add React Router and Axios
npm install axios react-router-dom react-hook-form

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Update your tailwind.config.js file
# Add the paths to all your template files
```

Create a tailwind.config.js file:
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind directives to your CSS:
```bash
# In src/index.css add:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
```

Once these components are set up, we can begin coding the application components, starting with the database schema and server configuration.

# RecipeHub Desktop Application Plan

## Architecture Overview

### 1. Application Structure
```
electron-app/
├── src/
│   ├── main/           # Main process files
│   │   ├── main.js     # Main Electron process
│   │   └── preload.js  # Preload script
│   ├── renderer/       # Renderer process (React app)
│   └── services/       # Electron-specific services
├── assets/             # App icons and resources
├── build/              # Build configuration
└── dist/               # Distribution files
```

### 2. Development Workflow
1. **Setup Phase**: Configure Electron with existing React app
2. **Integration Phase**: Connect to existing backend APIs
3. **Enhancement Phase**: Add desktop-specific features
4. **Testing Phase**: Test across platforms
5. **Distribution Phase**: Package for Windows/Mac/Linux

### 3. Key Features
- Native desktop window with menu bar
- System tray integration
- Auto-updater support
- Offline data caching
- File system access for recipe exports
- Native notifications
- Print recipe functionality

### 4. Backend Integration
- Use existing REST API endpoints
- Implement token-based authentication
- Handle network connectivity issues
- Provide offline fallback modes

### 5. Implementation Steps

#### Phase 1: Basic Electron Setup
- [x] Initialize Electron project
- [ ] Configure build system
- [ ] Setup development environment
- [ ] Create main process
- [ ] Setup preload script

#### Phase 2: UI Integration
- [ ] Integrate existing React frontend
- [ ] Configure routing for desktop
- [ ] Implement native menus
- [ ] Add window state management

#### Phase 3: Backend Connection
- [ ] Configure API client for desktop
- [ ] Implement authentication flow
- [ ] Add offline data storage
- [ ] Handle network errors gracefully

#### Phase 4: Desktop Features
- [ ] System tray integration
- [ ] Native notifications
- [ ] Print functionality
- [ ] Recipe export/import
- [ ] Auto-updater

#### Phase 5: Distribution
- [ ] Configure app signing
- [ ] Setup CI/CD pipeline
- [ ] Create installers
- [ ] Publish to app stores

## Current Status: Phase 1 - Basic Setup
- Need to fix build configuration
- Resolve port conflicts
- Complete main process setup
