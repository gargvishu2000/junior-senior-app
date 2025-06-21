import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

// Create AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up axios defaults
    axios.defaults.withCredentials = true; // Ensure cookies are sent
    axios.defaults.baseURL = API_URL;

    // Set token from localStorage if it exists
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["x-auth-token"] = token;
    }

    fetchCurrentUser();

    return () => {
      delete axios.defaults.headers.common["x-auth-token"];
    };
  }, []);
  

  // Fetch authenticated user details
  const fetchCurrentUser = async () => {
    try {
      // Check if we have a token first
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/auth/me`);
      console.log("Current user response:", res.data);

      // Backend now returns user data directly, not wrapped in success object
      setCurrentUser(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to authenticate user");
      logout(); // Clear session on error
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData, {
        withCredentials: true
      });
      console.log("Register response:", res.data);

      // Backend now returns { success, token, user }
      if (res.data.success && res.data.token) {
        saveUserSession(res.data);
        return res.data;
      } else {
        throw new Error("Invalid registration response");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Registration failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, userData, {
        withCredentials: true
      });
      console.log("Login response:", res.data);

      // Backend now returns { success, token, user }
      if (res.data.success && res.data.token) {
        saveUserSession(res.data);
        return res.data;
      } else {
        throw new Error("Invalid login response");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Login failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Save user session
  const saveUserSession = (data) => {
    localStorage.setItem("token", data.token);
    axios.defaults.headers.common["x-auth-token"] = data.token;
    setCurrentUser(data.user);
    setError(null);
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["x-auth-token"];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
