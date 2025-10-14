import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://nqouehuzbsdibfhqhqsx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VlaHV6YnNkaWJmaHFocXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDgyOTcsImV4cCI6MjA3NjAyNDI5N30.BEYAfwvsiAnvTWH0MHWG27AwwqoKmj33BdJ8wvKG0kY';

// Simple Supabase REST API wrapper
async function supabaseQuery(table, options = {}) {
  const { select = '*', order } = options;
  
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  
  if (order) {
    url += `&order=${order}`;
  }

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.statusText}`);
  }

  return response.json();
}

export default function TripPlanner() {
  const [accommodations, setAccommodations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      console.log('Attempting to fetch from:', `${SUPABASE_URL}/rest/v1/accommodations`);
      
      const accomData = await supabaseQuery('accommodations', {
        order: 'check_in.asc'
      });
      
      console.log('Accommodations loaded:', accomData);
      
      const actData = await supabaseQuery('activities', {
        order: 'date.asc'
      });
      
      console.log('Activities loaded:', actData);

      setAccommodations(accomData || []);
      setActivities(actData || []);
      setError(null);
    } catch (err) {
      console.error('Full error details:', err);
      setError(`${err.message} - Check console for details`);
    } finally {
      setLoading(false);
    }
  }

  // Generate calendar days from Nov 7-19, 2025
  const generateDays = () => {
    const days = [];
    const start = new Date('2025-11-07');
    const end = new Date('2025-11-19');
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const days = generateDays();

  // Get accommodation for a specific date (where we're sleeping that night)
  const getAccommodationForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return accommodations.find(accom => {
      const checkIn = accom.check_in;
      const checkOut = accom.check_out;
      // We sleep there if date >= check_in and date < check_out
      return dateStr >= checkIn && dateStr < checkOut;
    });
  };

  // Get activities for a specific date
  const getActivitiesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return activities.filter(act => act.date === dateStr);
  };

  // Check if it's a checkout day
  const isCheckoutDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return accommodations.some(accom => accom.check_out === dateStr);
  };

  // Check if it's a checkin day
  const isCheckinDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return accommodations.some(accom => accom.check_in === dateStr);
  };

  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5em' }}>Loading EepLog... 😴</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '15px',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#f5576c' }}>Error loading data</h2>
          <p>{error}</p>
          <button 
            onClick={loadData}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedDate) {
    const accom = getAccommodationForDate(selectedDate);
    const dateActivities = getActivitiesForDate(selectedDate);
    const isCheckout = isCheckoutDay(selectedDate);
    const isCheckin = isCheckinDay(selectedDate);

    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <button
            onClick={() => setSelectedDate(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '1.2em',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Calendar
          </button>
          
          <h1 style={{ color: '#667eea', marginBottom: '10px' }}>
            {getDayOfWeek(selectedDate)}, {formatDate(selectedDate)}
          </h1>

          {isCheckout && (
            <div style={{
              background: '#fff0f0',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '10px',
              borderLeft: '3px solid #f5576c'
            }}>
              🚪 Check out day
            </div>
          )}

          {isCheckin && (
            <div style={{
              background: '#e8f5e9',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '10px',
              borderLeft: '3px solid #66bb6a'
            }}>
              🔑 Check in day
            </div>
          )}

          {accom && (
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: '0 0 10px 0' }}>😴 Sleeping in {accom.city}</h2>
              <p style={{ margin: '5px 0' }}>{accom.beds} beds available</p>
              {accom.airbnb_link && (
                <a 
                  href={accom.airbnb_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'underline' }}
                >
                  View Airbnb →
                </a>
              )}
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h2 style={{ color: '#333' }}>Activities</h2>
            {dateActivities.length === 0 ? (
              <p style={{ color: '#666' }}>No activities planned yet</p>
            ) : (
              dateActivities.map(act => (
                <div
                  key={act.id}
                  style={{
                    background: '#f0f7ff',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    borderLeft: '3px solid #667eea'
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0' }}>{act.title}</h3>
                  {act.description && <p style={{ margin: '5px 0' }}>{act.description}</p>}
                  {act.link && (
                    <a 
                      href={act.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#667eea' }}
                    >
                      View details →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calendar view
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#667eea', 
          marginBottom: '30px',
          fontSize: '2.2em'
        }}>
          🚗 November 2025 Road Trip EepLog 🗺️
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          {days.map(day => {
            const accom = getAccommodationForDate(day);
            const dayActivities = getActivitiesForDate(day);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                style={{
                  background: accom ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#f9f9f9',
                  color: accom ? 'white' : '#333',
                  padding: '15px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '2px solid #e0e0e0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '5px',
                  fontSize: '0.9em',
                  opacity: accom ? 1 : 0.7
                }}>
                  {getDayOfWeek(day)}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '1.2em',
                  marginBottom: '8px'
                }}>
                  {formatDate(day)}
                </div>
                {accom && (
                  <div style={{ 
                    fontSize: '0.85em',
                    marginTop: '8px'
                  }}>
                    😴 {accom.city}
                  </div>
                )}
                {dayActivities.length > 0 && (
                  <div style={{ 
                    fontSize: '0.75em',
                    marginTop: '5px',
                    opacity: 0.9
                  }}>
                    📍 {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}