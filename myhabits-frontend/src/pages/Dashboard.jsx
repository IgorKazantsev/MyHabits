import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekDates() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  return [...Array(7)].map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      label: WEEK_DAYS[i],
      dateStr: date.toISOString().split("T")[0],
    };
  });
}

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    schedule_type: "daily",
    days_of_week: [],
    reward_7: "",
    reward_14: "",
    reward_21: "",
  });
  const [rewardNotification, setRewardNotification] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchHabits();
    fetchLogs();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await api.get("/habits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(res.data);
    } catch {
      alert("❌ Please log in again.");
      navigate("/");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get("/habit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
  };

  const handleLogToggle = async (habitId, dateStr) => {
    const existing = logs.find((l) => l.habit_id === habitId && l.date.split("T")[0] === dateStr);
    try {
      if (existing && existing.status === "done") {
        await api.delete(`/habit-logs/${existing.habit_log_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (!existing) {
        await api.post(
          `/habit-logs`,
          {
            habit_id: habitId,
            date: dateStr,
            status: "done",
            points_earned: 1,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchLogs();
      const updatedLogsRes = await api.get("/habit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedLogs = updatedLogsRes.data;
const updatedCompletions = updatedLogs.filter((l) => l.habit_id === habitId && l.status === "done").length;
const habit = habits.find((h) => h.habit_id === habitId);
if (habit) {
  if (updatedCompletions === 7 && habit.reward_7) setRewardNotification(`🏅 7 days! Treat yourself: ${habit.reward_7}`);
  else if (updatedCompletions === 14 && habit.reward_14) setRewardNotification(`🏅 14 days! Treat yourself: ${habit.reward_14}`);
  else if (updatedCompletions === 21 && habit.reward_21) setRewardNotification(`🏅 21 days! Treat yourself: ${habit.reward_21}`);
}
} catch {

      alert("❌ Failed to update log");
    }
  };

  const getLogStatus = (habitId, dateStr) => logs.find((l) => l.habit_id === habitId && l.date.split("T")[0] === dateStr)?.status;
  const countHabitCompletions = (habitId) => logs.filter((log) => log.habit_id === habitId && log.status === "done").length;
  const habitScheduledForDay = (habit, weekday) => habit.schedule_type === "daily" || (habit.schedule_type === "weekly" && weekday === "Monday") || (habit.schedule_type === "custom" && habit.days_of_week?.includes(weekday));

  const handleAddHabit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newHabit };
      if (payload.schedule_type !== "custom") delete payload.days_of_week;
      const res = await api.post("/habits", payload, { headers: { Authorization: `Bearer ${token}` } });
      const createdHabit = res.data;
      const userId = createdHabit.user_id || JSON.parse(atob(token.split('.')[1])).user_id;

const rewardsToCreate = [
  newHabit.reward_7 && { title: newHabit.reward_7, description: `Reward for 7 days of habit: ${newHabit.name}`, required_days: 7, user_id: userId },
  newHabit.reward_14 && { title: newHabit.reward_14, description: `Reward for 14 days of habit: ${newHabit.name}`, required_days: 14, user_id: userId },
  newHabit.reward_21 && { title: newHabit.reward_21, description: `Reward for 21 days of habit: ${newHabit.name}`, required_days: 21, user_id: userId },
].filter(Boolean);


      await Promise.all(rewardsToCreate.map((r) => api.post("/rewards", r, { headers: { Authorization: `Bearer ${token}` } })));

      setNewHabit({ name: "", description: "", schedule_type: "daily", days_of_week: [], reward_7: "", reward_14: "", reward_21: "" });
      fetchHabits();
      setShowAddForm(false);
    } catch {
      alert("❌ Failed to create habit");
    }
  };

  const handleEditHabit = (habit) => {
    setEditingHabit({ ...habit, days_of_week: habit.days_of_week || [], reward_7: habit.reward_7 || "", reward_14: habit.reward_14 || "", reward_21: habit.reward_21 || "" });
    setIsEditOpen(true);
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm("Delete this habit?")) return;
    try {
      await api.delete(`/habits/${habitId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchHabits();
    } catch {
      alert("❌ Failed to delete habit");
    }
  };

  const handleUpdateHabit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingHabit };
      if (payload.schedule_type !== "custom") delete payload.days_of_week;
      await api.put(`/habits/${editingHabit.habit_id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsEditOpen(false);
      setEditingHabit(null);
      fetchHabits();
    } catch {
      alert("❌ Failed to update habit");
    }
  };

  return (
    <div>
      <h2>MyHabits</h2>
<button onClick={() => navigate("/analytics")} style={{ marginRight: 10 }}>📊 Open Analytics</button>
<button onClick={() => setShowAddForm(prev => !prev)}>{showAddForm ? "Cancel" : "➕ Add Habit"}</button>
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
        Log out
      </button>
      {rewardNotification && (
        <div style={{ backgroundColor: "gold", color: "#000", padding: "10px", margin: "10px 0", borderRadius: "5px" }}>
          {rewardNotification}
          <button onClick={() => setRewardNotification(null)} style={{ marginLeft: "10px" }}>Close</button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddHabit}>
          <input value={newHabit.name} onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })} placeholder="Name" required />
          <input value={newHabit.description} onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} placeholder="Description" />
          <select value={newHabit.schedule_type} onChange={(e) => setNewHabit({ ...newHabit, schedule_type: e.target.value, days_of_week: [] })}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
          {newHabit.schedule_type === "custom" && WEEK_DAYS.map((d) => (
            <label key={d}>
              <input
                type="checkbox"
                checked={newHabit.days_of_week.includes(d)}
                onChange={() => {
                  const updated = newHabit.days_of_week.includes(d)
                    ? newHabit.days_of_week.filter((x) => x !== d)
                    : [...newHabit.days_of_week, d];
                  setNewHabit({ ...newHabit, days_of_week: updated });
                }}
              />
              {d.slice(0, 3)}
            </label>
          ))}
<div>
  <label>🏅 7 days:</label>
  <input value={newHabit.reward_7} onChange={(e) => setNewHabit({ ...newHabit, reward_7: e.target.value })} placeholder="For example: Pizza" />
  <label>🏅 14 days:</label>
  <input value={newHabit.reward_14} onChange={(e) => setNewHabit({ ...newHabit, reward_14: e.target.value })} placeholder="For example: Movie" />
  <label>🏅 21 days:</label>
  <input value={newHabit.reward_21} onChange={(e) => setNewHabit({ ...newHabit, reward_21: e.target.value })} placeholder="For example: New gadget" />
</div>
          <button type="submit">Add Habit</button>
        </form>
      )}

<h3 style={{ marginTop: 30 }}>This Week</h3>
<div style={{ display: 'grid', gridTemplateColumns: `100px repeat(7, 1fr)`, gap: 5, alignItems: 'center' }}>
  <div></div>
  {weekDates.map(({ label }) => (
    <div key={label} style={{ textAlign: 'center', fontWeight: 'bold' }}>{label.slice(0, 3)}</div>
  ))}

  {habits.map((habit) => (
    <React.Fragment key={habit.habit_id}>
      <div style={{ fontWeight: 'bold' }}>{habit.name}</div>
      {weekDates.map(({ dateStr, label }) => {
        const status = getLogStatus(habit.habit_id, dateStr);
        const scheduled = habitScheduledForDay(habit, label);
        let bgColor = 'transparent';
        let border = '1px solid #999';
        let color = '#999';

        if (scheduled) {
          if (status === 'done') {
            bgColor = '#4caf50';
            color = 'white';
          } else if (new Date(dateStr) < new Date()) {
            bgColor = '#f44336';
            color = 'white';
          } else {
            bgColor = '#555';
            color = 'white';
          }
        }

        return (
          <div
            key={habit.habit_id + dateStr}
            title={dateStr}
            onClick={() => handleLogToggle(habit.habit_id, dateStr)}
            style={{
              width: '100%',
              height: 30,
              borderRadius: 4,
              backgroundColor: bgColor,
              color,
              border,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {new Date(dateStr).getDate()}
          </div>
        );
      })}
    </React.Fragment>
  ))}
</div>

      <h3>All Habits</h3>
<ul>
  {habits.map((h) => (
    <li key={h.habit_id}>
      <strong>{h.name}</strong> — {h.schedule_type} — {(h.reward_7 || h.reward_14 || h.reward_21) && "🎯 Rewards active"}
      <br />Progress: {countHabitCompletions(h.habit_id)}
      <br />
      <button onClick={() => handleEditHabit(h)}>✏️ Edit</button>
      <button onClick={() => handleDeleteHabit(h.habit_id)} style={{ marginLeft: 8, color: "red" }}>🗑 Delete</button>
    </li>
  ))}
</ul>


      {isEditOpen && editingHabit && (
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", background: "#fff", color: "#000", padding: 20, zIndex: 1000 }}>
          <h3>Edit Habit</h3>
          <form onSubmit={handleUpdateHabit}>
            <input value={editingHabit.name} onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })} />
            <input value={editingHabit.description} onChange={(e) => setEditingHabit({ ...editingHabit, description: e.target.value })} />
            <select value={editingHabit.schedule_type} onChange={(e) => setEditingHabit({ ...editingHabit, schedule_type: e.target.value, days_of_week: [] })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
            {editingHabit.schedule_type === "custom" && WEEK_DAYS.map((d) => (
              <label key={d}>
                <input
                  type="checkbox"
                  checked={editingHabit.days_of_week.includes(d)}
                  onChange={() => {
                    const updated = editingHabit.days_of_week.includes(d)
                      ? editingHabit.days_of_week.filter((x) => x !== d)
                      : [...editingHabit.days_of_week, d];
                    setEditingHabit({ ...editingHabit, days_of_week: updated });
                  }}
                />
                {d.slice(0, 3)}
              </label>
            ))}
           <div style={{ marginTop: 10 }}>
  <label>🏅 7 days:</label>
  <input value={editingHabit.reward_7} onChange={(e) => setEditingHabit({ ...editingHabit, reward_7: e.target.value })} />
  <label>🏅 14 days:</label>
  <input value={editingHabit.reward_14} onChange={(e) => setEditingHabit({ ...editingHabit, reward_14: e.target.value })} />
  <label>🏅 21 days:</label>
  <input value={editingHabit.reward_21} onChange={(e) => setEditingHabit({ ...editingHabit, reward_21: e.target.value })} />
</div>
            <button type="submit">Save</button>
            <button onClick={() => setIsEditOpen(false)} type="button">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
