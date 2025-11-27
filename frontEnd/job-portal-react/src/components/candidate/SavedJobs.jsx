import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { MapPin, DollarSign, Clock, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog.jsx";


export function SavedJobs() {
  const { user } = useAuth();
  const candidateId = user?.id;
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!candidateId) return;
    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/candidates/saved-jobs/${candidateId}`);
        setSavedJobs(res.data);
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
      }
    };
    fetchSavedJobs();
  }, [candidateId]);

  const handleRemove = async (jobId) => {
    try {
      await axios.delete(`http://localhost:8080/api/candidates/saved-jobs/${candidateId}/${jobId}`);
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Error removing saved job:", err);
    }
  };

  if (savedJobs.length === 0)
    return <p className="text-gray-500 text-center">No saved jobs yet.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {savedJobs.map((job) => (
        <Card
          key={job.id}
          className="relative flex flex-col justify-between h-[300px] p-4 shadow-md rounded-xl"
        >
          {/* --- Nội dung phía trên --- */}
          <div>
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                {job.description}
              </p>

              <div className="flex items-center text-gray-500 text-sm mb-1">
                <MapPin className="size-4 mr-2" /> {job.location}
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <DollarSign className="size-4 mr-2" /> {job.salaryMin} - {job.salaryMax}
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Clock className="size-4 mr-2" />{" "}
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </div>

          {/* --- Hai nút cố định ở dưới --- */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/job-detail/${job.id}`)}
            >
              View
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Remove
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Saved Job</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove{" "}
                    <strong>{job.title}</strong> from your saved jobs?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleRemove(job.id)}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>


          </div>
        </Card>
      ))}
    </div>
  );
}
