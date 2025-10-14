// Generated route data between cities
// Coordinates are in [longitude, latitude] format
export const routes = [
  {
    from: 'Memphis',
    to: 'Atlanta',
    distance_miles: '386.7',
    duration_hours: '6.3'
  },
  {
    from: 'Atlanta',
    to: 'Savannah',
    distance_miles: '247.7',
    duration_hours: '3.8'
  },
  {
    from: 'Savannah',
    to: 'Panama City Beach',
    distance_miles: '408.2',
    duration_hours: '7.9'
  },
  {
    from: 'Panama City Beach',
    to: 'New Orleans',
    distance_miles: '245.0', // approximate
    duration_hours: '4.5'
  },
  {
    from: 'New Orleans',
    to: 'Houston',
    distance_miles: '349.0', // approximate
    duration_hours: '5.5'
  },
  {
    from: 'Houston',
    to: 'Waco',
    distance_miles: '180.9',
    duration_hours: '3.4'
  }
];

// Total trip distance and duration
export const tripStats = {
  total_miles: routes.reduce((sum, r) => sum + parseFloat(r.distance_miles), 0).toFixed(1),
  total_hours: routes.reduce((sum, r) => sum + parseFloat(r.duration_hours), 0).toFixed(1)
};

