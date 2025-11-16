# Threat Compass - Security Operations Center Dashboard

A modern, real-time threat intelligence and network security monitoring dashboard built with React, TypeScript, and Supabase.

## Features

- **Real-time Threat Monitoring**: Live dashboard with threat intelligence and network security metrics
- **Comprehensive Threat Analysis**: Detailed threat filtering, search, and analysis capabilities
- **Advanced Analytics**: Temporal patterns, geographic distribution, and risk analysis
- **Modern UI**: Built with shadcn-ui components and Tailwind CSS
- **Type-safe**: Full TypeScript support with proper type definitions

## Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase project with the `threat_analysis_results` table configured

## Quick Start

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd threat-compass
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your Supabase credentials:

```sh
cp .env.example .env
```

Edit `.env` and add your Supabase project URL and anon key:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings: https://app.supabase.com/project/_/settings/api

### 4. Start the development server

```sh
npm run dev
```

The application will be available at `http://localhost:8080` (or the port shown in the terminal).

## Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
threat-compass/
├── src/
│   ├── components/        # React components
│   │   ├── analytics/    # Analytics chart components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── threats/      # Threat analysis components
│   │   └── ui/           # shadcn-ui components
│   ├── pages/            # Page components (Dashboard, Threats, Analytics)
│   ├── integrations/     # Supabase client configuration
│   └── lib/              # Utility functions
├── public/               # Static assets
└── supabase/            # Supabase configuration
```

## Database Setup

Ensure your Supabase database has the `threat_analysis_results` table with the required schema. Refer to the `supabase_schema.sql` file in the project root for the complete schema definition.

## Technologies Used

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **shadcn-ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service for database
- **TanStack Query** - Data fetching and caching
- **Recharts** - Chart library for data visualization
- **React Router** - Client-side routing

## Development

The project follows these engineering principles:

- **Precision Rule**: Explicit column selection in database queries (no `SELECT *` except where justified)
- **Error Handling**: Comprehensive error states and user feedback
- **Type Safety**: Full TypeScript coverage with proper types
- **Performance**: Optimized queries and efficient data fetching

## Troubleshooting

### Environment Variables Not Loading

Make sure your `.env` file is in the root directory and contains valid Supabase credentials. Restart the dev server after creating or modifying `.env`.

### Database Connection Issues

Verify that:
1. Your Supabase project is active
2. The `threat_analysis_results` table exists
3. Your API keys have the correct permissions
4. Row Level Security (RLS) policies allow read access if enabled

## License

This project is part of a hackathon submission.
