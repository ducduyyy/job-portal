import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ message: "", success: true });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      setDialogData({ message: "Please fill in all fields.", success: false });
      setDialogOpen(true);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setDialogData({ message: "Passwords do not match.", success: false });
      setDialogOpen(true);
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });

      setDialogData({ message: "Password reset successfully!", success: true });
      setDialogOpen(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setDialogData({
        message: err.response?.data?.error || "Failed to reset password.",
        success: false,
      });
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogData.success) navigate("/login");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center">Reset Password</h2>
          <Input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            required
            className="mb-3"
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="mb-4"
          />
          <Button onClick={handleSubmit} className="w-full">
            Update Password
          </Button>
        </div>
      </div>

      {/* Dialog thông báo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className={dialogData.success ? "text-green-600" : "text-red-600"}
            >
              {dialogData.success ? "Success" : "Error"}
            </DialogTitle>
            <DialogDescription>{dialogData.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleDialogClose}
              className={`${
                dialogData.success
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
