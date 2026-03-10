# Prisma Migrations

This directory contains Prisma database migrations.

## Running Migrations

```bash
# Apply migrations
npx prisma migrate deploy

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client
npx prisma generate
```

## Database Setup

1. Start PostgreSQL (via Docker Compose):
   ```bash
   docker-compose up -d postgres
   ```

2. Apply migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. Seed database (optional):
   ```bash
   npx prisma db seed
   ```

## Migration Workflow

- Always create migrations in development using `prisma migrate dev`
- Never manually edit migration files
- Review migration SQL before committing
- Test migrations on dev database first
- Apply to staging before production

## Viewing Database

```bash
# Open Prisma Studio
npx prisma studio
```

This will open a web UI where you can view and edit your database.
