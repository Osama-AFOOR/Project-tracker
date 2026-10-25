//File: frontend/src/WorkforceTracker.js

import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://project-tracker-production-1803.up.railway.app";

export default function WorkforceTracker({ token }) {

  const [resources, setResources] = useState([]);

  const [workRecord, setWorkRecord] = useState({
    date: "",
    building: "",
    area: "",
    floor: "",
    roomNo: "",
    taskTitle: "",
    taskDescription: "",
    assignedResources: []
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

      setResources(data);

    } catch (err) {

      console.error(err);

    }
  };

  const handleResourceChange = (id) => {

    let selected =
      [...workRecord.assignedResources];

    if (selected.includes(id)) {

      selected =
        selected.filter(
          r => r !== id
        );

    } else {

      selected.push(id);

    }

    setWorkRecord({
      ...workRecord,
      assignedResources: selected
    });
  };

const saveWorkRecord = async () => {
  try {

    const res =
      await fetch(
        `${API_BASE}/work-records`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            date:
              workRecord.date,
            building:
              workRecord.building,
            area:
              workRecord.area,
            floor:
              workRecord.floor,
            roomNo:
              workRecord.roomNo,
            taskTitle:
              workRecord.taskTitle,
            taskDescription:
              workRecord.taskDescription,
            resources:
              workRecord.assignedResources
          })
        }
      );

    const data =
      await res.json();

    console.log(data);

    alert(
      "Work record saved successfully"
    );

  } catch (err) {

    console.error(err);

    alert(
      "Failed to save work record"
    );

  }
};

  return (
    <div className="workforce-page">

      <h2>
        👷 Workforce Tracker
      </h2>

      <div className="workforce-form">

        <input
          type="date"
          value={workRecord.date}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              date: e.target.value
            })
          }
        />

        <input
          placeholder="Building"
          value={workRecord.building}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              building: e.target.value
            })
          }
        />

        <input
          placeholder="Area"
          value={workRecord.area}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              area: e.target.value
            })
          }
        />

        <input
          placeholder="Floor"
          value={workRecord.floor}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              floor: e.target.value
            })
          }
        />

        <input
          placeholder="Room No."
          value={workRecord.roomNo}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              roomNo: e.target.value
            })
          }
        />

        <input
          placeholder="Task Title"
          value={workRecord.taskTitle}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              taskTitle: e.target.value
            })
          }
        />

        <textarea
          placeholder="Task Description"
          value={workRecord.taskDescription}
          onChange={(e) =>
            setWorkRecord({
              ...workRecord,
              taskDescription:
                e.target.value
            })
          }
        />

      </div>

      <h3>
        Assigned Resources
      </h3>

      <div className="resource-selection">

        {resources.map((resource) => (

          <label
            key={resource._id}
            className="resource-checkbox"
          >

            <input
              type="checkbox"
              checked={
                workRecord.assignedResources.includes(
                  resource._id
                )
              }
              onChange={() =>
                handleResourceChange(
                  resource._id
                )
              }
            />

            {resource.name}

            {" - "}

            {resource.level}

            {" - "}

            {resource.trade}

          </label>

        ))}

      </div>

      <button
        className="save-work-btn"
        onClick={saveWorkRecord}
      >
        Save Work Record
      </button>

    </div>
  );
}