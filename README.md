# Campground Review & Logging App

A web application for RV and camper users to log visited campgrounds, write reviews, upload photos, and maintain a personal travel journal.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Maps**: Google Maps API (Places API, Maps JavaScript API)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Google Cloud project with Maps APIs enabled

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

3. Add your environment variables to `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from the plan to create tables, RLS policies, and views
3. Create a storage bucket named `campground-photos` (public)
4. Enable Email/Password authentication

### Google Maps Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
3. Create an API key and restrict it by HTTP referrer
4. Add the API key to `.env.local`

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

- `src/components/` - React components organized by feature
- `src/pages/` - Page components for routing
- `src/hooks/` - Custom React hooks
- `src/services/` - API service layers (Supabase, Google Maps)
- `src/types/` - TypeScript type definitions
- `src/context/` - React Context providers
- `src/utils/` - Utility functions and constants

## Features

- User authentication (sign up, login, profile)
- Campground search using Google Maps
- Personal journal of visited campgrounds
- Reviews and ratings
- Photo uploads
- User profiles with stats

## License

MIT
