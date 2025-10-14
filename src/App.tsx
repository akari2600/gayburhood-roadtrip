import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import MapView from './MapView';

interface Accommodation {
  id: number;
  city: string;
  check_in: string;
  check_out: string;
  beds: number;
  airbnb_link: string | null;
}

interface Activity {
  id: number;
  date: string;
  title: string;
  description: string | null;
  link: string | null;
}

type View = 'calendar' | 'map';

export default function TripPlanner() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Fetch accommodations
      const { data: accomData, error: accomError } = await supabase
        .from('accommodations')
        .select('*')
        .order('check_in', { ascending: true });

      if (accomError) throw accomError;
      
      // Fetch activities
      const { data: actData, error: actError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: true });

      if (actError) throw actError;

      setAccommodations(accomData || []);
      setActivities(actData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Generate calendar weeks for full November 2025 month view
  const generateCalendarWeeks = () => {
    const weeks: Date[][] = [];
    // Use Date constructor with year, month (0-indexed), day to avoid timezone issues
    const start = new Date(2025, 9, 26); // Sunday Oct 26, 2025 (month 9 = October)
    const end = new Date(2025, 11, 6); // Saturday Dec 6, 2025 (month 11 = December)
    
    let currentWeek: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      currentWeek.push(new Date(current));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      current.setDate(current.getDate() + 1);
    }
    return weeks;
  };

  const weeks = generateCalendarWeeks();
  
  // Check if a date is in our trip range (Nov 7-19)
  const isInTripRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return (year === 2025 && month === 10 && day >= 7 && day <= 19); // month 10 = November
  };

  // Convert Date to YYYY-MM-DD string in local timezone
  const dateToLocalString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get accommodation for a specific date (where we're sleeping that night)
  const getAccommodationForDate = (date: Date) => {
    const dateStr = dateToLocalString(date);
    return accommodations.find(accom => {
      const checkIn = accom.check_in;
      const checkOut = accom.check_out;
      // We sleep there if date >= check_in and date < check_out
      return dateStr >= checkIn && dateStr < checkOut;
    });
  };

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    const dateStr = dateToLocalString(date);
    return activities.filter(act => act.date === dateStr);
  };

  // Check if it's a checkout day
  const isCheckoutDay = (date: Date) => {
    const dateStr = dateToLocalString(date);
    return accommodations.some(accom => accom.check_out === dateStr);
  };

  // Check if it's a checkin day
  const isCheckinDay = (date: Date) => {
    const dateStr = dateToLocalString(date);
    return accommodations.some(accom => accom.check_in === dateStr);
  };

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Navigation component
  const Navigation = () => (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => {
            setCurrentView('calendar');
            setSelectedDate(null);
          }}
          style={{
            background: currentView === 'calendar' ? 'white' : 'rgba(255,255,255,0.2)',
            color: currentView === 'calendar' ? '#667eea' : 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: currentView === 'calendar' ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
          }}
        >
          📅 Calendar View
        </button>
        <button
          onClick={() => setCurrentView('map')}
          style={{
            background: currentView === 'map' ? 'white' : 'rgba(255,255,255,0.2)',
            color: currentView === 'map' ? '#667eea' : 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: currentView === 'map' ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
          }}
        >
          🗺️ Map View
        </button>
      </div>
    </div>
  );

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
      <>
        <Navigation />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 100px)',
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
      </>
    );
  }

  // Show map view
  if (currentView === 'map') {
    return (
      <>
        <Navigation />
        <MapView accommodations={accommodations} activities={activities} />
      </>
    );
  }

  if (selectedDate) {
    const accom = getAccommodationForDate(selectedDate);
    const dateActivities = getActivitiesForDate(selectedDate);
    const isCheckout = isCheckoutDay(selectedDate);
    const isCheckin = isCheckinDay(selectedDate);

    return (
      <>
        <Navigation />
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: 'calc(100vh - 80px)',
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
      </>
    );
  }

  // Calendar view
  return (
    <>
      <Navigation />
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: 'calc(100vh - 80px)',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '1400px',
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

        {/* Calendar header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(7, 1fr)',
          gap: '10px',
          marginBottom: '10px',
          padding: '10px 0',
          background: '#667eea',
          borderRadius: '8px'
        }}>
          <div style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            textAlign: 'center',
            padding: '5px'
          }}>WEEK</div>
          {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
            <div key={day} style={{ 
              color: 'white', 
              fontWeight: 'bold', 
              textAlign: 'center',
              fontSize: '0.85em',
              padding: '5px'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={{
            display: 'grid',
            gridTemplateColumns: '80px repeat(7, 1fr)',
            gap: '10px',
            marginBottom: '10px'
          }}>
            {/* Week label */}
            <div style={{
              background: '#f0f0f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#666',
              padding: '10px'
            }}>
              Week<br/>{weekIndex + 1}
            </div>

            {/* Days of the week */}
            {week.map(day => {
              const accom = getAccommodationForDate(day);
              const dayActivities = getActivitiesForDate(day);
              const isCheckout = isCheckoutDay(day);
              const isCheckin = isCheckinDay(day);
              const inRange = isInTripRange(day);
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => inRange ? setSelectedDate(day) : null}
                  style={{
                    background: accom ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : inRange ? '#f9f9f9' : 'white',
                    color: accom ? 'white' : '#333',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: inRange ? 'pointer' : 'default',
                    border: inRange ? '2px solid #e0e0e0' : '1px solid #f0f0f0',
                    minHeight: '120px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: inRange ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    opacity: inRange ? 1 : 0.4
                  }}
                  onMouseEnter={(e) => {
                    if (inRange) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (inRange) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1.1em',
                    marginBottom: '8px',
                    color: accom ? 'white' : '#667eea'
                  }}>
                    {formatDate(day)}
                  </div>

                  {isCheckin && (
                    <div style={{
                      background: accom ? 'rgba(255,255,255,0.3)' : '#e8f5e9',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      fontSize: '0.75em',
                      marginBottom: '4px',
                      borderLeft: accom ? '2px solid white' : '2px solid #66bb6a'
                    }}>
                      🔑 Check into {accom?.city}
                    </div>
                  )}

                  {isCheckout && !isCheckin && (
                    <div style={{
                      background: accom ? 'rgba(255,255,255,0.3)' : '#fff0f0',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      fontSize: '0.75em',
                      marginBottom: '4px',
                      borderLeft: accom ? '2px solid white' : '2px solid #f5576c'
                    }}>
                      🚪 Check out
                    </div>
                  )}

                  {dayActivities.map(act => (
                    <div
                      key={act.id}
                      style={{
                        background: accom ? 'rgba(255,255,255,0.3)' : '#fff8e1',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75em',
                        marginBottom: '4px',
                        borderLeft: accom ? '2px solid white' : '2px solid #ffc107'
                      }}
                    >
                      🚗 {act.title}
                    </div>
                  ))}

                  {accom && (
                    <div style={{ 
                      fontSize: '0.8em',
                      marginTop: '8px',
                      fontWeight: 'bold'
                    }}>
                      😴 Sleep: {accom.city} ({accom.beds} beds)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        </div>
      </div>
    </>
  );
}

