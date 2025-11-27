import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  Eye,
  Check,
  X,
  AlertTriangle,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";
import { reportApi } from "../../api/ReportApi";
import { useAuth } from "../../context/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  // 🔹 Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await reportApi.getReports(token);

        const mappedReports = (data || []).map((r) => ({
          id: r.id,
          reportedBy: r.reporterUsername,
          reportedName: r.reportedItemName || "N/A",
          postedBy: r.reportedItemOwner || "N/A",
          reportedType: r.reportedItemType?.toLowerCase() || "user",
          reportedId: r.reportedItemId || null,
          reason: r.reason,
          status: r.status?.toLowerCase(),
          severity: r.severity?.toLowerCase(),
          reportDate: r.createdAt,
        }));

        setReports(mappedReports);
      } catch (error) {
        console.error("❌ Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  // 🔹 Update status
  const handleResolve = async (reportId) => {
    try {
      await reportApi.updateReportStatus(reportId, "RESOLVED", token);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: "resolved" } : r
        )
      );
    } catch (error) {
      console.error("❌ Failed to resolve report:", error);
    }
  };

  const handleDismiss = async (reportId) => {
    try {
      await reportApi.updateReportStatus(reportId, "DISMISSED", token);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: "dismissed" } : r
        )
      );
    } catch (error) {
      console.error("❌ Failed to dismiss report:", error);
    }
  };

  const handleSeverityChange = async (reportId, newSeverity) => {
    try {
      await reportApi.updateReportSeverity(reportId, newSeverity.toUpperCase(), token);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, severity: newSeverity } : r
        )
      );
    } catch (error) {
      console.error("❌ Failed to update severity:", error);
      alert("Failed to update severity");
    }
  };


  // 🔹 Open modal with report details
  const viewReport = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // 🔹 Filter
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reportedName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType =
      typeFilter === "all" || report.reportedType === typeFilter;
    const matchesSeverity =
      severityFilter === "all" || report.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesSeverity;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "resolved":
        return "default";
      case "dismissed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Reports</h1>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Reports</h1>
        <p className="text-muted-foreground">
          Manage reported users and job postings
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reports
            </CardTitle>
            <AlertTriangle className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Severity
            </CardTitle>
            <AlertTriangle className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.severity === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent attention required
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Reports
            </CardTitle>
            <Check className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "resolved").length}
            </div>
            <p className="text-xs text-muted-foreground">Cases closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or reason..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Reports</SelectItem>
                <SelectItem value="job">Job Reports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>


      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <CardDescription>
            Review and take action on reported content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reported Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center size-8 rounded-full bg-muted">
                        {report.reportedType === "user" ? (
                          <User className="size-4" />
                        ) : (
                          <Briefcase className="size-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {report.reportedName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {report.reportedId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {report.reportedType}
                  </TableCell>
                  <TableCell className="text-sm">{report.reportedBy}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Badge thể hiện màu ngay lập tức */}
                      <Badge variant={getSeverityColor(report.severity)}>
                        {/* {report.severity} */}
                      </Badge>

                      {/* Dropdown cho phép thay đổi */}
                      <Select
                        value={report.severity}
                        onValueChange={(newSeverity) =>
                          handleSeverityChange(report.id, newSeverity)
                        }
                      >
                        <SelectTrigger className="w-[90px] text-xs">
                          <SelectValue placeholder={report.severity} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="size-3 mr-1 text-muted-foreground" />
                      {new Date(report.reportDate).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}

                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReport(report)}
                      >
                        <Eye className="size-4" />
                      </Button>

                      {report.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResolve(report.id)}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDismiss(report.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 🔹 Report Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Detail #{selectedReport?.id}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-3 mt-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{selectedReport.reportedType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reported Item:</span>
                <span>{selectedReport.reportedName}</span>
              </div>
<div className="flex justify-between">
  <span className="font-medium">Posted By:</span>
  <span>{selectedReport.postedBy || "N/A"}</span>
</div>

              <div className="flex justify-between">
                <span className="font-medium">Reported By:</span>
                <span>{selectedReport.reportedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>
                  {new Date(selectedReport.reportDate).toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Severity:</span>
                <Badge variant={getSeverityColor(selectedReport.severity)}>
                  {selectedReport.severity}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={getStatusColor(selectedReport.status)}>
                  {selectedReport.status}
                </Badge>
              </div>

              <div className="pt-3 border-t">
                <span className="font-medium block mb-1">Reason:</span>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedReport.reason}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
