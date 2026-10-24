import React, { useEffect, useState } from "react";
import ResourceManagement from "./ResourceManagement";

export default function AdministrationCenter({ token }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [resources, setResources] = useState([]);

  const [activeTab, setActiveTab] = useState("users");

  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://project-tracker-production-1803.up.railway.app";

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [
        usersRes,
        tasksRes,
        commentsRes,
        resourcesRes
      ] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: token }
        }),
        fetch(`${API_BASE}/admin/tasks`, {
          headers: { Authorization: token }
        }),
        fetch(`${API_BASE}/admin/comments`, {
          headers: { Authorization: token }
        }),
        fetch(`${API_BASE}/resources`, {
          headers: { Authorization: token }
        })
      ]);

      setUsers(await usersRes.json());
      setTasks(await tasksRes.json());
      setComments(await commentsRes.json());
      setResources(await resourcesRes.json());

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-center">

      <h2>⚙ Administration Center</h2>

      {/* Summary Cards */}

      <div className="admin-cards">

        <div className="stat-card">
          <h3>👤 Users</h3>
          <p>{users.length}</p>
        </div>

        <div className="stat-card">
          <h3>📋 Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div className="stat-card">
          <h3>💬 Comments</h3>
          <p>{comments.length}</p>
        </div>

        <div className="stat-card">
          <h3>👷 Resources</h3>
          <p>{resources.length}</p>
        </div>

      </div>

      {/* Tabs */}

      <div className="admin-tabs">

        <button
          className={
            activeTab === "users"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("users")
          }
        >
          Users
        </button>

        <button
          className={
            activeTab === "resources"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("resources")
          }
        >
          Resources
        </button>

        <button
          className={
            activeTab === "tasks"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("tasks")
          }
        >
          Tasks
        </button>

        <button
          className={
            activeTab === "comments"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("comments")
          }
        >
          Comments
        </button>

        <button
          className={
            activeTab === "reports"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("reports")
          }
        >
          Reports
        </button>

      </div>

      {/* USERS */}

      {activeTab === "users" && (
        <div className="admin-section">

          <h3>User Management</h3>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* RESOURCES */}

      {activeTab === "resources" && (
        <ResourceManagement token={token} />
      )}

      {/* TASKS */}

      {activeTab === "tasks" && (
        <div className="admin-section">

          <h3>Task Management</h3>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Area</th>
              </tr>
            </thead>

            <tbody>

              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{task.area}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

      {/* COMMENTS */}

      {activeTab === "comments" && (
        <div className="admin-section">

          <h3>Comments</h3>

          <table className="admin-table">

            <thead>
              <tr>
                <th>Comment</th>
              </tr>
            </thead>

            <tbody>

              {comments.map((comment) => (
                <tr key={comment._id}>
                  <td>{comment.text}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

      {/* REPORTS */}

      {activeTab === "reports" && (

        <div className="admin-section">

          <h3>📊 Workforce Reports</h3>

          <div className="report-grid">

            <div className="report-card">
              Resource Utilization
            </div>

            <div className="report-card">
              Trade Utilization
            </div>

            <div className="report-card">
              Building Utilization
            </div>

            <div className="report-card">
              Workforce Productivity
            </div>

            <div className="report-card">
              Excel Reports
            </div>

            <div className="report-card">
              PDF Reports
            </div>

          </div>

        </div>
      )}

    </div>
  );
}