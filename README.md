# MyHabits – Web Application

**MyHabits** is a habit-tracking web application built with a Kaizen approach — focusing on consistency and small steps. The system supports two roles: user and administrator.

## 🎯 Project Overview

MyHabits helps users build healthy habits by providing scheduling, tracking, and rewards. Administrators can access system-wide analytics and user activity.

---

## Technologies Used

**Backend:**
- Python (FastAPI)
- SQLAlchemy + PostgreSQL
- JWT for authentication
- bcrypt for password hashing

**Frontend:**
- React + Vite
- CSS Modules
- Axios
- Chart.js (activity graphs)

---

## API Structure

### Authentication
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT token

### User
- `GET /users/me` — Get current user profile
- `PUT /users/me` — Update user profile

### Habits
- `GET /habits` — Get all user habits
- `POST /habits` — Add a new habit
- `PUT /habits/{id}` — Edit a habit
- `DELETE /habits/{id}` — Delete a habit

### Habit Logs
- `GET /habit-logs` — Get all habit logs
- `POST /habit-logs` — Log a habit as done
- `DELETE /habit-logs/{id}` — Remove a habit log

### Rewards
- `GET /rewards` — Get user rewards
- `POST /rewards` — Add a reward

### Admin API (restricted to admin role)
- `GET /admin/summary` — Global summary stats
- `GET /admin/habits` — View all habits
- `GET /admin/logs` — View all logs
- `GET /admin/activity-chart` — Log completion chart data

---

## UI Overview

### User
- Login / Register
- Dashboard with weekly tracker
- Analytics page with personal stats
- Reward notifications (popup)

### Admin
- Admin Dashboard:
  - User and system-wide stats
  - Habit and log lists
  - Activity line chart (Chart.js)
  - Logout button

---

## Achievements

- Role-based access (user/admin)
- JWT auth and secure routing
- Habit management and tracking
- Live analytics for user and admin
- Dynamic visualization of system data

---

## Challenges

- Styling and layout required extra work
- Admin logic was added late in development
- Building charts and joining log data was tricky

---

## Future Improvements

- Custom user profiles
- Email or push notifications
- Calendar-based habit view
- Filtering and searching in admin dashboard


