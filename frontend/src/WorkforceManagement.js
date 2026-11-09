import React from "react";

export default function WorkforceManagement({
  setCurrentPage
}) {
  return (
    <div
      style={{
        padding: "20px"
      }}
    >
      <h1>
        Workforce Management
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
          marginTop: "20px"
        }}
      >
        <div
          className="card"
          onClick={() =>
            setCurrentPage("addTask")
          }
        >
          <h2>
            ➕ Add New Task
          </h2>

          <p>
            Create project tasks
          </p>
        </div>

        <div
          className="card"
          onClick={() =>
            setCurrentPage("workforce")
          }
        >
          <h2>
            👷 Workforce Log
          </h2>

          <p>
            Create daily workforce
            records
          </p>
        </div>

        <div
          className="card"
          onClick={() =>
            setCurrentPage(
              "workHistory"
            )
          }
        >
          <h2>
            📋 Workforce History
          </h2>

          <p>
            Search and review
            workforce records
          </p>
        </div>
      </div>
    </div>
  );
}