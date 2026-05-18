# ExpenseIQ — Complete Deployment Guide

This guide covers every supported deployment topology for ExpenseIQ from bare-metal
single server all the way to Kubernetes. Follow only the section that matches your
target environment.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Tech Stack at a Glance](#2-tech-stack-at-a-glance)
3. [Scenario A — Single Server (App + DB on one machine)](#3-scenario-a--single-server)
4. [Scenario B — Two Servers (App Server + Separate DB Server)](#4-scenario-b--two-servers)
5. [Scenario C — Docker Compose](#5-scenario-c--docker-compose)
6. [Scenario D — Kubernetes](#6-scenario-d--kubernetes)
7. [Environment Variable Reference](#7-environment-variable-reference)
8. [Port Reference](#8-port-reference)

---

## 1. Application Overview

ExpenseIQ is a personal finance tracker with the following services:

**Frontend** — Next.js 15 (React, TypeScript, PWA-enabled)
Serves the browser UI. Runs on port 3000.

**Backend** — Node.js / Express
REST API handling auth, transactions, budgets, goals, subscriptions, bill-splits,
OCR receipt scanning (Tesseract.js), and audit logging. Runs on port 3000 internally.

**Database** — PostgreSQL 17
Stores all application data. Runs on port 5432.

**Reverse Proxy** — Nginx
Sits in front of both services on port 80. Routes `/api/*` to the backend and
everything else to the frontend.

### Request flow (all scenarios)

```
Browser
  └── Nginx :80
        ├── /api/*      ──► Express API :3000  ──► PostgreSQL :5432
        └── /*          ──► Next.js     :3000
```

---

## 2. Tech Stack at a Glance

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (React) | 15 / Next 16.2.6 |
| Backend runtime | Node.js | 22 LTS |
| Backend framework | Express | 4.x |
| OCR | Tesseract.js | latest |
| Database | PostgreSQL | 17 |
| Reverse proxy | Nginx | 1.24+ |
| Process manager (bare metal) | PM2 | 5.x |
| Container runtime | Docker | 26+ |
| Container orchestration | Kubernetes | 1.28+ |

---

## 3. Scenario A — Single Server

Everything runs on one machine: Nginx, Node.js backend, Next.js frontend, and PostgreSQL.

### Architecture

```
Single Server (e.g. Ubuntu 22.04)
├── Nginx          — port 80  (reverse proxy)
├── Node.js API    — port 3000 (Express, managed by PM2)
├── Next.js UI     — port 3001 (Next.js start, managed by PM2)
└── PostgreSQL     — port 5432 (local socket + TCP)
```

The frontend and backend both run as PM2 processes. Nginx proxies public traffic to them.

---

### Prerequisites

All of the following must be installed on the server before you begin.

#### 3.1 System packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential python3 make g++ gcc
```

`build-essential`, `python3`, `make`, `g++`, `gcc` are required by the `bcrypt` and
`tesseract.js` npm packages which compile native binaries.

#### 3.2 Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # should print v22.x.x
npm -v     # should print 10.x.x
```

#### 3.3 PM2 (process manager)

```bash
sudo npm install -g pm2
pm2 -v    # should print 5.x.x
```

PM2 keeps the Node.js processes running after you close the terminal and restarts
them automatically on server reboot.

#### 3.4 PostgreSQL 17

```bash
sudo apt install -y curl ca-certificates
sudo install -d /usr/share/postgresql-common/pgdg
curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list'

sudo apt update
sudo apt install -y postgresql-17
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Verify:

```bash
sudo systemctl status postgresql
psql --version    # should print psql (PostgreSQL) 17.x
```

#### 3.5 Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
nginx -v    # should print nginx/1.24.x or higher
```

---

### Step 1 — Create the PostgreSQL database and user

Switch to the `postgres` system user and enter the PostgreSQL shell:

```bash
sudo -u postgres psql
```

Inside the `psql` shell, run each of these lines one at a time:

```sql
CREATE USER expenseiq_user WITH PASSWORD 'your_strong_password_here';
CREATE DATABASE expense_db OWNER expenseiq_user;
GRANT ALL PRIVILEGES ON DATABASE expense_db TO expenseiq_user;
\q
```

Replace `your_strong_password_here` with a strong password. Write it down — you will
need it in the `.env` file later.

### Step 2 — Load the database schema

```bash
sudo -u postgres psql -d expense_db -f /path/to/ExpenseIQ/db/schema.sql
```

If you have not cloned the repo yet, do Step 3 first and come back here.

Verify that all tables were created:

```bash
sudo -u postgres psql -d expense_db -c "\dt"
```

You should see: `audit_logs`, `budgets`, `categories`, `goals`, `splits`,
`subscriptions`, `transactions`, `users`, `wallet_members`, `wallets`.

### Step 3 — Clone the repository

```bash
cd /opt
sudo git clone https://github.com/Sidhu1504/ExpenseIQ.git
sudo chown -R $USER:$USER /opt/ExpenseIQ
cd /opt/ExpenseIQ
```

### Step 4 — Configure the backend environment

```bash
cp /opt/ExpenseIQ/.env /opt/ExpenseIQ/backend/.env
```

Open `/opt/ExpenseIQ/backend/.env` with a text editor and set the following values:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://expenseiq_user:your_strong_password_here@localhost:5432/expense_db
JWT_SECRET=replace_with_a_random_string_minimum_32_characters
JWT_EXPIRES_IN=7d
TESSDATA_PREFIX=/opt/ExpenseIQ/backend
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output and paste it as the value of `JWT_SECRET`.

### Step 5 — Install backend dependencies

```bash
cd /opt/ExpenseIQ/backend
npm install
```

This will compile native binaries for `bcrypt` and `tesseract.js` using the
build tools you installed earlier. It may take a few minutes.

### Step 6 — Install frontend dependencies and build

```bash
cd /opt/ExpenseIQ/frontend
npm install
```

Create a frontend environment file:

```bash
cat > /opt/ExpenseIQ/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production
EOF
```

Build the Next.js production bundle:

```bash
cd /opt/ExpenseIQ/frontend
npm run build
```

This creates the optimised `.next` directory. It takes 1–3 minutes.

### Step 7 — Start both services with PM2

```bash
# Start the backend
cd /opt/ExpenseIQ/backend
pm2 start server.js --name expenseiq-backend --env production

# Start the frontend (Next.js production server)
cd /opt/ExpenseIQ/frontend
pm2 start npm --name expenseiq-frontend -- start

# Save the process list so PM2 restores them on reboot
pm2 save

# Configure PM2 to launch on system startup
pm2 startup
# Run the command that PM2 prints out (it looks like: sudo env PATH=... pm2 startup ...)
```

Verify both processes are running:

```bash
pm2 status
```

You should see `expenseiq-backend` and `expenseiq-frontend` both with status `online`.

Test the backend directly:

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"Healthy","db_time":"..."}
```

Test the frontend directly:

```bash
curl -o /dev/null -s -w "%{http_code}" http://localhost:3001
# Expected: 200
```

### Step 8 — Configure Nginx

Remove the default site and create the ExpenseIQ site:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/expenseiq
```

Paste the following (replace `your_server_ip_or_domain` with your actual IP or domain):

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server 127.0.0.1:3000;
    }

    upstream frontend {
        server 127.0.0.1:3001;
    }

    server {
        listen 80;
        server_name your_server_ip_or_domain;

        # Backend API
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
        }

        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/expenseiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9 — Verify the full stack

Open a browser and navigate to `http://your_server_ip_or_domain`.

You should see the ExpenseIQ login page. Register a new account and confirm that
login, dashboard, and transaction creation all work.

---

## 4. Scenario B — Two Servers

The database runs on a dedicated server (Server B). The application (Nginx, Node.js, Next.js) runs on a separate server (Server A). This is the most common production pattern for better resource isolation and easier database backups.

### Architecture

```
Internet
  └── Server A (App Server) — e.g. 10.0.0.10
        ├── Nginx          — port 80
        ├── Node.js API    — port 3000 (PM2)
        └── Next.js UI     — port 3001 (PM2)
              │
              │ Private network (port 5432)
              ▼
        Server B (DB Server) — e.g. 10.0.0.20
        └── PostgreSQL     — port 5432
```

Server A connects to Server B over your private network or VPC. Port 5432 on Server B
must be accessible from Server A only — never from the public internet.

---

### Server B — Database Server Setup

Do all of these steps on **Server B**.

#### Prerequisites on Server B

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates
```

#### Install PostgreSQL 17 on Server B

Follow the exact same PostgreSQL 17 installation steps from [Section 3.4](#34-postgresql-17).

#### Create the database and user

```bash
sudo -u postgres psql
```

```sql
CREATE USER expenseiq_user WITH PASSWORD 'your_strong_password_here';
CREATE DATABASE expense_db OWNER expenseiq_user;
GRANT ALL PRIVILEGES ON DATABASE expense_db TO expenseiq_user;
\q
```

#### Load the schema on Server B

Copy `db/schema.sql` from the repo to Server B (or clone the repo temporarily):

```bash
scp /path/to/ExpenseIQ/db/schema.sql user@server-b:/tmp/schema.sql
sudo -u postgres psql -d expense_db -f /tmp/schema.sql
```

#### Allow PostgreSQL to accept remote connections

By default PostgreSQL only listens on localhost. You need to change two configuration files.

**File 1: `/etc/postgresql/17/main/postgresql.conf`**

Find the line `#listen_addresses = 'localhost'` and change it to:

```
listen_addresses = '*'
```

**File 2: `/etc/postgresql/17/main/pg_hba.conf`**

Add this line at the end of the file (replace `10.0.0.10` with Server A's actual IP):

```
host    expense_db    expenseiq_user    10.0.0.10/32    scram-sha-256
```

This allows only Server A to connect to the `expense_db` database as `expenseiq_user`.

Apply the changes:

```bash
sudo systemctl restart postgresql
```

#### Firewall rule on Server B

Allow inbound connections on port 5432 from Server A only:

```bash
sudo ufw allow from 10.0.0.10 to any port 5432
sudo ufw enable
sudo ufw status
```

Replace `10.0.0.10` with Server A's actual IP address.

#### Test the connection from Server B itself

```bash
psql -U expenseiq_user -d expense_db -h 127.0.0.1 -c "SELECT NOW();"
# Should print a timestamp with no errors
```

---

### Server A — Application Server Setup

Do all of these steps on **Server A**.

#### Prerequisites on Server A

Install the same tools as Scenario A **except PostgreSQL**:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential python3 make g++ gcc
```

Install Node.js 22 LTS, PM2, and Nginx using the exact steps from
[Section 3.2](#32-nodejs-22-lts), [Section 3.3](#33-pm2-process-manager), and
[Section 3.5](#35-nginx).

#### Verify that Server A can reach Server B

```bash
nc -zv 10.0.0.20 5432
# Expected: Connection to 10.0.0.20 5432 port [tcp/postgresql] succeeded!
```

If this fails, check your firewall rules on Server B and your cloud security groups.

You can also test the actual PostgreSQL connection:

```bash
sudo apt install -y postgresql-client-17
psql -U expenseiq_user -d expense_db -h 10.0.0.20 -W
# Enter your password — you should land in the psql prompt
```

#### Clone the repository on Server A

```bash
cd /opt
sudo git clone https://github.com/Sidhu1504/ExpenseIQ.git
sudo chown -R $USER:$USER /opt/ExpenseIQ
cd /opt/ExpenseIQ
```

#### Configure the backend environment on Server A

Create `/opt/ExpenseIQ/backend/.env`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://expenseiq_user:your_strong_password_here@10.0.0.20:5432/expense_db
JWT_SECRET=replace_with_a_random_string_minimum_32_characters
JWT_EXPIRES_IN=7d
TESSDATA_PREFIX=/opt/ExpenseIQ/backend
```

Replace `10.0.0.20` with Server B's actual private IP.

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

#### Install dependencies, build frontend, start with PM2, and configure Nginx

Follow Steps 5 through 9 from [Scenario A](#step-5--install-backend-dependencies)
exactly as written. The only difference is the `DATABASE_URL` in the `.env` file
which you have already set above to point to Server B.

---

## 5. Scenario C — Docker Compose

All four services (Nginx, frontend, backend, PostgreSQL) run as Docker containers
managed by Docker Compose. This is the fastest way to get a working environment.

### Architecture

```
Host machine
└── Docker network: expenseiq_default
      ├── nginx container       — host port 80
      ├── expense_frontend      — internal port 3000
      ├── expense_backend       — internal port 3000 (host: 3001)
      └── expense_postgres      — internal port 5432
```

Containers communicate with each other by service name (e.g. `expense_backend`,
`expense_frontend`, `postgres_db`). Nginx is the only container exposed to the host
on port 80.

---

### Prerequisites

#### Install Docker Engine

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo systemctl enable docker
sudo systemctl start docker
```

Add your user to the docker group so you do not need `sudo` for every command:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version        # Docker version 26.x.x
docker compose version  # Docker Compose version v2.x.x
```

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Sidhu1504/ExpenseIQ.git
cd ExpenseIQ
```

### Step 2 — Configure the environment file

Open the `.env` file in the root of the repository:

```bash
nano .env
```

Set `HOST_IP` to the IP address of the machine you are running Docker on.
If you are testing locally, use your machine's LAN IP (`hostname -I | awk '{print $1}'`).
If this is a cloud server, use the public IP.

```env
HOST_IP=YOUR_SERVER_IP
```

### Step 3 — Build and start all containers

```bash
docker compose up --build -d
```

This command:
- Builds the backend and frontend Docker images from source
- Pulls the official PostgreSQL 17 Alpine image
- Starts all four containers
- Loads the database schema automatically on first start

Monitor startup progress:

```bash
docker compose logs -f
```

Wait until you see the backend print:
`Connected to PostgreSQL Database`
`Advanced Multi-Functional Engine running on port 3000`

### Step 4 — Verify

```bash
# Check all containers are running
docker compose ps

# Test the API health endpoint
curl http://localhost/api/health
# Expected: {"status":"Healthy","db_time":"..."}

# Check PostgreSQL has all tables
docker exec -it expense_postgres psql -U admin -d expense_db -c "\dt"
```

Open `http://YOUR_SERVER_IP` in a browser.

### Common Docker commands

```bash
# Stop all containers
docker compose down

# Stop and delete the database volume (wipes all data)
docker compose down -v

# View logs for a specific container
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres_db

# Restart a single service after a code change
docker compose up --build -d api

# Open a shell inside the backend container
docker exec -it expense_backend sh

# Open a PostgreSQL shell
docker exec -it expense_postgres psql -U admin -d expense_db
```

---

## 6. Scenario D — Kubernetes

The application runs as workloads in a Kubernetes cluster. Each component is a
separate Deployment or StatefulSet. This scenario targets a pre-existing cluster
(managed: EKS, GKE, AKS — or self-managed: kubeadm, k3s).

### Architecture

```
Internet
  └── Ingress Controller (Nginx) — LoadBalancer
        ├── /api/*     ──► expenseiq-backend-service (ClusterIP :3000)
        │                        └── 2x backend pods
        └── /*         ──► expenseiq-frontend-service (ClusterIP :3000)
                                 └── 2x frontend pods

Internal cluster network
  expenseiq-backend pods ──► expenseiq-postgres-clusterip (:5432)
                                    └── expenseiq-postgres-0 (StatefulSet pod)
                                              └── PersistentVolumeClaim (10 Gi)
```

All resources live in the `expenseiq` namespace. Secrets (passwords, JWT key) are
stored as Kubernetes Secrets, never in ConfigMaps or environment files.

### k8s directory layout

```
k8s/
├── 00-namespace.yaml          — expenseiq namespace
├── 01-secrets.yaml            — DB credentials, JWT secret
├── 02-configmap.yaml          — app config + schema SQL
├── postgres/
│   ├── statefulset.yaml       — PostgreSQL 17 StatefulSet
│   └── service.yaml           — headless + ClusterIP services
├── backend/
│   ├── deployment.yaml        — Express API (2 replicas)
│   └── service.yaml           — ClusterIP :3000
├── frontend/
│   ├── deployment.yaml        — Next.js (2 replicas)
│   └── service.yaml           — ClusterIP :3000
└── ingress.yaml               — Nginx Ingress routing
```

---

### Prerequisites (tools on your local machine or CI runner)

You do not need to manage the cluster itself. You need the following tools installed
on whatever machine you run `kubectl` from.

#### kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

Configure it to talk to your cluster:

```bash
# For managed clouds this is usually done via their CLI, e.g.:
# AWS EKS:   aws eks update-kubeconfig --name your-cluster --region us-east-1
# GKE:       gcloud container clusters get-credentials your-cluster --zone us-central1
# AKS:       az aks get-credentials --resource-group rg --name your-cluster

# Verify you can reach the cluster
kubectl cluster-info
kubectl get nodes
```

#### Docker (for building images)

Use the same Docker installation steps from [Section 5 Prerequisites](#prerequisites-1).

Docker is needed to build the backend and frontend images and push them to a container
registry so the cluster can pull them.

#### A container registry

You need somewhere to push your images. Options:

- Docker Hub: `docker.io/your-username`
- GitHub Container Registry: `ghcr.io/your-username`
- AWS ECR, Google Artifact Registry, Azure ACR

Create an account and log in:

```bash
docker login docker.io
# or
docker login ghcr.io
```

#### Nginx Ingress Controller (install once per cluster)

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml

# Wait until the controller pod is running
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Sidhu1504/ExpenseIQ.git
cd ExpenseIQ
```

### Step 2 — Build and push the backend image

```bash
docker build -t your-registry/expenseiq-backend:latest ./backend
docker push your-registry/expenseiq-backend:latest
```

Replace `your-registry` with your actual registry path, e.g. `docker.io/johndoe`.

### Step 3 — Build and push the frontend image

`NEXT_PUBLIC_API_URL` is baked into the JavaScript bundle at build time by Next.js.
You must pass it as a build argument. With the Ingress routing `/api` to the backend,
the relative path `/api` works from any domain.

First, add this line to the frontend `Dockerfile` (after the `COPY . .` line):

```dockerfile
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

Then build:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  -t your-registry/expenseiq-frontend:latest \
  ./frontend
docker push your-registry/expenseiq-frontend:latest
```

### Step 4 — Update image references in the manifests

Edit `k8s/backend/deployment.yaml` and change:

```yaml
image: expenseiq-backend:latest
```

to:

```yaml
image: your-registry/expenseiq-backend:latest
imagePullPolicy: Always
```

Edit `k8s/frontend/deployment.yaml` and change:

```yaml
image: expenseiq-frontend:latest
```

to:

```yaml
image: your-registry/expenseiq-frontend:latest
imagePullPolicy: Always
```

### Step 5 — Set real secret values

Open `k8s/01-secrets.yaml`. Every value in the `data` block must be base64-encoded.

Generate the values:

```bash
# DB password (choose a strong one)
echo -n 'your_strong_db_password' | base64

# JWT secret (minimum 32 characters)
node -e "console.log(Buffer.from(require('crypto').randomBytes(48).toString('hex')).toString('base64'))"

# Full DATABASE_URL (replace your_strong_db_password with the same password)
echo -n 'postgres://admin:your_strong_db_password@expenseiq-postgres-clusterip:5432/expense_db' | base64
```

Paste the output values into `k8s/01-secrets.yaml`:

```yaml
data:
  POSTGRES_USER: YWRtaW4=
  POSTGRES_PASSWORD: <your base64 password>
  POSTGRES_DB: ZXhwZW5zZV9kYg==
  DATABASE_URL: <your base64 DATABASE_URL>
  JWT_SECRET: <your base64 JWT secret>
```

Do not commit this file with real secrets. Use `.gitignore` or encrypt with
[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets).

### Step 6 — Set your domain in the Ingress

Open `k8s/ingress.yaml` and replace `expenseiq.example.com` with your actual domain:

```yaml
rules:
  - host: yourapp.yourdomain.com
```

If you do not have a domain and just want to test with an IP address, remove the
`host:` line entirely and the Ingress will match all hostnames.

After applying the manifests, point your domain's DNS A record to the Ingress
Controller's external IP.

### Step 7 — Apply all manifests

Apply in order. Kubernetes handles dependency ordering via the init container and
readiness probes, but applying the namespace and secrets first avoids lookup errors.

```bash
# 1. Namespace
kubectl apply -f k8s/00-namespace.yaml

# 2. Secrets and config
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-configmap.yaml

# 3. Database — wait for it to be ready before proceeding
kubectl apply -f k8s/postgres/
kubectl rollout status statefulset/expenseiq-postgres -n expenseiq

# 4. Backend
kubectl apply -f k8s/backend/
kubectl rollout status deployment/expenseiq-backend -n expenseiq

# 5. Frontend
kubectl apply -f k8s/frontend/
kubectl rollout status deployment/expenseiq-frontend -n expenseiq

# 6. Ingress (last — all backend services must exist)
kubectl apply -f k8s/ingress.yaml
```

### Step 8 — Get the Ingress external IP and verify

```bash
kubectl get ingress -n expenseiq
# NAME                 CLASS   HOSTS                    ADDRESS         PORTS
# expenseiq-ingress    nginx   yourapp.yourdomain.com   203.0.113.10    80
```

Update your DNS A record to point `yourapp.yourdomain.com` at the ADDRESS shown above.

Then verify:

```bash
curl http://yourapp.yourdomain.com/api/health
# Expected: {"status":"Healthy","db_time":"..."}
```

Open the domain in a browser to see the login page.

### Useful kubectl commands

```bash
# Watch all pods in the expenseiq namespace
kubectl get pods -n expenseiq -w

# View backend logs
kubectl logs -n expenseiq -l app=expenseiq-backend --tail=50 -f

# View frontend logs
kubectl logs -n expenseiq -l app=expenseiq-frontend --tail=50 -f

# View Postgres logs
kubectl logs -n expenseiq expenseiq-postgres-0 --tail=50 -f

# Describe a pod that is stuck (ImagePullBackOff, CrashLoopBackOff etc.)
kubectl describe pod -n expenseiq <pod-name>

# Open a shell inside a running backend pod
kubectl exec -it -n expenseiq deployment/expenseiq-backend -- sh

# Open a psql shell on the database pod
kubectl exec -it -n expenseiq expenseiq-postgres-0 -- \
  psql -U admin -d expense_db

# List all tables (run inside psql shell above)
\dt

# Restart the backend deployment (e.g. after pushing a new image)
kubectl rollout restart deployment/expenseiq-backend -n expenseiq

# Delete everything and start fresh (WARNING: deletes all data)
kubectl delete namespace expenseiq
```

---

## 7. Environment Variable Reference

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NODE_ENV` | Yes | Runtime mode | `production` |
| `PORT` | Yes | Port the Express server listens on | `3000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens. Min 32 chars. | `random-hex-string` |
| `JWT_EXPIRES_IN` | No | Token expiry duration | `7d` |
| `TESSDATA_PREFIX` | Yes | Path where Tesseract language data is stored | `/opt/ExpenseIQ/backend` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for API calls. Use `/api` when Nginx or Ingress proxies the path. | `/api` |
| `NODE_ENV` | No | Next.js runtime mode | `production` |
| `ALLOWED_DEV_IP` | Dev only | IP allowed for hot-reload in dev mode | `192.168.1.10` |

---

## 8. Port Reference

| Service | Internal port | External port | Notes |
|---|---|---|---|
| Nginx | 80 | 80 | Public entry point |
| Next.js frontend | 3000 | 3001 (bare metal) | Behind Nginx |
| Express backend | 3000 | 3001 (Docker) | Behind Nginx |
| PostgreSQL | 5432 | 5432 | Never exposed publicly |

In Docker Compose the backend is mapped to host port `3001` to avoid conflict with
the frontend on `3000`. In bare-metal Scenario A the frontend is started on `3001`
via `PORT=3001 npm start`. In Kubernetes everything is internal — only the Ingress
exposes traffic on port 80.
