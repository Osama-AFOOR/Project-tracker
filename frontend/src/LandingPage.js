//file: src/LandingPage 
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function LandingPage({ token, setCurrentPage }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/activities/recent`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => setActivities(data))
        .catch(err => console.error("Error fetching activities:", err));
    }
  }, [token]);

  return (
    <div className="landing-container">
      <h1>Welcome to Project Tracker</h1>
      <div className="card-container">
        
        {/* Card 1: Dashboard */}
        <div className="card" onClick={() => setCurrentPage("dashboard")}>
          <h2>📋 Project Log Dashboard</h2>
          <p>View and manage all tasks</p>
        </div>

        {/* Card 2: Recent Activities */}
        <div className="card">
          <h2>🕒 Recent Activities</h2>
          {activities.length === 0 ? (
            <p>No recent activity</p>
          ) : (
            <ul>
              {activities.map((a, i) => (
                <li key={i}>
                  <strong>{a.action}</strong> - {a.details} ({new Date(a.timestamp).toLocaleString()})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
