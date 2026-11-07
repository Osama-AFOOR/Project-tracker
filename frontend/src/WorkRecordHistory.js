//frontend/src/WorkRecordHistory.js
import React, { useEffect, useMemo, useState } from "react";
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export default function WorkRecordHistory({
  token,
  role,
  refreshKey = 0,
  onEditRecord
}) {
  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedRecord,
    setSelectedRecord] =
    useState(null);

  const [search, setSearch] =
    useState({
      owner: "",
      building: "",
      taskTitle: ""
    });

  useEffect(() => {
    loadRecords();
  }, [refreshKey]);

  const loadRecords =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_BASE}/work-records`,
            {
              headers: {
                Authorization:
                  token
              }
            }
          );

        const data =
          await res.json();

        setRecords(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }
    };

  const deleteRecord =
    async id => {

      const confirmed =
        window.confirm(
          "Delete this work record?"
        );

      if (!confirmed)
        return;

      try {

        const res =
          await fetch(
            `${API_BASE}/work-records/${id}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  token
              }
            }
          );

        if (!res.ok) {
          throw new Error(
            "Delete failed"
          );
        }

        await loadRecords();

      } catch (err) {

        console.error(err);

        alert(
          "Delete failed"
        );

      }
    };

  const filteredRecords =
    useMemo(() => {

      return records.filter(
        record => {

          const ownerMatch =
            search.owner === ""
              ? true
              : (
                  record.owner ||
                  ""
                )
                  .toLowerCase()
                  .includes(
                    search.owner.toLowerCase()
                  );

          const buildingMatch =
            search.building === ""
              ? true
              : (
                  record.building ||
                  ""
                )
                  .toLowerCase()
                  .includes(
                    search.building.toLowerCase()
                  );

          const titleMatch =
            search.taskTitle ===
            ""
              ? true
              : (
                  record.taskTitle ||
                  ""
                )
                  .toLowerCase()
                  .includes(
                    search.taskTitle.toLowerCase()
                  );

          return (
            ownerMatch &&
            buildingMatch &&
            titleMatch
          );
        }
      );

    }, [
      records,
      search
    ]);

  const stats =
    useMemo(() => {

      return {

        totalRecords:
          records.length,

        todayRecords:
          records.filter(
            r =>
              r.date &&
              new Date(
                r.date
              )
                .toISOString()
                .split("T")[0] ===
              new Date()
                .toISOString()
                .split("T")[0]
          ).length,

        buildings:
          new Set(
            records.map(
              r =>
                r.building
            )
          ).size,

        assignedResources:
          records.reduce(
            (sum, r) =>
              sum +
              (
                r.resources
                  ?.length || 0
              ),
            0
          )
      };

    }, [records]);

  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,.08)",
    textAlign:
      "center"
  };

  return (
    <div
      style={{
        marginTop: "30px"
      }}
    >
      <h2>
        📊 Workforce Dashboard
      </h2>

      <div
        style={{
          display: "grid",
          gap: "15px",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))"
        }}
      >
        <div style={cardStyle}>
          <h4>
            Total Records
          </h4>
          <h2>
            {
              stats.totalRecords
            }
          </h2>
        </div>

        <div style={cardStyle}>
          <h4>
            Today's Records
          </h4>
          <h2>
            {
              stats.todayRecords
            }
          </h2>
        </div>

        <div style={cardStyle}>
          <h4>
            Buildings
          </h4>
          <h2>
            {
              stats.buildings
            }
          </h2>
        </div>

        <div style={cardStyle}>
          <h4>
            Resources
          </h4>
          <h2>
            {
              stats.assignedResources
            }
          </h2>
        </div>
      </div>

      <div
        style={{
          marginTop: "25px",
          background:
            "#fff",
          padding: "20px",
          borderRadius:
            "12px"
        }}
      >
        <h3>
          Search Records
        </h3>

        <div
          style={{
            display: "grid",
            gap: "10px",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))"
          }}
        >
          <input
            placeholder="Owner"
            value={
              search.owner
            }
            onChange={e =>
              setSearch({
                ...search,
                owner:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Building"
            value={
              search.building
            }
            onChange={e =>
              setSearch({
                ...search,
                building:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Task Title"
            value={
              search.taskTitle
            }
            onChange={e =>
              setSearch({
                ...search,
                taskTitle:
                  e.target.value
              })
            }
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "25px",
          background:
            "#fff",
          padding: "20px",
          borderRadius:
            "12px"
        }}
      >
        <h3>
          Work Record History
        </h3>

        {loading ? (
          <p>
            Loading...
          </p>
        ) : (
          filteredRecords.map(
            record => (
              <div
                key={
                  record._id
                }
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  padding:
                    "15px",
                  marginBottom:
                    "12px"
                }}
              >
                <h4>
                  {
                    record.taskTitle
                  }
                </h4>

                <p>
                  👤 Owner:
                  {" "}
                  {
                    record.owner
                  }
                </p>

                <p>
                  🏢 Building:
                  {" "}
                  {
                    record.building
                  }
                </p>

                <p>
                  📅
                  {" "}
                  {
                    record.date
                      ? new Date(
                          record.date
                        )
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px"
                  }}
                >
                  <button
                onClick={() =>
                    setSelectedRecord(record)
                }
                >
                View
                </button>

                <button
                onClick={() =>
                    onEditRecord &&
                    onEditRecord(record)
                }
                >
                Edit
                </button>

                  {role ===
                    "Admin" && (
                    <button
                      style={{
                        background:
                          "#dc3545",
                        color:
                          "#fff"
                      }}
                      onClick={() =>
                        deleteRecord(
                          record._id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          )
        )}
      </div>

      {selectedRecord && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.6)",
            overflow:
              "auto",
            padding:
              "30px"
          }}
        >
          <div
            style={{
              background:
                "#fff",
              maxWidth:
                "900px",
              margin:
                "auto",
              padding:
                "25px",
              borderRadius:
                "12px"
            }}
          >
            <h2>
              {
                selectedRecord.taskTitle
              }
            </h2>

            <p>
              <strong>
                Owner:
              </strong>
              {" "}
              {
                selectedRecord.owner
              }
            </p>

            <p>
              <strong>
                Building:
              </strong>
              {" "}
              {
                selectedRecord.building
              }
            </p>

            <p>
              <strong>
                Area:
              </strong>
              {" "}
              {
                selectedRecord.area
              }
            </p>

            <p>
              <strong>
                Floor:
              </strong>
              {" "}
              {
                selectedRecord.floor
              }
            </p>

            <p>
              <strong>
                Room:
              </strong>
              {" "}
              {
                selectedRecord.roomNo
              }
            </p>

            <p>
              <strong>
                Description:
              </strong>
            </p>

            <p>
              {
                selectedRecord.taskDescription
              }
            </p>

            <h3>
              Activities
            </h3>

            {selectedRecord.activities?.map(
              (
                activity,
                idx
              ) => (
                <div
                  key={idx}
                  style={{
                    border:
                      "1px solid #eee",
                    padding:
                      "10px",
                    marginBottom:
                      "10px"
                  }}
                >
                  <p>
                    <strong>
                      Time:
                    </strong>
                    {" "}
                    {
                      activity.timeSlot
                    }
                  </p>

                  <p>
                    <strong>
                      Activity:
                    </strong>
                    {" "}
                    {
                      activity.activity
                    }
                  </p>

                  <p>
                    <strong>
                      Progress:
                    </strong>
                    {" "}
                    {
                      activity.progress
                    }
                    %
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>
                    {" "}
                    {
                      activity.status
                    }
                  </p>

                  <p>
                    <strong>
                      Comments:
                    </strong>
                    {" "}
                    {
                      activity.comments
                    }
                  </p>
                </div>
              )
            )}

            <button
              onClick={() =>
                setSelectedRecord(
                  null
                )
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}