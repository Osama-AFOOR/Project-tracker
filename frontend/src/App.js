// File: App.js
import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";
import Login from './Login';
import AddTask from './AddTask';
// eslint-disable-next-line no-unused-vars
import TaskDetails from './TaskDetails';
import UpdateTask from './UpdateTask';
import AdminPanel from './AdminPanel';
import './App.css';

// ✅ Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ Define API base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState("");
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ✅ Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Search filters
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    area: "",
    floor: "",
    roomNo: ""
  });

useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    } catch (err) {
      console.error("Token decode error:", err);
      setRole("");
    }

    const loadAllTasks = () => {
      fetch(`${API_URL}/tasks`, {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setTasks(data) : setTasks([]))
        .catch(err => console.error("Error fetching tasks:", err));
    };

    loadAllTasks();
  }
}, [token]); // ✅ only depends on token

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setRole("");
    setTasks([]);
    setCurrentPage("dashboard");
    setSelectedTaskId(null);
  };

  // ✅ Apply date filter
  const applyDateFilter = () => {
    let filtered = tasks;
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.addDate) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.addDate) <= new Date(endDate));
    }
    setTasks(filtered);
  };

  // ✅ Handle search
  const handleSearch = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const res = await fetch(`${API_URL}/tasks/search?${params.toString()}`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  };

  // ✅ Reset search
  const handleReset = () => {
    setFilters({ name: "", status: "", area: "", floor: "", roomNo: "" });
    setStartDate("");
    setEndDate("");
    loadAllTasks();
  };

  // ✅ Chart data
  const chartData = {
    labels: ["Completed", "In Progress", "Open"],
    datasets: [
      {
        data: [
          tasks.filter(t => t.status === "Completed").length,
          tasks.filter(t => t.status === "In Progress").length,
          tasks.filter(t => t.status === "Open").length
        ],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336"]
      }
    ]
  };

  return (
    <div className="app-container">
      <h1>📋 Project Log Dashboard</h1>

      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <>
          {/* ✅ Navigation Bar */}
          <nav className="top-bar">
            <button onClick={() => { setCurrentPage("dashboard"); setSelectedTaskId(null); }}>
              Dashboard
            </button>

            {(role === "Admin" || role === "Editor") && (
              <button onClick={() => { setCurrentPage("addTask"); setSelectedTaskId(null); }}>
                Add Task
              </button>
            )}

            {role === "Admin" && (
              <button onClick={() => setCurrentPage("adminPanel")}>
                Admin Panel
              </button>
            )}

            <button onClick={logout}>Logout</button>
          </nav>

          {/* ✅ Dashboard */}
          {currentPage === "dashboard" && !selectedTaskId && (
            <div>
              {/* ✅ Summary + Chart Side by Side */}
              <div className="dashboard-top">
                {/* Left side: Summary + Date Filter */}
                <div className="dashboard-left">
                  <h2>Task Overview</h2>
                  <div className="summary-stats">
                    <p>Total Tasks: {tasks.length}</p>
                    <p>Finished: {tasks.filter(t => t.status === "Completed").length}</p>
                    <p>In Progress: {tasks.filter(t => t.status === "In Progress").length}</p>
                    <p>Not Started: {tasks.filter(t => t.status === "Open").length}</p>
                  </div>

                  {/* Date Filter */}
                  <div className="date-filter">
                    <label>From: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
                    <label>To: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
                    <button onClick={applyDateFilter}>Apply</button>
                  </div>
                </div>

                {/* Right side: Pie Chart */}
                <div className="dashboard-right">
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              {/* ✅ Search Container */}
              <div className="search-container">
                <div className="search-fields">
                  <input
                    placeholder="Task name"
                    value={filters.name}
                    onChange={e => setFilters({ ...filters, name: e.target.value })}
                  />
                  <select
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                  <input
                    placeholder="Area"
                    value={filters.area}
                    onChange={e => setFilters({ ...filters, area: e.target.value })}
                  />
                  <input
                    placeholder="Floor"
                    value={filters.floor}
                    onChange={e => setFilters({ ...filters, floor: e.target.value })}
                  />
                  <input
                    placeholder="Room No."
                    value={filters.roomNo}
                    onChange={e => setFilters({ ...filters, roomNo: e.target.value })}
                  />
                </div>

                {/* Buttons centered below */}
                <div className="search-actions">
                  <button onClick={handleSearch}>Search</button>
                  <button onClick={handleReset}>Reset</button>
                </div>
              </div>

              {/* ✅ Task List */}
              {tasks.map(task => {
                const formattedDate = task.addDate
                  ? new Date(task.addDate).toISOString().split("T")[0]
                  : "";

                return (
                  <div key={task._id || task.id} className="task-card">
                    {/* Top row: Date + Room No */}
                    <div className="task-meta">
                      <span className="task-date">📅 {formattedDate}</span>
                      <span className="task-room"> Room {task.roomNo}</span>
                    </div>

                    {/* Title + Status */}
                    <div className="task-header">
                      <strong>{task.title}</strong>
                      <span className={`status-badge ${task.status.toLowerCase().replace(" ", "-")}`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Description (one line only) */}
                    <p className="task-desc">{task.description}</p>

                    {/* View button */}
                    <button onClick={() => setSelectedTaskId(task._id)}>View</button>
                  </div>
                );
              })}
            </div>
          )}

                   {/* ✅ AddTask */}
          {currentPage === "addTask" && (
            <AddTask 
              token={token} 
              onTaskAdded={(newTask) => {
                setTasks([...tasks, newTask]);
                setCurrentPage("dashboard");
              }} 
            />
          )}

          {/* ✅ AdminPanel */}
          {currentPage === "adminPanel" && role === "Admin" && (
            <AdminPanel token={token} />
          )}

          {/* ✅ UpdateTask dedicated page */}
          {currentPage === "updateTask" && selectedTaskId && (
            <UpdateTask 
              taskId={selectedTaskId} 
              token={token} 
              onBack={() => setCurrentPage("dashboard")} 
            />
          )}
        </>
      )}
      
      {/* ✅ Footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Project Log Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
