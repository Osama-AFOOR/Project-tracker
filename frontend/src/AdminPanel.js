// File: src/AdminPanel.js

import React, { useEffect, useState } from "react";

function AdminPanel({ token }) {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "Viewer" });
  const [editTask, setEditTask] = useState(null);
  const [editComment, setEditComment] = useState(null);

  const API_BASE = "https://project-tracker-production-1803.up.railway.app";

  // ✅ Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users`, { headers: { Authorization: token } }),
          fetch(`${API_BASE}/admin/tasks`, { headers: { Authorization: token } }),
          fetch(`${API_BASE}/admin/comments`, { headers: { Authorization: token } }),
        ]);

        setUsers(await usersRes.json());
        setTasks(await tasksRes.json());
        setComments(await commentsRes.json());
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // --------------------
  // User Management
  // --------------------
  const addUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      alert(data.message);
      setNewUser({ username: "", password: "", role: "Viewer" });
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const changeUserRole = async (id, newRole) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ role: newRole })
    });
    const updatedUser = await res.json();
    setUsers(users.map(u => (u._id === id ? updatedUser : u)));
  };

  const deleteUser = async (id) => {
    await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    setUsers(users.filter(u => u._id !== id));
  };

  // --------------------
  // Task Management
  // --------------------
  const updateTask = async () => {
    const res = await fetch(`${API_BASE}/admin/tasks/${editTask._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(editTask)
    });
    const updated = await res.json();
    setTasks(tasks.map(t => (t._id === updated._id ? updated : t)));
    setEditTask(null);
  };

  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/admin/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    setTasks(tasks.filter(t => t._id !== id));
  };

  // --------------------
  // Comment Management
  // --------------------
  const updateComment = async () => {
    const res = await fetch(`${API_BASE}/admin/comments/${editComment.taskId}/${editComment._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(editComment)
    });
    const updated = await res.json();
    setComments(comments.map(c => (c._id === updated._id ? updated : c)));
    setEditComment(null);
  };

  const deleteComment = async (taskId, commentId) => {
    await fetch(`${API_BASE}/admin/comments/${taskId}/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    setComments(comments.filter(c => c._id !== commentId));
  };

  if (loading) return <p>Loading admin data...</p>;

  return (
    <div>
      <h2>🔧 Admin Panel</h2>

      {/* Users */}
      <h3>👤 Users</h3>
      <input
        placeholder="Username"
        value={newUser.username}
        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        value={newUser.password}
        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
      />
      <select
        value={newUser.role}
        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
      >
        <option value="Admin">Admin</option>
        <option value="Approver">Approver</option>
        <option value="Editor">Editor</option>
        <option value="Viewer">Viewer</option>
      </select>
      <button onClick={addUser}>Add User</button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => changeUserRole(user._id, e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="Approver">Approver</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tasks */}
      <h3>📋 Tasks</h3>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            {editTask && editTask._id === task._id ? (
              <>
                <input
                  value={editTask.title}
                  onChange={e => setEditTask({ ...editTask, title: e.target.value })}
                />
                <input
                  value={editTask.status}
                  onChange={e => setEditTask({ ...editTask, status: e.target.value })}
                />
                <button onClick={updateTask}>Save</button>
                <button onClick={() => setEditTask(null)}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{task.title}</strong> - {task.status}
                <button onClick={() => setEditTask(task)}>Edit</button>
                <button onClick={() => deleteTask(task._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Comments */}
      <h3>💬 Comments</h3>
      <ul>
        {comments.map(comment => (
          <li key={comment._id}>
            {editComment && editComment._id === comment._id ? (
              <>
                <input
                  value={editComment.text}
                  onChange={e => setEditComment({ ...editComment, text: e.target.value })}
                />
                <button onClick={updateComment}>Save</button>
                <button onClick={() => setEditComment(null)}>Cancel</button>
              </>
            ) : (
              <>
                {comment.text} (Task: {comment.taskId})
                <button onClick={() => setEditComment(comment)}>Edit</button>
                <button onClick={() => deleteComment(comment.taskId, comment._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
