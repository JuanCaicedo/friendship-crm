# Friendship CRM

A personal relationship management application that helps you maintain meaningful connections with the people who matter most.

## Features

- **Contact Management**: Add and organize contacts with relationship tags
- **Interaction Logging**: Track text messages, phone calls, and hangouts with weighted importance
- **Health Tracking**: Visual indicators show relationship health based on interaction history
- **Smart Recommendations**: Get personalized suggestions on who to reach out to
- **Reminders**: Set reminders for future check-ins
- **Snooze**: Temporarily deprioritize contacts from recommendations

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/                    # Next.js App Router pages and API routes
src/
  components/           # React components
  lib/
    models/            # TypeScript type definitions
    services/          # Business logic services
    database/          # SQLite database setup
    utils/             # Utility functions
  hooks/               # Custom React hooks (SWR)
tests/                 # Test files
```

## Technology Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Material-UI (MUI)** for UI components
- **SQLite** (better-sqlite3) for local data storage
- **SWR** for data fetching and caching

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm test` - Run tests

## Database

The application uses SQLite for local data storage. The database file is created in the `data/` directory on first run. Default relationship tags (Family, Close friend, Acquaintance, Old friend) are automatically initialized.

## License

Private project

