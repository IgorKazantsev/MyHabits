import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [summaryRes, habitsRes, logsRes, chartRes] = await Promise.all([
          fetch("http://localhost:8000/admin/summary", { headers }),
          fetch("http://localhost:8000/admin/habits", { headers }),
          fetch("http://localhost:8000/admin/logs", { headers }),
          fetch("http://localhost:8000/admin/activity-chart", { headers }),
        ]);

        const summaryData = await summaryRes.json();
        const habitsData = await habitsRes.json();
        const logsData = await logsRes.json();
        const chartJson = await chartRes.json();

        setSummary(summaryData);
        setHabits(habitsData);
        setLogs(logsData);
        setChartData(chartJson);
      } catch (error) {
        console.error("Admin data loading error:", error);
      }
    };

    fetchData();
  }, [token]);

  if (!summary) return <div>Loading statistics...</div>;

  const completionRate =
    summary.total_logs > 0
      ? ((summary.done_logs / summary.total_logs) * 100).toFixed(1)
      : "–";

  return (
  <div style={{ padding: "2rem", fontFamily: "Arial" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
<h2>📊 Admin Panel</h2>
<button
  onClick={() => {
    localStorage.clear();
    window.location.href = "/";
  }}
  style={{
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  Log Out
</button>
</div>

<section style={{ marginBottom: "2rem" }}>
  <h3>General Statistics</h3>
  <ul>
    <li>👤 Users: {summary.total_users}</li>
    <li>📌 Habits: {summary.total_habits}</li>
    <li>🗓 Total logs: {summary.total_logs}</li>
    <li>✅ Completed: {summary.done_logs}</li>
    <li>⏭ Skipped: {summary.skipped_logs}</li>
    <li>📈 Completion rate: {completionRate}%</li>
  </ul>
</section>


<section style={{ marginBottom: "2rem" }}>
  <h3>📋 All Habits</h3>
  <ul>
    {habits.map((h) => (
      <li key={h.habit_id}>
        #{h.habit_id} — {h.name} (user: {h.user_id})
      </li>
    ))}
  </ul>
</section>


<section style={{ marginBottom: "2rem" }}>
  <h3>🧾 All Logs</h3>
  <ul>
    {logs.map((l) => (
      <li key={l.log_id}>
        habit #{l.habit_id} — {l.date} — {l.status} (+{l.points_earned})
      </li>
    ))}
  </ul>
</section>

<section style={{ marginTop: "3rem" }}>
  <h3>📆 Activity Chart</h3>
  {chartData.length > 0 ? (
    <Line
      data={{
        labels: chartData.map((d) => d.date),
        datasets: [
          {
            label: "Habits Completed",
            data: chartData.map((d) => d.count),
            borderColor: "#4caf50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            tension: 0.3,
          },
        ],
      }}
    />
  ) : (
    <p>No data to display</p>
  )}
</section>
</div>
);
};


export default AdminDashboard;
