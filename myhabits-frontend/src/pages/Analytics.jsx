import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import styles from "./Analytics.module.css";
function getMonthDays(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array(days)].map((_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      dateStr: date.toISOString().split("T")[0],
      label: i + 1,
      date: date,
    };
  });
}

function Analytics() {
  const [logs, setLogs] = useState([]);
  const [habits, setHabits] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchLogs();
    fetchHabits();
    fetchRewards();
  }, []);

  const fetchLogs = async () => {
    const res = await api.get("/habit-logs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLogs(res.data);
  };

  const fetchHabits = async () => {
    const res = await api.get("/habits", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHabits(res.data);
    if (res.data.length > 0) setSelectedHabitId(res.data[0].habit_id.toString());
  };

  const fetchRewards = async () => {
    const res = await api.get("/rewards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRewards(res.data);
  };

  const getLogStatus = (habitId, dateStr) => {
    return logs.find(
      (log) => log.habit_id === parseInt(habitId) && log.date.startsWith(dateStr)
    )?.status;
  };

  const isScheduled = (habit, date) => {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    if (habit.schedule_type === "daily") return true;
    if (habit.schedule_type === "weekly") return weekday === "Monday";
    if (habit.schedule_type === "custom") return habit.days_of_week?.includes(weekday);
    return false;
  };

  const handleMonthChange = (offset) => {
    const newDate = new Date(year, month + offset);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  const monthDays = getMonthDays(year, month);
  const monthLabel = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
  const today = new Date();
  const selectedHabit = habits.find((h) => h.habit_id.toString() === selectedHabitId);

  const getMonthStats = () => {
    if (!selectedHabit) return { percent: 0, streak: 0, nextReward: null, progressChartData: [], unlockedRewards: [] };

    let total = 0;
    let completed = 0;
    let maxStreak = 0;
    let currentStreak = 0;
    const createdAt = new Date(selectedHabit.created_at);

    const progressChartData = [];

    monthDays.forEach(({ dateStr, date, label }) => {
      if (date >= createdAt && isScheduled(selectedHabit, date)) {
        total++;
        const status = getLogStatus(selectedHabit.habit_id, dateStr);
        if (status === "done") {
          completed++;
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
        progressChartData.push({ day: label, done: status === "done" ? 1 : 0 });
      } else {
        progressChartData.push({ day: label, done: null });
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const completedCount = logs.filter(
      (l) => l.habit_id === selectedHabit.habit_id && l.status === "done"
    ).length;

    const allHabitRewards = rewards.filter(r => r.user_id === selectedHabit.user_id);

    const nextReward = allHabitRewards
      .filter(r => r.required_days > completedCount)
      .sort((a, b) => a.required_days - b.required_days)[0];

    const unlockedRewards = allHabitRewards.filter(r => completedCount >= r.required_days);

    return { percent, streak: maxStreak, nextReward, progressChartData, unlockedRewards };
  };

  const { percent, streak, nextReward, progressChartData, unlockedRewards } = getMonthStats();

  return (
<div>
  <button onClick={() => navigate('/dashboard')} style={{ marginBottom: 20 }}>← Back to Dashboard</button>
  <h2>📅 Habit Calendar</h2>

  <div style={{ marginBottom: 20 }}>
    <label>Select a habit: </label>
    <select value={selectedHabitId} onChange={(e) => setSelectedHabitId(e.target.value)}>
      {habits.map((habit) => (
        <option key={habit.habit_id} value={habit.habit_id}>
          {habit.name}
        </option>
      ))}
    </select>
  </div>


      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => handleMonthChange(-1)}>←</button>
        <label>{monthLabel}</label>
        <button onClick={() => handleMonthChange(1)}>→</button>

        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[...Array(10)].map((_, i) => (
            <option key={i} value={2020 + i}>{2020 + i}</option>
          ))}
        </select>

        <label>Month:</label>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
          ))}
        </select>
      </div>

      {selectedHabit && (
        <div key={selectedHabit.habit_id} style={{ marginBottom: 30 }}>
          <h4>{selectedHabit.name}</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {monthDays.map(({ dateStr, label, date }) => {
              const createdAt = new Date(selectedHabit.created_at);
              if (date < createdAt) return <div key={dateStr} style={{ width: 30, height: 30 }}></div>;
              const status = getLogStatus(selectedHabit.habit_id, dateStr);
              const scheduled = isScheduled(selectedHabit, date);
              let bgColor = "transparent";
              let border = "1px solid #999";
              let color = "#999";
              if (scheduled) {
                if (status === "done") {
                  bgColor = "#4caf50";
                  color = "white";
                } else if (date < today) {
                  bgColor = "#f44336";
                  color = "white";
                } else {
                  bgColor = "#555";
                  color = "white";
                }
              }
              return (
                <div
                  key={dateStr}
                  title={dateStr}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 4,
                    backgroundColor: bgColor,
                    color: color,
                    border: border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
  <h4>📊 Monthly Analytics</h4>
  <p>✅ Completion Rate: <strong>{percent}%</strong></p>
  <p>🔥 Streak without misses: <strong>{streak} days</strong></p>
  {nextReward && (
    <p>🎯 Next reward: in {nextReward.required_days} days — <strong>{nextReward.title}</strong></p>
  )}
  {unlockedRewards.length > 0 && (
    <div style={{ marginTop: 10 }}>
      <h5>🎉 Unlocked Rewards:</h5>
      <ul>
        {unlockedRewards.map((r, i) => (
          <li key={i}>🏆 {r.required_days} days — <strong>{r.title}</strong></li>
        ))}
      </ul>
    </div>
  )}
</div>


<div style={{ marginTop: 30 }}>
  <h4>📈 Completion Chart</h4>
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={progressChartData.filter(d => d.done !== null)}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis allowDecimals={false} domain={[0, 1]} />
      <Tooltip />
      <Line type="monotone" dataKey="done" stroke="#4caf50" dot={{ r: 4 }} />
    </LineChart>
  </ResponsiveContainer>
</div>

        </div>
      )}
    </div>
  );
}

export default Analytics;