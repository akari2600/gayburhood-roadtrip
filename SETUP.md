# Setup & Deployment Guide

## 🚀 Quick Start (5 minutes)

### Step 0: Set Node Version (if using NVM)

This project uses Node.js 20.x. If you use NVM:

```bash
nvm use
```

If you don't have Node 20 installed yet:

```bash
nvm install 20
nvm use
```

### Step 1: Install Dependencies

```bash
npm install
```

This installs React, TypeScript, Vite, and the Supabase client library.

### Step 2: Run Locally

```bash
npm run dev
```

Open the URL shown in your terminal (usually http://localhost:5173)

### Step 3: Test the App

- You should see the calendar view with Nov 7-19, 2025
- Click on any day to see accommodation and activity details
- If you see an error, check that your Supabase database is accessible

---

## 📦 Deploy to Vercel (Recommended)

Vercel provides free hosting with a stable URL that won't change.

### Option A: Deploy via CLI (Fastest)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Link to existing project? **N** (first time)
   - Project name? **gayburhood-roadtrip** (or whatever you prefer)
   - Which directory? **./** (press enter)

4. Your app is now live! 🎉

### Option B: Deploy via GitHub (Auto-deploy on push)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect Vite settings
6. Click "Deploy"
7. Done! Future pushes to main branch will auto-deploy

**Your friends can now access the app via the stable Vercel URL!**

---

## 🎨 Alternative: Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build your app:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod
```

4. When prompted:
   - Publish directory: **dist**
   - Create new site? **Yes**

---

## 🔧 Optional: TypeScript Type Generation

For even better TypeScript support, you can generate types from your Supabase database schema.

### Install Supabase CLI

```bash
npm install -g supabase
```

### Generate Types

```bash
npx supabase gen types typescript --project-id nqouehuzbsdibfhqhqsx > src/database.types.ts
```

This creates type definitions based on your actual database schema.

### Use the Types

Update `src/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://nqouehuzbsdibfhqhqsx.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

Now you'll get autocomplete and type checking for your database columns!

---

## 📱 Sharing with Friends

Once deployed, you'll get a URL like:
- Vercel: `https://gayburhood-roadtrip.vercel.app`
- Netlify: `https://your-site-name.netlify.app`

Just send this URL to your friends! It works on:
- ✅ Mobile (iPhone/Android)
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Discord embedded previews

No login or setup needed on their end - just click and go!

---

## 🔄 Making Updates

### For Vercel CLI users:
```bash
# Make your changes, then:
vercel --prod
```

### For Vercel GitHub users:
```bash
git add .
git commit -m "Update trip details"
git push
# Auto-deploys!
```

### For Netlify users:
```bash
npm run build
netlify deploy --prod
```

---

## 🗄️ Adding Data to Supabase

You can add/edit data in two ways:

### 1. Via Supabase Dashboard
Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) → Your Project → Table Editor

### 2. Add CRUD to the App (Future Enhancement)
We can add forms to create/edit activities and accommodations directly in the app. Let me know when you're ready for this!

---

## 🐛 Troubleshooting

### "Cannot find module @supabase/supabase-js"
Run: `npm install`

### "Connection refused" or CORS errors
Check that your Supabase project is active and the anon key is correct.

### Changes not showing up after deploy
1. Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Wait 30 seconds for CDN to update
3. Check deployment logs on Vercel/Netlify dashboard

### Mobile display issues
The app is responsive, but if you see layout issues, let me know and I can adjust the CSS.

---

## 📊 Current Database Schema

### `accommodations` table
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| city | text | City name |
| check_in | date | Check-in date |
| check_out | date | Check-out date |
| beds | integer | Number of beds |
| airbnb_link | text | Airbnb listing URL (optional) |

### `activities` table
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| date | date | Activity date |
| title | text | Activity name |
| description | text | Details (optional) |
| link | text | External link (optional) |

---

## 🎯 Next Steps

Once the read-only version is working well, we can add:
- [ ] Forms to add new activities
- [ ] Forms to add new accommodations
- [ ] Edit/delete functionality
- [ ] Photo uploads
- [ ] Notes/comments per day
- [ ] Packing list
- [ ] Budget tracker

Just let me know what you'd like to add next!

