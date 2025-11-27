
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { MapPin, DollarSign, Clock, Users, Calendar, Star, Share2, Flag, Bookmark, ArrowLeft, Building2, Globe } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuth } from '../../context/AuthProvider';

export function JobDetail() {
  const { id } = useParams();  // Lấy jobId từ URL
  const navigate = useNavigate();
  const [jobDetail, setJobDetail] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [selectedCv, setSelectedCv] = useState("");
  const [newCvFile, setNewCvFile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");


  const { user, token } = useAuth();
  const candidateId = user?.id;

  const handleQuickApply = async () => {
    if (!candidateId) {
      alert("Please log in as a candidate to apply.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8080/api/applications/quick-apply",
        null,
        {
          params: { candidateId, jobId: id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Application submitted successfully!");
      setHasApplied(true);
    } catch (err) {
      console.error("Error applying for job:", err);
      alert("Failed to apply for job.");
    }
  };

  const openApplyModal = async () => {
    if (!candidateId) {
      alert("Please log in to apply.");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/candidates/${candidateId}/cvs`);
      setCvList(res.data);
      setShowApplyModal(true);
    } catch (err) {
      console.error("Error fetching CV list:", err);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/jobs/${id}`);
        setJobDetail(res.data);

        // gọi API lấy job tương tự (ví dụ: theo industryId)
        if (res.data.industry && res.data.industry.id) {
          const similarRes = await axios.get(`http://localhost:8080/api/industries/${res.data.industry.id}/jobs`);
          setSimilarJobs(similarRes.data.filter(j => j.id !== res.data.id));
        }

      } catch (err) {
        console.error("Error fetching job detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!candidateId || !id) return;

    const checkIfSaved = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/candidates/saved-jobs/${candidateId}`);
        const savedIds = res.data.map(job => job.id);
        setIsSaved(savedIds.includes(parseInt(id)));
      } catch (err) {
        console.error("Error checking saved job:", err);
      }
    };
    checkIfSaved();
  }, [candidateId, id]);

  useEffect(() => {
    if (!candidateId || !id) return;

    const checkIfApplied = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/applications/candidate/${candidateId}`);
        const appliedIds = res.data.map(app => app.jobId);
        setHasApplied(appliedIds.includes(parseInt(id)));
      } catch (err) {
        console.error("Error checking applied jobs:", err);
      }
    };

    checkIfApplied();
  }, [candidateId, id]);

  const handleReportSubmit = async () => {
    if (!candidateId) {
      alert("Please log in to report this job.");
      return;
    }
    if (!reportReason.trim()) {
      alert("Please enter a reason for your report.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/reports/job`,
        null,
        {
          params: {
            reporterId: candidateId,
            jobId: id,
            reason: reportReason,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Report submitted successfully. Our team will review it soon!");
      setReportReason("");
      setShowReportModal(false);
    } catch (err) {
      console.error("❌ Error submitting report:", err);
      alert("Failed to submit report. Please try again later.");
    }
  };


  if (loading) return <p className="text-center py-10">Loading job detail...</p>;
  if (!jobDetail) return <p className="text-center py-10 text-red-500">Job not found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Ảnh tròn */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={
                          jobDetail.jobIMG
                            ? `http://localhost:8080${jobDetail.jobIMG}`
                            : "https://via.placeholder.com/100"
                        }
                        alt={`${jobDetail.companyName || 'Company'} logo`}
                        className="w-full h-full object-cover"
                      />

                    </div>

                    {/* Thông tin job */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-2xl">{jobDetail.title}</CardTitle>
                        {jobDetail.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="size-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <p className="text-lg text-gray-600">{jobDetail.companyName}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <MapPin className="size-4 mr-1" />
                          {jobDetail.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="size-4 mr-1" />
                          {`${jobDetail.salaryMin} - ${jobDetail.salaryMax}`}
                        </div>
                        <div className="flex items-center">
                          <Clock className="size-4 mr-1" />
                          {new Date(jobDetail.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="size-4 mr-1" />
                          {jobDetail.viewsCount} views
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!candidateId) {
                          alert("Please log in as a candidate to save jobs.");
                          return;
                        }
                        try {
                          if (isSaved) {
                            await axios.delete(`http://localhost:8080/api/candidates/saved-jobs/${candidateId}/${id}`);
                            setIsSaved(false);
                          } else {
                            await axios.post(`http://localhost:8080/api/candidates/saved-jobs`, null, {
                              params: { candidateId, jobId: id },
                            });
                            setIsSaved(true);
                          }
                        } catch (err) {
                          console.error("Error saving/removing job:", err);
                        }
                      }}
                      className={isSaved ? 'text-blue-600' : ''}
                    >
                      <Bookmark className={`size-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>

                    <Button variant="outline" size="sm">
                      <Share2 className="size-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReportModal(true)}
                    >
                      <Flag className="size-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {jobDetail.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skills (nếu backend trả về skills) */}
            {Array.isArray(jobDetail.skills) && jobDetail.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {jobDetail.skills.map((s, idx) => (
                      <Badge key={idx} variant="outline">
                        {typeof s === "string" ? s : s.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleQuickApply()}
                    disabled={hasApplied}
                  >
                    {hasApplied ? "Application Submitted" : "Apply Now"}
                  </Button>

                  {hasApplied && (
                    <div className="text-center text-sm text-green-600">
                      ✓ Your application has been submitted successfully
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => openApplyModal(true)}
                  >
                    Easy Apply with Profile
                  </Button>

                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {jobDetail.companyName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Building2 className="size-4 mr-2 text-gray-400" />
                    <span>{jobDetail.companySize || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="size-4 mr-2 text-gray-400" />
                    <span>{jobDetail.industryName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="size-4 mr-2 text-gray-400" />
                    <span>Founded {jobDetail.foundedYear || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {similarJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <h4 className="font-medium text-sm mb-1">{job.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{job.companyName}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{job.location}</span>
                          <span>{job.salaryMin} - {job.salaryMax}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {showApplyModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] space-y-4">
                  <h3 className="text-xl font-semibold">Apply for {jobDetail.title}</h3>
                  <p className="text-sm text-gray-500">Choose your existing CV or upload a new one.</p>

                  {/* Select CV đã upload */}
                  <select
                    className="border rounded-md w-full p-2"
                    onChange={(e) => setSelectedCv(e.target.value)}
                  >
                    <option value="">-- Select existing CV --</option>
                    {cvList.map((cv, idx) => (
                      <option key={idx} value={cv}>{cv.split("/").pop()}</option>
                    ))}
                  </select>

                  {/* Upload CV mới */}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNewCvFile(e.target.files[0])}
                    className="border rounded-md w-full p-2"
                  />

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      const formData = new FormData();
                      formData.append("candidateId", candidateId);
                      formData.append("jobId", id);
                      if (selectedCv) formData.append("existingCv", selectedCv);
                      if (newCvFile) formData.append("newCv", newCvFile);

                      try {
                        await axios.post("http://localhost:8080/api/applications/apply", formData);
                        setShowApplyModal(false);
                        setHasApplied(true);
                        alert("Application submitted successfully!");
                      } catch (err) {
                        if (err.response?.data?.includes("Duplicate entry")) {
                          alert("You have already applied for this job.");
                        } else {
                          console.error("Error submitting application:", err);
                          alert("Failed to submit application.");
                        }
                      }

                    }}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 🔹 Report Modal */}
            {showReportModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Flag className="text-red-500 size-5" />
                    Report Job
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tell us why you think this job posting violates our policy.
                  </p>

                  <textarea
                    rows="4"
                    className="w-full border rounded-md p-2 text-sm focus:ring focus:ring-blue-200"
                    placeholder="Describe your reason..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  ></textarea>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowReportModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReportSubmit}>
                      Submit Report
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );


}


