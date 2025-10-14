# 🚗 November 2025 Road Trip - EepLog 🗺️

A collaborative road trip planning app for tracking accommodations and activities during our November 2025 adventure.

## Features

- 📅 Calendar view of the entire trip (Nov 7-19, 2025)
- 🏠 Accommodation tracking with Airbnb links
- 🎯 Daily activities with descriptions and links
- 📱 Mobile-friendly design
- 🎨 Beautiful gradient UI

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (or Netlify)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open your browser to the URL shown (usually http://localhost:5173)

## Development

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your app will be live at a stable URL!

Alternatively, connect your GitHub repo to Vercel for automatic deployments.

### Deploy to Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Follow the prompts
4. Your app will be live!

## Database Structure

### Tables

**accommodations**
- `id`: integer (primary key)
- `city`: text
- `check_in`: date
- `check_out`: date
- `beds`: integer
- `airbnb_link`: text (nullable)

**activities**
- `id`: integer (primary key)
- `date`: date
- `title`: text
- `description`: text (nullable)
- `link`: text (nullable)

## Future Enhancements

- [ ] Add CRUD functionality to add/edit activities
- [ ] Add CRUD functionality to add/edit accommodations
- [ ] User authentication (if needed)
- [ ] Real-time collaboration
- [ ] Photo uploads
- [ ] Export to PDF

## Contributing

This is a private project for our friend group, but feel free to suggest improvements!

