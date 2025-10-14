# Timezone & Geospatial Feature Plan

## Current Situation

**Users in multiple timezones:**
- You + Friend 1: Pacific Time (PT)
- Friend 2: Central Time (CT)

**Trip crosses multiple timezones:**
- Memphis, Houston: Central Time (CT)
- Atlanta, Savannah: Eastern Time (ET)
- Panama City Beach: Central Time (CT)
- New Orleans: Central Time (CT)
- Waco: Central Time (CT)

## Timezone Implementation Plan

### 1. Database Schema Changes

We need to add timezone information to our tables:

```sql
-- Add timezone column to activities
ALTER TABLE activities 
ADD COLUMN timezone TEXT DEFAULT 'America/Chicago';

-- Add timezone and location columns to accommodations
ALTER TABLE accommodations
ADD COLUMN timezone TEXT DEFAULT 'America/Chicago',
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Optionally add time to activities if you want specific times
ALTER TABLE activities
ADD COLUMN time TIME;
```

**Common US Timezones:**
- `America/New_York` - Eastern Time (Atlanta, Savannah)
- `America/Chicago` - Central Time (Memphis, Houston, New Orleans, Waco, Panama City Beach)
- `America/Los_Angeles` - Pacific Time (your home timezone)

### 2. Libraries Installed

✅ **date-fns** (4.1.0) - Modern date manipulation
✅ **date-fns-tz** (3.2.0) - Timezone support

**Why date-fns-tz:**
- Lightweight (~20KB)
- Works well with React
- IANA timezone database support
- Active maintenance
- Better than moment.js (deprecated)

### 3. Display Strategy

**For Users:**
- Show their local time in the browser
- Display event times in the event's local timezone with clear labels
- Example: "Check in at 3:00 PM CT" or "3:00 PM Eastern"

**Implementation:**
```typescript
import { formatInTimeZone } from 'date-fns-tz';

// Display in event's timezone
formatInTimeZone(date, 'America/New_York', 'h:mm a zzz');
// Output: "3:00 PM EST"

// Display in user's timezone
formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, 'h:mm a zzz');
// Output: "12:00 PM PST" (if user is in Pacific)
```

## Geospatial / Maps Implementation Plan

### 1. Enable PostGIS in Supabase

PostGIS is the standard Postgres extension for geospatial data and is fully supported by Supabase.

**To enable:**
1. Go to Supabase Dashboard → Database → Extensions
2. Enable `postgis` extension
3. This adds geometry/geography types and spatial functions

### 2. Add Location Data to Tables

```sql
-- Add PostGIS geometry columns
ALTER TABLE accommodations
ADD COLUMN location GEOGRAPHY(POINT, 4326);

ALTER TABLE activities
ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Create spatial indexes for performance
CREATE INDEX accommodations_location_idx 
ON accommodations USING GIST (location);

CREATE INDEX activities_location_idx 
ON activities USING GIST (location);

-- Helper function to update location from lat/long
CREATE OR REPLACE FUNCTION update_location() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update location when lat/long changes
CREATE TRIGGER update_accommodations_location
BEFORE INSERT OR UPDATE ON accommodations
FOR EACH ROW
EXECUTE FUNCTION update_location();

CREATE TRIGGER update_activities_location
BEFORE INSERT OR UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION update_location();
```

### 3. Map Library Options

For React mapping, current best options:

**Option A: Leaflet + React-Leaflet** (Recommended for your use case)
- Free, open-source
- No API keys needed
- Lightweight
- Good for simple route visualization

**Option B: Mapbox GL JS**
- Beautiful maps
- Free tier: 50,000 loads/month
- More features but requires API key

**Option C: Google Maps**
- Most familiar to users
- Requires API key and billing setup
- Not necessary for your use case

### 4. Example Geospatial Queries

```typescript
// Find accommodations within 50 miles of a point
const { data } = await supabase.rpc('nearby_accommodations', {
  lat: 33.7490,
  lng: -84.3880,
  radius_miles: 50
});

// Calculate route distance (would need custom SQL function)
// Get all activities on the route sorted by proximity
```

## Recommended Next Steps

### Immediate (Today):
1. ✅ Install date-fns and date-fns-tz
2. Add timezone column to database tables
3. Update existing rows with correct timezones
4. Update the app to display times with timezone info

### Soon (This Week):
1. Enable PostGIS extension in Supabase
2. Add lat/long columns to tables
3. Populate location data for existing records
4. Install mapping library (react-leaflet)

### Later (As Needed):
1. Add interactive map view
2. Show route between cities
3. Distance calculations
4. "Nearby attractions" feature
5. Export to Google Maps/Apple Maps

## Example City Data

Here's reference data you'll want to add:

```
Memphis: 35.1495° N, 90.0490° W, America/Chicago
Atlanta: 33.7490° N, 84.3880° W, America/New_York
Savannah: 32.0809° N, 81.0912° W, America/New_York
Panama City Beach: 30.1766° N, 85.8055° W, America/Chicago
New Orleans: 29.9511° N, 90.0715° W, America/Chicago
Houston: 29.7604° N, 95.3698° W, America/Chicago
Waco: 31.5493° N, 97.1467° W, America/Chicago
```

## Questions to Decide

1. **Do activities need specific times?** (e.g., "Check in at 3 PM" vs just "Check in on Nov 7")
2. **Do you want route visualization on a map?** (driving directions between cities)
3. **Do you want distance calculations?** ("234 miles to next destination")
4. **Public vs Private?** (Do you want to share this URL publicly or keep it private?)

---

Ready to implement? Let me know which parts you want to tackle first!

