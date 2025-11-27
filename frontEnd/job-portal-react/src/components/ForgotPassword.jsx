import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", null, {
        params: { email },
      });
      setMessage("✅ Check your email for reset instructions.");
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Email not found.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Nút quay lại login */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Button>
      </div>

      {/* Form chính */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("❌")
                ? "text-red-500"
                : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
