import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog.jsx";
import { Loader2, FileText, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthProvider.jsx";

export function ApplicantDetail() {
  const { applicationId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvOpen, setCvOpen] = useState(false);
  const [cvUrl, setCvUrl] = useState(null);
  const [updating, setUpdating] = useState(false);

  // 🆕 Dialog thông báo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogSuccess, setDialogSuccess] = useState(true);

  // 🆕 Dialog xác nhận
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const EMPLOYER_API = "http://localhost:8080/api";

  useEffect(() => {
  const fetchApplicationDetail = async () => {
    try {
      const response = await axios.get(
        `${EMPLOYER_API}/applications/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApplication(response.data);
    } catch (error) {
      console.error("Error loading application detail:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchApplicationDetail();
}, [applicationId, token]);


  const handleViewCv = async () => {
    try {
      const response = await axios.get(`${EMPLOYER_API}/applications/${applicationId}/download-cv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(response.data);
      setCvUrl(blobUrl);
      setCvOpen(true);
    } catch (err) {
      console.error("Error loading CV:", err);
      showDialog("Không thể tải CV của ứng viên này.", false);
    }
  };

  const handleBack = () => navigate("/employer/applicants");

  // 🆕 Dialog hiển thị thông báo (tự tắt sau 2s)
  const showDialog = (message, success = true) => {
    setDialogMessage(message);
    setDialogSuccess(success);
    setDialogOpen(true);
    setTimeout(() => setDialogOpen(false), 2000);
  };

  // 🆕 Hiển thị dialog xác nhận trước khi cập nhật
  const handleOpenConfirm = (status) => {
    setPendingStatus(status);
    setConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    setConfirmOpen(false);
    setUpdating(true);

    try {
      await axios.patch(
        `${EMPLOYER_API}/employers/applications/${applicationId}/status`,
        { status: pendingStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplication((prev) => ({ ...prev, status: pendingStatus }));
      showDialog("Cập nhật trạng thái thành công!", true);
    } catch (err) {
      console.error("Error updating status:", err);
      showDialog("Không thể cập nhật trạng thái ứng viên.", false);
    } finally {
      setUpdating(false);
      setPendingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Đang tải chi tiết ứng viên...
      </div>
    );
  }

  if (!application) {
    return <div className="text-center text-gray-500 mt-10">Không tìm thấy thông tin ứng tuyển.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Applicant Detail</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <Button onClick={handleViewCv}>
            <FileText className="mr-2 h-4 w-4" /> Xem CV
          </Button>
        </div>
      </div>

      {/* Applicant Info */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{application.candidateName}</h2>
            <p className="text-gray-600">
              Ứng tuyển vào: <span className="font-medium">{application.jobTitle}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p><strong>Ngày ứng tuyển:</strong> {new Date(application.appliedAt).toLocaleString()}</p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`px-2 py-1 text-sm rounded-full ${application.status === "ACCEPTED"
                  ? "bg-green-100 text-green-700"
                  : application.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {application.status}
              </span>
            </p>
            <p><strong>Email:</strong> {application.candidateEmail}</p>
            <p><strong>Số điện thoại:</strong> {application.candidatePhone || "—"}</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex gap-3">
            <Button
              disabled={updating || application.status === "ACCEPTED"}
              onClick={() => handleOpenConfirm("ACCEPTED")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Chấp nhận
            </Button>

            <Button
              disabled={updating || application.status === "REJECTED"}
              onClick={() => handleOpenConfirm("REJECTED")}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" /> Từ chối
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CV Dialog */}
      <Dialog open={cvOpen} onOpenChange={setCvOpen}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>CV của {application.candidateName}</DialogTitle>
          </DialogHeader>
          {cvUrl ? (
            <iframe src={cvUrl} title="CV Preview" className="w-full h-[80vh] border rounded" />
          ) : (
            <p className="text-center text-gray-500 mt-4">Không thể hiển thị CV.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* 🆕 Dialog xác nhận cập nhật */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="
      sm:max-w-sm        /* ✅ Giới hạn chiều rộng */
      text-center
      p-6
      rounded-xl
      shadow-lg
      data-[state=open]:animate-in
      data-[state=open]:fade-in-90
      data-[state=open]:zoom-in-95
      data-[state=closed]:animate-out
      data-[state=closed]:fade-out-90
      data-[state=closed]:zoom-out-95
    "
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Xác nhận thay đổi trạng thái
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 mt-2 text-sm">
            Bạn có chắc muốn chuyển trạng thái sang{" "}
            <strong className="uppercase">{pendingStatus}</strong>?
          </p>
          <DialogFooter className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleConfirmStatusChange}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Dialog thông báo kết quả */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="
      sm:max-w-sm              /* ✅ Giới hạn chiều rộng tối đa */
      text-center
      p-6
      rounded-xl
      shadow-lg
      border border-gray-100
      ring-1 ring-gray-200/50
      data-[state=open]:animate-in
      data-[state=open]:fade-in-90
      data-[state=open]:zoom-in-95
      data-[state=closed]:animate-out
      data-[state=closed]:fade-out-90
      data-[state=closed]:zoom-out-95
    "
        >
          <DialogHeader>
            <DialogTitle
              className={`text-lg font-semibold flex items-center justify-center gap-2 ${dialogSuccess ? "text-green-600" : "text-red-600"
                }`}
            >
              {dialogSuccess ? (
                <>
                  ✅ Thành công
                </>
              ) : (
                <>
                  ⚠️ Lỗi xảy ra
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 mt-2 text-sm">{dialogMessage}</p>
        </DialogContent>
      </Dialog>

    </div>
  );
}
