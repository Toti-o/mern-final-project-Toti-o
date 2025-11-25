import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchEvent, createRSVP, fetchEventRSVPs } from '../services/api';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [userRSVP, setUserRSVP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);
  
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const [eventResponse, rsvpsResponse] = await Promise.all([
        fetchEvent(id),
        fetchEventRSVPs(id)
      ]);
      
      setEvent(eventResponse.data.event);
      setRsvps(rsvpsResponse.data);
      
      // Find user's RSVP if logged in
      if (user) {
        const userRsvp = rsvpsResponse.data.find(rsvp => rsvp.user._id === user.id);
        setUserRSVP(userRsvp);
      }
    } catch (error) {
      setError('Failed to load event details');
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (response) => {
    if (!user) {
      setError('Please log in to RSVP');
      return;
    }

    try {
      setRsvpLoading(true);
      const rsvpData = {
        event: id,
        response,
        guests: 0
      };
      
      await createRSVP(rsvpData);
      await loadEvent(); // Reload to get updated RSVPs
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const yesCount = rsvps.filter(r => r.response === 'Yes').length;
  const noCount = rsvps.filter(r => r.response === 'No').length;
  const maybeCount = rsvps.filter(r => r.response === 'Maybe').length;

  return (
    <div className="event-detail-page">
      <div className="event-detail">
        <div className="event-header">
          <h1>{event.title}</h1>
          <span className="event-category">{event.category}</span>
        </div>
        
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="event-date">
            <strong>📅 Date & Time:</strong> {formatDate(event.date)}
          </div>
          <div className="event-location">
            <strong>📍 Location:</strong> {event.location}
          </div>
          <div className="event-creator">
            <strong>👤 Hosted by:</strong> {event.creator?.name}
          </div>
          {event.maxAttendees && (
            <div className="event-capacity">
              <strong>👥 Capacity:</strong> {event.maxAttendees} attendees
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="rsvp-section">
          <h3>RSVP to this Event</h3>
          <p>Let the organizer know if you can attend:</p>
          
          <div className="rsvp-buttons">
            <button
              className={userRSVP?.response === 'Yes' ? 'active' : ''}
              onClick={() => handleRSVP('Yes')}
              disabled={rsvpLoading}
            >
              ✅ Yes, I'll be there
            </button>
            <button
              className={userRSVP?.response === 'Maybe' ? 'active' : ''}
              onClick={() => handleRSVP('Maybe')}
              disabled={rsvpLoading}
            >
              🤔 Maybe
            </button>
            <button
              className={userRSVP?.response === 'No' ? 'active' : ''}
              onClick={() => handleRSVP('No')}
              disabled={rsvpLoading}
            >
              ❌ Can't make it
            </button>
          </div>
          
          {userRSVP && (
            <div className="success">
              You've responded: <strong>{userRSVP.response}</strong>
            </div>
          )}
        </div>
      )}

      <div className="rsvp-section">
        <h3>Attendance Summary</h3>
        <div className="attendance-summary">
          <div>✅ Yes: {yesCount}</div>
          <div>🤔 Maybe: {maybeCount}</div>
          <div>❌ No: {noCount}</div>
          <div>📊 Total Responses: {rsvps.length}</div>
        </div>

        <div className="rsvp-list">
          <h4>All Responses</h4>
          {rsvps.length === 0 ? (
            <p>No responses yet</p>
          ) : (
            rsvps.map(rsvp => (
              <div key={rsvp._id} className="rsvp-item">
                <span>{rsvp.user.name}</span>
                <span className={`response-${rsvp.response.toLowerCase()}`}>
                  {rsvp.response}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;