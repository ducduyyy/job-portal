import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../ui/select";
import {
  Search, Eye, Check, X, MapPin, DollarSign, Calendar, Briefcase
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "../ui/dialog";
import { useAuth } from "../../context/AuthProvider";

export function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    jobId: null,
  });

  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "success", // "success" | "error"
  });

  const API_BASE_URL = "/api/admin";
  const { token } = useAuth();

  // 🧩 Fetch jobs list
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/jobs`, { headers });
      setJobs(res.data.content || res.data);
    } catch (error) {
      console.error("❌ Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 🧩 Fetch job details for modal
  const handleViewJob = async (jobId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, { headers });
      setSelectedJob(res.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Failed to fetch job details:", error);
    }
  };

  // 🧩 Update job status
  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(
        `${API_BASE_URL}/jobs/${jobId}/status`,
        null,
        { headers, params: { status: newStatus.toUpperCase() } }
      );
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: newStatus.toUpperCase() } : job
        )
      );
    } catch (error) {
      console.error("❌ Failed to update job status:", error);
    }
  };

  // 🧩 Delete job
  const handleDelete = (jobId) => {
    setConfirmDialog({ open: true, jobId });
  };

  const confirmDelete = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE_URL}/jobs/${confirmDialog.jobId}`, { headers });

      setJobs((prev) => prev.filter((job) => job.id !== confirmDialog.jobId));

      setResultDialog({
        open: true,
        title: "Deleted Successfully",
        message: "The job has been removed from the system.",
        type: "success",
      });

      // ✅ Auto close sau 3s
      setTimeout(() => {
        setResultDialog((prev) => ({ ...prev, open: false }));
      }, 3000);
    } catch (error) {
      console.error("❌ Failed to delete job:", error);
      setResultDialog({
        open: true,
        title: "Delete Failed",
        message: "Something went wrong while deleting this job.",
        type: "error",
      });
    } finally {
      setConfirmDialog({ open: false, jobId: null });
    }
  };

  // 🧩 Filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter.toUpperCase();
    const matchesType = typeFilter === "all" || job.jobType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };


  const getTypeColor = (jobType) => {
    switch (jobType) {
      case "FULL_TIME":
        return "default";
      case "PART_TIME":
        return "secondary";
      case "CONTRACT":
        return "outline";
      case "REMOTE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Job Management</h1>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Job Management</h1>
        <p className="text-muted-foreground">Review and moderate job postings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter job postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FULL_TIME">Full-time</SelectItem>
                <SelectItem value="PART_TIME">Part-time</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="REMOTE">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Postings ({filteredJobs.length})</CardTitle>
          <CardDescription>Manage and moderate job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.company}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="size-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="size-3 mr-1" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(job.jobType)}>{job.jobType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {job.visible === true ? (
                      <Badge variant="destructive" className="text-xs">
                        Reported
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Normal
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>{job.totalApplications || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="size-3 mr-1 text-muted-foreground" />
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewJob(job.id)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {job.status === "PENDING" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(job.id, "APPROVED")}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateStatus(job.id, "REJECTED")}
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
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

      {/* 🧩 Job Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          {selectedJob ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="size-5 text-primary" />
                  {selectedJob.title}
                </DialogTitle>
                <DialogDescription>
                  Posted by <span className="font-medium">{selectedJob.company}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Location:</strong> {selectedJob.location}
                  </div>
                  <div>
                    <strong>Salary:</strong> {selectedJob.salary}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedJob.jobType}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <Badge variant={getStatusColor(selectedJob.status)}>
                      {selectedJob.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mt-3">Description</h4>
                  <p className="text-muted-foreground">{selectedJob.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mt-3">Requirements</h4>
                  <p className="text-muted-foreground">{selectedJob.requirements}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Posted on {new Date(selectedJob.createdAt).toLocaleDateString()}
                </div>
              </div>
            </>
          ) : (
            <p>Loading job details...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* 🧩 Confirm Delete Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, jobId: null })}
      >
        <DialogContent
          className="max-w-[360px] rounded-xl p-5 shadow-lg border border-gray-200"
          style={{ margin: "0 auto" }}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDialog({ open: false, jobId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🧩 Result Dialog (auto close after 3s) */}
      <Dialog
        open={resultDialog.open}
        onOpenChange={(open) => !open && setResultDialog({ ...resultDialog, open: false })}
      >
        <DialogContent
          className="max-w-[340px] rounded-xl p-5 shadow-lg border border-gray-200"
          style={{ margin: "0 auto" }}
        >
          <DialogHeader>
            <DialogTitle
              className={`text-base font-semibold ${resultDialog.type === "error" ? "text-red-600" : "text-green-600"
                }`}
            >
              {resultDialog.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {resultDialog.message}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mt-4">
            <Button
              size="sm"
              onClick={() => setResultDialog({ ...resultDialog, open: false })}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>




    </div>
  );
}
