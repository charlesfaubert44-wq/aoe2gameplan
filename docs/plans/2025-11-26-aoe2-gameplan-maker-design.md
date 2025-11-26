# AoE2 Interactive Gameplan Maker - Design Document

**Date:** 2025-11-26
**Status:** Approved
**Version:** 1.0

## Executive Summary

An interactive web application for Age of Empires 2: Definitive Edition players to create, share, and follow build orders and strategies. The platform integrates live player statistics from AoE2.net and current game balance data to provide a comprehensive strategic planning tool for players of all skill levels.

## Goals

1. **Enable build order creation** with intuitive drag-and-drop interface and timing calculations
2. **Integrate live player data** from Steam/AoE2.net for personalized recommendations
3. **Build community platform** for sharing and discovering strategies
4. **Provide interactive viewer** for following build orders during gameplay
5. **Support all skill levels** from learning players to content creators

## Target Users

- **Learning players**: Follow step-by-step build orders with timings
- **Intermediate players**: Create and tweak build orders for their playstyle
- **Content creators/coaches**: Share detailed strategies with community
- **Competitive players**: Analyze and optimize build orders with precise timings

## Technical Architecture

### Stack Selection

**Frontend + Backend:** Next.js 15 (App Router)
- React Server Components for performance
- Server Actions for mutations
- TypeScript for type safety
- TailwindCSS + shadcn/ui for UI

**Database:** PostgreSQL with Prisma ORM
- Type-safe database access
- Schema migrations
- Edge-ready queries

**Authentication:** NextAuth.js
- Steam OpenID OAuth
- Optional email/password
- JWT sessions

**External APIs:**
- AoE2.net API (player stats, match history)
- AoE2 game data (civilizations, units, technologies)

**Deployment:** Coolify + Docker
- Single Next.js container
- PostgreSQL sidecar
- Environment-based configuration

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         Frontend (React/Next.js)        │
│  - Build Order Editor (Interactive)     │
│  - Strategy Browser                     │
│  - Player Dashboard                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      API Layer (Next.js API Routes)     │
│  - CRUD Operations                      │
│  - Server Actions                       │
│  - Rate Limiting                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Data Layer (Prisma + Postgres)    │
│  - Build Orders                         │
│  - Users & Auth                         │
│  - Cached Game Data                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      External Integration Layer         │
│  - AoE2.net API Client                  │
│  - Game Data Sync (Background Jobs)     │
│  - Rate Limiting & Caching              │
└─────────────────────────────────────────┘
```

## Database Schema

### Core Entities

**User**
```typescript
{
  id: string (UUID)
  steamId?: string
  username: string
  email: string
  avatar?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**BuildOrder**
```typescript
{
  id: string (UUID)
  title: string
  description: string
  civilization: string
  mapType: string[]
  steps: BuildOrderStep[]
  authorId: string
  isPublic: boolean
  views: int
  likes: int
  createdAt: DateTime
  updatedAt: DateTime
}
```

**BuildOrderStep**
```typescript
{
  id: string (UUID)
  order: int
  timeMinutes: int
  timeSeconds: int
  villagerCount: int
  action: string
  description: string
  resources: Json // { wood, food, gold, stone }
  buildOrderId: string
}
```

**Strategy**
```typescript
{
  id: string (UUID)
  title: string
  description: string (markdown)
  civilization: string
  buildOrderIds: string[]
  counters: string[] // civs this strategy counters
  authorId: string
  isPublic: boolean
  tags: string[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

**PlayerStats**
```typescript
{
  id: string (UUID)
  userId: string
  steamId: string
  rating: int
  wins: int
  losses: int
  favoriteCivilization: string
  lastSynced: DateTime
}
```

**GameData**
```typescript
{
  id: string
  version: string // game version
  civilizations: Json
  units: Json
  buildings: Json
  technologies: Json
  lastUpdated: DateTime
}
```

### Relationships

- User → BuildOrders (one-to-many)
- User → Strategies (one-to-many)
- User → PlayerStats (one-to-one)
- BuildOrder → BuildOrderSteps (one-to-many)
- Strategy → BuildOrders (many-to-many)

## Key Features

### 1. Build Order Creator (Interactive Editor)

**Components:**
- Step-by-step builder with timing calculator
- Drag-and-drop reordering of steps
- Auto-calculation of villager distribution
- Real-time resource accumulation preview
- Template library (Fast Castle, Scouts Rush, etc.)
- Validation warnings for impossible timings

**User Flow:**
1. Select civilization and map type
2. Choose template or start from scratch
3. Add steps with actions, timings, villager counts
4. Preview economy breakdown and resource flow
5. Validate and save (private or public)
6. Share link with community

**Technical Implementation:**
- React DnD or dnd-kit for drag-and-drop
- Zustand or React Context for editor state
- Server Actions for persistence
- Zod validation for step data

### 2. Build Order Viewer

**Viewing Modes:**
- **Read Mode**: Clean, printable view with all steps
- **Timer Mode**: Interactive step-through with click/keyboard nav
- **Overlay Mode** (future): Second monitor display during gameplay

**Features:**
- Visual/audio cues for step transitions
- Progress tracking
- Resource graphs
- Mobile-responsive design

**Sharing:**
- Unique shareable URLs
- Open Graph meta tags for social previews
- Embed code for Discord/forums

### 3. Strategy Library

**Discovery:**
- Browse public strategies
- Filter by civilization, map type, playstyle
- Search by keywords
- Sort by popularity, rating, date

**Strategy Pages:**
- Markdown-rendered description
- Linked build orders
- Matchup guides ("vs. Knights", "vs. Archers")
- Comments and ratings
- Author profile link

**Personalization:**
- Recommended strategies based on player stats
- "Strategies that work at your ELO"
- Most-played civilization suggestions

### 4. Player Dashboard

**Profile Integration:**
- Steam OAuth login
- Import AoE2.net profile
- Display rating, win/loss, recent matches

**Personal Library:**
- Created build orders (private & public)
- Bookmarked strategies
- Practice history tracking

**Analytics:**
- Most-used civilizations
- Win rate by strategy
- Suggested improvements

### 5. Community Features

**Public Library:**
- Browse all public build orders
- Top creators leaderboard
- Trending strategies

**Social:**
- Like/bookmark build orders
- User profiles with contributed content
- Following system (future)
- Comments and discussions

## External API Integration

### AoE2.net API

**Endpoints Used:**
- `GET /player/{steam_id}` - Player profile and stats
- `GET /player/{steam_id}/matches` - Recent match history
- `GET /leaderboard` - Current rankings

**Rate Limiting:**
- 1 request per second
- Implement exponential backoff
- Cache responses for 15 minutes

**Error Handling:**
- Graceful degradation with cached data
- User-friendly error messages
- Retry logic with exponential backoff

### AoE2 Game Data

**Data Sources:**
- Static JSON from community repos (SiegeEngineers)
- Manual extraction from game files
- Community-maintained tech trees

**Update Strategy:**
- Background job checks weekly for updates
- Manual updates on DLC releases
- Version tracking in database

**Data Cached:**
- All 42+ civilizations with bonuses
- 100+ units with stats
- 50+ buildings with costs/timings
- 100+ technologies with effects

### Caching Strategy

**Server-Side:**
- Next.js `unstable_cache` for game data (long TTL: 7 days)
- Database cache for player stats (15-min TTL)

**Client-Side:**
- React Query for user-specific data
- Optimistic updates on mutations
- Background refetching

**Optional Redis (Phase 2):**
- External API response caching
- Session storage
- Rate limiting counters

## Error Handling & Validation

### External API Failures

**Strategy:**
- Show cached data with "Last updated X minutes ago"
- Retry with exponential backoff (1s, 2s, 4s, 8s)
- Fallback to graceful degradation
- Clear error messages: "Unable to fetch latest stats"

### Data Validation

**Server-Side (Zod):**
```typescript
BuildOrderStepSchema = z.object({
  order: z.number().int().positive(),
  timeMinutes: z.number().int().min(0).max(60),
  timeSeconds: z.number().int().min(0).max(59),
  villagerCount: z.number().int().min(0).max(200),
  action: z.string().min(1).max(200),
  description: z.string().max(1000),
  resources: z.object({
    wood: z.number().int().min(0),
    food: z.number().int().min(0),
    gold: z.number().int().min(0),
    stone: z.number().int().min(0),
  }),
})
```

**Client-Side:**
- React Hook Form with Zod resolver
- Real-time validation feedback
- Prevent invalid submissions

### Build Order Validation

**Rules:**
- Villager count cannot be negative
- Resources must accumulate realistically
- Timings must be chronological
- Warn (don't block) on unconventional timings

### Rate Limiting

**Per-User Limits:**
- Build order creation: 100/day
- Strategy creation: 20/day
- API requests: 60/minute

**IP-Based Limits:**
- Public endpoints: 100/minute
- Auth endpoints: 10/minute

## Security Considerations

**Authentication:**
- JWT tokens with secure httpOnly cookies
- CSRF protection via Next.js middleware
- Steam OAuth validation

**Authorization:**
- User can only edit own build orders
- Public/private visibility controls
- Admin role for moderation

**Data Protection:**
- Environment variables for secrets
- API keys stored in .env.local (never committed)
- Database credentials via Coolify secrets
- Input sanitization on all user content

**Rate Limiting:**
- Prevent API abuse
- DDoS protection via Coolify/Nginx
- Per-user and per-IP limits

## Testing Strategy

### Unit Tests (Vitest)

**Coverage:**
- Timing calculation utilities
- Resource accumulation logic
- Zod schema validation
- API client functions (mocked)

**Example:**
```typescript
test('calculates villager distribution correctly', () => {
  const steps = [...buildOrderSteps]
  const distribution = calculateVillagerDistribution(steps)
  expect(distribution.wood).toBe(8)
  expect(distribution.food).toBe(15)
})
```

### Integration Tests (Playwright)

**Scenarios:**
- Build order creation flow end-to-end
- Authentication with Steam OAuth (mocked)
- Public build order browsing and filtering
- Strategy linking multiple build orders

### E2E Tests (Playwright)

**Critical Paths:**
1. Create account → Create build order → Share link → View as guest
2. Browse strategies → Filter by civ → View build order → Follow steps
3. Login → Sync Steam stats → Get recommendations

**Mobile Testing:**
- Responsive design on tablet/mobile
- Touch interactions for step navigation

### Manual Testing

**User Acceptance:**
- Test with actual AoE2 players
- Verify build order timings match in-game reality
- UX validation for editor usability

## Performance Optimization

**Frontend:**
- Code splitting per route
- Image optimization with Next.js Image
- Lazy loading for build order lists
- React Server Components for static content

**Backend:**
- Database query optimization with Prisma
- Eager loading for related entities
- Connection pooling
- Index optimization on frequent queries

**Caching:**
- Static generation for public build order pages
- Revalidation on mutation
- CDN for static assets (future)

**Monitoring:**
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics alternative)
- Database query performance logs

## Deployment

**Docker Configuration:**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
# Build Next.js app
FROM node:20-alpine AS runner
# Production runtime
```

**Coolify Setup:**
- Single Next.js service
- PostgreSQL database service
- Environment variables via Coolify UI
- Automatic SSL via Coolify
- Zero-downtime deployments

**Environment Variables:**
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STEAM_API_KEY=
AOE2NET_API_BASE_URL=
```

**CI/CD (Optional Phase 2):**
- GitHub Actions for tests
- Automated deployment on merge to main
- Preview deployments for PRs

## Rollout Plan

### Phase 1: MVP (Weeks 1-4)
- ✓ Project setup (Next.js, Prisma, PostgreSQL)
- ✓ Authentication (Steam OAuth)
- ✓ Build order CRUD
- ✓ Basic editor with step management
- ✓ Public build order viewer
- ✓ Coolify deployment

### Phase 2: Data Integration (Weeks 5-6)
- AoE2.net API integration
- Player stats dashboard
- Game data sync (civilizations, units)
- Caching implementation

### Phase 3: Interactive Features (Weeks 7-8)
- Timer mode for build order viewer
- Drag-and-drop editor
- Resource calculation engine
- Validation and warnings

### Phase 4: Community (Weeks 9-10)
- Strategy creation and linking
- Public library with search/filters
- Like/bookmark system
- User profiles and leaderboards

### Phase 5: Polish (Weeks 11-12)
- Mobile optimization
- Performance tuning
- User testing with AoE2 community
- Bug fixes and refinements

## Future Enhancements (Post-MVP)

- **Real-time collaboration**: Multiple users editing same build order
- **Video integration**: Link build orders to YouTube guides
- **AI suggestions**: ML-powered build order recommendations
- **In-game overlay**: Second monitor app with timer
- **Mobile app**: React Native version
- **Tournament integration**: Link to AoE2 esports events
- **Replay analysis**: Upload game replay, compare to build order

## Success Metrics

**Usage:**
- 1,000+ registered users in first month
- 500+ public build orders created
- 10,000+ build order views

**Engagement:**
- Average session time > 5 minutes
- 30% return rate (weekly active users)
- 50+ active build order creators

**Technical:**
- Page load time < 2 seconds
- 99.5% uptime
- API response time < 500ms (p95)

## Risks & Mitigations

**Risk:** AoE2.net API becomes unavailable
- **Mitigation:** Cache all data, graceful degradation, manual data entry fallback

**Risk:** Game balance patches invalidate build orders
- **Mitigation:** Version tracking, "outdated" warnings, community updates

**Risk:** Low user adoption
- **Mitigation:** Share on AoE2 subreddit, Discord, partner with content creators

**Risk:** Server costs exceed budget
- **Mitigation:** Optimize queries, implement caching, self-hosting on Coolify

## Conclusion

This design provides a comprehensive, scalable foundation for an AoE2 interactive gameplan maker. The Next.js full-stack approach balances rapid development with future extensibility, while Coolify deployment ensures cost-effective hosting. By integrating live player data and current game balance, the platform serves all skill levels from learning players to competitive strategists.

Next steps: Set up development environment, create initial Next.js project, and begin Phase 1 implementation.
