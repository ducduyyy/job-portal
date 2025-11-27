import React, { useState, useEffect, use } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Search, MapPin, DollarSign, Clock, Star, Filter, Grid, List, Bookmark } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuth } from '../../context/AuthProvider';

export function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState("relevant");
  const [showHiddenPopup, setShowHiddenPopup] = useState(false);
  const [hiddenJobTitle, setHiddenJobTitle] = useState("");


  const locationHook = useLocation();

  const handleResetFilters = () => {
    setSearchQuery('');
    setLocation('');
    setSalaryRange([0, 200000]);
    setSelectedIndustries([]);
    setSelectedTypes([]);
    setSelectedLevel('');
    setSortBy("relevant");
    setVisibleCount(5);
  };

  const navigate = useNavigate();

  const jobTypes = [...new Set(jobs.map(job => job.jobType))];
  const { user } = useAuth();
  const candidateId = user?.id;
  const [experienceLevels, setExperienceLevels] = useState([]);

  useEffect(() => {
    const fetchExperienceLevels = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/jobs/experience-levels');
        setExperienceLevels(res.data);
      } catch (err) {
        console.error("Error fetching experience levels:", err);
      }
    };
    fetchExperienceLevels();
  }, []);


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/industries');
        setIndustries(res.data);
      } catch (err) {
        console.error("Error fetching industries", err);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    if (!candidateId) return;

    const fetchSavedJobs = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/candidates/saved-jobs/${candidateId}`);
        // Lưu mảng ID job đã lưu vào state
        setSavedJobs(res.data.map(job => job.id));
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
      }
    };
    fetchSavedJobs();
  }, [candidateId]);

  // useEffect(() => {
  // const fetchJob = async () => {
  //   const res = await jobApi.getJobById(jobId);
  //   setJob(res);

  //   // 🔥 Nếu job bị ẩn thì hiển thị popup cảnh báo
  //   if (res && res.visible === false) {
  //     setShowUnavailablePopup(true);
  //   }
  // };
  // fetchJob();
  // }, [jobId]);


  const handleSaveJob = async (jobId) => {
    if (!candidateId) {
      alert("Please log in as a candidate to save jobs.");
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        // ❌ Nếu đã lưu → gọi API xóa
        await axios.delete(`http://localhost:8080/api/candidates/saved-jobs/${candidateId}/${jobId}`);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      } else {
        // ✅ Nếu chưa lưu → gọi API lưu
        await axios.post(`http://localhost:8080/api/candidates/saved-jobs`, null, {
          params: { candidateId, jobId },
        });
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (err) {
      console.error("Error saving/removing job:", err);
    }
  };

  const filteredJobs = jobs
    // .filter(job => job.visible === false)
    .filter(job => {
      const matchesTitleOrCompany =
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.postedByName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = job.location
        ?.toLowerCase()
        .includes(location.toLowerCase());

      const matchesIndustry =
        selectedIndustries.length === 0 ||
        selectedIndustries.some(sel =>
          String(job.industryId) === String(sel) || String(job.industryName) === String(sel)
        );

      const matchesLevel =
        !selectedLevel || job.level === selectedLevel;

      const matchesSalary =
        job.salaryMax >= salaryRange[0] &&
        job.salaryMin <= salaryRange[1];

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(job.jobType);

      return (
        matchesTitleOrCompany &&
        matchesLocation &&
        matchesIndustry &&
        matchesLevel &&
        matchesSalary &&
        matchesType
      );
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'salary') {
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      }
      return 0;
    });

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const industryFromURL = params.get('industry');
    if (industryFromURL) {
      setSelectedIndustries([industryFromURL]);
    }
  }, [locationHook.search]);

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const q = params.get("q") || "";
    const loc = params.get("location") || "";
    const sal = params.get("salary") || "";

    if (q) setSearchQuery(q);
    if (loc) setLocation(loc);
    if (sal) setSalaryRange([0, parseInt(sal) || 200000]); // nếu bạn muốn dùng range
  }, [locationHook.search]);


  const JobCard = ({ job }) => {
    // Nếu visible = 1 => job bị ẩn
    const isHidden = job.visible === true;


    const handleViewJob = () => {
      if (isHidden) {
        setHiddenJobTitle(job.title);
        setShowHiddenPopup(true);
        return;
      }
      navigate(`/job-detail/${job.id}`);
    };

    const handleApplyJob = () => {
      if (isHidden) {
        setHiddenJobTitle(job.title);
        setShowHiddenPopup(true);
        return;
      }
      // Gọi API hoặc mở modal Apply Job nếu có
    };

    return (
      <Card
        className={`relative hover:shadow-lg transition-shadow duration-200 ${isHidden ? "opacity-60 pointer-events-auto" : ""
          }`}
      >
        {isHidden && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
            Hidden (Reported)
          </div>
        )}

        {job.featured && (
          <Badge className="absolute top-2 right-4 bg-yellow-500 text-yellow-900 z-10 flex items-center">
            <Star className="size-3 mr-1" />
            Featured
          </Badge>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start space-x-3">
            <div className="size-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={job.jobIMG || "https://via.placeholder.com/100"}
                alt={`${job.company || "Company"} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{job.postedByName || "Unknown Company"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveJob(job.id)}
                  className={`${savedJobs.includes(job.id) ? "text-blue-600" : "text-gray-400"
                    } z-0`}
                >
                  <Bookmark
                    className={`size-4 ${savedJobs.includes(job.id) ? "fill-current" : ""
                      }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="size-4 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <DollarSign className="size-4 mr-2" />
              {`${job.salaryMin} - ${job.salaryMax}`}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="secondary">{job.jobType}</Badge>
                <Badge variant="secondary">{job.level}</Badge>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="size-4 mr-1" />
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" size="sm" onClick={handleApplyJob}>
                Apply Now
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewJob}>
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  placeholder="Job title, keywords, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative w-64">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button className="lg:w-auto">
              <Search className="mr-2 size-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 size-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Salary Range */}
                <div>
                  <label className="font-medium mb-3 block">Salary Range</label>
                  <div className="px-2">
                    <Slider
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      max={200000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>$0</span>
                      <span className="font-medium">${(salaryRange[0] / 10000)}k+</span>
                      <span>$200k+</span>
                    </div>
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="font-medium mb-3 block">Industry</label>
                  <div className="space-y-3">
                    {industries.map((industry) => (
                      <div key={industry.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={industry.id.toString()}
                          checked={selectedIndustries.includes(industry.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIndustries([...selectedIndustries, industry.name]);
                            } else {
                              setSelectedIndustries(selectedIndustries.filter(i => i !== industry.name));
                            }
                          }}
                        />
                        <label htmlFor={industry.id.toString()} className="text-sm cursor-pointer">
                          {industry.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="font-medium mb-3 block">Job Type</label>
                  <div className="space-y-3">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <label htmlFor={type} className="text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="font-medium mb-3 block">Experience Level</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Jobs List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  Job Results{selectedIndustries.length > 0 ? ` for ${selectedIndustries.join(', ')}` : ''}
                </h1>
                <p className="text-gray-600">{filteredJobs.length} jobs found</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary">Highest Salary</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="size-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
            {loading ? (
              <p>Loading jobs...</p>
            ) : (
              <>

                {/* Jobs Grid/List */}
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
                }>
                  {filteredJobs.slice(0, visibleCount).map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.slice(0, visibleCount).map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div> */}

                {filteredJobs.length > 0 && (
                  <div className="text-center mt-12 flex justify-center gap-4">
                    {visibleCount < filteredJobs.length && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setVisibleCount(prev => prev + 5)}
                      >
                        Load More Jobs
                      </Button>
                    )}
                    {visibleCount > 5 && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setVisibleCount(5)}
                      >
                        Show Less
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
            {showHiddenPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9999]">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-fadeIn">
                  <h2 className="text-lg font-semibold text-red-600 mb-2">
                    Công việc tạm thời bị ẩn
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Công việc <strong>{hiddenJobTitle}</strong> hiện đang bị ẩn do đang được xem xét (report).
                  </p>
                  <Button variant="outline" onClick={() => setShowHiddenPopup(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}