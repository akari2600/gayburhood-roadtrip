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
    <div className="sticky top-0 z-50 bg-gradient-to-br from-primary-500 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setCurrentView('calendar');
              setSelectedDate(null);
            }}
            className={`
              px-6 py-3 rounded-full font-bold transition-all
              ${currentView === 'calendar' 
                ? 'bg-white text-primary-500 shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
              }
            `}
          >
            <span className="hidden sm:inline">📅 Calendar View</span>
            <span className="sm:hidden">📅 Calendar</span>
          </button>
          <button
            onClick={() => setCurrentView('map')}
            className={`
              px-6 py-3 rounded-full font-bold transition-all
              ${currentView === 'map' 
                ? 'bg-white text-primary-500 shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
              }
            `}
          >
            <span className="hidden sm:inline">🗺️ Map View</span>
            <span className="sm:hidden">🗺️ Map</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-primary-500 to-purple-600">
        <div className="text-white text-2xl">Loading EepLog... 😴</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="flex justify-center items-center min-h-[calc(100vh-100px)] bg-gradient-to-br from-primary-500 to-purple-600 p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md shadow-2xl">
            <h2 className="text-secondary-500 text-2xl font-bold mb-4">Error loading data</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button 
              onClick={loadData}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
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
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-primary-500 to-purple-600 p-4 md:p-10">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl p-4 md:p-8 shadow-2xl">
          <h1 className="text-center text-primary-500 text-2xl md:text-4xl font-bold mb-6 md:mb-8">
            🚗 November 2025 Road Trip EepLog 🗺️
          </h1>

          {/* Calendar header - hidden on mobile, shown on tablet+ */}
          <div className="hidden md:grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-2 p-3 bg-primary-500 rounded-lg">
            <div className="text-white font-bold text-center text-sm">WEEK</div>
            {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
              <div key={day} className="text-white font-bold text-center text-xs lg:text-sm">
                {day}
              </div>
            ))}
          </div>

        {/* Calendar weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[80px_repeat(7,1fr)] gap-2 md:gap-3 mb-3">
            {/* Week label - hidden on mobile */}
            <div className="hidden md:flex bg-gray-100 rounded-lg items-center justify-center font-bold text-gray-600 p-2">
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
                  className={`
                    p-3 rounded-lg transition-all min-h-[120px]
                    ${accom ? 'bg-gradient-to-br from-pink-400 to-secondary-500 text-white' : inRange ? 'bg-gray-50' : 'bg-white'}
                    ${inRange ? 'cursor-pointer border-2 border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1' : 'border border-gray-100 opacity-40'}
                    ${accom ? 'text-white' : 'text-gray-800'}
                  `}
                >
                  <div className={`font-bold text-lg mb-2 ${accom ? 'text-white' : 'text-primary-500'}`}>
                    <span className="md:hidden">{getDayOfWeek(day)} </span>
                    {formatDate(day)}
                  </div>

                  {isCheckin && (
                    <div className={`
                      px-2 py-1 rounded text-xs mb-1 border-l-2
                      ${accom ? 'bg-white/30 border-white' : 'bg-green-50 border-green-500'}
                    `}>
                      🔑 Check into {accom?.city}
                    </div>
                  )}

                  {isCheckout && !isCheckin && (
                    <div className={`
                      px-2 py-1 rounded text-xs mb-1 border-l-2
                      ${accom ? 'bg-white/30 border-white' : 'bg-red-50 border-red-500'}
                    `}>
                      🚪 Check out
                    </div>
                  )}

                  {dayActivities.map(act => (
                    <div
                      key={act.id}
                      className={`
                        px-2 py-1 rounded text-xs mb-1 border-l-2
                        ${accom ? 'bg-white/30 border-white' : 'bg-yellow-50 border-yellow-500'}
                      `}
                    >
                      🚗 {act.title}
                    </div>
                  ))}

                  {accom && (
                    <div className="text-sm mt-2 font-bold">
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

