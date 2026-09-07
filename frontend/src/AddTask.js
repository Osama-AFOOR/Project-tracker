// File: AddTask.js

import React, { useState } from "react";

// ✅ Define API base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AddTask({ token, onTaskAdded }) {
  // -----------------------------
  // Store form values
  // -----------------------------
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [addDate, setAddDate] = useState("");
  const [responsible, setResponsible] = useState("");
  const [area, setArea] = useState("");
  const [floor, setFloor] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("Open"); // ✅ dropdown field

  // -----------------------------
  // Handle form submission
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Upload all images first
      let imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append("image", images[i]);

        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadRes.json();

        // ✅ Backend returns { url: "..." }, not imageUrl
        if (uploadData.url) {
          imageUrls.push(uploadData.url);
        }
      }

      // ✅ Send task data to backend
      const newTaskRes = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          title: taskName,
          description,
          addDate,
          responsible,
          area,
          floor,
          roomNo,
          status,
          imageUrl: imageUrls // ✅ array of Cloudinary URLs
        })
      });

      const newTask = await newTaskRes.json();
      if (onTaskAdded) onTaskAdded(newTask);

      // ✅ Reset form
      setTaskName("");
      setDescription("");
      setAddDate("");
      setResponsible("");
      setArea("");
      setFloor("");
      setRoomNo("");
      setImages([]);
      setStatus("Open");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // -----------------------------
  // What shows on the screen
  // -----------------------------
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        /><br />

        <textarea
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /><br />

        <input
          type="date"
          value={addDate}
          onChange={(e) => setAddDate(e.target.value)}
        /><br />

        <input
          type="text"
          placeholder="Follow-up responsible"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
        /><br />

        <input
          type="text"
          placeholder="Task area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        /><br />

        <input
          type="text"
          placeholder="Floor"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
        /><br />

        <input
          type="text"
          placeholder="Room No."
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
        /><br />

        {/* ✅ Status dropdown */}
        <label>Status: </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select><br />

        <input
          type="file"
          multiple
          onChange={(e) => setImages([...e.target.files])}
        /><br />

        <button type="submit">Save Task</button>
      </form>
    </div>
  );
}

export default AddTask;
