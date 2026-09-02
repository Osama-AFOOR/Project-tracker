// File: src/Login.js
import React, { useState } from "react";
import "./Login.css"; // ✅ import the stylesheet

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Login failed: " + errData.error);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (err) {
      console.error("Login error:", err);
      alert("Error logging in");
    }
  };

  return (
    
    <div className="login-page">
      <div className="login-card">
        {/* Optional logo area */}
        <div className="login-logo">
          {/* Replace with your logo image if you have one */}
          {/* <img src="/logo.png" alt="Company Logo" /> */}
        </div>

        <h2>🔐 Sign in</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {/* Info text below button */}
        <p className="login-info">
          Please sign in with your organizational account to access the system securely.
        </p>
      </div>
    </div>
  );
}

export default Login;
