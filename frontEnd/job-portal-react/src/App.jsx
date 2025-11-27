import { Routes, Route, Navigate } from "react-router-dom";
import CandidateApp from "./Candidate";
import EmployerApp from "./Employer";
import AdminApp from "./Admin";
import Login from "./components/authenticate/login/users/Login.jsx";
import AdminLogin from "./components/authenticate/login/admin/LoginComponent";
import NotFound from "./components/default/NotFoundPage";
import SignupStep1 from "./components/authenticate/signup/SignUpStep1";
import ChooseRole from "./components/authenticate/login/users/chooseRole";
import SignupStep2 from "./components/authenticate/signup/SignUpStep2";
import SignupStep3 from "./components/authenticate/signup/SignUpStep3";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import SwaggerPage from "./components/swagger";
import TranslateFloat from "./components/TranslateFloat.jsx";
import { ChangePassword } from "./components/ChangePassword.jsx";
import { ForgotPassword } from "./components/ForgotPassword.jsx";
import { ResetPassword } from "./components/ResetPassword.jsx";

// 👇 Tách AppContent để dùng role từ context
function AppContent() {
  const { role } = useAuth();
  const currentRole = role?.toUpperCase() || "";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/signup/step1" element={<SignupStep1 />} />
      <Route path="/signup/step2" element={<SignupStep2 />} />
      <Route path="/signup/step3" element={<SignupStep3 />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/swagger-ui/index.html" element={<SwaggerPage />} />

      <Route path="/choose-role" element={<ChooseRole />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      {/* Protected routes */}
      {currentRole === "ADMIN" && <Route path="/admin/*" element={<AdminApp />} />}
      {["BUSINESS", "ADMIN"].includes(currentRole) && (
        <Route path="/employer/*" element={<EmployerApp />} />
      )}
      {["PERSONAL", "ADMIN", ""].includes(currentRole) && (
        <Route path="/*" element={<CandidateApp />} />
      )}

      {/* Route catch-all: đường dẫn không tồn tại */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


// 👇 AuthProvider bọc AppContent
export default function App() {
  return (
    <AuthProvider>
      <TranslateFloat />
      <AppContent />
    </AuthProvider>
  );
}
