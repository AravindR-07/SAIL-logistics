# Steel Logistics Optimization Platform

A comprehensive enterprise logistics management system built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: High-level view of logistics operations, key metrics, and alerts
- **Vessel Scheduling**: Manage vessel schedules, track STEMs, and predict berthing delays with AI
- **Port Planning & Allocation**: Optimize vessel-to-port assignments and manage capacity
- **Railway Dispatch Planning**: Plan and schedule railway dispatches from ports to steel plants
- **Optimization Engine**: Run optimization algorithms and analyze results
- **Sensitivity & What-If Analysis**: Perform scenario testing and sensitivity analysis
- **Analytics & Reports**: Historical analysis, KPI tracking, and report generation
- **Data Integration & Sources**: Manage data connections, imports, and data quality monitoring
- **Settings & Configuration**: System configuration, user management, and preferences

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout with navigation
├── pages/
│   ├── Dashboard.tsx       # Dashboard overview
│   ├── VesselScheduling.tsx
│   ├── PortPlanning.tsx
│   ├── RailwayDispatch.tsx
│   ├── OptimizationEngine.tsx
│   ├── SensitivityAnalysis.tsx
│   ├── AnalyticsReports.tsx
│   ├── DataIntegration.tsx
│   └── Settings.tsx
├── App.tsx                 # Main app component with routing
├── main.tsx               # Entry point
└── index.css              # Tailwind CSS imports
```

## Design System

The application uses a custom design system with:

- **Primary Color**: Orange (#FF5722)
- **Typography**: Inter font family
- **Border Radius**: 16px for cards
- **Spacing**: Consistent 8px base unit

## Available Routes

- `/dashboard` - Dashboard Overview
- `/vessel-scheduling` - Vessel Scheduling
- `/port-planning` - Port Planning & Allocation
- `/railway-dispatch` - Railway Dispatch Planning
- `/optimization` - Optimization Engine
- `/analysis` - Sensitivity & What-If Analysis
- `/analytics` - Analytics & Reports
- `/data-integration` - Data Integration & Sources
- `/settings` - Settings & Configuration

## Development

The project uses:
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality
- **Vite** for fast development and building

## License

Private - All rights reserved

