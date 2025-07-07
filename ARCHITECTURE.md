# RecipeHub Application Architecture

## Overview

RecipeHub implements a **4-Tier (N-Tier) Architecture** with clear separation of concerns across presentation, application logic, business logic, and data persistence layers. This architecture provides scalability, maintainability, and loose coupling between components.

## N-Tier Architecture Analysis

### Tier 1: Presentation Layer (Client Tier)
**Location**: `/client` (React Web App) + `/electron-app` (Desktop Client)

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION TIER                  │
├─────────────────┬───────────────────────────────┤
│   Web Client    │     Desktop Client            │
│   (React/Vite)  │     (Electron + React)        │
│   Port: 3000    │     Native Application        │
└─────────────────┴───────────────────────────────┘
```

**Responsibilities**:
- User Interface rendering
- User input validation (client-side)
- State management (React Context)
- API communication
- Routing and navigation

**Technologies**:
- React 19 with functional components
- TailwindCSS for styling
- React Router for SPA routing
- Axios for HTTP communication
- Electron for desktop native features

### Tier 2: Application/Logic Layer (Middle Tier)
**Location**: `/server` (Node.js/Express API)

```
┌─────────────────────────────────────────────────┐
│             APPLICATION TIER                    │
├─────────────────────────────────────────────────┤
│              Express.js API                     │
│  ┌─────────────┬─────────────┬─────────────┐    │
│  │ Controllers │ Middleware  │   Routes    │    │
│  └─────────────┴─────────────┴─────────────┘    │
│              Port: 5000                         │
└─────────────────────────────────────────────────┘
```

**Responsibilities**:
- HTTP request/response handling
- Authentication & authorization (JWT)
- Input validation and sanitization
- Business logic orchestration
- File upload management
- API endpoint routing

**Key Components**:
```javascript
// MVC Pattern Implementation
server/
├── controllers/     # Request handlers (Controller)
├── middleware/      # Cross-cutting concerns
├── routes/         # API endpoint definitions
├── config/         # Configuration management
└── utils/          # Helper functions
```

### Tier 3: Business Logic Layer (Service Tier)
**Embedded within Controllers** - Following Domain-Driven Design patterns

```
┌─────────────────────────────────────────────────┐
│             BUSINESS LOGIC TIER                 │
├─────────────────────────────────────────────────┤
│  Recipe Management │ User Management │ Auth     │
│  - CRUD Operations │ - Profile Mgmt  │ Service  │
│  - Rating System   │ - Favorites     │          │
│  - Comment System  │ - User Recipes  │          │
└─────────────────────────────────────────────────┘
```

**Business Rules Implementation**:
- Recipe creation/validation logic
- User authentication workflows
- Rating and comment business rules
- File upload constraints
- Category management

### Tier 4: Data Access Layer (Persistence Tier)
**Location**: `/docker` (PostgreSQL Database)

```
┌─────────────────────────────────────────────────┐
│               DATA TIER                         │
├─────────────────────────────────────────────────┤
│            PostgreSQL Database                  │
│  ┌─────────┬─────────┬─────────┬─────────┐      │
│  │ Tables  │ Views   │ Indexes │ Triggers│      │
│  └─────────┴─────────┴─────────┴─────────┘      │
│              Port: 5430                         │
└─────────────────────────────────────────────────┘
```

**Data Model**:
```sql
-- Core entities with relationships
users → recipes (1:many)
recipes ↔ categories (many:many)
recipes → ingredients (1:many)
recipes → instructions (1:many)
users ↔ recipes (many:many via favorites)
```

## Additional Architectural Patterns

### 1. Cross-Cutting Concerns Layer
```
┌─────────────────────────────────────────────────┐
│           CROSS-CUTTING CONCERNS                │
├─────────────────────────────────────────────────┤
│ Security │ Logging │ Caching │ File Storage     │
│   JWT    │ Console │ Memory  │   Local/Cloud    │
└─────────────────────────────────────────────────┘
```

### 2. Infrastructure Layer
**Docker Containerization**:
```yaml
# Container orchestration
services:
  frontend:    # Presentation tier container
  backend:     # Application tier container  
  postgres:    # Data tier container
```

## Architecture Benefits

### ✅ Separation of Concerns
- **Presentation**: UI logic isolated from business logic
- **Application**: API logic separated from data access
- **Business**: Domain rules centralized
- **Data**: Persistence abstracted from application

### ✅ Scalability
```javascript
// Horizontal scaling capability
// Each tier can be scaled independently
Frontend: Multiple nginx instances
Backend: Load-balanced Node.js instances
Database: Read replicas, connection pooling
```

### ✅ Maintainability
- Clear boundaries between layers
- Dependency injection patterns
- Modular component structure
- Configuration externalization

### ✅ Testability
```javascript
// Each layer can be tested independently
// Unit tests: Controllers, services
// Integration tests: API endpoints
// E2E tests: Full application flow
```

## Communication Flow

### Request Flow (Top-Down)
```
1. User Action (Presentation)
   ↓
2. HTTP Request (Network)
   ↓  
3. Route Handler (Application)
   ↓
4. Controller Logic (Business)
   ↓
5. Database Query (Data)
```

### Response Flow (Bottom-Up)
```
5. Database Result (Data)
   ↑
4. Business Processing (Business)
   ↑
3. JSON Response (Application)
   ↑
2. HTTP Response (Network)
   ↑
1. UI Update (Presentation)
```

## Technology Stack per Tier

| Tier | Technologies | Purpose |
|------|-------------|---------|
| **Presentation** | React, Electron, TailwindCSS | User Interface |
| **Application** | Node.js, Express, JWT | API & Logic |
| **Business** | JavaScript, Validation | Domain Rules |
| **Data** | PostgreSQL, SQL | Persistence |
| **Infrastructure** | Docker, nginx | Deployment |

## Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (localhost:5173)
├── Backend (localhost:5000)
├── Database (localhost:5430)
└── Desktop App (Electron)
```

### Production Environment
```
Cloud Infrastructure
├── Frontend (CDN + nginx)
├── Backend (Load Balanced API)
├── Database (Managed PostgreSQL)
└── File Storage (Cloud Storage)
```

## Architecture Evolution

### Current State: 4-Tier Monolithic
- Single backend application
- Shared database
- Containerized deployment

## Conclusion

Your RecipeHub application successfully implements a **4-Tier N-Tier Architecture** with:

1. **Clear layer separation** - Each tier has distinct responsibilities
2. **Loose coupling** - Layers communicate through well-defined interfaces
3. **High cohesion** - Related functionality grouped within tiers
4. **Scalability** - Each tier can be scaled independently
5. **Maintainability** - Changes in one tier don't affect others

This architecture provides a solid foundation for growth and can evolve into microservices as the application scales.
