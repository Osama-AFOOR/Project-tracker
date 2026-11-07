//frontend/src/WorkforceTracker.js
import React, { useEffect, useState } from "react";
import WorkRecordHistory from "./WorkRecordHistory";
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const OWNERS = [
  "Owner 1",
  "Owner 2",
  "Owner 3"
];

const STATUS_OPTIONS = [
  "Ongoing",
  "Completed",
  "Blocked"
];


export default function WorkforceTracker({ token }) {
  const [resources, setResources] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [record, setRecord] = useState({
    date: new Date()
      .toISOString()
      .split("T")[0],

    owner: "Owner 1",

    building: "",
    area: "",
    floor: "",
    roomNo: "",

    taskTitle: "",
    taskDescription: "",

    resources: [],

    activities: [
      {
        timeSlot: "",
        activity: "",
        discipline: "",
        progress: 0,
        status: "Ongoing",
        comments: "",
        photos: []
      }
    ]
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/resources`,
        {
          headers: {
            Authorization: token
          }
        }
      );

      const data = await res.json();

      setResources(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleResource = resourceId => {
    setRecord(prev => {

      const exists =
        prev.resources.includes(
          resourceId
        );

      return {
        ...prev,

        resources: exists
          ? prev.resources.filter(
              r => r !== resourceId
            )
          : [
              ...prev.resources,
              resourceId
            ]
      };
    });
  };

  const addActivity = () => {
    setRecord(prev => ({
      ...prev,

      activities: [
        ...prev.activities,
        {
          timeSlot: "",
          activity: "",
          discipline: "",
          progress: 0,
          status: "Ongoing",
          comments: "",
          photos: []
        }
      ]
    }));
  };

  const removeActivity = index => {

    if (
      record.activities.length === 1
    ) {
      return;
    }

    const updated = [
      ...record.activities
    ];

    updated.splice(index, 1);

    setRecord({
      ...record,
      activities: updated
    });
  };

  const updateActivity = (
    index,
    field,
    value
  ) => {

    const updated = [
      ...record.activities
    ];

    updated[index][field] =
      value;

    setRecord({
      ...record,
      activities: updated
    });
  };
      const uploadImage = async file => {
        const formData = new FormData();

        formData.append(
          "image",
          file
        );

        const response = await fetch(
          `${API_BASE}/upload`,
          {
            method: "POST",
            body: formData
          }
        );

      const data =
        await response.json();

      return data.url;
    };
  const saveRecord = async () => {
    try {

      setSaving(true);

      const payload = {
        date: record.date,
        owner: record.owner,

        building:
          record.building,

        area:
          record.area,

        floor:
          record.floor,

        roomNo:
          record.roomNo,

        taskTitle:
          record.taskTitle,

        taskDescription:
          record.taskDescription,

        resources:
          record.resources,

        activities:
        record.activities
      };

        const url = editingId
          ? `${API_BASE}/work-records/${editingId}`
          : `${API_BASE}/work-records`;

        const method = editingId
          ? "PUT"
          : "POST";

        const res = await fetch(
          url,
          {
            method,

          headers: {
            Authorization:
              token,

            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to save record"
        );
      }

        alert(
          editingId
            ? "Work record updated successfully."
            : "Work record saved successfully."
        );

        setEditingId(null);
        setRefreshKey(prev => prev + 1);

      setRecord({
        date: new Date()
          .toISOString()
          .split("T")[0],

        owner: "Owner 1",

        building: "",
        area: "",
        floor: "",
        roomNo: "",

        taskTitle: "",
        taskDescription: "",

        resources: [],

        activities: [
          {
            timeSlot: "",
            activity: "",
            discipline: "",
            progress: 0,
            status: "Ongoing",
            comments: "",
            photos: []
          }
        ]
      });

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
          "Failed to save record"
      );

    } finally {

      setSaving(false);

    }
  };

  return (
    <div
      style={{
        padding: "20px"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "25px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,.1)"
        }}
      >
        <h2
          style={{
            color: "#1a3c6e",
            marginTop: 0
          }}
        >
          👷 Workforce Tracker
        </h2>

        {/* HEADER */}

        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))"
          }}
        >
          <input
            type="date"
            value={record.date}
            onChange={e =>
              setRecord({
                ...record,
                date:
                  e.target.value
              })
            }
          />

          <select
            value={record.owner}
            onChange={e =>
              setRecord({
                ...record,
                owner:
                  e.target.value
              })
            }
          >
            {OWNERS.map(owner => (
              <option
                key={owner}
                value={owner}
              >
                {owner}
              </option>
            ))}
          </select>

          <input
            placeholder="Building"
            value={
              record.building
            }
            onChange={e =>
              setRecord({
                ...record,
                building:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Area"
            value={record.area}
            onChange={e =>
              setRecord({
                ...record,
                area:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Floor"
            value={record.floor}
            onChange={e =>
              setRecord({
                ...record,
                floor:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Room No."
            value={record.roomNo}
            onChange={e =>
              setRecord({
                ...record,
                roomNo:
                  e.target.value
              })
            }
          />
        </div>

        {/* TASK */}

        <div
          style={{
            marginTop: "20px"
          }}
        >
          <input
            style={{
              width: "100%",
              marginBottom:
                "10px"
            }}
            placeholder="Task Title"
            value={
              record.taskTitle
            }
            onChange={e =>
              setRecord({
                ...record,
                taskTitle:
                  e.target.value
              })
            }
          />

          <textarea
            rows={4}
            style={{
              width: "100%"
            }}
            placeholder="Task Description"
            value={
              record.taskDescription
            }
            onChange={e =>
              setRecord({
                ...record,
                taskDescription:
                  e.target.value
              })
            }
          />
        </div>

        {/* ACTIVITIES */}

        <div
          style={{
            marginTop: "25px"
          }}
        >
          <h3>
            Daily Activities
          </h3>

          {record.activities.map(
            (
              activity,
              index
            ) => (
              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "10px",

                  padding:
                    "15px",

                  marginBottom:
                    "15px",

                  background:
                    "#fafafa"
                }}
              >
                <h4>
                  Activity #
                  {index + 1}
                </h4>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(220px,1fr))"
                  }}
                >
                  <input
                    placeholder="Time Slot"
                    value={
                      activity.timeSlot
                    }
                    onChange={e =>
                      updateActivity(
                        index,
                        "timeSlot",
                        e.target.value
                      )
                    }
                  />

                  <input
                    placeholder="Activity"
                    value={
                      activity.activity
                    }
                    onChange={e =>
                      updateActivity(
                        index,
                        "activity",
                        e.target.value
                      )
                    }
                  />

                  <input
                    placeholder="Discipline"
                    value={
                      activity.discipline
                    }
                    onChange={e =>
                      updateActivity(
                        index,
                        "discipline",
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Progress %"
                    value={
                      activity.progress
                    }
                    onChange={e =>
                      updateActivity(
                        index,
                        "progress",
                        Number(
                          e.target.value
                        )
                      )
                    }
                  />

                  <select
                    value={
                      activity.status
                    }
                    onChange={e =>
                      updateActivity(
                        index,
                        "status",
                        e.target.value
                      )
                    }
                  >
                    {STATUS_OPTIONS.map(
                      option => (
                        <option
                          key={
                            option
                          }
                          value={
                            option
                          }
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <textarea
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop:
                      "10px"
                  }}
                  placeholder="Comments"
                  value={
                    activity.comments
                  }
                  onChange={e =>
                    updateActivity(
                      index,
                      "comments",
                      e.target.value
                    )
                  }
                />

                <div
                  style={{
                    marginTop:
                      "10px"
                  }}
                >
                  <label>
                    Activity Photos
                  </label>

<input
  type="file"
  multiple
  onChange={async e => {

    const files =
      Array.from(
        e.target.files
      );

    try {

      const urls =
        await Promise.all(
          files.map(file =>
            uploadImage(file)
          )
        );

      updateActivity(
        index,
        "photos",
        urls
      );

    } catch (err) {

      console.error(err);

      alert(
        "Image upload failed"
      );

    }

  }}
/>


                  <div>
                    Selected:
                    {" "}
                    {
                      activity
                        .photos
                        .length
                    }
                    {" "}
                    file(s)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeActivity(
                      index
                    )
                  }
                  style={{
                    marginTop:
                      "10px",
                    background:
                      "#dc3545"
                  }}
                >
                  Remove Activity
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={addActivity}
          >
            + Add Activity
          </button>
        </div>

        {/* RESOURCES */}

        <div
          style={{
            marginTop: "30px"
          }}
        >
          <h3>
            Assigned Resources
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "10px"
            }}
          >
            {resources.map(
              resource => (
                <div
                  key={
                    resource._id
                  }
                  onClick={() =>
                    toggleResource(
                      resource._id
                    )
                  }
                  style={{
                    cursor:
                      "pointer",

                    border:
                      record.resources.includes(
                        resource._id
                      )
                        ? "2px solid #1976d2"
                        : "1px solid #ddd",

                    background:
                      record.resources.includes(
                        resource._id
                      )
                        ? "#eaf3ff"
                        : "#fff",

                    padding:
                      "12px",

                    borderRadius:
                      "8px"
                  }}
                >
                  <strong>
                    {
                      resource.name
                    }
                  </strong>

                  <div>
                    {
                      resource.trade
                    }
                  </div>

                  <div>
                    {
                      resource.level
                    }
                  </div>

                  <div>
                    {
                      resource.company
                    }
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* SAVE */}

        <div
          style={{
            marginTop: "25px"
          }}
        >
          <button
            disabled={saving}
            onClick={saveRecord}
            style={{
              padding:
                "12px 20px",
              fontSize:
                "15px"
            }}
          >
          {saving
            ? "Saving..."
            : editingId
            ? "Update Work Record"
            : "Save Work Record"}
          </button>
<WorkRecordHistory
  token={token}
  refreshKey={refreshKey}
  role={
    JSON.parse(
      atob(
        token.split(".")[1]
      )
    ).role
  }
  onEditRecord={record => {
    setEditingId(record._id);

    setRecord({
      date: record.date
        ? new Date(record.date)
            .toISOString()
            .split("T")[0]
        : "",

      owner:
        record.owner ||
        "Owner 1",

      building:
        record.building || "",

      area:
        record.area || "",

      floor:
        record.floor || "",

      roomNo:
        record.roomNo || "",

      taskTitle:
        record.taskTitle || "",

      taskDescription:
        record.taskDescription || "",

      resources:
        (
          record.resources || []
        ).map(
          r => r._id || r
        ),

      activities:
        record.activities?.length
          ? record.activities
          : [
              {
                timeSlot: "",
                activity: "",
                discipline: "",
                progress: 0,
                status: "Ongoing",
                comments: "",
                photos: []
              }
            ]
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }}
/>
        </div>
      </div>
    </div> 
  );
}