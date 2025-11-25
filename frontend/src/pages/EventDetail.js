import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchEvent, createRSVP, fetchEventRSVPs } from "../services/api";
import io from "socket.io-client";

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [userRSVP, setUserRSVP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [liveUsers, setLiveUsers] = useState(1);
  
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    loadEvent();
    
    // Initialize Socket.io connection
    const newSocket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");
    setSocket(newSocket);

    // Join the event room for real-time updates
    newSocket.emit("join-event", id);

    // Listen for real-time RSVP updates
    newSocket.on("rsvp-update", (data) => {
      console.log("🔔 Real-time RSVP update:", data);
      
      if (data.eventId === id) {
        // Update RSVPs list
        setRsvps(prevRsvps => {
          const existingIndex = prevRsvps.findIndex(r => r._id === data.rsvp._id);
          if (existingIndex >= 0) {
            // Update existing RSVP
            const updated = [...prevRsvps];
            updated[existingIndex] = data.rsvp;
            return updated;
          } else {
            // Add new RSVP
            return [...prevRsvps, data.rsvp];
          }
        });

        // Show notification
        if (data.user.name !== user?.name) {
          showNotification(`${data.user.name} just RSVP'd ${data.user.response} to this event!`);
        }
      }
    });

    // Cleanup on component unmount
    return () => {
      newSocket.emit("leave-event", id);
      newSocket.disconnect();
    };
  }, [id, user]);

  const showNotification = (message) => {
    // Create a temporary notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  };

  const loadEvent = async () => {
    try {
      setLoading(true);
      const [eventResponse, rsvpsResponse] = await Promise.all([
        fetchEvent(id),
        fetchEventRSVPs(id)
      ]);
      
      setEvent(eventResponse.data.event);
      setRsvps(rsvpsResponse.data);
      
      if (user) {
        const userRsvp = rsvpsResponse.data.find(rsvp => rsvp.user._id === user.id);
        setUserRSVP(userRsvp);
      }
    } catch (error) {
      setError("Failed to load event details");
      console.error("Error loading event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (response) => {
    if (!user) {
      setError("Please log in to RSVP");
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
      // Note: The real-time update will handle the UI update via Socket.io
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update RSVP");
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const yesCount = rsvps.filter(r => r.response === "Yes").length;
  const noCount = rsvps.filter(r => r.response === "No").length;
  const maybeCount = rsvps.filter(r => r.response === "Maybe").length;

  return (
    <div className="event-detail-page">
      <div className="event-detail">
        <div className="event-header">
          <h1>{event.title}</h1>
          <div>
            <span className="event-category">{event.category}</span>
            <div className="live-indicator">
              🔴 Live Updates Enabled
            </div>
          </div>
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
              className={userRSVP?.response === "Yes" ? "active" : ""}
              onClick={() => handleRSVP("Yes")}
              disabled={rsvpLoading}
            >
              ✅ Yes, I'll be there
            </button>
            <button
              className={userRSVP?.response === "Maybe" ? "active" : ""}
              onClick={() => handleRSVP("Maybe")}
              disabled={rsvpLoading}
            >
              🤔 Maybe
            </button>
            <button
              className={userRSVP?.response === "No" ? "active" : ""}
              onClick={() => handleRSVP("No")}
              disabled={rsvpLoading}
            >
              ❌ Can't make it
            </button>
          </div>
          
          {userRSVP && (
            <div className="success">
              You've responded: <strong>{userRSVP.response}</strong>
              <div style={{fontSize: "0.8rem", marginTop: "0.5rem"}}>
                🔄 Changes update in real-time for all viewers
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rsvp-section">
        <h3>
          Attendance Summary 
          <span style={{fontSize: "0.9rem", marginLeft: "1rem", color: "#27ae60"}}>
            🔄 Live Updates
          </span>
        </h3>
        
        <div className="attendance-summary">
          <div>✅ Yes: {yesCount}</div>
          <div>🤔 Maybe: {maybeCount}</div>
          <div>❌ No: {noCount}</div>
          <div>📊 Total Responses: {rsvps.length}</div>
        </div>

        <div className="rsvp-list">
          <h4>All Responses {rsvps.length > 0 && `(${rsvps.length})`}</h4>
          {rsvps.length === 0 ? (
            <p>No responses yet. Be the first to RSVP!</p>
          ) : (
            rsvps.map(rsvp => (
              <div key={rsvp._id} className="rsvp-item">
                <span>
                  {rsvp.user.name}
                  {rsvp.user._id === user?.id && " (You)"}
                </span>
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
