import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyRSVPs } from "../services/api";
import { Link } from "react-router-dom";

const MyRSVPs = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMyRSVPs();
    }
  }, [user]);

  const loadMyRSVPs = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading user RSVPs...");
      const response = await fetchMyRSVPs();
      console.log("✅ RSVPs loaded:", response.data);
      setRsvps(response.data);
    } catch (error) {
      console.error("❌ Error loading RSVPs:", error);
      setError(error.response?.data?.message || "Failed to load your RSVPs");
    } finally {
      setLoading(false);
    }
  };

  // Add safe data access to prevent undefined errors
  const getEventTitle = (rsvp) => {
    return rsvp.event?.title || "Unknown Event";
  };

  const getEventDescription = (rsvp) => {
    return rsvp.event?.description || "No description available";
  };

  const getEventDate = (rsvp) => {
    return rsvp.event?.date || new Date();
  };

  const getEventLocation = (rsvp) => {
    return rsvp.event?.location || "Location not specified";
  };

  const getEventId = (rsvp) => {
    return rsvp.event?._id || rsvp.event;
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const upcomingRSVPs = rsvps.filter(rsvp => new Date(getEventDate(rsvp)) > new Date());
  const pastRSVPs = rsvps.filter(rsvp => new Date(getEventDate(rsvp)) <= new Date());

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
                    <h3>{getEventTitle(rsvp)}</h3>
                    <span className={`response-${rsvp.response?.toLowerCase() || 'unknown'}`}>
                      {rsvp.response || 'Unknown'}
                    </span>
                  </div>
                  <p className="event-description">{getEventDescription(rsvp)}</p>
                  <div className="event-details">
                    <div className="event-date">
                      <strong>📅</strong> {formatDate(getEventDate(rsvp))}
                    </div>
                    <div className="event-location">
                      <strong>📍</strong> {getEventLocation(rsvp)}
                    </div>
                  </div>
                  <Link to={`/event/${getEventId(rsvp)}`} className="view-details-btn">
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
                    <h3>{getEventTitle(rsvp)}</h3>
                    <span className={`response-${rsvp.response?.toLowerCase() || 'unknown'}`}>
                      {rsvp.response || 'Unknown'}
                    </span>
                  </div>
                  <p className="event-description">{getEventDescription(rsvp)}</p>
                  <div className="event-details">
                    <div className="event-date">
                      <strong>📅</strong> {formatDate(getEventDate(rsvp))}
                    </div>
                    <div className="event-location">
                      <strong>📍</strong> {getEventLocation(rsvp)}
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
