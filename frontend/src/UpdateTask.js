// File: UpdateTask.js
import React, { useState, useEffect } from "react";

// ✅ Define API base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function UpdateTask({ taskId, token, onBack }) {
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, {
          headers: { Authorization: token }
        });
        const data = await res.json();
        setTask(data);
        setFormData({ ...data });

        // decode role from token
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch (err) {
        console.error("Error fetching task:", err);
      }
    };
    fetchTask();
  }, [taskId, token]);

  if (!task) return <p>Loading task...</p>;

  // ✅ Save updates
  const saveTask = async () => {
    let payload = {};

    if (role === "Approver") {
      // Approvers can only update status
      payload = { status: formData.status };
    } else if (role === "Admin" || role === "Editor") {
      // Upload new images if any
      let imageUrls = Array.isArray(formData.imageUrl) ? [...formData.imageUrl] : [];
      for (let file of newImages) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formDataUpload
        });
        const uploadData = await uploadRes.json();
        imageUrls.push(uploadData.imageUrl);
      }

      // Admin/Editor can update full fields
      payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        imageUrl: imageUrls,
        responsible: formData.responsible,
        area: formData.area,
        floor: formData.floor,
        roomNo: formData.roomNo
      };
    }

    try {
      const res = await fetch(`${API_URL}/admin/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Error saving task: " + errData.error);
        return;
      }

      const updated = await res.json();
      setTask(updated);
      alert("Task updated successfully");
      onBack();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ✅ Delete image (only Admin/Editor)
  const deleteImage = (index) => {
    if (role !== "Admin" && role !== "Editor") return;
    setFormData({
      ...formData,
      imageUrl: formData.imageUrl.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="update-task">
      <h2>Edit Task</h2>

      {/* Viewer cannot edit */}
      {role === "Viewer" && (
        <p>You do not have permission to edit tasks.</p>
      )}

      {/* Approver: can only update status */}
      {role === "Approver" && (
        <>
          <label>Status:</label>
          <select
            value={formData.status || ""}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Canceled">Canceled</option>
          </select>
          <button onClick={saveTask}>Save Status</button>
          <button onClick={onBack}>Cancel</button>
        </>
      )}

      {/* Admin or Editor: full edit */}
      {(role === "Admin" || role === "Editor") && (
        <>
          <label>Title:</label>
          <input
            value={formData.title || ""}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <label>Description:</label>
          <textarea
            value={formData.description || ""}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />

          <label>Status:</label>
          <select
            value={formData.status || ""}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Canceled">Canceled</option>
          </select>

          <h3>Images</h3>
          <div className="task-images">
            {formData.imageUrl?.map((img, i) => (
              <div key={i} style={{ display: "inline-block", position: "relative" }}>
                <img src={img} alt="task" />
                <button onClick={() => deleteImage(i)}>✖</button>
              </div>
            ))}
          </div>
          <input type="file" multiple onChange={e => setNewImages([...e.target.files])} />

          <button onClick={saveTask}>Save Task</button>
          <button onClick={onBack}>Cancel</button>
        </>
      )}
    </div>
  );
}

export default UpdateTask;