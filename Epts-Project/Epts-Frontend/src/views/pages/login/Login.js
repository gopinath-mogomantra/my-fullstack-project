/*
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
 
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
     
      const response = await axios.post("http://127.0.0.1:8000/api/users/login/", {
        username,
        password,
      });
 
     
      if (response.data.success) {
       
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("username", response.data.username);
 
       
        setAlert({
          show: true,
          message: `Welcome ${response.data.role}! Login successful.`,
          type: "success",
        });
 
        setTimeout(() => {
          if (response.data.role === "admin") navigate("/Dashboard");
          else if (response.data.role === "manager") navigate("/manager-dashboard");
          else navigate("/base/collapses");
        }, 1500);
      } else {
        setAlert({
          show: true,
          message: "Invalid credentials!",
          type: "danger",
        });
      }
    } catch (error) {
      console.log(error);
 
      setAlert({
        show: true,
        message: "Server error! Please try again later.",
        type: "danger",
      });
    }
  };
 
  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg p-4"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4 text-primary">LOGIN</h3>
 
        {alert.show && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setAlert({ show: false, message: "", type: "" })
              }
            ></button>
          </div>
        )}
 
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
 
          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
 
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
 
        <div className="text-center mt-3 text-muted small">© 2025 eGrovity</div>
      </div>
    </div>
  );
}
*/

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../../utils/axiosInstance";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false); // ✅ Added
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Show loader

    try {
      const response = await axiosInstance.post("users/login/", {
        username,
        password,
      });

      console.log("Response:", response.data);

      if (response.data.success === true) {
        const role = response.data.role?.toLowerCase();

        // ✅ Store tokens and user info (consistent keys)
        localStorage.setItem("access_token", response.data.token);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("username", response.data.username);

        setAlert({
          show: true,
          message: `Welcome ${role}! Login successful.`,
          type: "success",
        });

        // ✅ Same redirection logic you already had
        setTimeout(() => {
          if (role === "admin") {
            window.location.hash = "#/dashboard";
          } else if (role === "manager") {
            window.location.hash = "#/manager-dashboard";
          } else {
            window.location.hash = "#/base/collapses";
          }
        }, 1200);
      } else {
        setAlert({
          show: true,
          message: response.data.message || "Invalid credentials!",
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Server error! Please try again later.";

      setAlert({
        show: true,
        message,
        type: "danger",
      });
    } finally {
      setLoading(false); // ✅ Hide loader
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg p-4"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4 text-primary">LOGIN</h3>

        {alert.show && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert({ show: false, message: "", type: "" })}
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              Username / Emp ID / Email
            </label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username, emp ID, or email"
              disabled={loading} // ✅ Disable during loading
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading} // ✅ Disable during loading
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
            disabled={loading} // ✅ Prevent multiple clicks
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center mt-3 text-muted small">© 2025 eGrovity</div>
      </div>
    </div>
  );
}
