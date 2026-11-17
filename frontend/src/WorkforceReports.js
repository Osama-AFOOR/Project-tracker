import React, {
  useEffect,
  useMemo,
  useState
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
const [reportType, setReportType] =
  useState("daily");

const [fromDate, setFromDate] =
  useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

const [toDate, setToDate] =
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
    const groupedDays = {};
    records.forEach(record => {

      const recordDate =
        record.date
          ? new Date(
              record.date
            )
              .toISOString()
              .split("T")[0]
          : "";

      const inRange =
        reportType === "daily"
            ? recordDate ===
            selectedDate
            : (
                recordDate >= fromDate &&
                recordDate <= toDate
            );

        if (!inRange)
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

      const row = {
  date: recordDate,

  time:
    `${activity.fromTime || ""}
    - 
    ${activity.toTime || ""}`,

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
};

rows.push(row);

if (!groupedDays[recordDate]) {
  groupedDays[recordDate] = [];
}

groupedDays[recordDate].push(
  row
);

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
        groupedDays,
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
const exportToExcel = async () => {

  if (!reportData) return;

  const workbook =
    new ExcelJS.Workbook();

  const sheet =
    workbook.addWorksheet(
      "Daily Activity Tracker"
    );

  sheet.mergeCells("A1:G1");

  sheet.getCell("A1").value =
    "DAILY ENGINEERING ACTIVITY TRACKER";

  sheet.getCell("A1").font = {
    size: 16,
    bold: true
  };

  sheet.getCell("A1").alignment = {
    horizontal: "center"
  };

  sheet.addRow([]);

  sheet.addRow([
    "Date",
    selectedDate,
    "Resource",
    reportData.resource.name
  ]);

  sheet.addRow([
    "Trade",
    reportData.resource.trade,
    "Company",
    reportData.resource.company
  ]);

  sheet.addRow([
    "Level",
    reportData.resource.level
  ]);

  sheet.addRow([]);

  const header =
    sheet.addRow([
      "Time Slot",
      "Activity",
      "Progress %",
      "Discipline",
      "Owner",
      "Status",
      "Comments"
    ]);

  header.font = {
    bold: true,
    color: {
      argb: "FFFFFFFF"
    }
  };

  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "4F81BD"
    }
  };

  reportData.rows.forEach(
    row => {

      sheet.addRow([
        row.time,
        row.activity,
        row.progress,
        row.discipline,
        row.owner,
        row.status,
        row.comments
      ]);

    }
  );

  sheet.columns.forEach(
    column => {
      column.width = 25;
    }
  );

  const buffer =
    await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `DailyTracker_${reportData.resource.name}_${selectedDate}.xlsx`
  );

};
const exportToPDF = () => {

  if (!reportData) return;

  const doc =
    new jsPDF(
      "landscape"
    );

  doc.setFontSize(16);

  doc.text(
    "DAILY ENGINEERING ACTIVITY TRACKER",
    14,
    15
  );

  doc.setFontSize(10);

  doc.text(
    `Date: ${selectedDate}`,
    14,
    25
  );

  doc.text(
    `Resource: ${reportData.resource.name}`,
    70,
    25
  );

  doc.text(
    `Trade: ${reportData.resource.trade}`,
    14,
    32
  );

  doc.text(
    `Company: ${reportData.resource.company}`,
    70,
    32
  );

  doc.text(
    `Level: ${reportData.resource.level}`,
    150,
    32
  );

  autoTable(doc, {
    startY: 40,

    head: [[
      "Time",
      "Activity",
      "Progress",
      "Discipline",
      "Owner",
      "Status",
      "Comments"
    ]],

    body:
      reportData.rows.map(
        row => [
          row.time,
          row.activity,
          `${row.progress}%`,
          row.discipline,
          row.owner,
          row.status,
          row.comments
        ]
      )
  });

  doc.save(
    `DailyTracker_${reportData.resource.name}_${selectedDate}.pdf`
  );

};
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
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "20px"
        }}
        >
        <button onClick={exportToExcel}>
            📊 Export Excel
        </button>

        <button onClick={exportToPDF}>
            📄 Export PDF
        </button>
        </div>
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
                Report Type
            </label>

            <select
                value={reportType}
                onChange={e =>
                setReportType(
                    e.target.value
                )
                }
            >
                <option value="daily">
                Daily Report
                </option>

                <option value="period">
                Period Report
                </option>
            </select>
            </div>

            {reportType === "daily" && (
            <div>
                <label>
                Date
                </label>

                <input
                type="date"
                value={selectedDate}
                onChange={e =>
                    setSelectedDate(
                    e.target.value
                    )
                }
                />
            </div>
            )}

            {reportType === "period" && (
            <>
                <div>
                <label>
                    From Date
                </label>

                <input
                    type="date"
                    value={fromDate}
                    onChange={e =>
                    setFromDate(
                        e.target.value
                    )
                    }
                />
                </div>

                <div>
                <label>
                    To Date
                </label>

                <input
                    type="date"
                    value={toDate}
                    onChange={e =>
                    setToDate(
                        e.target.value
                    )
                    }
                />
                </div>
            </>
            )}

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

{Object.entries(
  reportData.groupedDays
).map(
  ([date, activities]) => (

    <div
      key={date}
      style={{
        marginBottom: "30px"
      }}
    >
      <div
        style={{
          background: "#4F81BD",
          color: "white",
          padding: "10px",
          fontWeight: "bold",
          borderRadius: "6px 6px 0 0"
        }}
      >
        {date}
      </div>

      <table
        className="admin-table"
      >
        <thead>
          <tr>
            <th>Time</th>
            <th>Activity</th>
            <th>Progress</th>
            <th>Discipline</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Comments</th>
          </tr>
        </thead>

        <tbody>

          {activities.map(
            (
              row,
              index
            ) => (
              <tr key={index}>
                <td>{row.time}</td>
                <td>{row.activity}</td>
                <td>
                  {row.progress}%
                </td>
                <td>
                  {row.discipline}
                </td>
                <td>
                  {row.owner}
                </td>
                <td>
                  {row.status}
                </td>
                <td>
                  {row.comments}
                </td>
              </tr>
            )
          )}

        </tbody>
      </table>

      <div
        style={{
          background:
            "#f5f7fa",
          padding: "10px",
          border:
            "1px solid #ddd",
          borderTop: "none",
          borderRadius:
            "0 0 6px 6px"
        }}
      >
        <strong>
          Daily Activities:
        </strong>
        {" "}
        {activities.length}
      </div>
    </div>

  )
)}

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