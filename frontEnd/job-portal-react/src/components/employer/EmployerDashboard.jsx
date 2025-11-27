import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip.jsx";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Briefcase,
  Users,
  Eye,
  UserCheck,
  TrendingUp,
  Plus,
  Calendar,
  MapPin,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';


export function EmployerDashboard() {
  const { user, token } = useAuth();
  const userId = user?.id;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const URL_BASE = 'http://localhost:8080/api/employers';
  console.log("Employer token:", token);

  // 🟢 Hàm load tổng hợp dashboard (gọi endpoint chính)
  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get(`${URL_BASE}/${userId}/dashboard`);
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Nếu muốn tối ưu: tách riêng chart hoặc list (optional)
  const fetchExtraData = async () => {
    try {
      const [viewsRes, appsRes] = await Promise.all([
        axios.get(`${URL_BASE}/${userId}/views-stats`),
        axios.get(`${URL_BASE}/${userId}/applications-stats`)
      ]);
      setDashboardData(prev => ({
        ...prev,
        viewsData: viewsRes.data,
        applicationData: appsRes.data
      }));
    } catch (err) {
      console.warn('Error fetching extra data (charts):', err);
    }
  };

  const handleManageJobs = () => {
    navigate('/employer/jobs'); // ✅ Trang quản lý Jobs
  };

  const handleEditJob = (jobId) => {
    navigate(`/employer/jobs/${jobId}/edit`); // ✅ Trang chỉnh sửa Job chi tiết
  };

  const handleManageApplicants = () => { // ✅ Thêm hàm điều hướng mới
    navigate('/employer/applicants');
  };

  const handleViewApplication = (applicationId) => {
    navigate(`/employer/applications/${applicationId}`);
  };

  useEffect(() => {
    if (!userId) return;
    fetchDashboard().then(fetchExtraData);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchDashboard().then(fetchExtraData);
  }, [userId]);

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading employer dashboard...</div>;
  }

  if (!dashboardData) {
    return (
      <div className="p-10 text-center text-red-600">
        No employer dashboard data found.
      </div>
    );
  }

  // ✅ Destructure dữ liệu thực từ backend
  const {
    totalJobs = 0,
    totalApplications = 0,
    totalViews = 0,
    totalHired = 0,
    jobChange = 0,
    applicationChange = 0,
    viewChange = 0,
    hiredChange = 0,
    recentJobs = [],
    recentApplications = [],
    viewsData = [],
    applicationData = [],
  } = dashboardData;

  // ✅ Tạo mảng thống kê thực tế
  const stats = [
    {
      title: "Active Jobs",
      value: totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      change: `${jobChange >= 0 ? '▲' : '▼'} ${Math.abs(jobChange).toFixed(1)}% from last month`,
      changeColor: jobChange >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Users,
      color: "text-green-600",
      change: `${applicationChange >= 0 ? '▲' : '▼'} ${Math.abs(applicationChange).toFixed(1)}% from last month`,
      changeColor: applicationChange >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: "Job Views",
      value: totalViews,
      icon: Eye,
      color: "text-purple-600",
      change: `${viewChange >= 0 ? '▲' : '▼'} ${Math.abs(viewChange).toFixed(1)}% from last month`,
      changeColor: viewChange >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: "Hired Candidates",
      value: totalHired,
      icon: UserCheck,
      color: "text-orange-600",
      change: `${hiredChange >= 0 ? '▲' : '▼'} ${Math.abs(hiredChange).toFixed(1)}% from last month`,
      changeColor: hiredChange >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: "Reported Jobs",
      value: dashboardData.reportedJobsCount || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      change: "⚠️ Needs review",
      changeColor: "text-red-600",
    },

  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-gray-600">Manage your job postings and track applications</p>
          </div>
          <Button size="lg" onClick={() => navigate('/employer/post-job')}>
            <Plus className="mr-2 size-4" />
            Post New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-wrap">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`size-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Applications Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Applications Overview</CardTitle>
              <CardDescription>Monthly applications trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Job Views</CardTitle>
              <CardDescription>Monthly job view trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Your latest job listings</CardDescription>
              </div>
              <Button variant="ghost" onClick={handleManageJobs} className="flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentJobs && recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleEditJob(job.id)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{job.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="size-4 mr-1 text-gray-500" />
                          {job.location || 'No location specified'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Posted on {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            job.status?.toUpperCase() === 'OPEN'
                              ? 'default'
                              : job.status?.toUpperCase() === 'CLOSED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {job.status?.toUpperCase() === 'OPEN'
                            ? 'Active'
                            : job.status?.toUpperCase() === 'CLOSED'
                              ? 'Closed'
                              : 'Unknown'}
                        </Badge>

                        {/* ✅ Hiển thị nếu job bị report */}
                        {job.visible && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="destructive"
                                  className="ml-2 cursor-help"
                                >
                                  ⚠ Reported
                                </Badge>
                              </TooltipTrigger>

                              <TooltipContent side="top" className="max-w-xs p-3 text-sm">
                                <p className="font-semibold mb-1 text-red-600">
                                  This job has been reported
                                </p>
                                <p>
                                  Reason: {job.reportReason || "Under review"}
                                </p>
                                {job.reportCount && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Reports: {job.reportCount}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-sm text-gray-500">You haven’t posted any jobs yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest candidate submissions</CardDescription>
              </div>
              <Button variant="ghost" onClick={handleManageApplicants} className="flex items-center space-x-1"> {/* ✅ Thêm nút View All Applicants */}
                <span>View All</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications && recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => handleViewApplication(app.applicationId)} // ✅ Thêm click
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{app.applicantName}</h4>
                        <p className="text-sm text-gray-600">{app.jobTitle}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="size-4 mr-1" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          app.status?.toUpperCase() === 'APPROVED'
                            ? 'default'
                            : app.status?.toUpperCase() === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent applications yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
