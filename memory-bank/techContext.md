# CAMU ECOA App Technical Context

## Development Environment

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn
- Git

### Local Setup
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database
npm run seed
```

### Development Tools
- VS Code with recommended extensions
- Postman for API testing
- MySQL Workbench for database management
- Vue DevTools for frontend debugging
- Chrome DevTools for PWA testing

## Technical Dependencies

### Frontend Dependencies
- Vue 3.2+
- Vuetify 3.0+
- Vuex 4.0+
- Vue Router 4.0+
- PWA Workbox
- IndexedDB (Dexie.js)

### Backend Dependencies
- Node.js 18+
- Express 4+
- Prisma ORM 4+
- JWT for authentication
- bcrypt for password hashing
- Jest for testing

### Database
- MySQL 8.0+
- Prisma as ORM
- Connection pooling
- Migrations for schema changes
- JSON column support
- InnoDB engine for transactions
- Binary log for replication
- Query optimization tools

## Technical Constraints

### Security Requirements
1. CDCR security standards compliance
2. Data encryption requirements
3. Authentication standards
4. Audit logging requirements
5. Access control policies

### Performance Requirements
1. < 2s response time for API calls
2. < 60s sync time for offline data
3. Support for 100+ concurrent users
4. 72h offline operation capability
5. < 5MB initial bundle size

### Infrastructure Requirements
1. CDCR-approved hosting environment
2. Limited network connectivity
3. Tablet-based deployment
4. Offline-first architecture
5. Data backup requirements

## Development Workflow

### Version Control
1. Git-based workflow
2. Feature branch strategy
3. Pull request reviews
4. Semantic versioning
5. Changelog maintenance

### Code Quality
1. ESLint configuration
2. Prettier for formatting
3. TypeScript for type safety
4. Unit test coverage requirements
5. Code review guidelines

### Deployment Process
1. CI/CD pipeline
2. Environment promotion
3. Database migrations
4. Feature flags
5. Rollback procedures

## Testing Strategy

### Test Environments
1. Local development
2. Integration testing
3. Staging environment
4. UAT environment
5. Production environment

### Test Coverage
1. Unit tests (80%+ coverage)
2. Integration tests
3. E2E tests
4. Performance tests
5. Security tests

## Monitoring & Support

### Application Monitoring
1. Error tracking
2. Performance metrics
3. User analytics
4. System health
5. Security monitoring

### Support Tools
1. Logging system
2. Error reporting
3. Analytics dashboard
4. Health check endpoints
5. Support documentation

## Documentation

### Technical Documentation
1. API documentation
2. Database schema
3. Architecture diagrams
4. Setup guides
5. Deployment procedures

### User Documentation
1. User guides
2. Admin guides
3. API guides
4. Troubleshooting guides
5. Release notes

## Security Measures

### Authentication
1. JWT implementation
2. Password policies
3. Session management
4. 2FA requirements
5. Access control

### Data Protection
1. Encryption standards
2. Data retention policies
3. Backup procedures
4. Privacy requirements
5. Audit requirements

## Performance Optimization

### Frontend Optimization
1. Code splitting
2. Asset optimization
3. Caching strategy
4. Bundle optimization
5. Load time optimization

### Backend Optimization
1. Query optimization
2. Caching strategy
3. Connection pooling
4. Rate limiting
5. Load balancing

## Kubernetes Deployment

### Infrastructure
- Minikube for local Kubernetes cluster
- Docker as container runtime
- Nginx for frontend routing and API proxying
- Kubernetes resources in dedicated namespace

### Components
1. Frontend Service:
   - Nginx-based container
   - Port 80 internal, 30000 NodePort
   - SPA routing support
   - API proxying configuration

2. Backend Service:
   - Node.js container
   - Port 4001
   - Health check endpoint
   - Database connectivity

3. MySQL Service:
   - Persistent volume storage
   - Port 3306
   - Initial schema setup
   - User authentication

### Automation
1. verify-stack.sh:
   - Docker status check
   - Minikube verification
   - Kubernetes resource validation
   - Port forwarding setup

2. deploy-changes.sh:
   - Selective component deployment
   - Image building and loading
   - Pod replacement
   - Deployment verification

### Access Methods
1. Port Forwarding (Development):
   - Frontend: localhost:8080
   - API: localhost:8080/api
   - Automated setup via scripts

2. Minikube Tunnel (Alternative):
   - NodePort access
   - Direct service exposure
   - Suitable for specific use cases 