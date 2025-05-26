import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("❗ Please fill in both fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Login error:", errorData);
        alert("❌ Incorrect login or password");
        return;
      }

      const data = await response.json();

      // Save token and role
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      // Redirect depending on role
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("❌ Network error:", error);
      alert("❌ Network error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className={styles.submit}>
            Log In
          </button>
        </form>
        <button
          className={styles.altButton}
          onClick={() => navigate("/register")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;
