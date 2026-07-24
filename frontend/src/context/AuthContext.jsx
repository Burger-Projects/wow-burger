import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api/client";

const AuthContext = createContext(null);

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const userFromDecoded = (decoded) => ({
  id: decoded.id,
  email: decoded.email,
  role: decoded.role,
  name: decoded.name || decoded.full_name || "",
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    let logoutTimer;

    const handleAutoLogout = () => {
      sessionStorage.removeItem("authToken");
      setAuthState({ token: null, user: null, isLoading: false });
      toast.info("Session expired. Please login again.");
      navigate("/login", { replace: true });
    };

    if (authState.token) {
      const decoded = decodeJWT(authState.token);
      if (decoded?.exp) {
        const remaining = decoded.exp * 1000 - Date.now();
        if (remaining <= 0) handleAutoLogout();
        else logoutTimer = setTimeout(handleAutoLogout, remaining);
      }
    }

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [authState.token, navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setAuthState({
          token,
          user: userFromDecoded(decoded),
          isLoading: false,
        });
        return;
      }
      sessionStorage.removeItem("authToken");
    }
    setAuthState({ token: null, user: null, isLoading: false });
  }, []);

  const applyAuth = (token) => {
    const decoded = decodeJWT(token);
    if (!decoded) throw new Error("Invalid token");
    sessionStorage.setItem("authToken", token);
    const user = userFromDecoded(decoded);
    setAuthState({ token, user, isLoading: false });
    return user;
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/users/login", { email, password });
      if (!response.data.success) {
        return { success: false, error: response.data.message || "Login failed" };
      }
      const user = applyAuth(response.data.data.token);
      return { success: true, role: user.role, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const response = await api.post("/api/users/register", {
        name,
        email,
        password,
      });
      if (!response.data.success) {
        return {
          success: false,
          error: response.data.message || "Registration failed",
        };
      }
      const user = applyAuth(response.data.data.token);
      return { success: true, role: user.role, user };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    setAuthState({ token: null, user: null, isLoading: false });
    navigate("/login", { replace: true });
    toast.success("Logged out");
  };

  const isAuthenticated = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return false;
    const decoded = decodeJWT(token);
    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem("authToken");
      setAuthState({ token: null, user: null, isLoading: false });
      return false;
    }
    return true;
  };

  const isAdmin = authState.user?.role === "admin";
  const isCustomer = authState.user?.role === "customer";

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
