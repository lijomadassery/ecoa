# CAMU ECOA App - Technical Context Document

## 1. Technology Stack Overview

The CAMU ECOA (Effective Communication for Armstrong) App will be built using the following technology stack:

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Frontend Framework | Vue 3 | 3.2+ | Component-based UI development with Composition API |
| UI Component Library | Vuetify | 3.0+ | Material Design-based UI components for Vue |
| ORM | Prisma | 4.0+ | Database access, schema management, and migrations |
| Database | MySQL | 8.0+ | Relational database for data persistence |
| Authentication | JWT | - | Secure, stateless authentication mechanism |
| Password Security | bcryptjs | - | Password hashing for secure credential storage |

## 2. System Architecture

### 2.1 High-Level Architecture

The application will follow a modern client-server architecture:

- **Client (Frontend)**: Vue 3 + Vuetify SPA (Single Page Application)
- **Server (Backend)**: Node.js API with Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based with refresh token strategy

```
┌────────────────┐      ┌─────────────────┐      ┌────────────────┐
│                │      │                 │      │                │
│  Vue 3 Client  │<─────│  Express API    │<─────│  MySQL Database│
│  (Vuetify UI)  │      │  (Prisma ORM)   │      │                │
│                │      │                 │      │                │
└────────────────┘      └─────────────────┘      └────────────────┘
```

### 2.2 Deployment Architecture

The application will be deployed with the following infrastructure:

- **Frontend**: Static assets served from CDN or web server
- **Backend API**: Node.js application deployed on containerized infrastructure
- **Database**: Managed MySQL database service
- **Offline Support**: Service Workers for client-side caching and offline functionality

## 3. Frontend Technical Context

### 3.1 Vue 3 Implementation

The application will leverage Vue 3's Composition API for improved code organization, reusability, and TypeScript integration:

```javascript
// Example of a composition function for user authentication
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export function useAuth() {
  const store = useStore()
  const router = useRouter()
  const isLoading = ref(false)
  
  const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
  
  async function login(credentials) {
    isLoading.value = true
    try {
      await store.dispatch('auth/login', credentials)
      router.push('/roster')
    } catch (error) {
      // Handle error
    } finally {
      isLoading.value = false
    }
  }
  
  function logout() {
    store.dispatch('auth/logout')
    router.push('/login')
  }
  
  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  }
}
```

### 3.2 Vuetify Component Structure

The application will use Vuetify 3.x for UI components, following Material Design principles:

- Custom theme configuration to match CDCR design guidelines
- Responsive layouts for tablet and desktop views
- Accessibility-focused component implementation

```javascript
// Example of Vuetify theme configuration
export default {
  theme: {
    themes: {
      light: {
        primary: '#3498db',       // Primary app color
        secondary: '#2ecc71',     // Success indicators
        accent: '#f39c12',        // Warning/in-progress indicators
        error: '#e74c3c',         // Error indicators
        info: '#3498db',          // Informational elements
        success: '#2ecc71',       // Success elements
        warning: '#f39c12'        // Warning elements
      }
    }
  }
}
```

### 3.3 State Management

The application will use Vuex 4 for state management with the following stores:

- **auth**: User authentication state
- **roster**: HOH individual roster data
- **prompts**: Communication prompts and delivery history
- **offline**: Offline synchronization queue and status
- **ui**: UI state (loading indicators, notifications)

### 3.4 Offline Support Strategy

The application will implement offline support using:

- Service Workers for caching static assets
- IndexedDB for offline data storage
- Synchronization queue for pending operations
- Clear offline status indicators in UI

## 4. Backend Technical Context

### 4.1 API Structure

The backend will be built using Express.js with a RESTful API structure:

```
/api
  /auth
    POST /login         # User authentication
    POST /refresh-token # JWT refresh
  /roster
    GET /               # Get HOH roster
    GET /:id            # Get individual details
  /prompts
    GET /               # Get available prompts
    GET /history        # Get prompt delivery history
    POST /              # Record new prompt delivery
    POST /batch         # Record batch prompt delivery
  /sync
    POST /              # Submit offline data for synchronization
  /reports
    GET /compliance     # Get compliance reports
    GET /dashboard      # Get dashboard data
```

### 4.2 Prisma Database Schema

The application will use Prisma for database access with the following core models:

```prisma
// Example Prisma schema
model User {
  id          Int       @id @default(autoincrement())
  username    String    @unique
  password    String    // Hashed with bcryptjs
  firstName   String
  lastName    String
  badgeNumber String?
  role        Role      @default(OFFICER)
  facility    String
  unit        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  prompts     Prompt[]
}

model Individual {
  id           Int       @id @default(autoincrement())
  cdcrNumber   String    @unique
  firstName    String
  lastName     String
  housingUnit  String
  disabilities Disability[]
  prompts      Prompt[]
}

model Disability {
  id            Int         @id @default(autoincrement())
  type          String      // e.g., "HOH", "Mobility", etc.
  description   String?
  individuals   Individual[]
}

model PromptType {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  category    String    // e.g., "Yard", "Meals", "Medical"
  prompts     Prompt[]
}

model Prompt {
  id            Int          @id @default(autoincrement())
  userId        Int
  individualId  Int
  promptTypeId  Int
  status        PromptStatus
  signatureData String?      // Base64 encoded signature data
  notes         String?
  createdAt     DateTime     @default(now())
  location      String
  deviceId      String?
  syncedAt      DateTime?    // Tracks when the record was synced from offline
  
  user          User         @relation(fields: [userId], references: [id])
  individual    Individual   @relation(fields: [individualId], references: [id])
  promptType    PromptType   @relation(fields: [promptTypeId], references: [id])
}

enum Role {
  ADMIN
  SUPERVISOR
  OFFICER
  MEDICAL
}

enum PromptStatus {
  SIGNED
  REFUSED
  ATTEMPTED
  PENDING
}
```

### 4.3 Authentication Implementation

The application will use JWT for authentication with:

- Access tokens with short expiration (15-30 minutes)
- Refresh tokens with longer expiration (7 days)
- Secure, HTTP-only cookies for token storage
- bcryptjs for password hashing

```javascript
// Example JWT implementation
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Password hashing
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Password verification
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

// JWT generation
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  )
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}
```

## 5. Database Design

### 5.1 MySQL Configuration

The MySQL database will be configured with:

- InnoDB storage engine for transaction support
- UTF-8mb4 character encoding
- Regular automated backups
- Appropriate indices for query optimization

### 5.2 Data Migration Strategy

For initial deployment and future updates:

- Prisma Migrate for schema changes
- Data seeding for initial system configuration
- Version-controlled migration scripts

## 6. Security Considerations

### 6.1 Authentication & Authorization

- Role-based access control (RBAC) implementation
- JWT with short expiration times
- Refresh token rotation for enhanced security
- Password policy enforcement

### 6.2 Data Security

- All personal data encrypted at rest
- TLS/SSL for data in transit
- Secure API endpoints with proper authorization checks
- Input validation on all API endpoints

### 6.3 Offline Data Security

- Encrypted local storage for offline data
- Automatic clearing of sensitive data after synchronization
- Device authorization for offline mode access

## 7. Development Workflow & Tooling

### 7.1 Development Environment

- Node.js development environment
- Vue CLI for frontend tooling
- Docker for consistent development environments
- Environment-specific configuration files

### 7.2 Build & Deployment

- CI/CD pipeline for automated testing and deployment
- Containerized deployment with Docker
- Environment-specific build configurations
- Database migration automation

### 7.3 Testing Strategy

- Unit testing with Jest for frontend and backend
- Component testing with Vue Test Utils
- API integration testing
- End-to-end testing with Cypress

## 8. Performance Considerations

### 8.1 Frontend Optimization

- Code splitting for improved load times
- Asset optimization (minification, compression)
- Lazy loading of routes and components
- Efficient state management practices

### 8.2 Backend Optimization

- API response caching where appropriate
- Query optimization with Prisma
- Pagination for large data sets
- Rate limiting for API endpoints

### 8.3 Offline Performance

- Efficient IndexedDB usage
- Optimized synchronization algorithms
- Batch processing of offline data

## 9. Scalability Considerations

### 9.1 Database Scalability

- Efficient indexing strategy
- Query optimization
- Connection pooling
- Potential for read replicas in future

### 9.2 API Scalability

- Stateless design for horizontal scaling
- Load balancing configuration
- Rate limiting and throttling

## 10. Monitoring & Logging

### 10.1 Application Logging

- Structured logging format
- Error tracking and reporting
- User action auditing
- Performance metrics

### 10.2 Monitoring Tools

- Server health monitoring
- API performance metrics
- Database performance monitoring
- Real-time error alerting

## 11. Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)

- Project setup and configuration
- Authentication system implementation
- Database schema design and implementation
- Basic API structure

### Phase 2: Core Features (Weeks 3-4)

- Roster management implementation
- Prompt delivery and documentation
- Basic offline functionality
- Integration with authentication

### Phase 3: Advanced Features (Weeks 5-6)

- Enhanced offline support and synchronization
- Signature capture implementation
- Reporting dashboard development
- Multi-select functionality

### Phase 4: Testing & Refinement (Weeks 7-8)

- Comprehensive testing
- Performance optimization
- Security hardening
- Usability refinements

## 12. Technical Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| Vue 3 | Frontend framework | ^3.2.0 |
| Vuetify | UI component library | ^3.0.0 |
| Vite | Build tool | ^2.9.0 |
| Pinia/Vuex | State management | ^2.0.0 |
| Vue Router | Routing | ^4.0.0 |
| Axios | HTTP client | ^1.1.0 |
| Express.js | Backend framework | ^4.18.0 |
| Prisma | ORM | ^4.0.0 |
| MySQL2 | MySQL client | ^2.3.0 |
| JWT | Authentication | ^9.0.0 |
| bcryptjs | Password hashing | ^2.4.0 |
| Jest | Testing | ^29.0.0 |
| Cypress | E2E testing | ^10.0.0 |
