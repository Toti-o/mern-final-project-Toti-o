import React, { useState, useEffect, useCallback } from 'react';
import { fetchEvents } from '../services/api';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchEvents(currentPage);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to load events');
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="home">
      <div className="hero-section">
        <h1>EventFlow HR</h1>
        <p>Streamlining Corporate Event Management and Employee Engagement</p>
      </div>
      
      <div className="events-grid">
        <h2>Upcoming Events</h2>
        
        {error && <div className="error">{error}</div>}
        
        {events.length === 0 ? (
          <p>No upcoming events. Be the first to create one!</p>
        ) : (
          <>
            <div className="events-list">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
