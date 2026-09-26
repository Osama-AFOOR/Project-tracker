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
import TaskDetails from './TaskDetails';
import UpdateTask from './UpdateTask';
import AdminPanel from './AdminPanel';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState("");
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    status: "",
    area: "",
    floor: "",
    roomNo: ""
  });

  const [activities, setActivities] = useState([]);

 const loadAllTasks = React.useCallback(() => {
  fetch(`${API_URL}/tasks`, {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      let tasksArray = Array.isArray(data) ? data : [];
      // ✅ Default sort: critical first
      tasksArray.sort((a, b) => (b.isCritical === true) - (a.isCritical === true));
      setTasks(tasksArray);
    })
    .catch(err => console.error("Error fetching tasks:", err));
}, [token]);


  const loadActivities = React.useCallback(() => {
    fetch(`${API_URL}/activities/recent`, {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setActivities(data) : setActivities([]))
      .catch(err => console.error("Error fetching activities:", err));
  }, [token]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Token decode error:", err);
        setRole("");
      }
      loadAllTasks();
      loadActivities();
      setCurrentPage("landing");
    }
  }, [token, loadAllTasks, loadActivities]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setRole("");
    setTasks([]);
    setActivities([]);
    setCurrentPage("landing");
    setSelectedTaskId(null);
  };

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

  const handleReset = () => {
    setFilters({ name: "", status: "", area: "", floor: "", roomNo: "" });
    setStartDate("");
    setEndDate("");
    loadAllTasks();
  };

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
          <nav className="top-bar">
            <button onClick={() => { setCurrentPage("landing"); setSelectedTaskId(null); }}>
              Home
            </button>
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

          {currentPage === "landing" && (
            <div className="landing-container">
              <h2>Welcome to Project Tracker</h2>
              <div className="card-container">
                <div className="card" onClick={() => setCurrentPage("dashboard")}>
                  <h3>📋 Project Log Dashboard</h3>
                  <p>View and manage all tasks</p>
                </div>
                <div className="card">
                  <h3>🕒 Recent Activities</h3>
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
          )}

          {currentPage === "dashboard" && !selectedTaskId && (
            <div>
              <div className="dashboard-top">
                <div className="dashboard-left">
                  <h2>Task Overview</h2>
                  <div className="summary-stats">
                    <p>Total Tasks: {tasks.length}</p>
                    <p>Finished: {tasks.filter(t => t.status === "Completed").length}</p>
                    <p>In Progress: {tasks.filter(t => t.status === "In Progress").length}</p>
                    <p>Not Started: {tasks.filter(t => t.status === "Open").length}</p>
                  </div>
                  <div className="date-filter">
                    <label>From: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
                    <label>To: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
                    <button onClick={applyDateFilter}>Apply</button>
                  </div>
                </div>
                <div className="dashboard-right">
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
{/* ✅ Sorting Options */}
<div className="sort-container">
  <label>Sort by: </label>
  <select
    defaultValue="critical"   // ✅ default sorting is Critical First
    onChange={e => {
      const value = e.target.value;
      let sorted = [...tasks];
      if (value === "date") {
        sorted.sort((a, b) => new Date(b.addDate) - new Date(a.addDate));
      } else if (value === "status") {
        sorted.sort((a, b) => a.status.localeCompare(b.status));
      } else if (value === "critical") {
        sorted.sort((a, b) => (b.isCritical === true) - (a.isCritical === true));
      }
      setTasks(sorted);
    }}
  >
    <option value="critical">Critical First</option>
    <option value="date">Date</option>
    <option value="status">Status</option>
    <option value="">Default</option>
  </select>
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

  <div className="search-actions">
    <button onClick={handleSearch}>Search</button>
    <button onClick={handleReset}>Reset</button>
  </div>
</div>

{/* ✅ Task List */}
<div className="task-list">
  {tasks.map(task => {
    const formattedDate = task.addDate
      ? new Date(task.addDate).toISOString().split("T")[0]
      : "";

    return (
      <div 
        key={task._id || task.id} 
        className={`task-card ${task.isCritical ? "critical" : ""}`}
      >
         {/* Image at top */}
        <div className="task-image">
          {Array.isArray(task.imageUrl) && task.imageUrl.length > 0 ? (
            <img src={task.imageUrl[0]} alt={task.title} />
          ) : Array.isArray(task.images) && task.images.length > 0 ? (
            <img src={task.images[0]} alt={task.title} />
          ) : task.imageUrl ? (
            <img src={task.imageUrl} alt={task.title} />
          ) : (
            <div className="placeholder">No Image</div>
          )}
        </div>


        {/* Info below */}
        <div className="task-info">
          <div className="task-meta">
            <span className="task-date">📅 {formattedDate}</span>
            <span className="task-room">Room {task.roomNo}</span>
          </div>

          <div className="task-header">
            <strong>{task.title}</strong>
            <span className={`status-badge ${task.status.toLowerCase().replace(" ", "-")}`}>
              {task.status}
            </span>
          </div>

          <p className="task-desc">{task.description}</p>

          {task.isCritical && <p className="critical-mark">⚠ Critical</p>}

          <button onClick={() => setSelectedTaskId(task._id)}>View</button>
        </div>
      </div>
    );
  })}
</div>

            </div>
          )}


          {/* ✅ TaskDetails when a task is selected */}
          {currentPage === "dashboard" && selectedTaskId && (
            <TaskDetails
              taskId={selectedTaskId}
              onBack={() => setSelectedTaskId(null)}
              setCurrentPage={setCurrentPage}
            />
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
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Project Log Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
