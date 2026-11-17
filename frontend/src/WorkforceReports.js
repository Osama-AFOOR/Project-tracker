import React, {
  useEffect,
  useMemo,
  useState
} from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export default function WorkforceReports({
  token
}) {
  const [resources, setResources] =
    useState([]);

  const [records, setRecords] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [
    selectedResource,
    setSelectedResource
  ] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        resourcesRes,
        recordsRes
      ] = await Promise.all([
        fetch(
          `${API_URL}/resources`,
          {
            headers: {
              Authorization:
                token
            }
          }
        ),
        fetch(
          `${API_URL}/work-records`,
          {
            headers: {
              Authorization:
                token
            }
          }
        )
      ]);

      setResources(
        await resourcesRes.json()
      );

      setRecords(
        await recordsRes.json()
      );

    } catch (err) {
      console.error(err);
    }
  };

  const reportData = useMemo(() => {

    if (!selectedResource)
      return null;

    const resource =
      resources.find(
        r =>
          r._id ===
          selectedResource
      );

    if (!resource)
      return null;

    const rows = [];

    records.forEach(record => {

      const recordDate =
        record.date
          ? new Date(
              record.date
            )
              .toISOString()
              .split("T")[0]
          : "";

      if (
        recordDate !==
        selectedDate
      )
        return;

      (
        record.activities || []
      ).forEach(activity => {

        const assigned =
          (
            activity.resources ||
            []
          ).some(
            r =>
              (r._id || r) ===
              selectedResource
          );

        if (!assigned)
          return;

        rows.push({
          time:
            `${activity.fromTime || ""} - ${activity.toTime || ""}`,

          activity:
            activity.activity,

          progress:
            activity.progress,

          discipline:
            activity.discipline,

          owner:
            record.owner,

          status:
            activity.status,

          comments:
            activity.comments
        });

      });

    });

    const completed =
      rows.filter(
        r =>
          r.status ===
          "Completed"
      ).length;

    const ongoing =
      rows.filter(
        r =>
          r.status ===
          "Ongoing"
      ).length;

    const blocked =
      rows.filter(
        r =>
          r.status ===
          "Blocked"
      ).length;

    return {
      resource,
      rows,
      completed,
      ongoing,
      blocked
    };

  }, [
    selectedDate,
    selectedResource,
    records,
    resources
  ]);

  return (
    <div
      style={{
        padding: "20px"
      }}
    >
      <h1>
        📊 Workforce Reports
      </h1>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,.08)"
        }}
      >
        <h3>
          Daily Engineering Activity Tracker
        </h3>

        <div
          style={{
            display: "grid",
            gap: "15px",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))"
          }}
        >
          <div>
            <label>
              Date
            </label>

            <input
              type="date"
              value={
                selectedDate
              }
              onChange={e =>
                setSelectedDate(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label>
              Resource
            </label>

            <select
              value={
                selectedResource
              }
              onChange={e =>
                setSelectedResource(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Resource
              </option>

              {resources.map(
                resource => (
                  <option
                    key={
                      resource._id
                    }
                    value={
                      resource._id
                    }
                  >
                    {
                      resource.name
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {reportData && (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,.08)"
          }}
        >
          <h2
            style={{
              textAlign:
                "center"
            }}
          >
            DAILY ENGINEERING
            ACTIVITY TRACKER
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "10px",
              marginBottom: "25px"
            }}
          >
            <div>
              <strong>
                Date:
              </strong>{" "}
              {selectedDate}
            </div>

            <div>
              <strong>
                Resource:
              </strong>{" "}
              {
                reportData
                  .resource
                  .name
              }
            </div>

            <div>
              <strong>
                Trade:
              </strong>{" "}
              {
                reportData
                  .resource
                  .trade
              }
            </div>

            <div>
              <strong>
                Company:
              </strong>{" "}
              {
                reportData
                  .resource
                  .company
              }
            </div>

            <div>
              <strong>
                Level:
              </strong>{" "}
              {
                reportData
                  .resource
                  .level
              }
            </div>
          </div>

          <table
            className="admin-table"
          >
            <thead>
              <tr>
                <th>
                  Time
                </th>

                <th>
                  Activity
                </th>

                <th>
                  Progress
                </th>

                <th>
                  Discipline
                </th>

                <th>
                  Owner
                </th>

                <th>
                  Status
                </th>

                <th>
                  Comments
                </th>
              </tr>
            </thead>

            <tbody>
              {reportData.rows
                .length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign:
                        "center"
                    }}
                  >
                    No activities
                    found
                  </td>
                </tr>
              ) : (
                reportData.rows.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      <td>
                        {
                          row.time
                        }
                      </td>

                      <td>
                        {
                          row.activity
                        }
                      </td>

                      <td>
                        {
                          row.progress
                        }
                        %
                      </td>

                      <td>
                        {
                          row.discipline
                        }
                      </td>

                      <td>
                        {
                          row.owner
                        }
                      </td>

                      <td>
                        {
                          row.status
                        }
                      </td>

                      <td>
                        {
                          row.comments
                        }
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "25px",
              display: "grid",
              gap: "15px",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))"
            }}
          >
            <div
              className="stat-card"
            >
              <h3>
                Activities
              </h3>

              <p>
                {
                  reportData
                    .rows
                    .length
                }
              </p>
            </div>

            <div
              className="stat-card"
            >
              <h3>
                Completed
              </h3>

              <p>
                {
                  reportData
                    .completed
                }
              </p>
            </div>

            <div
              className="stat-card"
            >
              <h3>
                Ongoing
              </h3>

              <p>
                {
                  reportData
                    .ongoing
                }
              </p>
            </div>

            <div
              className="stat-card"
            >
              <h3>
                Blocked
              </h3>

              <p>
                {
                  reportData
                    .blocked
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}