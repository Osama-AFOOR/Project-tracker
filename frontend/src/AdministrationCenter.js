import React, { useEffect, useState } from "react";
import ResourceManagement from "./ResourceManagement";

export default function AdministrationCenter({ token }) {
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://project-tracker-production-1803.up.railway.app";

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "Viewer"
  });

  const [editTask, setEditTask] = useState(null);
  const [editComment, setEditComment] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  // ====================
  // USER MANAGEMENT
  // ====================

  const addUser = async () => {
    try {

      const res = await fetch(
        `${API_BASE}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(newUser)
        }
      );

      const data = await res.json();

      alert(
        data.message ||
        "User created"
      );

      setNewUser({
        username: "",
        password: "",
        role: "Viewer"
      });

      loadData();

    } catch (err) {
      console.error(err);
    }
  };

  const changeUserRole = async (
    id,
    role
  ) => {

    try {

      const res = await fetch(
        `${API_BASE}/admin/users/${id}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            role
          })
        }
      );

      const updatedUser =
        await res.json();

      setUsers(
        users.map((user) =>
          user._id === id
            ? updatedUser
            : user
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (
    id
  ) => {

    if (
      !window.confirm(
        "Delete user?"
      )
    )
      return;

    try {

      await fetch(
        `${API_BASE}/admin/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              token
          }
        }
      );

      setUsers(
        users.filter(
          (user) =>
            user._id !== id
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  // ====================
  // TASK MANAGEMENT
  // ====================

  const updateTask =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/admin/tasks/${editTask._id}`,
            {
              method:
                "PUT",

              headers: {
                Authorization:
                  token,

                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  editTask
                )
            }
          );

        const updated =
          await res.json();

        setTasks(
          tasks.map(
            (task) =>
              task._id ===
              updated._id
                ? updated
                : task
          )
        );

        setEditTask(null);

      } catch (err) {
        console.error(err);
      }
    };

  const deleteTask =
    async (id) => {

      if (
        !window.confirm(
          "Delete task?"
        )
      )
        return;

      try {

        await fetch(
          `${API_BASE}/admin/tasks/${id}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                token
            }
          }
        );

        setTasks(
          tasks.filter(
            (task) =>
              task._id !== id
          )
        );

      } catch (err) {
        console.error(err);
      }
    };

  // ====================
  // COMMENT MANAGEMENT
  // ====================

  const updateComment =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/admin/comments/${editComment.taskId}/${editComment._id}`,
            {
              method:
                "PUT",

              headers: {
                Authorization:
                  token,

                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  editComment
                )
            }
          );

        const updated =
          await res.json();

        setComments(
          comments.map(
            (
              comment
            ) =>
              comment._id ===
              updated._id
                ? updated
                : comment
          )
        );

        setEditComment(
          null
        );

      } catch (err) {
        console.error(err);
      }
    };

  const deleteComment =
    async (
      taskId,
      commentId
    ) => {

      if (
        !window.confirm(
          "Delete comment?"
        )
      )
        return;

      try {

        await fetch(
          `${API_BASE}/admin/comments/${taskId}/${commentId}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                token
            }
          }
        );

        setComments(
          comments.filter(
            (
              comment
            ) =>
              comment._id !==
              commentId
          )
        );

      } catch (err) {
        console.error(err);
      }
    };

  if (loading)
    return (
      <p>
        Loading Administration
        Center...
      </p>
    );

  return (
    <div className="admin-center">

      <h2>
        ⚙ Administration
        Center
      </h2>

      {/* SUMMARY CARDS */}

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

        <div className="stat-card">
          <h3>⚠ Critical</h3>
          <p>
            {
              tasks.filter(
                (task) =>
                  task.isCritical
              ).length
            }
          </p>
        </div>

      </div>

      {/* TABS */}

      <div className="admin-tabs">

        <button
          className={
            activeTab ===
            "users"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "users"
            )
          }
        >
          Users
        </button>

        <button
          className={
            activeTab ===
            "resources"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "resources"
            )
          }
        >
          Resources
        </button>

        <button
          className={
            activeTab ===
            "tasks"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "tasks"
            )
          }
        >
          Tasks
        </button>

        <button
          className={
            activeTab ===
            "comments"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "comments"
            )
          }
        >
          Comments
        </button>

        <button
          className={
            activeTab ===
            "reports"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "reports"
            )
          }
        >
          Reports
        </button>

      </div>

      {/* USERS */}

      {activeTab === "users" && (
        <div className="admin-section">

          <h3>
            👤 User Management
          </h3>

          <div className="user-form">

            <input
              placeholder="Username"
              value={
                newUser.username
              }
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  username:
                    e.target
                      .value
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={
                newUser.password
              }
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  password:
                    e.target
                      .value
                })
              }
            />

            <select
              value={
                newUser.role
              }
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role:
                    e.target
                      .value
                })
              }
            >
              <option value="Admin">
                Admin
              </option>
              <option value="Approver">
                Approver
              </option>
              <option value="Editor">
                Editor
              </option>
              <option value="Viewer">
                Viewer
              </option>
            </select>

            <button
              onClick={addUser}
            >
              Add User
            </button>

          </div>

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  Username
                </th>
                <th>Role</th>
                <th>
                  Change Role
                </th>
                <th>
                  Delete
                </th>
              </tr>
            </thead>

            <tbody>

              {users.map(
                (user) => (
                  <tr
                    key={
                      user._id
                    }
                  >
                    <td>
                      {
                        user.username
                      }
                    </td>

                    <td>
                      {
                        user.role
                      }
                    </td>

                    <td>

                      <select
                        value={
                          user.role
                        }
                        onChange={(
                          e
                        ) =>
                          changeUserRole(
                            user._id,
                            e
                              .target
                              .value
                          )
                        }
                      >
                        <option value="Admin">
                          Admin
                        </option>
                        <option value="Approver">
                          Approver
                        </option>
                        <option value="Editor">
                          Editor
                        </option>
                        <option value="Viewer">
                          Viewer
                        </option>
                      </select>

                    </td>

                    <td>

                      <button
                        onClick={() =>
                          deleteUser(
                            user._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

      {activeTab === "resources" && (
        <ResourceManagement token={token} />
      )}

      {/* TASKS */}

      {activeTab === "tasks" && (
        <div className="admin-section">

          <h3>📋 Tasks</h3>

          {tasks.map(
            (task) => (
              <div
                key={
                  task._id
                }
                className="admin-item-card"
              >

                {editTask &&
                editTask._id ===
                  task._id ? (
                  <>
                    <input
                      value={
                        editTask.title
                      }
                      onChange={(
                        e
                      ) =>
                        setEditTask(
                          {
                            ...editTask,
                            title:
                              e
                                .target
                                .value
                          }
                        )
                      }
                    />

                    <input
                      value={
                        editTask.status
                      }
                      onChange={(
                        e
                      ) =>
                        setEditTask(
                          {
                            ...editTask,
                            status:
                              e
                                .target
                                .value
                          }
                        )
                      }
                    />

                    <button
                      onClick={
                        updateTask
                      }
                    >
                      Save
                    </button>

                    <button
                      onClick={() =>
                        setEditTask(
                          null
                        )
                      }
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <strong>
                      {
                        task.title
                      }
                    </strong>

                    <p>
                      {
                        task.status
                      }
                    </p>

                    <button
                      onClick={() =>
                        setEditTask(
                          task
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(
                          task._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </>
                )}

              </div>
            )
          )}

        </div>
      )}

      {/* COMMENTS */}

      {activeTab === "comments" && (
        <div className="admin-section">

          <h3>
            💬 Comments
          </h3>

          {comments.map(
            (
              comment
            ) => (
              <div
                key={
                  comment._id
                }
                className="admin-item-card"
              >

                {editComment &&
                editComment._id ===
                  comment._id ? (
                  <>
                    <input
                      value={
                        editComment.text
                      }
                      onChange={(
                        e
                      ) =>
                        setEditComment(
                          {
                            ...editComment,
                            text:
                              e
                                .target
                                .value
                          }
                        )
                      }
                    />

                    <button
                      onClick={
                        updateComment
                      }
                    >
                      Save
                    </button>

                    <button
                      onClick={() =>
                        setEditComment(
                          null
                        )
                      }
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      {
                        comment.text
                      }
                    </p>

                    <button
                      onClick={() =>
                        setEditComment(
                          comment
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteComment(
                          comment.taskId,
                          comment._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </>
                )}

              </div>
            )
          )}

        </div>
      )}

      {/* REPORTS */}

      {activeTab === "reports" && (
        <div className="admin-section">

          <h3>
            📊 Workforce Reports
          </h3>

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