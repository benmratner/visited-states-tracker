# Docker Setup Guide

There are two ways to run this application with Docker:

## Option 1: Using Dockerfile (Recommended for Production)

This builds a proper Docker image with all dependencies baked in.

### Setup Steps:

1. Copy all files to your server at `/mnt/main_pool/docker/visited-states-tracker/`

2. Create the data directory:
```bash
mkdir -p /mnt/main_pool/docker/visited-states-tracker/data
```

3. Build and start the container:
```bash
cd /mnt/main_pool/docker/visited-states-tracker
docker-compose up -d --build
```

### File Structure:
```
/mnt/main_pool/docker/visited-states-tracker/
├── server.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── public/
│   ├── index.html
│   └── state_paths.js
└── data/                      # Volume mounted - persistent storage
    └── state-tracker.db       # Created automatically
```

**Pros:**
- Faster container startup
- Dependencies installed once during build
- Production-ready setup
- Smaller attack surface

**Cons:**
- Need to rebuild image if you change code
- Slightly more complex initial setup

---

## Option 2: Using Bind Mount (Easier for Development)

This mounts your entire app directory and installs dependencies on startup.

### Setup Steps:

1. Copy all files to your server at `/mnt/main_pool/docker/visited-states-tracker/`

2. Start the container using the alternative compose file:
```bash
cd /mnt/main_pool/docker/visited-states-tracker
docker-compose -f docker-compose-bindmount.yml up -d
```

### File Structure:
```
/mnt/main_pool/docker/visited-states-tracker/
├── server.js
├── package.json
├── docker-compose-bindmount.yml
├── public/
│   ├── index.html
│   └── state_paths.js
├── data/                      # Created automatically
│   └── state-tracker.db       # Database file
└── node_modules/              # Created by container
```

**Pros:**
- Edit files directly on the host
- No rebuild needed for code changes
- Easier to debug and develop

**Cons:**
- Slower startup (installs dependencies each time)
- Larger directory footprint
- node_modules created on host

---

## Common Commands

### View logs:
```bash
docker-compose logs -f visited-states-tracker
```

### Stop container:
```bash
docker-compose down
```

### Restart container:
```bash
docker-compose restart
```

### Check container status:
```bash
docker ps | grep visited-states-tracker
```

### Access container shell:
```bash
docker exec -it visited-states-tracker sh
```

---

## Accessing the Application

Once running, access the app at:
```
http://YOUR_SERVER_IP:4001
```

Or if running locally:
```
http://localhost:4001
```

---

## Database Backup

The database is stored at:
- **Option 1**: `/mnt/main_pool/docker/visited-states-tracker/data/state-tracker.db`
- **Option 2**: `/mnt/main_pool/docker/visited-states-tracker/data/state-tracker.db`

To backup:
```bash
cp /mnt/main_pool/docker/visited-states-tracker/data/state-tracker.db ~/backup-$(date +%Y%m%d).db
```

---

## Troubleshooting

### Container won't start:
```bash
docker-compose logs visited-states-tracker
```

### Permission issues:
```bash
sudo chown -R 1000:1000 /mnt/main_pool/docker/visited-states-tracker/data
```

### Port already in use:
Change the port mapping in docker-compose.yml:
```yaml
ports:
  - "4002:4001"  # Use 4002 instead
```

### Database not persisting:
Make sure the data directory exists and has proper permissions:
```bash
mkdir -p /mnt/main_pool/docker/visited-states-tracker/data
chmod 755 /mnt/main_pool/docker/visited-states-tracker/data
```

---

## Updating the Application

### Option 1 (Dockerfile):
```bash
cd /mnt/main_pool/docker/visited-states-tracker
docker-compose down
# Update files
docker-compose up -d --build
```

### Option 2 (Bind Mount):
```bash
# Just edit files directly, then restart:
docker-compose restart
```

---

## Environment Variables

You can customize the port by editing the docker-compose.yml:

```yaml
environment:
  - NODE_ENV=production
  - PORT=4001  # Change this to use a different port
```

Note: If you change PORT, also update the ports mapping:
```yaml
ports:
  - "4001:4001"  # host:container - keep them matching
```
