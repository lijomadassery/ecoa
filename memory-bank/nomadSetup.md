# Nomad Setup and Full Stack Deployment Guide

## Overview
This document details the process of setting up HashiCorp Nomad on WSL2, deploying a full stack (MySQL, backend, frontend), and troubleshooting common issues encountered during the process. The goal was to evaluate Nomad as an alternative to Kubernetes for local development, using runtime-configurable Docker images built and pushed from a Mac development environment.

---

## 1. Nomad Installation and Configuration
- Installed Nomad on WSL2 (Ubuntu) and configured it to use the Docker driver.
- Used systemd to run Nomad as a service, with `bind_addr = "0.0.0.0"` for accessibility.
- Ensured Docker was running and accessible from WSL2.

---

## 2. Job Files and Image Configuration
### MySQL Job
- Used the official `mysql:8` image.
- Mapped host port 3307 to container port 3306 to avoid conflicts.
- Set environment variables for DB name, user, and password.

### Backend Job
- Used `lijomadassery/backend:latest` image built and pushed via CI/CD.
- Set `DATABASE_URL` to match the running MySQL instance (e.g., `mysql://Admin:@Admin002@192.168.127.2:3307/camu_ecoa_db`).
- Exposed backend on a unique port (e.g., 4001).

### Frontend Job
- Used `lijomadassery/frontend:latest` image with runtime-configurable backend API URL.
- Set `VITE_API_BASE_URL` to the backend's address (e.g., `http://192.168.127.2:4001`).
- Used envsubst in the Dockerfile to inject the API URL into the Nginx config at container startup.
- Exposed frontend on a high, unique port (e.g., 18888) to avoid conflicts with Minikube.

---

## 3. Running Prisma Migrations and Seeding the Database
- Ran migrations and seed scripts inside a temporary backend container:
  ```bash
  docker run --rm \
    -e DATABASE_URL="mysql://Admin:@Admin002@192.168.127.2:3307/camu_ecoa_db" \
    lijomadassery/backend:latest \
    sh -c "npx prisma migrate deploy && npx prisma db seed"
  ```
- If migrations hung, restarting the MySQL container resolved the issue.

---

## 4. CORS and Network Troubleshooting
- Initial login attempts from the frontend failed with Axios `ERR_NETWORK` due to missing CORS headers.
- Fixed by adding the Nomad frontend's origin (e.g., `http://192.168.127.2:18888`) to the backend's CORS config and redeploying the backend image.
- Confirmed CORS headers in `/api/health` response.

---

## 5. Dockerfile Adjustments for Frontend
- Overrode the default Nginx ENTRYPOINT with `ENTRYPOINT []` to allow a custom CMD.
- Used restricted envsubst invocation to only substitute `$VITE_API_BASE_URL`:
  ```dockerfile
  CMD ["/bin/sh", "-c", "envsubst '$VITE_API_BASE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
  ```
- Ensured all other Nginx variables (e.g., `$host`) were preserved in the config.

---

## 6. Port Conflicts and Solutions
- Encountered repeated port binding errors ("can't bind on the specified endpoint") when ports were already in use or not properly released.
- Resolved by:
  - Using high, unique ports for Nomad jobs (e.g., 18888 for frontend).
  - Pruning exited Docker containers with `docker container prune`.
  - Restarting Nomad jobs after freeing ports.

---

## 7. Outcome
- Successfully deployed and accessed the full stack via Nomad.
- Frontend and backend communicate correctly; database is seeded and operational.
- All troubleshooting steps and solutions are documented for future reference. 