import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, MapPin, DollarSign, Clock, Star, TrendingUp, Locate } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

export function CandidateHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');

  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const navigate = useNavigate();

  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessDialog, setUploadSuccessDialog] = useState(false);


  const { user, token } = useAuth();


  const API_BASE = "http://localhost:8080/api";


  useEffect(() => {
    axios.get(`${API_BASE}/jobs`)
      .then(res => setJobs(res.data))
      .catch(err => console.error("Error fetching jobs:", err));

    axios.get(`${API_BASE}/industries`)
      .then(res => setIndustries(res.data))
      .catch(err => console.error("Error fetching industries:", err));
  }, []);


const handleUpload = async () => {
  if (!file) return alert("Please select a CV file first!");
  if (!user?.id) return alert("You must be logged in to upload a CV!");

  try {
    setUploading(true);
    const formData = new FormData();
    formData.append("cvFile", file);

    await axios.post(
      `http://localhost:8080/api/candidates/${user.id}/upload-cv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ Hiển thị dialog success thay vì alert
    setUploadSuccessDialog(true);
    setOpenUpload(false);
  } catch (err) {
    console.error("Error uploading CV:", err);
    alert("Failed to upload CV.");
  } finally {
    setUploading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Find Your <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Dream Job</span> Today
            </h1>
            <p className="text-xl sm:text-2xl mb-12 text-blue-100/90 leading-relaxed">
              Connect with top employers and discover opportunities that match your skills and ambitions
            </p>

            {/* Enhanced Search Bar */}
            <Card className="p-8 bg-white/95 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl rounded-3xl border-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    placeholder="Job title or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base rounded-2xl border-2 border-transparent focus:border-primary/50 bg-gray-50 focus:bg-white transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 h-14 text-base rounded-2xl border-2 border-transparent focus:border-primary/50 bg-gray-50 focus:bg-white transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                  <Input
                    placeholder="Salary range..."
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="pl-12 h-14 text-base rounded-2xl border-2 border-transparent focus:border-primary/50 bg-gray-50 focus:bg-white transition-all duration-200"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchQuery) params.append("q", searchQuery);
                    if (location) params.append("location", location);
                    if (salary) params.append("salary", salary);
                    navigate(`/search?${params.toString()}`);
                  }}
                >
                  <Search className="mr-2 size-5" />
                  Search Jobs
                </Button>

              </div>
            </Card>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 text-center">
              <div className="group cursor-pointer">
                <div className="text-4xl sm:text-5xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-200">50,000+</div>
                <div className="text-blue-100/80 font-medium">Active Jobs</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl sm:text-5xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-200">15,000+</div>
                <div className="text-blue-100/80 font-medium">Companies</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-4xl sm:text-5xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-200">2M+</div>
                <div className="text-blue-100/80 font-medium">Job Seekers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Enhanced Featured Jobs */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Featured Jobs</h2>
              <p className="text-lg text-gray-600">Hand-picked opportunities from top companies</p>
            </div>
            <Button variant="outline" className="hidden sm:flex rounded-2xl border-2 hover:border-primary/50 transition-colors duration-200"
              onClick={() => navigate('/search')}
            >
              View All Jobs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.filter((job) => job.featured)
              .map((job) => (
                <Card key={job.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg"
                  onClick={() => navigate(`/job-detail/${job.id}`)}
                >
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className="size-14 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                        <ImageWithFallback
                          src={job.logoUrl || "https://via.placeholder.com/150"}
                          alt={`${job.companyName} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors duration-200">{job.title}</CardTitle>
                        <p className="text-gray-600 font-medium">{job.companyName}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4 relative z-10">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="size-4 mr-2" />
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <DollarSign className="size-4 mr-2" />
                      {`${job.salaryMin} - ${job.salaryMax}`}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="px-3 py-1.5 rounded-xl font-medium">{job.jobType}</Badge>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="size-4 mr-1" />
                        {new Date(job.createdAt).toLocaleDateString() || "N/A"}
                      </div>
                    </div>
                    <Badge className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-semibold px-3 py-1.5 rounded-xl shadow-lg z-10">
                      <Star className="size-3 mr-1" />
                      Featured
                    </Badge>
                    <Button className="w-full rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Enhanced Job Categories */}
        {/* ✅ Industries từ API */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Browse by Industry</h2>
            <p className="text-lg text-gray-600">Explore opportunities in your field</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <Card
                key={industry.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer rounded-3xl border-0 shadow-md bg-white overflow-hidden"
                onClick={() => navigate(`/search?industry=${encodeURIComponent(industry.name)}`)}
              >
                <CardContent className="p-8 text-center relative">
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">🏢</div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-200">
                    {industry.name}
                  </h3>
                  <p className="text-gray-600 font-medium">{industry.jobCount || 0} jobs</p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <TrendingUp className="size-5 text-primary mx-auto" />
                  </div>
                </CardContent>
              </Card>

            ))}
          </div>
        </section>

        {/* Enhanced How it Works */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">How It Works</h2>
            <p className="text-lg text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="size-20 bg-gradient-to-br from-blue-100 to-blue-50 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Search className="size-10" />
              </div>
              <h3 className="font-bold text-xl mb-4">Search Jobs</h3>
              <p className="text-gray-600 leading-relaxed">Use our advanced filters to find jobs that match your skills and preferences</p>
            </div>
            <div className="text-center group">
              <div className="size-20 bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Star className="size-10" />
              </div>
              <h3 className="font-bold text-xl mb-4">Apply with Ease</h3>
              <p className="text-gray-600 leading-relaxed">Submit your application with just one click using your saved profile and CV</p>
            </div>
            <div className="text-center group">
              <div className="size-20 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="size-10" />
              </div>
              <h3 className="font-bold text-xl mb-4">Get Hired</h3>
              <p className="text-gray-600 leading-relaxed">Connect directly with employers and land your dream job</p>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>
          <div className="relative text-center p-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-10 text-blue-100/90 max-w-2xl mx-auto leading-relaxed">Join thousands of professionals who found their dream job through our platform</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary font-semibold rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 border-0" onClick={() => navigate('/profile')}>
                Create Your Profile
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border-2 text-primary font-semibold rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                onClick={() => setOpenUpload(true)}
              >
                Upload Your CV
              </Button>
            </div>
          </div>
        </section>
      </div>
      {/* Upload CV Dialog */}
      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="sm:max-w-sm rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Upload Your CV
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Select a PDF or DOC file to upload to your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm"
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Dialog nhỏ hiển thị thông báo sau khi upload */}
      <Dialog open={uploadSuccessDialog} onOpenChange={setUploadSuccessDialog}>
        <DialogContent className="sm:max-w-sm rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-green-600 text-lg font-semibold">
              ✅ Upload Successful!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Your CV has been uploaded successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setUploadSuccessDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>

  );
}