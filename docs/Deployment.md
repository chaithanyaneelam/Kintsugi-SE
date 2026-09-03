# Production Deployment & CI/CD Guide

This guide details how to build Docker container images and set up the Jenkins CI/CD pipeline for **Kintsugi** ([chaithanyaneelam/Kintsugi-SE](https://github.com/chaithanyaneelam/Kintsugi-SE/)).

---

## Production Prerequisites

- **Server Spec**: 2+ vCPU, 4GB+ RAM, Ubuntu 22.04 LTS (or Windows Server with WSL2/Docker Desktop)
- **Runtimes**: Docker 24+, Docker Compose v2+
- **CI/CD Automation**: Jenkins 2.400+ with Docker Pipeline plugin installed

---

## 🐳 Docker Containerization

Kintsugi microservices are containerized into production-grade multi-stage Docker images:

1. **Backend Service (`backend/Dockerfile`)**:
   - Built on `python:3.11-slim`.
   - Runs FastAPI server (Uvicorn) and Celery background task worker on port `8000`.

2. **Web Frontend Service (`web/Dockerfile`)**:
   - Multi-stage build (Node.js 20 build stage -> Nginx alpine runtime stage).
   - High-performance web serving with Gzip compression and SPA route fallback on port `80`.

### Building Docker Images Locally

```bash
# Build Backend Image
docker build -t chaithanyaneelam/kintsugi-backend:latest ./backend

# Build Web Frontend Image
docker build -t chaithanyaneelam/kintsugi-web:latest ./web
```

### Running the Full Microservices Stack

```bash
# Launch development / standard stack
docker compose up -d --build

# Launch production stack
docker compose -f docker-compose.prod.yml up -d --build
```

### Stack Verification

```bash
# Check container status
docker compose ps

# Backend Health Check
curl http://localhost:8000/health

# Web Frontend Access
curl http://localhost:8080/
```

---

## ⚙️ Jenkins CI/CD Pipeline (`Jenkinsfile`)

The repository includes a declarative `Jenkinsfile` for automated building, testing, image publishing, and deployment.

### Pipeline Stages

1. **Checkout Source**: Fetches source code from `chaithanyaneelam/Kintsugi-SE`.
2. **Lint & Quality Verification**: Parallel verification of Python backend (`pytest`) and React frontend (`npm run build`).
3. **Build Docker Images**: Constructs tag-versioned container images (`${BUILD_NUMBER}` and `latest`).
4. **Validate Compose Configuration**: Validates `docker-compose.prod.yml` syntax.
5. **Push Docker Images**: Authenticates and pushes images to Docker Hub (`docker-hub-credentials`).
6. **Deploy Stack**: Executes zero-downtime deployment using `docker compose -f docker-compose.prod.yml up -d`.
7. **Post Cleanup**: Automatically prunes dangling images and notifies build status.

### Configuring Jenkins Pipeline Job

1. Open Jenkins Dashboard -> **New Item**.
2. Select **Pipeline**, set name `Kintsugi-SE-Pipeline`, click **OK**.
3. Under **Definition**, select **Pipeline script from SCM**.
4. Set **SCM** to `Git`.
5. Set **Repository URL** to `https://github.com/chaithanyaneelam/Kintsugi-SE.git`.
6. Set **Script Path** to `Jenkinsfile`.
7. Add **Credentials** in Jenkins for Docker Hub:
   - ID: `docker-hub-credentials`
   - Type: Username with password (Docker Hub username and Access Token/Password).
8. Click **Save** and trigger **Build Now**.
