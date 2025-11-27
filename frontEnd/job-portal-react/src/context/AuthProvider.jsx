// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // ✅ Khôi phục trạng thái từ localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);

  // ✅ Tự động lưu lại user khi thay đổi
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ✅ Kiểm tra token hợp lệ khi app load
  useEffect(() => {
    if (token) {
      AuthService.checkToken(token)
        .then((data) => {
          if (data.success) {
            setUser(data.user);
            const cleanRole = data.role?.trim().toUpperCase();
            setRole(cleanRole);
            localStorage.setItem("role", cleanRole);
          } else {
            handleTokenRefresh();
          }
        })
        .catch(() => handleTokenRefresh());
    }
  }, [token]);

  // ✅ Làm mới token khi hết hạn
  const handleTokenRefresh = async () => {
    if (!refreshToken) return logout();
    try {
      const res = await AuthService.refreshToken(refreshToken);
      if (res.accessToken) {
        setToken(res.accessToken);
        localStorage.setItem("token", res.accessToken);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  // ✅ Login — lưu tất cả thông tin cần thiết
  const login = (accessToken, role, userData, refreshTokenValue) => {
    const cleanRole = role?.trim().toUpperCase();

    setToken(accessToken);
    setRole(cleanRole);
    setUser(userData);
    setRefreshToken(refreshTokenValue);

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshTokenValue);
    localStorage.setItem("role", cleanRole);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ✅ Logout — xóa tất cả dữ liệu
  const logout = () => {
    const previousRole = role?.toUpperCase() || "";
    setToken(null);
    setRole("");
    setUser(null);
    setRefreshToken(null);

    localStorage.removeItem("chatHistory");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    if (previousRole === "ADMIN") {
      navigate("/admin/login", { replace: true, state: { fromLogout: true } });
    } else {
      navigate("/home");
    }
  };
  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
