import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const logo =
  "https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyds-metals-logo.svg";

const backgroundStyle = {
  backgroundImage: `url('https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyd-metals/Ghughus-Steel-Plant.jpg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    userId: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = {
      userId: credentials.userId,
      password: credentials.password,
    };

    try {
      const response = await fetch(
        "https://localhost:7067/api/production/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        alert("❌ Invalid credentials");
        return;
      }

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data); 

      // Login state
      localStorage.setItem("isLoggedIn", "true");

      // Store user data
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);
      localStorage.setItem("permissions", data.permissions || "{}");

      navigate("/testing");
    } catch (err) {
      console.error("Login error:", err);
      alert("System error. Please try again.");
    }
  };

  return (
    <div style={backgroundStyle}>
      <div className="login-card">
        <img
          src={logo}
          alt="Company Logo"
          style={{ width: "200px", marginBottom: "20px" }}
        />

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>User ID</label>
            <input
              type="text"
              name="userId"
              value={credentials.userId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
