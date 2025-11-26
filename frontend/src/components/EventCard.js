import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
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

  return (
    <div className="event-card">
      <div className="event-header">
        <h3>{event.title}</h3>
        <span className="event-category">{event.category}</span>
      </div>
      
      <p className="event-description">{event.description}</p>
      
      <div className="event-details">
        <div className="event-date">
          <strong>📅</strong> {formatDate(event.date)}
        </div>
        <div className="event-location">
          <strong>📍</strong> {event.location}
        </div>
        <div className="event-creator">
          <strong>👤</strong> Hosted by {event.creator?.name}
        </div>
      </div>
      
      <Link to={`/event/${event._id}`} className="view-details-btn">
        View Details & RSVP
      </Link>
    </div>
  );
};

export default EventCard;
