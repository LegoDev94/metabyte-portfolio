# Project Notes for Claude

## Deployment

Server: Hostinger VPS
- SSH alias: `hostinger` (configured in ~/.ssh/config)
- IP: 76.13.128.67
- User: root
- SSH key: ~/.ssh/hostinger_portfolio
- Project path: /var/www/portfolio
- Process manager: PM2 (app name: portfolio)

### Deploy command:
```bash
ssh hostinger "cd /var/www/portfolio && git pull origin master && npm run build && pm2 restart portfolio"
```

### Standalone build notes:
- PM2 runs `node .next/standalone/server.js` (not `npm start`)
- Uploads are served via API route `/api/uploads/[...path]` to bypass static file caching
- `scripts/setup-uploads.mjs` copies static files and creates symlink for uploads

## Database
- PostgreSQL on the same server
- Prisma ORM with config at `prisma.config.ts`
