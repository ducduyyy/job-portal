import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { Users, Filter, RefreshCcw, Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Badge } from '../ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog.jsx';

// Hàm helper để map status từ backend sang màu sắc/biến thể badge
const getStatusBadge = (status) => {
    switch (status) {
        case 'PENDING':
            return { variant: 'secondary', text: 'Pending' };
        case 'REVIEWED':
            return { variant: 'default', text: 'Reviewed' };
        case 'INTERVIEW':
            return { variant: 'blue', text: 'Interview' };
        case 'ACCEPTED':
            return { variant: 'blue', text: 'Accepted' };
        case 'REJECTED':
            return { variant: 'destructive', text: 'Rejected' };
        default:
            return { variant: 'outline', text: 'New' };
    }
};

export function ViewApplicants() {
    const { user, token } = useAuth();
    const userId = user?.id; // Hoặc employerProfileId, tùy thuộc vào API
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
    const [filters, setFilters] = useState({ status: 'ALL', jobId: 'ALL' });
    const [jobsList, setJobsList] = useState([]); // Danh sách Job để lọc
    const navigate = useNavigate();

    const URL_BASE = 'http://localhost:8080/api/employers';

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogSuccess, setDialogSuccess] = useState(true);

    const showDialog = (message, success = true) => {
        setDialogMessage(message);
        setDialogSuccess(success);
        setDialogOpen(true);
        setTimeout(() => setDialogOpen(false), 2500);
    };

    // Lấy danh sách Jobs để dùng cho bộ lọc
    const fetchJobsList = async () => {
        try {
            // Lấy tất cả jobs (có thể dùng endpoint /employer/{userId}/jobs đã tạo)
            const response = await axios.get(`${URL_BASE}/${userId}/jobs`, { params: { size: 999, status: 'ALL' }, headers: { Authorization: `Bearer ${token}` } });
            setJobsList(response.data.content || []);
        } catch (error) {
            console.error('Error fetching jobs list for filter:', error);
        }
    };

    const fetchApplications = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                size: pagination.size,
            };

            // chỉ gửi khi có filter thật
            if (filters.status && filters.status !== 'ALL') {
                params.status = filters.status;
            }

            if (filters.jobId && filters.jobId !== 'ALL') {
                params.jobId = filters.jobId;
            }

            const response = await axios.get(`${URL_BASE}/${userId}/applications`, {
                params,
                headers: { Authorization: `Bearer ${token}` }, // thêm token luôn
            });

            setApplications(response.data.content || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements
            }));
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, pagination.page, pagination.size, filters.status, filters.jobId]);


    useEffect(() => {
        fetchJobsList();
    }, [userId]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 0 })); // Reset về trang 1 khi filter
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleViewDetail = (applicationId) => {
        navigate(`/employer/applications/${applicationId}`);
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        if (!applicationId || !newStatus) return;

        try {
            setLoading(true);

            await axios.patch(
                `${URL_BASE}/applications/${applicationId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // ✅ Thông báo thành công
            showDialog(`Cập nhật trạng thái thành công: ${newStatus}`, true);

            // ✅ Làm mới danh sách ứng viên
            fetchApplications();
        } catch (error) {
            console.error("❌ Error updating applicant status:", error);

            let message = "Không thể cập nhật trạng thái ứng viên.";
            if (error.response?.status === 400) {
                message = error.response?.data?.error || "Dữ liệu không hợp lệ.";
            } else if (error.response?.status === 404) {
                message = "Không tìm thấy đơn ứng tuyển.";
            } else if (error.response?.status === 401) {
                message = "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.";
            } else if (error.response?.status === 500) {
                message = "Lỗi máy chủ, vui lòng thử lại sau.";
            }

            showDialog(message, false);
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Users className="mr-2 size-6" /> Applicant Tracking
            </h1>
            <p className="text-gray-600 mb-6">Review, filter, and manage all candidate applications.</p>

            {/* Filter and Controls */}
            <Card className="mb-6">
                <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-end">

                    <div className="w-full md:w-60">
                        <label className="text-sm font-medium">Filter by Job</label>
                        <Select value={filters.jobId} onValueChange={(v) => handleFilterChange('jobId', v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Job Title" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Jobs</SelectItem>
                                {jobsList.map(job => (
                                    <SelectItem key={job.id} value={String(job.id)}>{job.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="text-sm font-medium">Filter by Status</label>
                        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses ({pagination.totalElements})</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                                <SelectItem value="INTERVIEW">Interview</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => fetchApplications()} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
                        Refresh
                    </Button>
                </CardContent>
            </Card>

            {/* Applications List */}
            {loading ? (
                <div className="p-10 text-center text-gray-600 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin mr-2" /> Loading applications...
                </div>
            ) : applications.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                        No applications found under the selected filters.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map(app => (
                        <Card key={app.applicationId} className="hover:shadow-lg transition">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div
                                    className="flex-1 min-w-0 pr-4 cursor-pointer"
                                    onClick={() => handleViewDetail(app.applicationId)}
                                >
                                    <h2 className="font-semibold text-xl">{app.candidateName}</h2>
                                    <p className="text-sm text-gray-600 truncate mt-0.5">{app.jobTitle}</p>
                                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                        <Badge {...getStatusBadge(app.status)} />
                                        <span>| Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        title="View Detail"
                                        onClick={() => handleViewDetail(app.applicationId)}
                                    >
                                        <FileText className="size-4" />
                                    </Button>

                                    {app.status !== 'ACCEPTED' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={loading}
                                            title="Mark as accepted"
                                            onClick={() => handleUpdateStatus(app.applicationId, 'ACCEPTED')}
                                        >
                                            {loading ? (
                                                <Loader2 className="size-4 animate-spin text-green-600" />
                                            ) : (
                                                <CheckCircle className="size-4 text-green-600" />
                                            )}
                                        </Button>

                                    )}

                                    {app.status !== 'REJECTED' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Reject"
                                            onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}
                                        >
                                            <XCircle className="size-4 text-red-600" />
                                        </Button>
                                    )}
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-sm text-center p-6 rounded-xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle
                            className={`text-lg font-semibold flex items-center justify-center gap-2 ${dialogSuccess ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {dialogSuccess ? "✅ Thành công" : "⚠️ Thông báo lỗi"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-700 mt-2 text-sm">{dialogMessage}</p>
                </DialogContent>
            </Dialog>

        </div>
    );
}