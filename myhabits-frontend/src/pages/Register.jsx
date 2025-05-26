import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import styles from "./Register.module.css";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/auth/register", { email, username, password });
      alert("✅ Registration successful!");
      navigate("/");
    } catch (error) {
      alert("❌ Registration error");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formBox}>
        <h2 className={styles.heading}>Registration</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.submit}>
          Sign Up
        </button>
        <button type="button" className={styles.loginButton} onClick={() => navigate("/")}>
          Log In
        </button>
      </form>
    </div>
  );
}

export default Register;
