import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export default function WorkforceManagement({
  setCurrentPage,
  token
}) {
  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadWorkRecords();
  }, []);

  const loadWorkRecords =
    async () => {
      try {
        setLoading(true);

        const res =
          await fetch(
            `${API_URL}/work-records`,
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
        console.error(
          "Error loading workforce records:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  const dashboardStats =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const totalRecords =
        records.length;

      const todayRecords =
        records.filter(
          r =>
            r.date &&
            new Date(
              r.date
            )
              .toISOString()
              .split("T")[0] ===
              today
        ).length;

      let activityCount = 0;

      const resourceIds =
        new Set();

      const ownerCounts =
        {};

      const statusCounts = {
        Completed: 0,
        Ongoing: 0,
        Blocked: 0
      };

      records.forEach(
        record => {
          ownerCounts[
            record.owner
          ] =
            (ownerCounts[
              record.owner
            ] || 0) + 1;

          (
            record.activities ||
            []
          ).forEach(
            activity => {

              activityCount++;

              (
                activity.resources ||
                []
              ).forEach(
                resource => {
                  resourceIds.add(
                    resource._id ||
                      resource
                  );
                }
              );

              if (
                statusCounts[
                  activity.status
                ] !== undefined
              ) {
                statusCounts[
                  activity.status
                ]++;
              }
            }
          );
        }
      );

      return {
        totalRecords,
        todayRecords,
        activityCount,
        resourceCount:
          resourceIds.size,
        ownerCounts,
        statusCounts
      };
    }, [records]);

  const ownerChartData = {
    labels:
      Object.keys(
        dashboardStats.ownerCounts
      ),

    datasets: [
      {
        data: Object.values(
          dashboardStats.ownerCounts
        ),

        backgroundColor: [
          "#1976d2",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#f44336"
        ]
      }
    ]
  };

  const statusChartData = {
    labels: [
      "Completed",
      "Ongoing",
      "Blocked"
    ],

    datasets: [
      {
        data: [
          dashboardStats
            .statusCounts
            .Completed,

          dashboardStats
            .statusCounts
            .Ongoing,

          dashboardStats
            .statusCounts
            .Blocked
        ],

        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#f44336"
        ]
      }
    ]
  };

  const statCard = {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow:
      "0 3px 10px rgba(0,0,0,.08)",
    textAlign: "center"
  };

  return (
    <div
      style={{
        padding: "20px"
      }}
    >
      <h1>
        👷 Workforce Management
      </h1>

      {loading ? (
        <p>
          Loading workforce dashboard...
        </p>
      ) : (
        <>
          {/* KPI CARDS */}

          <div
            style={{
              display: "grid",
              gap: "20px",
              marginTop: "20px",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))"
            }}
          >
            <div style={statCard}>
              <h3>
                Total Logs
              </h3>

              <h1>
                {
                  dashboardStats.totalRecords
                }
              </h1>
            </div>

            <div style={statCard}>
              <h3>
                Today's Logs
              </h3>

              <h1>
                {
                  dashboardStats.todayRecords
                }
              </h1>
            </div>

            <div style={statCard}>
              <h3>
                Activities
              </h3>

              <h1>
                {
                  dashboardStats.activityCount
                }
              </h1>
            </div>

            <div style={statCard}>
              <h3>
                Resources Used
              </h3>

              <h1>
                {
                  dashboardStats.resourceCount
                }
              </h1>
            </div>
          </div>

          {/* CHARTS */}

          <div
            style={{
              display: "grid",
              gap: "30px",

              marginTop: "30px",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(350px,1fr))"
            }}
          >
            <div
              style={statCard}
            >
              <h3>
                Owner Distribution
              </h3>

              {Object.keys(
                dashboardStats.ownerCounts
              ).length > 0 && (
                <Pie
                  data={
                    ownerChartData
                  }
                />
              )}
            </div>

            <div
              style={statCard}
            >
              <h3>
                Activity Status
              </h3>

              <Pie
                data={
                  statusChartData
                }
              />
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <h2
            style={{
              marginTop: "40px"
            }}
          >
            Quick Actions
          </h2>

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
                setCurrentPage(
                  "addTask"
                )
              }
            >
              <h2>
                ➕ Add New Task
              </h2>

              <p>
                Create project
                tasks
              </p>
            </div>

            <div
              className="card"
              onClick={() =>
                setCurrentPage(
                  "workforce"
                )
              }
            >
              <h2>
                👷 Workforce Log
              </h2>

              <p>
                Create workforce
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
                Review workforce
                records
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}