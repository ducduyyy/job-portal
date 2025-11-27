import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "/api/admin";
  const token = useAuth();
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];


  const fetchStats = async () => {

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    try {
      console.log("➡️ Gọi GET /stats");
      const res = await axios.get(`${API_BASE_URL}/stats`, { headers });
      console.log("✅ Nhận được dữ liệu:", res.data);
      setStats(res.data);
    } catch (error) {
      console.error("❌ Lỗi khi gọi /stats:", error);

      // Nếu thất bại, thử khởi tạo dữ liệu mẫu
      try {
        console.log("➡️ Gọi POST /init-sample-data");
        await axios.post(`${API_BASE_URL}/init-sample-data`, null, { headers });
        const res2 = await axios.get(`${API_BASE_URL}/stats`, { headers });
        console.log("✅ Sau khi init-sample-data:", res2.data);
        setStats(res2.data);
      } catch (initError) {
        console.error("🚫 Không thể init sample data:", initError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Users",
      value: stats?.totalUsers?.toString() || "0",
      change: "+2.1%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs?.toString() || "0",
      change: "+5.4%",
      icon: Briefcase,
      color: "text-green-600",
    },
    {
      title: "Applications",
      value: stats?.totalApplications?.toString() || "0",
      change: "+12.3%",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Pending Reports",
      value: stats?.pendingReports?.toString() || "0",
      change: "+1.8%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  const formatTimeAgo = (timestamp) => {
    const diff = (Date.now() - new Date(timestamp)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };


  const industryData = stats?.industryData || [];
  const growthData = stats?.growthData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job board platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>User and job growth over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="New Users" />
                <Bar dataKey="jobs" fill="#10b981" name="New Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hot Industries Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hot Industries</CardTitle>
            <CardDescription>Job distribution by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="jobs"
                  label={({ name, jobs }) => `${name}: ${jobs}`}
                >
                  {industryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>

            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivities?.length ? (
            <div className="space-y-4">
              {stats.recentActivities.map((n, index) => {
                const colorMap = {
                  JOB_CREATED: "bg-blue-500",
                  JOB_UPDATED: "bg-amber-500",
                  JOB_DELETED: "bg-red-500",
                  JOB_REPORTED: "bg-orange-500",
                  JOB_APPLIED: "bg-green-500",
                  APPLICATION_ACCEPTED: "bg-green-600",
                  APPLICATION_REJECTED: "bg-red-600",
                  USER_REGISTERED: "bg-indigo-500",
                  USER_DELETED: "bg-gray-500",
                  REPORT_RECEIVED: "bg-yellow-500",
                  CANDIDATE_UPLOAD_CV: "bg-sky-500",
                  CANDIDATE_UPLOAD_AVATAR: "bg-cyan-500",
                };
                const color = colorMap[n.type] || "bg-gray-400";

                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`size-2 ${color} rounded-full mt-2`} />
                    <div className="flex-1">
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No recent notifications found</p>
          )}
        </CardContent>
      </Card>


    </div>
  );
}