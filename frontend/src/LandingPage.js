// File: src/LandingPage
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function LandingPage({ token, setCurrentPage }) {
  const [activities, setActivities] = useState([]);
  const [role, setRole] = useState("");

  // ✅ Decode role from token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, [token]);

  // ✅ Fetch activities only if Admin
  useEffect(() => {
    if (token && role === "Admin") {
      fetch(`${API_URL}/activities/all`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => {
          console.log("Activities from server:", data); // 🔍 Debug log
          setActivities(data);
        })
        .catch(err => console.error("Error fetching activities:", err));
    }
  }, [token, role]);

  return (
    <div className="landing-container">
      <h1>Welcome to Project Tracker</h1>
      <div className="card-container">
        
        {/* Card 1: Dashboard */}
        <div className="card" onClick={() => setCurrentPage("dashboard")}>
          <h2>📋 Project Log Dashboard</h2>
          <p>View and manage all tasks</p>
        </div>

        {/* Card 2: Recent Activities (Admins only) */}
        {role === "Admin" && (
          <div className="card">
            <h2>🕒 Recent Activities (All Users)</h2>
            {activities.length === 0 ? (
              <p>No recent activity</p>
            ) : (
              <ul>
                {activities.map((a, i) => (
                  <li key={i}>
                    <strong>{a.userId?.username || "Unknown User"}</strong>{" "}
                    ({a.userId?.role || "Unknown Role"}) →{" "}
                    {a.action} - {a.details} (
                    {new Date(a.timestamp).toLocaleString()})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
