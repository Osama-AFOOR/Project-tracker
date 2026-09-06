 // File: TaskDetails.js
import React, { useState, useEffect } from 'react';
import './App.css';

// ✅ Define API base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function TaskDetails({ taskId, onBack, setCurrentPage }) {
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [touchStartX, setTouchStartX] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [role, setRole] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newImages, setNewImages] = useState([]);

  // ✅ Fetch full task by ID (with comments)
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, {
          headers: { "Authorization": localStorage.getItem("token") }
        });
        if (!res.ok) throw new Error("Failed to fetch task");
        const data = await res.json();
        setTask(data);
        setComments(data.comments || []);

        // decode role from token
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setRole(payload.role);
        }
      } catch (err) {
        console.error("Error fetching task:", err);
      }
    };
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // ✅ Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      else if (e.key === "ArrowRight") setSelectedIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : prev));
      else if (e.key === "Escape") { setSelectedIndex(null); setSelectedImages([]); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, selectedImages]);

  if (!task) return <p>Loading task...</p>;

  // ✅ Lightbox helpers
  const openImage = (images, index) => { setSelectedImages(images); setSelectedIndex(index); };
  const closeImage = () => { setSelectedIndex(null); setSelectedImages([]); };
  const showPrev = () => { if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1); };
  const showNext = () => { if (selectedIndex < selectedImages.length - 1) setSelectedIndex(selectedIndex + 1); };
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) showNext(); else if (diff < -50) showPrev();
    setTouchStartX(null);
  };

  // ✅ Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      let imageUrls = [];
      for (let i = 0; i < newImages.length; i++) {
        if (newImages[i] instanceof File) {
          const formData = new FormData();
          formData.append("image", newImages[i]);
          const uploadRes = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
          const uploadData = await uploadRes.json();
          imageUrls.push(uploadData.imageUrl);
        }
      }

      const res = await fetch(`${API_URL}/tasks/${task._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": localStorage.getItem("token") },
        body: JSON.stringify({ text: newComment, images: imageUrls })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Error adding comment: " + errData.error);
        return;
      }

      const addedComment = await res.json();
      setComments([...comments, addedComment]);
      setNewComment("");
      setNewImages([]);
    } catch (err) {
      console.error("Add comment failed:", err);
      alert("Failed to add comment");
    }
  };

  // ✅ Edit comment
  const handleEditComment = async (commentId) => {
    try {
      let imageUrls = [...editImages];
      for (let i = 0; i < editImages.length; i++) {
        if (editImages[i] instanceof File) {
          const formData = new FormData();
          formData.append("image", editImages[i]);
          const uploadRes = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
          const uploadData = await uploadRes.json();
          imageUrls[i] = uploadData.imageUrl;
        }
      }

      const res = await fetch(`${API_URL}/tasks/${task._id}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": localStorage.getItem("token") },
        body: JSON.stringify({ text: editText, images: imageUrls })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Error editing comment: " + errData.error);
        return;
      }

      const updatedComment = await res.json();
      setComments(comments.map(c => c._id === commentId ? updatedComment : c));
      setEditingCommentId(null);
      setEditText("");
      setEditImages([]);
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Failed to edit comment");
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    const res = await fetch(`${API_URL}/tasks/${task._id}/comments/${commentId}`, {
      method: "DELETE",
      headers: { "Authorization": localStorage.getItem("token") }
    });
    if (!res.ok) {
      const errData = await res.json();
      alert("Error deleting comment: " + errData.error);
      return;
    }
    setComments(comments.filter(c => c._id !== commentId));
  };

  return (
    <div className="task-details">
      <h2>Task Details</h2>

      <div className="task-card">
        <p><strong>Task Name:</strong> {task.title}</p>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Add Date:</strong> {task.addDate ? new Date(task.addDate).toLocaleDateString() : "Not set"}</p>
        <p><strong>Responsible:</strong> {task.responsible}</p>
        <p><strong>Area:</strong> {task.area}</p>
        <p><strong>Floor:</strong> {task.floor}</p>
        <p><strong>Room No.:</strong> {task.roomNo}</p>
        <p><strong>Status:</strong> {task.status}</p>
      </div>

          {/* ✅ Show task images */}
      {task.imageUrl && task.imageUrl.length > 0 && (
        <div className="task-images">
          <h3>Attached Images</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {task.imageUrl.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`task-${i}`}
                onClick={() => openImage(task.imageUrl, i)}
              />
            ))}
          </div>
        </div>
      )}

      <button onClick={onBack} style={{ marginTop: "20px" }}>Back to Dashboard</button>

      {/* ✅ Show Edit Task button only for roles that can edit */}
      {(role === "Admin" || role === "Editor" || role === "Approver") && (
        <button onClick={() => setCurrentPage("updateTask")} style={{ marginTop: "10px" }}>
          Edit Task
        </button>
      )}

      {/* ✅ Comments Section */}
      <div className="task-comments">
        <h3>Progress Updates</h3>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="comment-card">
              <p><strong>Date:</strong> {new Date(c.date).toLocaleString()}</p>
              <p>{c.text}</p>
              {c.images?.length > 0 && (
                <div className="comment-images">
                  {c.images.map((img, j) => (
                    <img key={j} src={img} alt="comment" onClick={() => openImage(c.images, j)} />
                  ))}
                </div>
              )}
              {/* ✅ Only Admin/Editor can edit/delete comments */}
              {(role === "Admin" || role === "Editor") && (
                <>
                  {editingCommentId === c._id ? (
                    <>
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                      <button onClick={() => handleEditComment(c._id)}>Save</button>
                      <button onClick={() => { setEditingCommentId(null); setEditText(""); setEditImages([]); }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingCommentId(c._id); setEditText(c.text); setEditImages(c.images || []); }}>Edit</button>
                      <button onClick={() => handleDeleteComment(c._id)}>Delete</button>
                    </>
                  )}
                </>
              )}
            </div>
          ))
        )}

        {/* ✅ Add Comment (Admins & Editors only) */}
        {(role === "Admin" || role === "Editor") && (
          <div className="add-comment-container">
            <h4>Add Comment</h4>
            <textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <input
              type="file"
              multiple
              onChange={(e) => setNewImages(Array.from(e.target.files))}
            />
            <div className="add-comment-actions">
              <button onClick={handleAddComment}>Submit Comment</button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Unified Lightbox overlay */}
      {selectedIndex !== null && (
        <div 
          className="lightbox" 
          onClick={closeImage}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            className="nav-button left" 
            onClick={(e) => { e.stopPropagation(); showPrev(); }} 
            disabled={selectedIndex === 0}
          >
            ◀
          </button>

          <img 
            src={selectedImages[selectedIndex]} 
            alt="full view" 
            className="lightbox-image" 
          />

          <button 
            className="nav-button right" 
            onClick={(e) => { e.stopPropagation(); showNext(); }} 
            disabled={selectedIndex === selectedImages.length - 1}
          >
            ▶
          </button>

          <button 
            className="close-button" 
            onClick={(e) => { e.stopPropagation(); closeImage(); }}
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskDetails;