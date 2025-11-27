// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Separator } from "../../../ui/separator";
import { Navigation } from "../../../Navigation";
import { useAuth } from "../../../../context/AuthProvider";
import AuthService from "../../../../services/AuthService";
import Footer from "../../../Footer";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../ui/dialog";
import { CheckCircle, XCircle, Info, Briefcase } from "lucide-react";



export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const autoCloseTimer = useRef(null);
  const [googleLoading, setGoogleLoading] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username or email is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = await AuthService.login(form.username, form.password);

      // ❌ Nếu tài khoản không tồn tại
      if (data.status === 404 || data === "User not found" || data?.error?.includes("not found")) {
        setModalMessage("This account does not exist. Would you like to sign up?");
        setModalTitle("Info");
        setShowModal(true);
        return;
      }

      // ❌ Nếu tài khoản bị chặn
      if (data.status === 403 || data === "Your account has been blocked by admin." || data?.error?.includes("blocked")) {
        setModalMessage("Your account has been blocked by admin. Please contact support.");
        setModalTitle("Error");
        setShowModal(true);
        return;
      }

      // ✅ Nếu đăng nhập thành công
      if (data.accessToken) {
        login(data.accessToken, data.role, data.userId, data.refreshToken);
        setModalMessage("Login Successfully!");
        setModalTitle("Success");
        setShowModal(true);

        if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
        autoCloseTimer.current = setTimeout(() => setShowModal(false), 900);

        setTimeout(() => {
          if (data.role === "PERSONAL") navigate("/home");
          else if (data.role === "BUSINESS") navigate("/employer/dashboard");
          else navigate("/");
        }, 1000);
      } else {
        setModalMessage("Invalid username or password.");
        setModalTitle("Error");
        setShowModal(true);
      }

    } catch (error) {
      console.error("Login failed", error);

      // ✅ Nếu backend trả về lỗi cụ thể
      if (error.response) {
        if (error.response.status === 404) {
          setModalMessage("This account does not exist. Please sign up first.");
          setModalTitle("Info");
          setShowModal(true);
          return;
        } else if (error.response.status === 403) {
          setModalMessage("Your account has been blocked by admin. Please contact support.");
          setModalTitle("Error");
          setShowModal(true);
          return;
        }
      }

      setModalMessage("Your username or password was wrong. Please try again.");
      setModalTitle("Error");
      setShowModal(true);
    }

  };

  const handleModalClose = () => {
    setShowModal(false);
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
    if (modalTitle !== "Error") {
      setForm({ username: "", password: "" });
    }
  };

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, []);

  return (
    <>
      <Dialog open={showModal} onOpenChange={handleModalClose}>
        <DialogContent
          className={`w-300 mx-auto rounded-2xl shadow-2xl text-center p-6 
          max-w-[400px] sm:max-w-[420px] 
          ${modalTitle === "Success" ? "bg-green-50" : modalTitle === "Error" ? "bg-red-50" : "bg-white"}
          transition-all duration-200`}
        >


          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            {modalTitle === "Success" ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : modalTitle === "Error" ? (
              <XCircle className="w-10 h-10 text-red-500" />
            ) : (
              <Info className="w-10 h-10 text-slate-500" />
            )}

            <DialogTitle
              className={
                modalTitle === "Error"
                  ? "text-red-600 text-lg font-semibold"
                  : modalTitle === "Success"
                    ? "text-green-600 text-lg font-semibold"
                    : "text-slate-900 text-lg font-semibold"
              }
            >
              {modalTitle}
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              {modalMessage}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            {modalMessage.includes("sign up") || modalMessage.includes("not exist") ? (
              <Button
                onClick={() => {
                  setShowModal(false);
                  navigate("/signup/step1");
                }}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Head to Signup
              </Button>
            ) : (
              <Button onClick={handleModalClose}>Close</Button>
            )}
          </DialogFooter>


        </DialogContent>
      </Dialog>

      <Navigation />

      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Logo/Title */}
              <div className="text-center mb-8 flex flex-col items-center">
                {/* Icon hình tròn to */}
                <div className="bg-primary/10 text-primary p-6 rounded-full shadow-md flex items-center justify-center mb-4">
                  <Briefcase className="size-10" />
                </div>

                {/* Dòng mô tả bên dưới */}
                <p className="text-gray-600 text-sm sm:text-base">
                  Welcome back! Please login to your account.
                </p>
              </div>


              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-gray-700">Username or Email</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="you@example.com"
                    value={form.username}
                    onChange={handleChange}
                    className={`mt-1 border-bottom ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`mt-1 border-bottom ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  <div className="flex justify-end mt-5">
                    <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600 text-sm">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Log In
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-2 text-gray-500 text-sm">or</span>
                </div>
              </div>

              {/* Google Login */}
<div className="mt-6">
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <div className="relative w-full flex flex-col items-center">
      {/* Nút Google */}
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            setGoogleLoading(true);

            const res = await AuthService.loginWithGoogle(credentialResponse.credential);

            if (res.status === 403 || res?.error?.includes("blocked")) {
              setModalMessage("Your account has been blocked by admin. Please contact support.");
              setModalTitle("Error");
              setShowModal(true);
              return;
            }

            if (res.status === 404 || res?.error?.includes("not found")) {
              setModalMessage("This Google account is not registered yet. Would you like to sign up?");
              setModalTitle("Info");
              setShowModal(true);
              autoCloseTimer.current = setTimeout(() => navigate("/signup/step1"), 1500);
              return;
            }

            if (res.accessToken) {
              login(res.accessToken, res.role, res.userId, res.refreshToken);
              setModalMessage("Login with Google Successfully!");
              setModalTitle("Success");
              setShowModal(true);

              if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
              autoCloseTimer.current = setTimeout(() => setShowModal(false), 900);

              setTimeout(() => {
                if (res.needRoleSelection) navigate(`/choose-role?userId=${res.userId}`);
                else if (res.role === "PERSONAL") navigate("/home");
                else if (res.role === "BUSINESS") navigate("/employer/dashboard");
                else navigate("/");
              }, 1000);
            } else {
              setModalMessage("Google login failed: Invalid token.");
              setModalTitle("Error");
              setShowModal(true);
            }
          } catch (err) {
            console.error("Google login failed", err);
            setModalMessage("Google login failed. Please try again.");
            setModalTitle("Error");
            setShowModal(true);
          } finally {
            setGoogleLoading(false);
          }
        }}
        onError={() => {
          setModalMessage("Google login failed. Please try again.");
          setModalTitle("Error");
          setShowModal(true);
          setGoogleLoading(false);
        }}
        useOneTap={false}
        theme="outline"
        size="large"
        shape="rectangular"
        text="signin_with"
        width="100%"
        logo_alignment="left"
      />

      {/* Overlay Loading */}
      {googleLoading && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-md transition-all duration-200">
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-6 h-6 mb-2 animate-spin-slow"
          />
          <p className="text-gray-600 text-sm font-medium">Đang đăng nhập bằng Google...</p>
        </div>
      )}
    </div>
  </GoogleOAuthProvider>
</div>



              <div className="text-center mt-6">
                <p className="text-gray-600">
                  New to JobPortal?{' '}
                  <Link to="/signup/step1" className="text-blue-500 hover:text-blue-600">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />

        {/* Removed legacy manual modal; using Dialog primitives above for notifications */}
      </div>
    </>
  );
}
