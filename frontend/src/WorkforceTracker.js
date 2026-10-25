import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export default function WorkforceTracker({ token }) {
  const [resources, setResources] = useState([]);

  const [saving, setSaving] =
    useState(false);

  const [record, setRecord] =
    useState({
      date: new Date()
        .toISOString()
        .split("T")[0],

      building: "",
      area: "",
      floor: "",
      roomNo: "",

      taskTitle: "",
      taskDescription: "",

      resources: [],

      photos: []
    });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources =
    async () => {
      try {
        const res = await fetch(
          `${API_BASE}/resources`,
          {
            headers: {
              Authorization: token
            }
          }
        );

        const data =
          await res.json();

        setResources(data);

      } catch (err) {
        console.error(err);
      }
    };

  const toggleResource = (
    resourceId
  ) => {

    setRecord(prev => {

      const exists =
        prev.resources.includes(
          resourceId
        );

      return {
        ...prev,

        resources: exists
          ? prev.resources.filter(
              x =>
                x !==
                resourceId
            )
          : [
              ...prev.resources,
              resourceId
            ]
      };
    });
  };

  const handlePhotoChange =
    e => {

      const files =
        Array.from(
          e.target.files
        );

      setRecord(prev => ({
        ...prev,
        photos: files
      }));
    };

  const saveRecord =
    async () => {

      try {

        setSaving(true);

        console.log(
          "Future Work Record:",
          record
        );

        alert(
          "Workforce Tracker V2 Ready.\nBackend API will be connected next."
        );

      } catch (err) {

        console.error(err);

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
            marginTop: 0,
            color: "#1a3c6e"
          }}
        >
          👷 Workforce Tracker
        </h2>

        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))"
          }}
        >
          <div>
            <label>
              Work Date
            </label>

            <input
              type="date"
              value={record.date}
              onChange={e =>
                setRecord({
                  ...record,
                  date:
                    e.target
                      .value
                })
              }
            />
          </div>

          <div>
            <label>
              Building
            </label>

            <input
              value={
                record.building
              }
              placeholder="Building A"
              onChange={e =>
                setRecord({
                  ...record,
                  building:
                    e.target
                      .value
                })
              }
            />
          </div>

          <div>
            <label>
              Area
            </label>

            <input
              value={
                record.area
              }
              placeholder="Area"
              onChange={e =>
                setRecord({
                  ...record,
                  area:
                    e.target
                      .value
                })
              }
            />
          </div>

          <div>
            <label>
              Floor
            </label>

            <input
              value={
                record.floor
              }
              placeholder="Floor"
              onChange={e =>
                setRecord({
                  ...record,
                  floor:
                    e.target
                      .value
                })
              }
            />
          </div>

          <div>
            <label>
              Room Number
            </label>

            <input
              value={
                record.roomNo
              }
              placeholder="Room"
              onChange={e =>
                setRecord({
                  ...record,
                  roomNo:
                    e.target
                      .value
                })
              }
            />
          </div>

          <div>
            <label>
              Task Title
            </label>

            <input
              value={
                record.taskTitle
              }
              placeholder="Task Title"
              onChange={e =>
                setRecord({
                  ...record,
                  taskTitle:
                    e.target
                      .value
                })
              }
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "15px"
          }}
        >
          <label>
            Work Description
          </label>

          <textarea
            rows={4}
            value={
              record.taskDescription
            }
            placeholder="Describe completed work..."
            onChange={e =>
              setRecord({
                ...record,
                taskDescription:
                  e.target
                    .value
              })
            }
          />
        </div>

        <div
          style={{
            marginTop: "25px"
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

                    cursor:
                      "pointer",

                    borderRadius:
                      "8px",

                    padding:
                      "12px"
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

        <div
          style={{
            marginTop: "25px"
          }}
        >
          <h3>
            Work Photos
          </h3>

          <input
            type="file"
            multiple
            onChange={
              handlePhotoChange
            }
          />

          <p>
            Selected:
            {" "}
            {
              record.photos
                .length
            }
            {" "}
            file(s)
          </p>
        </div>

        <div
          style={{
            marginTop: "25px"
          }}
        >
          <button
            disabled={saving}
            onClick={
              saveRecord
            }
            style={{
              padding:
                "12px 20px",
              fontSize:
                "15px"
            }}
          >
            {saving
              ? "Saving..."
              : "Save Work Record"}
          </button>
        </div>
      </div>
    </div>
  );
}