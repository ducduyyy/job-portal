import React, { useEffect, useState, useCallback, use } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Pencil, Trash2, Search, Filter, RefreshCcw, Loader2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Input } from '../ui/input.jsx';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';

// Hàm helper để map status từ backend sang màu sắc/biến thể badge
const getStatusBadge = (status) => {
    switch (status) {
        case 'OPEN':
            return { variant: 'default', text: 'Active' };
        case 'DRAFT':
            return { variant: 'secondary', text: 'Draft' };
        case 'CLOSED':
            return { variant: 'destructive', text: 'Closed' };
        default:
            return { variant: 'outline', text: 'Unknown' };
    }
};

export function EmployerJobs() {
    const { user, token } = useAuth();
    const userId = user?.id;
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
    const [filters, setFilters] = useState({ status: 'ALL', search: '' });
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [reportDetails, setReportDetails] = useState([]);

    const navigate = useNavigate();

    const URL_BASE = 'http://localhost:8080/api/employers';

    const fetchJobs = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const statusParam = filters.status !== 'ALL' ? filters.status : '';
            // Backend endpoint: GET /api/employers/{employerId}/jobs?status=...&page=...
            const response = await axios.get(`${URL_BASE}/${userId}/jobs`, {
                params: {
                    status: statusParam,
                    page: pagination.page,
                    size: pagination.size,
                    // Thêm tìm kiếm nếu cần: title: filters.search
                    sortBy: 'createdAt',
                    sortDir: 'desc'
                }
            });

            setJobs(response.data.content || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements
            }));
        } catch (err) {
            console.error('Error fetching employer jobs:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, pagination.page, pagination.size, filters.status]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 0 })); // Reset về trang 1 khi filter
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleEdit = (jobId) => {
        navigate(`/employer/jobs/${jobId}/edit`);
    };

    const handleDelete = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                // Endpoint DELETE /api/jobs/{id}
                await axios.delete(`http://localhost:8080/api/jobs/${jobId}`);
                fetchJobs(); // Tải lại danh sách sau khi xóa
            } catch (error) {
                console.error("Error deleting job:", error);
                alert("Failed to delete job.");
            }
        }
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        try {
            // Endpoint PATCH /api/employers/jobs/{jobId}/status
            await axios.patch(`${URL_BASE}/jobs/${jobId}/status`, { status: newStatus });
            fetchJobs(); // Tải lại danh sách sau khi cập nhật
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update job status.");
        }
    };

    const handleViewReport = async (jobId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/reports/job/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setReportDetails(response.data || []);
            setOpenReportDialog(true);
        } catch (error) {
            console.error("Error fetching report details:", error);
            alert("Failed to load report details.");
        }
    };


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Briefcase className="mr-2 size-6" /> Job Management
            </h1>
            <p className="text-gray-600 mb-6">Manage, edit, or delete your job postings.</p>

            {/* Filter and Controls */}
            <Card className="mb-6">
                <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium">Search by Title</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                            <Input
                                placeholder="Search job titles..."
                                className="pl-10"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            // TODO: Cần điều chỉnh backend để hỗ trợ tìm kiếm theo tiêu đề
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="text-sm font-medium">Filter by Status</label>
                        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses ({pagination.totalElements})</SelectItem>
                                <SelectItem value="OPEN">Active</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => fetchJobs()} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
                        Refresh
                    </Button>
                </CardContent>
            </Card>

            {/* Job List */}
            {loading ? (
                <div className="p-10 text-center text-gray-600 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin mr-2" /> Loading jobs...
                </div>
            ) : jobs.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                        No job postings found under the selected filters.
                        <div className="mt-4">
                            <Button onClick={() => navigate('/employer/post-job')}>Post Your First Job</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <Card
                            key={job.id}
                            className={`transition ${job.visible ? 'border-red-300 bg-red-50' : 'hover:shadow-lg'
                                }`}
                        >
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h2 className="font-semibold text-xl truncate">{job.title}</h2>

                                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                                        <Badge {...getStatusBadge(job.status)} />

                                        {/* ✅ Nếu job bị report (visible = 1) thì hiển thị badge */}
                                        {job.visible && (
                                            <>
                                                <Badge variant="destructive" className="ml-2">
                                                    ⚠ Reported
                                                </Badge>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="ml-1 text-red-600 hover:text-red-800"
                                                    title="View Report Details"
                                                    onClick={() => handleViewReport(job.id)}
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </>
                                        )}


                                        <span>| Views: {job.viewsCount || 0}</span>
                                        <span>| Apps: {job.totalApplications || 0}</span>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        title="Edit Job"
                                        onClick={() => handleEdit(job.id)}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>

                                    <Button
                                        variant={job.status === 'OPEN' ? 'secondary' : 'default'}
                                        size="sm"
                                        title={job.status === 'OPEN' ? 'Close Job' : 'Re-open Job'}
                                        onClick={() => handleToggleStatus(job.id, job.status)}
                                    >
                                        {job.status === 'OPEN' ? 'Close' : 'Re-open'}
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        title="Delete Job"
                                        onClick={() => handleDelete(job.id)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-gray-600">
                            Page {pagination.page + 1} of {pagination.totalPages}
                        </p>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <Dialog open={openReportDialog} onOpenChange={setOpenReportDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Report Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about reports submitted for this job.
                        </DialogDescription>
                    </DialogHeader>

                    {reportDetails.length === 0 ? (
                        <p className="text-gray-500">No reports found for this job.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {reportDetails.map((report) => (
                                <div
                                    key={report.id}
                                    className="border rounded-lg p-3 bg-gray-50 text-sm"
                                >
                                    <p>
                                        <b>Reason:</b> {report.reason}
                                    </p>
                                    <p>
                                        <b>Status:</b> {report.status}
                                    </p>
                                    <p>
                                        <b>Severity:</b> {report.severity}
                                    </p>
                                    <p>
                                        <b>Reported By:</b>{" "}
                                        {report.reporter?.username || "Unknown"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        <b>Date:</b>{" "}
                                        {new Date(report.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}