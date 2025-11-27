import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, UserCheck, UserX, Mail, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [errorDialog, setErrorDialog] = useState({ show: false, message: "" });


  const API_BASE_URL = "/api/admin";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log("📡 Fetching users...");
      const res = await axios.get(`${API_BASE_URL}/users`, { headers });
      console.log("✅ Users fetched:", res.data);

      // Spring trả về Page<AdminUserViewDto> → ta lấy phần content
      setUsers(res.data.content || res.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log(`📝 Updating status of user ${userId} → ${newStatus}`);
      const res = await axios.put(
        `${API_BASE_URL}/users/${userId}/status`,
        { status: newStatus },
        { headers }
      );


      console.log("✅ Updated:", res.data);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (error) {
      console.error("❌ Failed to update user status:", error);
    }
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_BASE_URL}/users/${selectedUser.id}`, { headers });

      // ✅ Thành công
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      setTimeout(() => setShowSuccessDialog(false), 3000);
    } catch (error) {
      console.error("❌ Failed to delete user:", error);

      // 🧩 Chỉ hiển thị thông báo gọn gàng, không chi tiết SQL
      let message = "Delete failed — unable to remove this user.";
      if (error.response?.status === 404) {
        message = "User not found or already deleted.";
      } else if (error.response?.status === 409) {
        message = "Cannot delete this user because they have related data (e.g., jobs).";
      }

      setShowConfirmDialog(false);
      setErrorDialog({ show: true, message });
    }
  };


  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === "all" || user.status === statusFilter.toUpperCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>User Management</h1>
        <p className="text-muted-foreground">Manage candidates and employers</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CANDIDATE">Candidates</SelectItem>
                <SelectItem value="BUSINESS">Employers</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatar || ""} />
                        <AvatarFallback>
                          {user.username?.slice(0, 2).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Mail className="size-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "BUSINESS" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="size-3 mr-1 text-muted-foreground" />
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant={user.status === "ACTIVE" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          setUserToBlock(user);
                          setShowBlockDialog(true);
                        }}

                      >
                        {user.status === "ACTIVE" ? (
                          <>
                            <UserX className="size-4 mr-1" />
                            Block
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-4 mr-1" />
                            Unblock
                          </>
                        )}
                      </Button>

                      {/* 🗑️ Delete button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedUser?.username}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🆕 Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-xs text-center py-4">
          <DialogTitle className="text-green-600 text-base font-semibold">
            ✅ User deleted successfully
          </DialogTitle>
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            onClick={() => setShowSuccessDialog(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* 🆕 Confirm Block/Unblock Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {userToBlock?.status === "ACTIVE" ? "Block User" : "Unblock User"}
            </DialogTitle>
            <DialogDescription>
              {userToBlock?.status === "ACTIVE"
                ? `Are you sure you want to block ${userToBlock?.username}?`
                : `Are you sure you want to unblock ${userToBlock?.username}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={userToBlock?.status === "ACTIVE" ? "destructive" : "default"}
              onClick={() => {
                handleToggleStatus(userToBlock.id);
                setShowBlockDialog(false);
              }}
            >
              {userToBlock?.status === "ACTIVE" ? "Block" : "Unblock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={errorDialog.show} onOpenChange={() => setErrorDialog({ show: false, message: "" })}>
        <DialogContent className="max-w-xs text-center py-4">
          <DialogTitle className="text-red-600 text-base font-semibold">
            ❌ Delete Failed
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {errorDialog.message}
          </DialogDescription>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setErrorDialog({ show: false, message: "" })}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
