# Project Notes for Claude

## Deployment

Server: Hostinger VPS (KVM 2: 2 vCPU, 8GB RAM, 100GB NVMe)
- SSH alias: `hostinger` (configured in ~/.ssh/config)
- IP: 76.13.128.67
- User: root
- SSH key: ~/.ssh/hostinger_portfolio
- Project path: /var/www/portfolio

### Option 1: PM2 (current)
Process manager: PM2 (app name: portfolio)

```bash
ssh hostinger "cd /var/www/portfolio && git pull origin master && npm run build && pm2 restart portfolio"
```

### Option 2: Docker (recommended for multiple projects)
```bash
# First time setup on server:
ssh hostinger "cd /var/www/portfolio && chmod +x docker/deploy.sh"

# Deploy with Docker:
ssh hostinger "cd /var/www/portfolio && git pull && ./docker/deploy.sh update"

# Other commands:
ssh hostinger "cd /var/www/portfolio && ./docker/deploy.sh logs"
ssh hostinger "cd /var/www/portfolio && ./docker/deploy.sh status"
```

### Standalone build notes:
- PM2 runs `node .next/standalone/server.js` (not `npm start`)
- Uploads are served via API route `/api/uploads/[...path]` to bypass static file caching
- `scripts/setup-uploads.mjs` copies static files and creates symlink for uploads

## Database
- PostgreSQL on Supabase (aws-1-eu-north-1.pooler.supabase.com)
- Prisma ORM with config at `prisma.config.ts`

## Docker Setup on Server

### Install Docker (one time):
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Switch from PM2 to Docker:
```bash
pm2 stop portfolio
pm2 delete portfolio
cd /var/www/portfolio
cp .env.local .env  # Docker uses .env
docker compose up -d
```

### Adding new projects:
Each project gets its own port (3001, 3002, etc.)
Nginx proxies domains to containers
