# CAMU ECOA App Active Context

## Current Focus

### Phase 1: Core Infrastructure (In Progress)
1. Database schema implementation
   - ✅ Core models defined
   - ✅ Relationships established
   - ✅ Indexes created
   - 🔄 Migration scripts in progress

2. Authentication System
   - ✅ User model created
   - ✅ Password hashing implemented
   - 🔄 JWT implementation in progress
   - ⏳ Role-based access control pending

3. Basic API Structure
   - ✅ Project structure set up
   - ✅ Express server configured
   - 🔄 Core endpoints in development
   - ⏳ Middleware implementation pending

### Phase 2: Kubernetes Deployment (Active)
1. Local Development Environment
   - ✅ Minikube cluster setup
   - ✅ Service configuration
   - ✅ Resource management
   - ✅ Access configuration

2. Service Deployment
   - ✅ MySQL deployment with persistence
   - ✅ Backend service with health checks
   - ✅ Frontend service with Nginx
   - ✅ Inter-service communication

3. Infrastructure Management
   - ✅ Local image builds
   - ✅ Service networking
   - ✅ Volume management
   - ✅ Health monitoring
   - ✅ Deployment automation

### Phase 3: FluxCD Integration & CI/CD (Complete)
1. GitHub Connectivity
   - ✅ Basic FluxCD setup
   - ✅ Token authentication
   - ✅ SSL certificate configuration
   - ✅ GitHub repository access
   - ✅ Automated sync testing
   - ✅ GitOps repository structure finalized

2. CI/CD Pipeline
   - ✅ GitHub Actions workflow implemented
   - ✅ Test, build, push, and deploy stages
   - ✅ Docker Hub authentication working in CI/CD
   - ✅ Dummy test scaffolding in place for frontend (Vitest) and backend (Jest)
   - ✅ Build and push to Docker Hub verified
   - ✅ Secure handling of Docker credentials via GitHub secrets

3. Monitoring & Dashboard
   - ✅ Prometheus deployed for metrics collection
   - ✅ Grafana deployed for visualization
   - ✅ Initial dashboard created (API request rate, memory usage)
   - ✅ Monitoring stack ready for further customization

### Phase 4: Testing Infrastructure (Active)
1. E2E Testing with Cypress
   - ✅ Initial setup completed
   - 🔄 Login flow tests in progress
   - 🔄 Selector optimization
   - ⏳ Additional user flows pending

2. Test Infrastructure
   - ✅ Cypress configuration
   - ✅ Test environment setup
   - 🔄 Selector standardization
   - ⏳ CI/CD integration

## Recent Changes

### Kubernetes Infrastructure
1. Deployment Automation
   - Added verify-stack.sh for health checks
   - Created deploy-changes.sh for updates
   - Implemented systematic restart procedure
   - Configured resource monitoring

2. Service Configuration
   - Optimized MySQL persistence
   - Enhanced backend health checks
   - Improved frontend routing
   - Secured inter-service communication

3. Development Workflow
   - Streamlined local image builds
   - Enhanced deployment scripts
   - Added health verification
   - Improved troubleshooting tools
   - Refactored deploy-changes.sh to auto-detect Minikube Docker, use correct build contexts for frontend, backend, and mysql, and skip build for monitoring images.
   - Documented workflow for Minikube image troubleshooting, CA certs, and image loading.
   - **Troubleshooting persistent ErrImageNeverPull:**
     - Ensure image tag in manifest matches tag in Minikube Docker exactly (e.g., mysql-local:latest)
     - imagePullPolicy must be Never for local images
     - Always use eval $(minikube docker-env) before building images
     - If issue persists, restart Minikube and redeploy
     - Sometimes deleting the deployment/replicaset and recreating is required to clear kubelet cache
   - **Grafana Access Tip:**
     - If you need to open Grafana in a browser, use:
       - `minikube service grafana -n monitoring`
     - This command will launch the Grafana service in your default browser using Minikube's service tunneling.

### FluxCD & CI/CD
1. Token Authentication
   - Implemented GitHub token auth
   - Configured local image usage
   - Added SSL certificate handling
   - Created test infrastructure

2. Monitoring Setup
   - Added pod health checks
   - Configured service monitoring
   - Implemented access logging
   - Added security verification

3. CI/CD: GitHub Actions pipeline, Docker Hub integration, test scaffolding, secure secrets management

### Testing Infrastructure
1. Cypress Setup
   - Implemented initial test structure
   - Optimized selectors for reliability
   - Added login flow tests
   - Standardized test patterns

2. Test Improvements
   - Updated button selectors to use classes
   - Enhanced test reliability
   - Improved test maintainability
   - Documented testing patterns

## Active Issues

### SSL Certificate Management
1. Certificate verification failing in pods
2. Need root access for certificate installation
3. Working on secure certificate distribution
4. Testing GitHub API connectivity

### Security Considerations
1. Pod security contexts
2. Root access requirements
3. Certificate management
4. GitHub token handling

### Minikube Docker Certificate Issues
- Minikube's Docker daemon may not trust Docker Hub's SSL certificates by default
- Secure approach: add CA certs to Minikube Docker daemon and restart Docker
- Less secure workaround: use --insecure-registry (not recommended for production)
- Documented and ready for future troubleshooting if needed
- If Minikube is reset or a new profile is used, all local images must be rebuilt and redeployed using the updated script.
- Monitoring images (Loki, Promtail, Grafana, Prometheus) are now deployed from manifests, not built locally.

## Active Decisions

### Technical Decisions
1. Using MySQL for:
   - JSON column support for metadata
   - Strong indexing capabilities
   - Transaction support with InnoDB
   - Binary logging for audit trail
   - Replication support
   - Connection pooling
   - Query optimization tools

2. Implementing offline-first architecture:
   - IndexedDB for local storage
   - Queue-based synchronization
   - Conflict resolution strategy

3. Security implementation:
   - JWT with refresh tokens
   - Role-based access control
   - Encryption at rest and in transit

4. Using Alpine-based test containers for:
   - Minimal footprint
   - Quick deployment
   - Easy package management
   - SSL testing capabilities

5. SSL Certificate Strategy:
   - Local CA certificates installation
   - Root privilege requirements identified
   - Security context modifications needed
   - Certificate verification procedures

### Active Decisions
- Use GitHub Actions for CI/CD with test, build, push, and deploy stages
- Use Docker Hub for image registry with secure token-based authentication
- Maintain test scaffolding for both frontend and backend to ensure CI/CD stability
- Use Prometheus and Grafana for monitoring and dashboarding
- Continue to follow GitOps best practices for deployment

## Next Steps

1. Complete SSL certificate configuration for GitHub access
2. Implement automated health checks for all services
3. Enhance monitoring and alerting system
4. Implement backup and restore procedures
5. Add security hardening measures
6. Expand test coverage for frontend and backend
7. Enhance monitoring dashboards and alerting
8. Focus on application features and user experience

## Known Issues

### Technical Debt
1. Need to implement proper error handling
2. Require comprehensive test coverage
3. Documentation needs expansion
4. Performance optimization pending
5. Security audit required

### Blockers
1. Awaiting CDCR security approval
2. Network infrastructure assessment pending
3. Hardware specifications needed
4. Integration API documentation required
5. User training plan needed

## Questions & Considerations

### Technical Questions
1. Optimal offline storage strategy
2. Conflict resolution approach
3. Performance optimization methods
4. Security implementation details
5. Integration patterns

### Business Questions
1. Compliance reporting requirements
2. Audit trail specifications
3. Data retention policies
4. Access control requirements
5. Training requirements

## Resources & Dependencies

### Internal Resources
1. Development team documentation
2. CDCR security guidelines
3. System architecture diagrams
4. API specifications
5. Test plans

### External Dependencies
1. CDCR authentication system
2. Facility management system
3. Medical records system
4. Network infrastructure
5. Hardware specifications

## Nomad Setup and Full Stack Deployment (May 2025)

### Recent Focus
- Evaluated and set up HashiCorp Nomad as an alternative to Kubernetes for local development and deployment.
- Deployed MySQL, backend, and frontend services using Docker images built and pushed via CI/CD from the Mac development environment.
- Ensured all images are runtime-configurable (e.g., backend API URL for frontend via envsubst in Nginx).

### Key Steps
1. Installed Nomad on WSL2 and configured with Docker driver.
2. Created Nomad job files for MySQL, backend, and frontend, mapping ports to avoid conflicts with Minikube.
3. Used environment variables for service configuration (e.g., VITE_API_BASE_URL for frontend, DATABASE_URL for backend).
4. Pulled images from Docker Hub after each CI/CD build.
5. Ran Prisma migrations and seed scripts inside the backend container to populate the MySQL database.
6. Fixed CORS issues by updating backend CORS config to allow requests from the Nomad frontend.

### Issues & Fixes
- **Port conflicts:** Resolved by using high, unique ports for Nomad jobs (e.g., 18888 for frontend).
- **Prisma migration hangs:** Fixed by restarting the MySQL container to clear locks.
- **CORS/network errors:** Fixed by explicitly adding the Nomad frontend's origin to backend CORS config and redeploying.
- **Docker CMD/ENTRYPOINT issues:** Overrode Nginx's ENTRYPOINT in the frontend Dockerfile to allow custom envsubst logic.
- **Envsubst replacing Nginx variables:** Used restricted envsubst invocation to only substitute custom variables.

### Outcome
- Successfully deployed and accessed the full stack via Nomad.
- Frontend and backend communicate correctly; database is seeded and operational.
- Documented all troubleshooting steps and solutions for future reference. 