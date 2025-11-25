import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMyRSVPs } from '../services/api';
import { Link } from 'react-router-dom';

const MyRSVPs = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMyRSVPs();
    }
  }, [user]);

  const loadMyRSVPs = async () => {
    try {
      setLoading(true);
      const response = await fetchMyRSVPs();
      setRsvps(response.data);
    } catch (error) {
      setError('Failed to load your RSVPs');
      console.error('Error loading RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="form-container">
        <div className="error">Please log in to view your RSVPs</div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading your RSVPs...</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingRSVPs = rsvps.filter(rsvp => new Date(rsvp.event.date) > new Date());
  const pastRSVPs = rsvps.filter(rsvp => new Date(rsvp.event.date) <= new Date());

  return (
    <div className="my-rsvps">
      <h1>My Event RSVPs</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="rsvp-sections">
        <div className="rsvp-section">
          <h2>Upcoming Events ({upcomingRSVPs.length})</h2>
          {upcomingRSVPs.length === 0 ? (
            <p>No upcoming events</p>
          ) : (
            <div className="events-list">
              {upcomingRSVPs.map(rsvp => (
                <div key={rsvp._id} className="event-card">
                  <div className="event-header">
                    <h3>{rsvp.event.title}</h3>
                    <span className={`response-${rsvp.response.toLowerCase()}`}>
                      {rsvp.response}
                    </span>
                  </div>
                  <p className="event-description">{rsvp.event.description}</p>
                  <div className="event-details">
                    <div className="event-date">
                      <strong>📅</strong> {formatDate(rsvp.event.date)}
                    </div>
                    <div className="event-location">
                      <strong>📍</strong> {rsvp.event.location}
                    </div>
                  </div>
                  <Link to={`/event/${rsvp.event._id}`} className="view-details-btn">
                    View Event Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rsvp-section">
          <h2>Past Events ({pastRSVPs.length})</h2>
          {pastRSVPs.length === 0 ? (
            <p>No past events</p>
          ) : (
            <div className="events-list">
              {pastRSVPs.map(rsvp => (
                <div key={rsvp._id} className="event-card past-event">
                  <div className="event-header">
                    <h3>{rsvp.event.title}</h3>
                    <span className={`response-${rsvp.response.toLowerCase()}`}>
                      {rsvp.response}
                    </span>
                  </div>
                  <p className="event-description">{rsvp.event.description}</p>
                  <div className="event-details">
                    <div className="event-date">
                      <strong>📅</strong> {formatDate(rsvp.event.date)}
                    </div>
                    <div className="event-location">
                      <strong>📍</strong> {rsvp.event.location}
                    </div>
                  </div>
                  <div className="past-event-label">Past Event</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRSVPs;
