import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
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

export function ChangePassword() {
  const { token } = useAuth();
  console.log("Authorization header:", `Bearer ${token}`);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ message: "", success: true });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!token) {
      setDialogData({ message: "Session expired. Please log in again.", success: false });
      setDialogOpen(true);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setDialogData({ message: "Passwords do not match", success: false });
      setDialogOpen(true);
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8080/api/auth/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDialogData({ message: "Password changed successfully", success: true });
      setDialogOpen(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Change password error:", err);
      setDialogData({
        message: err.response?.data?.error || "Failed to change password",
        success: false,
      });
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <div className="space-y-4">
          <Input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Password"}
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
              onClick={() => setDialogOpen(false)}
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
