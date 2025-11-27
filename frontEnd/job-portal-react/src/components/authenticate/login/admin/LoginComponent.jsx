import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthProvider"; // path tương ứng
import AuthService from "../../../../services/AuthService";
import Loader from "./Loader";
import "./login.css";

const AdminLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showModalAfterDelay = (message, title, delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setModalMessage(message);
        setModalTitle(title);
        setShowModal(true);
        resolve();
      }, delay);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = await AuthService.login(form.username, form.password);
      if (data.accessToken) {
        // Lưu thông tin vào context
        login(data.accessToken, data.role, data.userId, data.refreshToken);

        await showModalAfterDelay("Login Successfully!", "Success", 1000);

        if (data.role === "ADMIN") navigate("/admin/dashboard");
        else {
          await showModalAfterDelay(
            "You are not permitted to enter this website!",
            "Error",
            1000
          );
          navigate("/");
        }
      } else {
        await showModalAfterDelay("Sai tên đăng nhập hoặc mật khẩu", "Error", 1500);
      }
    } catch (error) {
      await showModalAfterDelay(
        "Your username or password was wrong. Please try again",
        "Error",
        1500
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setForm({ username: "", password: "" });
  };

  return (
    <div className="bg-neutral-900 min-h-screen flex flex-col items-center justify-center relative overflow-y-auto">
      <div className="w-full max-w-md bg-neutral-800 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="off"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 pl-10 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pl-10 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Login
          </button>
        </form>

        {isLoading && (
          <div className="flex justify-center mt-4">
            <Loader />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800">{modalTitle}</h3>
            <p className="mt-2 text-gray-600">{modalMessage}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
