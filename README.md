# AoE2 Gameplan Maker

An interactive web application for creating, sharing, and following Age of Empires 2: Definitive Edition build orders and strategies.

## Features

- 🏗️ **Interactive Build Order Creator** - Design build orders with step-by-step timing and resource tracking
- 👀 **Build Order Viewer** - Follow build orders with timer mode and step navigation
- 🔐 **Steam Authentication** - Sign in with your Steam account
- 📚 **Community Library** - Browse and share public build orders
- 📊 **Player Stats Integration** (Coming Soon) - Sync your AoE2.net stats
- 🎯 **Strategy Library** (Coming Soon) - Link build orders into comprehensive strategies

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Steam OAuth
- **UI**: TailwindCSS + shadcn/ui
- **Validation**: Zod
- **Deployment**: Docker + Coolify

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Steam API Key (optional, for authentication)

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd aoe2gameplan
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your database credentials and API keys

4. Set up database
   ```bash
   npx prisma migrate dev
   npx prisma db seed  # Optional: add sample data
   ```

5. Run development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Development

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.ts
```

### Build

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions using Coolify.

### Quick Deploy with Docker

```bash
docker build -t aoe2gameplan .
docker run -p 3000:3000 --env-file .env.local aoe2gameplan
```

## Project Structure

```
aoe2gameplan/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   ├── build-orders/         # Build order pages
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx
│   └── build-order-form.tsx
├── lib/                      # Utility functions
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth config
│   └── validations/          # Zod schemas
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
├── docs/                     # Documentation
│   └── plans/                # Design and implementation plans
└── public/                   # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [x] Phase 1: MVP (Build order CRUD, viewer, basic editor)
- [ ] Phase 2: Data Integration (AoE2.net API, player stats)
- [ ] Phase 3: Interactive Features (Drag-and-drop, resource calculations)
- [ ] Phase 4: Community Features (Strategies, search, ratings)
- [ ] Phase 5: Polish (Mobile optimization, performance tuning)

## License

MIT

## Acknowledgments

- Age of Empires 2 community
- [AoE2.net](https://aoe2.net) for player statistics API
- [Siege Engineers](https://github.com/SiegeEngineers) for game data
