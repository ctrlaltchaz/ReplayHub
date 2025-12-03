# Docker Deployment Guide

This guide explains how to deploy ReplayHub using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- A domain name (for production deployment with Caddy)

## Configuration

### 1. Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set the following variables:

- `DB_USER` - PostgreSQL database username
- `DB_PASSWORD` - PostgreSQL database password (use a strong password)
- `DB_NAME` - PostgreSQL database name
- `JWT_SECRET` - Secret key for JWT tokens (generate a long random string)
- `SESSION_SECRET` - Secret key for sessions (generate a long random string)
- `NEXT_PUBLIC_API_URL` - Public URL for the API (e.g., `https://api.yourdomain.com`)
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `COOKIE_DOMAIN` - Domain for cookies (e.g., `.yourdomain.com`)

### 2. Caddyfile Configuration

Edit the `Caddyfile` and replace `yourdomain.com` with your actual domain:

```caddyfile
yourdomain.com {
    reverse_proxy web:3000
    encode gzip
}

api.yourdomain.com {
    reverse_proxy api:3000
    encode gzip
}
```

## Deployment

### Build and Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This command will:
1. Build the API and Web Docker images
2. Start PostgreSQL and Redis services
3. Run database migrations automatically
4. Start the API and Web services
5. Start Caddy as a reverse proxy with automatic SSL

### View Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
```

### Stop Services

```bash
docker-compose -f docker-compose.prod.yml down
```

### Stop Services and Remove Volumes

⚠️ **Warning**: This will delete all data including the database!

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Service Architecture

The deployment consists of the following services:

- **db** - PostgreSQL 16 database
- **redis** - Redis 7 for session storage (available but not yet configured in the API)
- **api** - NestJS backend API (port 3000 internal)
- **web** - Next.js frontend (port 3000 internal)
- **caddy** - Caddy reverse proxy with automatic SSL (ports 80, 443)

## Database Migrations

Database migrations run automatically when the API container starts. The Dockerfile includes:

```dockerfile
CMD ["sh", "-c", "npm run migration:run && node dist/main"]
```

This ensures migrations are applied before the API starts.

## Volumes

The following persistent volumes are created:

- `postgres_data` - PostgreSQL database files
- `redis_data` - Redis persistence
- `api_data` - API uploaded files and assets
- `caddy_data` - Caddy SSL certificates
- `caddy_config` - Caddy configuration

## Coolify Deployment

To deploy with Coolify:

1. Create a new project in Coolify
2. Connect your Git repository
3. Select "Docker Compose" as the deployment method
4. Point to `docker-compose.prod.yml`
5. Set the environment variables in Coolify's UI
6. Deploy!

Coolify will handle the build and deployment process automatically.

## Troubleshooting

### API Container Won't Start

Check the logs:
```bash
docker-compose -f docker-compose.prod.yml logs api
```

Common issues:
- Database connection failed: Ensure DB credentials are correct
- Migration failed: Check database schema and migration files

### Web Container Won't Build

The web container requires `NEXT_PUBLIC_API_URL` to be set during build time. Ensure it's set in your environment file.

### SSL/HTTPS Issues

Caddy automatically provisions SSL certificates via Let's Encrypt. Ensure:
- Your domain DNS is correctly pointed to your server
- Ports 80 and 443 are open and accessible from the internet
- The domain is correctly configured in the Caddyfile

### Sessions Not Persisting

Currently, sessions use in-memory storage. To enable Redis session storage, you would need to:
1. Configure connect-redis in `apps/api/src/main.ts`
2. Update the session middleware to use Redis store

## Production Checklist

- [ ] Set strong passwords for `DB_PASSWORD`, `JWT_SECRET`, and `SESSION_SECRET`
- [ ] Update `Caddyfile` with your actual domain name
- [ ] Configure DNS records to point to your server
- [ ] Set `CORS_ORIGINS` to only include your actual domains
- [ ] Set `COOKIE_DOMAIN` to your domain
- [ ] Review and adjust `FORCE_SECURE_COOKIES` setting
- [ ] Set up regular database backups
- [ ] Monitor container resource usage
- [ ] Set up log aggregation and monitoring

## Backup and Restore

### Backup Database

```bash
docker-compose -f docker-compose.prod.yml exec db pg_dump -U ${DB_USER} ${DB_NAME} > backup.sql
```

### Restore Database

```bash
docker-compose -f docker-compose.prod.yml exec -T db psql -U ${DB_USER} ${DB_NAME} < backup.sql
```

## Updates and Maintenance

To update the application:

```bash
# Pull latest code
git pull

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml up -d --build

# Migrations will run automatically on API restart
```
