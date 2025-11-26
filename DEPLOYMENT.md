# Deployment to Coolify

## Prerequisites
- Coolify instance with PostgreSQL service
- Steam API key

## Steps

1. **Create PostgreSQL Database in Coolify**
   - Service name: `aoe2-postgres`
   - Database: `aoe2gameplan`
   - Note the connection URL

2. **Create Application in Coolify**
   - Type: Docker
   - Repository: (your git repo URL)
   - Build method: Dockerfile
   - Port: 3000

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@aoe2-postgres:5432/aoe2gameplan
   NEXTAUTH_SECRET=(generate with: openssl rand -base64 32)
   NEXTAUTH_URL=https://your-domain.com
   STEAM_API_KEY=your_steam_api_key_here
   ```

4. **Deploy**
   - Coolify will build and deploy automatically
   - Run migrations: `npx prisma migrate deploy`
   - Verify deployment at your domain

## Post-Deployment

- Test authentication with Steam
- Create a test build order
- Verify public build orders are visible

## Troubleshooting

- Check logs: Coolify dashboard → Application → Logs
- Database connection: Verify DATABASE_URL is correct
- Prisma Client: Ensure `npx prisma generate` ran during build
