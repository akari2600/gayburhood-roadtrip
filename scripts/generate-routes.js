// Script to generate driving routes between cities using OpenRouteService
// Run this once to populate route data

const cities = [
  { name: 'Memphis', lat: 35.1495, lng: -90.0490 },
  { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
  { name: 'Savannah', lat: 32.0809, lng: -81.0912 },
  { name: 'Panama City Beach', lat: 30.1766, lng: -85.8055 },
  { name: 'New Orleans', lat: 29.9511, lng: -90.0715 },
  { name: 'Houston', lat: 29.7604, lng: -95.3698 },
  { name: 'Waco', lat: 31.5493, lng: -97.1467 },
];

async function getRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.code === 'Ok' && data.routes && data.routes[0]) {
    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates, // [lng, lat] pairs
      distance: route.distance, // meters
      duration: route.duration, // seconds
    };
  }
  
  throw new Error('Could not get route');
}

async function generateAllRoutes() {
  const routes = [];
  
  for (let i = 0; i < cities.length - 1; i++) {
    const start = cities[i];
    const end = cities[i + 1];
    
    console.log(`Generating route: ${start.name} → ${end.name}`);
    
    try {
      const route = await getRoute(start, end);
      routes.push({
        from: start.name,
        to: end.name,
        coordinates: route.coordinates,
        distance_miles: (route.distance / 1609.34).toFixed(1),
        duration_hours: (route.duration / 3600).toFixed(1),
      });
      
      console.log(`  ✓ ${route.distance / 1609.34} miles, ${route.duration / 3600} hours`);
      
      // Be nice to the API - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }
  }
  
  console.log('\n--- Copy this JSON to save route data ---\n');
  console.log(JSON.stringify(routes, null, 2));
}

generateAllRoutes();

