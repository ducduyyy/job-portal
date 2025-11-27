import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthService from "../../../../services/AuthService";
import { useAuth } from "../../../../context/AuthProvider";
import { Button } from "../../../ui/button";

export default function ChooseRole() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId"); // ✅ lấy userId từ URL

  const handleSelectRole = async (role) => {
    try {
      console.log("Setting role for user:", userId, "as", role);
      const res = await AuthService.setRole(userId, role);
      console.log("Response from setRole:", res);

      if (res.accessToken) {
        // ✅ Lưu token tạm thời để giữ đăng nhập
        login(res.accessToken, res.role, res.userId, res.refreshToken);

        // ✅ Chuyển đến Step3 để tạo profile
        navigate("/signup/step3", {
          state: {
            accountType: res.role, // PERSONAL hoặc BUSINESS
            userId: res.userId,
            userInfo: {} // chưa cần info thêm
          },
        });
      }
    } catch (err) {
      console.error("Error setting role:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-semibold mb-6">Choose your role</h2>
      <div className="flex gap-6">
        <Button
          onClick={() => handleSelectRole("PERSONAL")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          I'm a Candidate
        </Button>
        <Button
          onClick={() => handleSelectRole("BUSINESS")}
          className="bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          I'm an Employer
        </Button>
      </div>
    </div>
  );
}
