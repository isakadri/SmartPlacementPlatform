import { useEffect, useState } from "react";
import "./App.css";

import {
  getRecommendedJobs,
  applyForJob,
  getMyApplications,
  getRecruiterStats,
  getRecruiterJobs,
  getRecruiterApplications,
  updateApplicationStatus,
  createJob,
  updateJob,
  deleteJob,
  getMyCompany,
  updateMyCompany
} from "./api";

import Login from "./Login";


function App() {

  // ==============================
  // LOGIN
  // ==============================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );


  // ==============================
  // GET USER ROLE FROM JWT
  // ==============================

  const getUserRole = () => {

    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.role;

    } catch (error) {

      console.error(
        "Unable to read JWT role",
        error
      );

      return null;
    }
  };

  const userRole = getUserRole();


  // ==============================
  // DATA
  // ==============================

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [recruiterJobs, setRecruiterJobs] =
    useState([]);

  const [recruiterApplications, setRecruiterApplications] =
    useState([]);

  const [recruiterStats, setRecruiterStats] = useState({
    totalApplicants: 0,
    shortlisted: 0,
    selected: 0
  });


  // ==============================
  // RECRUITER COMPANY
  // ==============================

  const [recruiterCompany, setRecruiterCompany] =
    useState(null);

  const [companyLoading, setCompanyLoading] =
    useState(false);

  const [companySaving, setCompanySaving] =
    useState(false);

  const [companyError, setCompanyError] =
    useState("");

  const [editingCompany, setEditingCompany] =
    useState(false);


  // ==============================
  // GENERAL STATE
  // ==============================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingApplicationId, setUpdatingApplicationId] =
    useState(null);


  // ==============================
  // NAVIGATION
  // ==============================

  const [activeSection, setActiveSection] =
    useState("dashboard");


  // ==============================
  // SELECTED JOB
  // ==============================

  const [selectedJob, setSelectedJob] =
    useState(null);


  // ==============================
  // LOAD DATA
  // ==============================

  useEffect(() => {

    if (!isLoggedIn) {

      setLoading(false);

      return;
    }

    const token = localStorage.getItem("token");


    // ==========================================
    // RECRUITER DATA
    // ==========================================

    if (userRole === "RECRUITER") {

      setLoading(true);
      setError("");

      Promise.all([
        getRecruiterStats(token),
        getRecruiterJobs(token),
        getRecruiterApplications(token),
        getMyCompany(token)
      ])
        .then(
          ([
            statsData,
            jobsData,
            applicationsData,
            companyData
          ]) => {

            setRecruiterStats(statsData);

            setRecruiterJobs(jobsData);

            setRecruiterApplications(
              applicationsData
            );

            setRecruiterCompany(
              companyData
            );

            setLoading(false);

          }
        )
        .catch((err) => {

          console.error(err);

          setError(
            "Unable to load recruiter dashboard data."
          );

          setLoading(false);

        });

      return;
    }


    // ==========================================
    // STUDENT DATA
    // ==========================================

    Promise.all([
      getRecommendedJobs(token),
      getMyApplications(token)
    ])
      .then(([jobsData, applicationsData]) => {

        setJobs(jobsData);
        setApplications(applicationsData);

        setLoading(false);

      })
      .catch((err) => {

        console.error(err);

        setError(
          "Unable to load dashboard data."
        );

        setLoading(false);

      });

  }, [isLoggedIn, userRole]);


  // ==============================
  // APPLY FOR JOB
  // ==============================

  const handleApply = async (jobId) => {

    const token = localStorage.getItem("token");

    try {

      const message =
        await applyForJob(jobId, token);

      alert(message);

      const updatedApplications =
        await getMyApplications(token);

      setApplications(updatedApplications);

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };


  // ==============================
  // CHECK APPLICATION
  // ==============================

  const hasApplied = (jobId) => {

    return applications.some((application) => {

      if (application.job) {

        return (
          Number(application.job.id) ===
          Number(jobId)
        );

      }

      if (application.jobId) {

        return (
          Number(application.jobId) ===
          Number(jobId)
        );

      }

      return false;

    });

  };


  // ==============================
  // UPDATE APPLICATION STATUS
  // ==============================

  const handleApplicationStatus = async (
    applicationId,
    status
  ) => {

    const token =
      localStorage.getItem("token");

    setUpdatingApplicationId(
      applicationId
    );

    try {

      await updateApplicationStatus(
        applicationId,
        status,
        token
      );

      setRecruiterApplications(
        (previous) =>
          previous.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  status: status
                }
              : application
          )
      );

      const updatedStats =
        await getRecruiterStats(token);

      setRecruiterStats(updatedStats);

      alert(
        `Application ${status.toLowerCase()} successfully`
      );

    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Unable to update application status."
      );

    } finally {

      setUpdatingApplicationId(null);

    }

  };


  // ==============================
  // UPDATE COMPANY PROFILE
  // ==============================

  const handleCompanyUpdate = async (
    companyData
  ) => {

    const token =
      localStorage.getItem("token");

    setCompanySaving(true);
    setCompanyError("");

    try {

      const updatedCompany =
        await updateMyCompany(
          companyData,
          token
        );

      setRecruiterCompany(
        updatedCompany
      );

      setEditingCompany(false);

      alert(
        "Company profile updated successfully"
      );

    } catch (error) {

      console.error(error);

      setCompanyError(
        error.message ||
        "Unable to update company profile."
      );

    } finally {

      setCompanySaving(false);

    }

  };


  // ==============================
  // LOGIN
  // ==============================

  const handleLogin = () => {

    setIsLoggedIn(true);
    setActiveSection("dashboard");

  };


  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {

    localStorage.removeItem("token");

    setIsLoggedIn(false);

    setJobs([]);
    setApplications([]);
    setRecruiterJobs([]);
    setRecruiterApplications([]);

    setRecruiterCompany(null);

    setRecruiterStats({
      totalApplicants: 0,
      shortlisted: 0,
      selected: 0
    });

    setSelectedJob(null);

    setActiveSection("dashboard");

    setEditingCompany(false);

  };


  // ==============================
  // LOGIN PAGE
  // ==============================

  if (!isLoggedIn) {

    return (
      <Login onLogin={handleLogin} />
    );

  }


  // =========================================================
  // STUDENT JOB CARD
  // =========================================================

  const JobCard = ({ job }) => {
        const [resumeMatch, setResumeMatch] = useState(null);
        const [matchLoading, setMatchLoading] = useState(false);
          const checkResumeMatch = async () => {
            try {
              setMatchLoading(true);

              const token = localStorage.getItem("token");

              const response = await fetch(
                `http://localhost:8080/api/resume/match/${job.jobId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              if (!response.ok) {
                throw new Error("Failed to calculate resume match");
              }

              const data = await response.json();

              setResumeMatch(data);

            } catch (error) {
              console.error("Resume match error:", error);
              alert("Failed to calculate resume match");
            } finally {
              setMatchLoading(false);
            }
          };

    return (

      <div className="job-card">

        <div className="job-top">

          <div>

            <h3>
              {job.jobTitle}
            </h3>

            <p>
              {job.companyName}
              {" • "}
              {job.location}
            </p>

          </div>

          <span className="score">
            {job.finalScore}%
          </span>

        </div>


        <div className="job-details">

          <span>
            🎯 Skill Match: {job.skillMatch}%
          </span>

          <span>
            {job.cgpaEligible
              ? "✓ CGPA Eligible"
              : "✗ CGPA Not Eligible"
            }
          </span>

        </div>


        <p className="salary">

          ₹
          {(job.salary / 100000).toFixed(1)}
          {" "}
          LPA

        </p>


        <p className="recommendation">

          <strong>
            {job.recommendation}
          </strong>

        </p>


        <div className="job-actions">
            <button
              type="button"
              className="view-btn"
              onClick={checkResumeMatch}
              disabled={matchLoading}
            >
              {matchLoading
                ? "Checking..."
                : "🎯 Resume Match"}
            </button>

          <button
            type="button"
            className="view-btn"
            onClick={() => {
              setSelectedJob(job);
            }}
          >
            View Job
          </button>


          {hasApplied(job.jobId) ? (

            <button
              type="button"
              className="apply-btn applied-btn"
              disabled
            >
              ✓ Applied
            </button>

          ) : (

            <button
              type="button"
              className="apply-btn"
              onClick={() =>
                handleApply(job.jobId)
              }
            >
              Apply
            </button>

          )}

        </div>
        {resumeMatch && (
          <div className="resume-match-result">

            <h4>
              🎯 Resume Match: {resumeMatch.matchPercentage}%
            </h4>

            <p>
              <strong>Matched Skills:</strong>
              {" "}
              {resumeMatch.matchedSkills.join(", ")}
            </p>

            <p>
              <strong>Missing Skills:</strong>
              {" "}
              {resumeMatch.missingSkills.length > 0
                ? resumeMatch.missingSkills.join(", ")
                : "None 🎉"
              }
            </p>

          </div>
        )}

      </div>

    );

  };


  // =========================================================
  // STUDENT DASHBOARD
  // =========================================================

  const DashboardPage = () => (

    <>

      <section className="welcome">

        <h1>
          Welcome, Isa 👋
        </h1>

        <p>
          Find the right opportunities
          for your career.
        </p>

      </section>


      <section className="stats">

        <div className="stat-card">

          <h3>
            CGPA
          </h3>

          <p>
            7.2
          </p>

        </div>


        <div className="stat-card">

          <h3>
            Skills
          </h3>

          <p>
            Java • Spring Boot • MySQL
          </p>

        </div>


        <div className="stat-card">

          <h3>
            Applications
          </h3>

          <p>
            {applications.length}
          </p>

        </div>


        <div className="stat-card">

          <h3>
            Eligible Jobs
          </h3>

          <p>
            {
              jobs.filter(
                (job) => job.eligible
              ).length
            }
          </p>

        </div>

      </section>


      <section className="jobs-section">

        <div className="section-header">

          <div>

            <h2>
              Recommended Jobs
            </h2>

          </div>

          <button
            type="button"
            className="view-all"
            onClick={() =>
              setActiveSection("jobs")
            }
          >
            View All
          </button>

        </div>


        {loading && (
          <p>
            Loading recommended jobs...
          </p>
        )}


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {!loading &&
          !error && (

            <div className="job-grid">

              {jobs.map((job) => (

                <JobCard
                  key={job.jobId}
                  job={job}
                />

              ))}

            </div>

          )}

      </section>

    </>

  );


  // =========================================================
  // JOBS PAGE
  // =========================================================

  const JobsPage = () => (

    <section className="jobs-section">

      <div className="section-header">

        <div>

          <h2>
            All Jobs
          </h2>

          <p>
            Explore available placement
            opportunities.
          </p>

        </div>

      </div>


      {loading ? (

        <p>
          Loading jobs...
        </p>

      ) : (

        <div className="job-grid">

          {jobs.length === 0 ? (

            <p>
              No jobs available.
            </p>

          ) : (

            jobs.map((job) => (

              <JobCard
                key={job.jobId}
                job={job}
              />

            ))

          )}

        </div>

      )}

    </section>

  );


  // =========================================================
  // APPLICATIONS PAGE
  // =========================================================

  const ApplicationsPage = () => (

    <section className="applications-section">

      <div className="section-header">

        <div>

          <h2>
            My Applications
          </h2>

          <p>
            Track the status of your
            applications.
          </p>

        </div>

      </div>


      {applications.length === 0 ? (

        <div className="empty-state">

          <h3>
            No applications yet
          </h3>

          <p>
            Apply for a job to start
            tracking your applications.
          </p>

        </div>

      ) : (

        <div className="applications-list">

          {applications.map((application) => {

            const jobTitle =
              application.job?.title ||
              application.job?.jobTitle ||
              "Job";

            const companyName =
              application.job?.company?.name ||
              "Company";

            const location =
              application.job?.location ||
              "";

            const status =
              application.status ||
              "APPLIED";


            return (

              <div
                className="application-card"
                key={application.id}
              >

                <div className="application-info">

                  <h3>
                    {jobTitle}
                  </h3>

                  <p>
                    {companyName}

                    {location &&
                      ` • ${location}`
                    }
                  </p>

                  <p className="application-date">

                    Applied:
                    {" "}
                    {application.appliedDate ||
                      "N/A"
                    }

                  </p>

                </div>


                <span
                  className={
                    `application-status ${status.toLowerCase()}`
                  }
                >
                  {status}
                </span>

              </div>

            );

          })}

        </div>

      )}

    </section>

  );


  // =========================================================
  // STUDENT PROFILE PAGE
  // =========================================================

  // =========================================================
  // STUDENT PROFILE PAGE
  // =========================================================

  const StudentProfilePage = () => {

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
      phone: "",
      college: "",
      degree: "",
      branch: "",
      cgpa: "",
      skills: "",
      graduationYear: "",
      githubUrl: "",
      linkedinUrl: ""
    });


    // GET PROFILE
    useEffect(() => {

      const loadProfile = async () => {

        const token =
          localStorage.getItem("token");

        try {

          const response = await fetch(
            "http://localhost:8080/api/student/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );




          if (!response.ok) {
            throw new Error("Unable to load profile");
          }

          const data = await response.json();

          setProfile(data);

          setForm({
            phone: data.phone || "",
            college: data.college || "",
            degree: data.degree || "",
            branch: data.branch || "",
            cgpa: data.cgpa ?? "",
            skills: data.skills || "",
            graduationYear:
              data.graduationYear ?? "",
            githubUrl:
              data.githubUrl || "",
            linkedinUrl:
              data.linkedinUrl || ""
          });

        } catch (error) {

          console.error(error);

          setError(
            "Unable to load your profile."
          );

        } finally {

          setLoadingProfile(false);

        }
      };

      loadProfile();

    }, []);


    // HANDLE FORM CHANGE
    const handleChange = (e) => {

      const { name, value } = e.target;

      setForm((previous) => ({
        ...previous,
        [name]: value
      }));

    };


    // UPDATE PROFILE
    const handleSave = async (e) => {

      e.preventDefault();

      const token =
        localStorage.getItem("token");

      setSaving(true);
      setError("");

      try {

        const response = await fetch(
          "http://localhost:8080/api/student/profile",
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
              phone: form.phone,
              college: form.college,
              degree: form.degree,
              branch: form.branch,
              cgpa: Number(form.cgpa),
              skills: form.skills,
              graduationYear:
                Number(form.graduationYear),
              githubUrl: form.githubUrl,
              linkedinUrl:
                form.linkedinUrl
            })
          }
        );

        if (!response.ok) {

          throw new Error(
            "Unable to update profile"
          );

        }

        const updatedProfile =
          await response.json();

        setProfile(updatedProfile);

        setEditing(false);

        alert(
          "Profile updated successfully!"
        );

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Unable to update profile."
        );

      } finally {

        setSaving(false);

      }

    };


    // LOADING
    if (loadingProfile) {

      return (
        <section className="profile-section">

          <p>
            Loading your profile...
          </p>

        </section>
      );

    }


    // ERROR
    if (error && !profile) {

      return (
        <section className="profile-section">

          <p className="error-message">
            {error}
          </p>

        </section>
      );

    }


    // EDIT PROFILE
    if (editing) {

      return (
        <section className="profile-section">

          <div className="section-header">

            <div>

              <h2>
                Edit Profile
              </h2>

              <p>
                Update your placement profile.
              </p>

            </div>

          </div>


          <form
            className="profile-card"
            onSubmit={handleSave}
          >

            <div className="profile-grid">

              {/* PHONE */}

              <div>

                <span>
                  Phone
                </span>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* COLLEGE */}

              <div>

                <span>
                  College
                </span>

                <input
                  type="text"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  placeholder="Enter college"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* DEGREE */}

              <div>

                <span>
                  Degree
                </span>

                <input
                  type="text"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="Enter degree"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* BRANCH */}

              <div>

                <span>
                  Branch
                </span>

                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="Enter branch"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* CGPA */}

              <div>

                <span>
                  CGPA
                </span>

                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={form.cgpa}
                  onChange={handleChange}
                  placeholder="Enter CGPA"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* GRADUATION YEAR */}

              <div>

                <span>
                  Graduation Year
                </span>

                <input
                  type="number"
                  name="graduationYear"
                  value={form.graduationYear}
                  onChange={handleChange}
                  placeholder="2026"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* SKILLS */}

              <div
                style={{
                  gridColumn: "1 / -1"
                }}
              >

                <span>
                  Skills
                </span>

                <input
                  type="text"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="Java, Spring Boot, MySQL, React"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* GITHUB */}

              <div>

                <span>
                  GitHub URL
                </span>

                <input
                  type="url"
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>


              {/* LINKEDIN */}

              <div>

                <span>
                  LinkedIn URL
                </span>

                <input
                  type="url"
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "6px"
                  }}
                />

              </div>

            </div>


            {error && (
              <p className="error-message">
                {error}
              </p>
            )}


            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px"
              }}
            >

              <button
                type="submit"
                className="apply-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>


              <button
                type="button"
                className="view-btn"
                onClick={() =>
                  setEditing(false)
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </section>
      );

    }


    // VIEW PROFILE
    return (
      <section className="profile-section">

        <div className="section-header">

          <div>

            <h2>
              My Profile
            </h2>

            <p>
              Manage your placement profile.
            </p>

          </div>

        </div>


        <div className="profile-card">

          {/* PROFILE HEADER */}

          <div className="profile-header">

            <div className="profile-avatar">

              {
                profile?.user?.name
                  ? profile.user.name
                      .split(" ")
                      .map(
                        (word) =>
                          word[0]
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "ST"
              }

            </div>


            <div>

              <h2>
                {profile?.user?.name ||
                  "Student"}
              </h2>

              <p>
                Student
              </p>

            </div>

          </div>


          {/* PROFILE DATA */}

          <div className="profile-grid">

            <div>

              <span>
                Email
              </span>

              <strong>
                {profile?.user?.email ||
                  "Not available"}
              </strong>

            </div>


            <div>

              <span>
                Phone
              </span>

              <strong>
                {profile?.phone ||
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                College
              </span>

              <strong>
                {profile?.college ||
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                Degree
              </span>

              <strong>
                {profile?.degree ||
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                Branch
              </span>

              <strong>
                {profile?.branch ||
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                CGPA
              </span>

              <strong>
                {profile?.cgpa ??
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                Graduation Year
              </span>

              <strong>
                {profile?.graduationYear ??
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                Skills
              </span>

              <strong>
                {profile?.skills ||
                  "Not provided"}
              </strong>

            </div>


            <div>

              <span>
                GitHub
              </span>

              <strong>

                {profile?.githubUrl ? (

                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View GitHub
                  </a>

                ) : (
                  "Not provided"
                )}

              </strong>

            </div>


            <div>

              <span>
                LinkedIn
              </span>

              <strong>

                {profile?.linkedinUrl ? (

                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View LinkedIn
                  </a>

                ) : (
                  "Not provided"
                )}

              </strong>

            </div>


            <div>

              <span>
                Role
              </span>

              <strong>
                STUDENT
              </strong>

            </div>

          </div>


          {/* EDIT BUTTON */}

          <button
            type="button"
            className="view-btn"
            onClick={() =>
              setEditing(true)
            }
          >
            ✏️ Edit Profile
          </button>

        </div>

      </section>
    );

  };


  // =========================================================
  // RECRUITER DASHBOARD
  // =========================================================

  const RecruiterDashboard = () => (

    <section className="recruiter-dashboard">

      <div className="welcome">

        <h1>
          Welcome, Recruiter 👋
        </h1>

        <p>
          Manage your jobs and find the
          best candidates.
        </p>

      </div>


      <section className="stats">

        <div className="stat-card">

          <h3>
            Posted Jobs
          </h3>

          <p>
            {loading
              ? "..."
              : recruiterJobs.length
            }
          </p>

        </div>


        <div className="stat-card">

          <h3>
            Total Applicants
          </h3>

          <p>
            {loading
              ? "..."
              : recruiterStats.totalApplicants
            }
          </p>

        </div>


        <div className="stat-card">

          <h3>
            Shortlisted
          </h3>

          <p>
            {loading
              ? "..."
              : recruiterStats.shortlisted
            }
          </p>

        </div>


        <div className="stat-card">

          <h3>
            Selected
          </h3>

          <p>
            {loading
              ? "..."
              : recruiterStats.selected
            }
          </p>

        </div>

      </section>


      {error && (

        <p className="error-message">
          {error}
        </p>

      )}


      <section className="recruiter-actions-section">

        <div className="section-header">

          <div>

            <h2>
              Recruiter Tools
            </h2>

            <p>
              Manage your recruitment
              process from one place.
            </p>

          </div>

        </div>


        <div className="recruiter-tools">

          <div className="recruiter-tool-card">

            <div className="tool-icon">
              💼
            </div>

            <h3>
              Manage Jobs
            </h3>

            <p>
              Create, update and delete
              job opportunities.
            </p>

            <button
              type="button"
              className="apply-btn"
              onClick={() =>
                setActiveSection("manage-jobs")
              }
            >
              Manage Jobs
            </button>

          </div>


          <div className="recruiter-tool-card">

            <div className="tool-icon">
              👥
            </div>

            <h3>
              Applicants
            </h3>

            <p>
              View candidates who applied
              for your jobs.
            </p>

            <button
              type="button"
              className="apply-btn"
              onClick={() =>
                setActiveSection("applicants")
              }
            >
              View Applicants
            </button>

          </div>

        </div>

      </section>

    </section>

  );


  // =========================================================
  // RECRUITER MANAGE JOBS
  // =========================================================

  const ManageJobsPage = () => {

    const emptyForm = {
      title: "",
      description: "",
      location: "",
      jobType: "Full Time",
      salary: "",
      requiredSkills: "",
      minimumCgpa: "",
      experienceRequired: 0
    };

    const [jobForm, setJobForm] =
      useState(emptyForm);

    const [editingJobId, setEditingJobId] =
      useState(null);

    const [savingJob, setSavingJob] =
      useState(false);

    const [jobError, setJobError] =
      useState("");


    const handleFormChange = (e) => {

      const { name, value } = e.target;

      setJobForm((previous) => ({
        ...previous,
        [name]: value
      }));

    };


    const resetForm = () => {

      setJobForm(emptyForm);
      setEditingJobId(null);
      setJobError("");

    };


    const handleCreateOrUpdate = async (e) => {

      e.preventDefault();

      const token =
        localStorage.getItem("token");

      setSavingJob(true);
      setJobError("");

      try {

        const jobData = {
          title: jobForm.title,
          description: jobForm.description,
          location: jobForm.location,
          jobType: jobForm.jobType,
          salary: Number(jobForm.salary),
          requiredSkills: jobForm.requiredSkills,
          minimumCgpa: Number(jobForm.minimumCgpa),
          experienceRequired:
            Number(jobForm.experienceRequired)
        };


        if (editingJobId) {

          const updatedJob =
            await updateJob(
              editingJobId,
              jobData,
              token
            );

          setRecruiterJobs((previous) =>
            previous.map((job) =>
              job.id === editingJobId
                ? updatedJob
                : job
            )
          );

          alert("Job updated successfully");

        } else {

          const createdJob =
            await createJob(
              jobData,
              token
            );

          setRecruiterJobs((previous) => [
            ...previous,
            createdJob
          ]);

          alert("Job created successfully");

        }

        resetForm();

      } catch (error) {

        console.error(error);

        setJobError(
          error.message ||
          "Unable to save job."
        );

      } finally {

        setSavingJob(false);

      }

    };


    const handleEdit = (job) => {

      setEditingJobId(job.id);

      setJobForm({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        jobType: job.jobType || "Full Time",
        salary: job.salary ?? "",
        requiredSkills:
          job.requiredSkills || "",
        minimumCgpa:
          job.minimumCgpa ?? "",
        experienceRequired:
          job.experienceRequired ?? 0
      });

      setJobError("");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    };


    const handleDelete = async (jobId) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this job?"
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem("token");

      try {

        await deleteJob(
          jobId,
          token
        );

        setRecruiterJobs((previous) =>
          previous.filter(
            (job) =>
              job.id !== jobId
          )
        );

        if (editingJobId === jobId) {
          resetForm();
        }

        alert("Job deleted successfully");

      } catch (error) {

        console.error(error);

        alert(
          error.message ||
          "Unable to delete job."
        );

      }

    };


    return (

      <section className="recruiter-page">

        <div className="section-header">

          <div>

            <h2>
              Manage Jobs
            </h2>

            <p>
              Create, update and manage your
              company's job opportunities.
            </p>

          </div>

        </div>


        <div className="job-form-card">

          <div className="form-header">

            <div>

              <h3>
                {editingJobId
                  ? "Edit Job"
                  : "Create New Job"
                }
              </h3>

              <p>
                {editingJobId
                  ? "Update the job posting details."
                  : "Add a new job opportunity for students."
                }
              </p>

            </div>

          </div>


          {jobError && (

            <p className="error-message">
              {jobError}
            </p>

          )}


          <form
            className="job-form"
            onSubmit={handleCreateOrUpdate}
          >

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Job Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Java Backend Developer"
                  value={jobForm.title}
                  onChange={handleFormChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Pune"
                  value={jobForm.location}
                  onChange={handleFormChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Job Type
                </label>

                <select
                  name="jobType"
                  value={jobForm.jobType}
                  onChange={handleFormChange}
                >

                  <option value="Full Time">
                    Full Time
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                  <option value="Contract">
                    Contract
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  Salary
                </label>

                <input
                  type="number"
                  name="salary"
                  placeholder="e.g. 600000"
                  value={jobForm.salary}
                  onChange={handleFormChange}
                  min="0"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Minimum CGPA
                </label>

                <input
                  type="number"
                  name="minimumCgpa"
                  placeholder="e.g. 6.5"
                  value={jobForm.minimumCgpa}
                  onChange={handleFormChange}
                  min="0"
                  max="10"
                  step="0.01"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Experience Required
                </label>

                <input
                  type="number"
                  name="experienceRequired"
                  placeholder="e.g. 0"
                  value={jobForm.experienceRequired}
                  onChange={handleFormChange}
                  min="0"
                  required
                />

              </div>


              <div className="form-group form-full">

                <label>
                  Required Skills
                </label>

                <input
                  type="text"
                  name="requiredSkills"
                  placeholder="e.g. Java, Spring Boot, MySQL, REST API"
                  value={jobForm.requiredSkills}
                  onChange={handleFormChange}
                  required
                />

              </div>


              <div className="form-group form-full">

                <label>
                  Job Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter job responsibilities and requirements..."
                  value={jobForm.description}
                  onChange={handleFormChange}
                  rows="5"
                  required
                />

              </div>

            </div>


            <div className="form-actions">

              <button
                type="submit"
                className="apply-btn"
                disabled={savingJob}
              >
                {savingJob
                  ? "Saving..."
                  : editingJobId
                    ? "Update Job"
                    : "Create Job"
                }
              </button>


              {editingJobId && (

                <button
                  type="button"
                  className="view-btn"
                  onClick={resetForm}
                  disabled={savingJob}
                >
                  Cancel Edit
                </button>

              )}

            </div>

          </form>

        </div>


        <div className="manage-jobs-list">

          <div className="section-header">

            <div>

              <h2>
                Your Job Postings
              </h2>

              <p>
                {recruiterJobs.length} job
                {recruiterJobs.length !== 1
                  ? "s"
                  : ""
                } posted
              </p>

            </div>

          </div>


          {loading ? (

            <p>
              Loading jobs...
            </p>

          ) : recruiterJobs.length === 0 ? (

            <div className="empty-state">

              <h3>
                No jobs posted yet
              </h3>

              <p>
                Create your first job posting
                using the form above.
              </p>

            </div>

          ) : (

            <div className="recruiter-job-list">

              {recruiterJobs.map((job) => (

                <div
                  className="recruiter-job-card"
                  key={job.id}
                >

                  <div className="recruiter-job-info">

                    <div className="recruiter-job-title">

                      <h3>
                        {job.title}
                      </h3>

                      <span>
                        {job.jobType}
                      </span>

                    </div>


                    <p>
                      {job.location}
                      {" • "}
                      ₹
                      {job.salary
                        ? (job.salary / 100000)
                            .toFixed(1)
                        : "0"
                      }
                      {" LPA"}
                    </p>


                    <p>
                      Minimum CGPA:
                      {" "}
                      {job.minimumCgpa}
                      {" • "}
                      Experience:
                      {" "}
                      {job.experienceRequired}
                      {" "}
                      years
                    </p>


                    <p className="recruiter-job-skills">
                      Skills:
                      {" "}
                      {job.requiredSkills}
                    </p>

                  </div>


                  <div className="recruiter-job-actions">

                    <button
                      type="button"
                      className="view-btn"
                      onClick={() =>
                        handleEdit(job)
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(job.id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    );

  };


  // =========================================================
  // RECRUITER APPLICANTS
  // =========================================================



  // =========================================================
  // RECRUITER APPLICANTS
  // =========================================================

  const ApplicantsPage = () => {
    const [selectedApplicant, setSelectedApplicant] =
      useState(null);

    if (loading) {
      return (
        <section className="recruiter-page">
          <div className="section-header">
            <div>
              <h2>Applicants</h2>
              <p>
                Review candidates who applied to your jobs.
              </p>
            </div>
          </div>

          <p>Loading applicants...</p>
        </section>
      );
    }

    if (recruiterApplications.length === 0) {
      return (
        <section className="recruiter-page">
          <div className="section-header">
            <div>
              <h2>Applicants</h2>
              <p>
                Review candidates who applied to your jobs.
              </p>
            </div>
          </div>

          <div className="empty-state">
            <h3>No applicants yet</h3>
            <p>
              Students who apply to your jobs will appear here.
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="recruiter-page">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="section-header">
          <div>
            <h2>Applicants</h2>

            <p>
              Review and manage candidates who applied
              to your jobs.
            </p>
          </div>

          <span className="role-badge">
            {recruiterApplications.length} Applicant
            {recruiterApplications.length !== 1
              ? "s"
              : ""}
          </span>
        </div>


        {/* ==========================================
            APPLICATIONS LIST
        ========================================== */}

        <div className="applications-list">

          {recruiterApplications.map((application) => {

            const student =
              application.student;

            const user =
              student?.user;

            const job =
              application.job;

            const status =
              application.status || "APPLIED";


            return (
              <div
                className="application-card"
                key={application.id}
              >

                {/* ======================================
                    APPLICANT INFORMATION
                ====================================== */}

                <div className="application-info">

                  {/* Profile Header */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px"
                    }}
                  >

                    {/* Avatar */}

                    <div
                      className="profile-avatar"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "16px"
                      }}
                    >
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map(
                              (name) => name[0]
                            )
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "ST"}
                    </div>


                    {/* Name + Email */}

                    <div>

                      <h3>
                        {user?.name ||
                          "Unknown Student"}
                      </h3>

                      <p>
                        {user?.email ||
                          "No email available"}
                      </p>

                    </div>

                  </div>


                  {/* Applied Job */}

                  <p>
                    <strong>
                      Applied For:
                    </strong>{" "}
                    {job?.title ||
                      "Unknown Job"}
                  </p>


                  {/* Location + CGPA */}

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {job?.location || "N/A"}

                    {" • "}

                    <strong>
                      CGPA:
                    </strong>{" "}
                    {student?.cgpa ?? "N/A"}
                  </p>


                  {/* Degree + Branch */}

                  <p>
                    <strong>
                      Degree:
                    </strong>{" "}
                    {student?.degree || "N/A"}

                    {" • "}

                    <strong>
                      Branch:
                    </strong>{" "}
                    {student?.branch || "N/A"}
                  </p>


                  {/* College */}

                  <p>
                    <strong>
                      College:
                    </strong>{" "}
                    {student?.college || "N/A"}
                  </p>


                  {/* Skills */}

                  <p className="recruiter-job-skills">

                    <strong>
                      Skills:
                    </strong>{" "}

                    {student?.skills ||
                      "No skills provided"}

                  </p>


                  {/* Graduation Year */}

                  <p>
                    <strong>
                      Graduation:
                    </strong>{" "}

                    {student?.graduationYear ||
                      "N/A"}
                  </p>


                  {/* Application Date */}

                  <p className="application-date">

                    Applied:{" "}

                    {application.appliedDate ||
                      "N/A"}

                  </p>

                </div>


                {/* ======================================
                    ACTIONS
                ====================================== */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "15px"
                  }}
                >

                  {/* Current Status */}

                  <span
                    className={
                      `application-status ${status.toLowerCase()}`
                    }
                  >
                    {status}
                  </span>


                  {/* Action Buttons */}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      justifyContent: "flex-end"
                    }}
                  >

                    {/* VIEW PROFILE */}

                    <button
                      type="button"
                      className="view-btn"
                      onClick={() =>
                        setSelectedApplicant(
                          application
                        )
                      }
                    >
                      👤 View Profile
                    </button>


                    {/* SHORTLIST */}

                    <button
                      type="button"
                      className="apply-btn"
                      disabled={
                        updatingApplicationId ===
                        application.id
                      }
                      onClick={() =>
                        handleApplicationStatus(
                          application.id,
                          "SHORTLISTED"
                        )
                      }
                    >
                      {updatingApplicationId ===
                      application.id
                        ? "Updating..."
                        : "Shortlist"}
                    </button>


                    {/* REJECT */}

                    <button
                      type="button"
                      className="delete-btn"
                      disabled={
                        updatingApplicationId ===
                        application.id
                      }
                      onClick={() =>
                        handleApplicationStatus(
                          application.id,
                          "REJECTED"
                        )
                      }
                    >
                      Reject
                    </button>


                    {/* SELECT */}

                    <button
                      type="button"
                      className="view-btn"
                      disabled={
                        updatingApplicationId ===
                        application.id
                      }
                      onClick={() =>
                        handleApplicationStatus(
                          application.id,
                          "SELECTED"
                        )
                      }
                    >
                      Select
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>


        {/* ==========================================
            FULL APPLICANT PROFILE MODAL
        ========================================== */}

        {selectedApplicant && (

          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.55)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: "20px"
            }}
            onClick={() =>
              setSelectedApplicant(null)
            }
          >

            <div
              style={{
                background: "#ffffff",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY: "auto",
                borderRadius: "16px",
                padding: "30px",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,0.25)"
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {(() => {

                const student =
                  selectedApplicant.student;

                const user =
                  student?.user;

                const job =
                  selectedApplicant.job;

                const status =
                  selectedApplicant.status ||
                  "APPLIED";


                return (
                  <>

                    {/* =================================
                        PROFILE HEADER
                    ================================= */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "flex-start",
                        marginBottom: "25px"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px"
                        }}
                      >

                        <div
                          className="profile-avatar"
                          style={{
                            width: "65px",
                            height: "65px",
                            fontSize: "20px"
                          }}
                        >
                          {user?.name
                            ? user.name
                                .split(" ")
                                .map(
                                  (name) =>
                                    name[0]
                                )
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()
                            : "ST"}
                        </div>


                        <div>

                          <h2
                            style={{
                              margin:
                                "0 0 5px 0"
                            }}
                          >
                            {user?.name ||
                              "Unknown Student"}
                          </h2>

                          <p
                            style={{
                              margin: 0,
                              color:
                                "#64748b"
                            }}
                          >
                            {user?.email ||
                              "No email available"}
                          </p>

                        </div>

                      </div>


                      {/* CLOSE */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedApplicant(
                            null
                          )
                        }
                        style={{
                          border: "none",
                          background:
                            "#f1f5f9",
                          borderRadius: "50%",
                          width: "36px",
                          height: "36px",
                          cursor: "pointer",
                          fontSize: "18px"
                        }}
                      >
                        ✕
                      </button>

                    </div>


                    {/* =================================
                        APPLICATION STATUS
                    ================================= */}

                    <div
                      style={{
                        background:
                          "#f8fafc",
                        borderRadius: "10px",
                        padding: "15px",
                        marginBottom: "20px"
                      }}
                    >

                      <h3>
                        Application Details
                      </h3>

                      <p>
                        <strong>
                          Applied For:
                        </strong>{" "}
                        {job?.title ||
                          "Unknown Job"}
                      </p>

                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {job?.location ||
                          "N/A"}
                      </p>

                      <p>
                        <strong>
                          Application Status:
                        </strong>{" "}

                        <span
                          className={
                            `application-status ${status.toLowerCase()}`
                          }
                        >
                          {status}
                        </span>
                      </p>

                      <p>
                        <strong>
                          Applied Date:
                        </strong>{" "}

                        {selectedApplicant.appliedDate ||
                          "N/A"}
                      </p>

                    </div>


                    {/* =================================
                        PERSONAL INFORMATION
                    ================================= */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "12px",
                        marginBottom: "20px"
                      }}
                    >

                      <div
                        style={{
                          padding: "15px",
                          background:
                            "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        <small>
                          Phone
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px"
                          }}
                        >
                          {student?.phone ||
                            "Not provided"}
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "15px",
                          background:
                            "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        <small>
                          CGPA
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px"
                          }}
                        >
                          {student?.cgpa ??
                            "Not provided"}
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "15px",
                          background:
                            "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        <small>
                          Degree
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px"
                          }}
                        >
                          {student?.degree ||
                            "Not provided"}
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "15px",
                          background:
                            "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        <small>
                          Branch
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px"
                          }}
                        >
                          {student?.branch ||
                            "Not provided"}
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "15px",
                          background:
                            "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        <small>
                          Graduation Year
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px"
                          }}
                        >
                          {student?.graduationYear ||
                            "Not provided"}
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "15px",
                          background:
                            "#f8fafc",
                          borderRadius: "10px"
                        }}
                      >
                        <small>
                          College
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px"
                          }}
                        >
                          {student?.college ||
                            "Not provided"}
                        </strong>
                      </div>

                    </div>


                    {/* =================================
                        SKILLS
                    ================================= */}

                    <div
                      style={{
                        background:
                          "#f8fafc",
                        padding: "18px",
                        borderRadius: "10px",
                        marginBottom: "20px"
                      }}
                    >

                      <h3>
                        Skills
                      </h3>

                      <p>
                        {student?.skills ||
                          "No skills provided"}
                      </p>

                    </div>


                    {/* =================================
                        SOCIAL LINKS
                    ================================= */}

                    <div
                      style={{
                        background:
                          "#f8fafc",
                        padding: "18px",
                        borderRadius: "10px",
                        marginBottom: "20px"
                      }}
                    >

                      <h3>
                        Professional Profiles
                      </h3>


                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px"
                        }}
                      >

                        {student?.githubUrl ? (
                          <a
                            href={
                              student.githubUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-btn"
                            style={{
                              textDecoration:
                                "none"
                            }}
                          >
                            💻 GitHub
                          </a>
                        ) : (
                          <span>
                            GitHub not provided
                          </span>
                        )}


                        {student?.linkedinUrl ? (
                          <a
                            href={
                              student.linkedinUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-btn"
                            style={{
                              textDecoration:
                                "none"
                            }}
                          >
                            🔗 LinkedIn
                          </a>
                        ) : (
                          <span>
                            LinkedIn not provided
                          </span>
                        )}

                      </div>

                    </div>


                    {/* =================================
                        APPLICATION ACTIONS
                    ================================= */}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        justifyContent:
                          "flex-end",
                        borderTop:
                          "1px solid #e2e8f0",
                        paddingTop: "20px"
                      }}
                    >

                      <button
                        type="button"
                        className="apply-btn"
                        disabled={
                          updatingApplicationId ===
                          selectedApplicant.id
                        }
                        onClick={() =>
                          handleApplicationStatus(
                            selectedApplicant.id,
                            "SHORTLISTED"
                          )
                        }
                      >
                        Shortlist
                      </button>


                      <button
                        type="button"
                        className="delete-btn"
                        disabled={
                          updatingApplicationId ===
                          selectedApplicant.id
                        }
                        onClick={() =>
                          handleApplicationStatus(
                            selectedApplicant.id,
                            "REJECTED"
                          )
                        }
                      >
                        Reject
                      </button>


                      <button
                        type="button"
                        className="view-btn"
                        disabled={
                          updatingApplicationId ===
                          selectedApplicant.id
                        }
                        onClick={() =>
                          handleApplicationStatus(
                            selectedApplicant.id,
                            "SELECTED"
                          )
                        }
                      >
                        Select
                      </button>


                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() =>
                          setSelectedApplicant(
                            null
                          )
                        }
                      >
                        Close
                      </button>

                    </div>

                  </>
                );

              })()}

            </div>

          </div>

        )}

      </section>
    );
  };


  // =========================================================
  // RECRUITER COMPANY PROFILE
  // =========================================================

  const RecruiterProfilePage = () => {

    const emptyCompany = {
      name: "",
      description: "",
      industry: "",
      location: "",
      website: "",
      companySize: ""
    };


    const [companyForm, setCompanyForm] =
      useState(emptyCompany);


    useEffect(() => {

      if (recruiterCompany) {

        setCompanyForm({
          name:
            recruiterCompany.name || "",

          description:
            recruiterCompany.description || "",

          industry:
            recruiterCompany.industry || "",

          location:
            recruiterCompany.location || "",

          website:
            recruiterCompany.website || "",

          companySize:
            recruiterCompany.companySize || ""
        });

      }

    }, [recruiterCompany]);


    const handleChange = (e) => {

      const { name, value } = e.target;

      setCompanyForm((previous) => ({
        ...previous,
        [name]: value
      }));

    };


    const handleSubmit = async (e) => {

      e.preventDefault();

      await handleCompanyUpdate(
        companyForm
      );

    };


    if (companyLoading) {

      return (

        <section className="profile-section">

          <div className="section-header">

            <h2>
              Company Profile
            </h2>

          </div>

          <p>
            Loading company profile...
          </p>

        </section>

      );

    }


    if (!recruiterCompany) {

      return (

        <section className="profile-section">

          <div className="section-header">

            <div>

              <h2>
                Company Profile
              </h2>

              <p>
                Manage your company information.
              </p>

            </div>

          </div>


          <div className="empty-state">

            <h3>
              Company profile unavailable
            </h3>

            <p>
              No company is linked to this
              recruiter account.
            </p>

          </div>

        </section>

      );

    }


    return (

      <section className="profile-section">

        <div className="section-header">

          <div>

            <h2>
              Company Profile
            </h2>

            <p>
              Manage your company's information.
            </p>

          </div>

        </div>


        {companyError && (

          <p className="error-message">
            {companyError}
          </p>

        )}


        {!editingCompany ? (

          <div className="profile-card">

            <div className="profile-header">

              <div className="profile-avatar">
                {recruiterCompany.name
                  ? recruiterCompany.name
                      .split(" ")
                      .map(
                        (name) =>
                          name[0]
                      )
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "CO"
                }
              </div>


              <div>

                <h2>
                  {recruiterCompany.name}
                </h2>

                <p>
                  Recruiter
                </p>

              </div>

            </div>


            <div className="profile-grid">

              <div>

                <span>
                  Company Name
                </span>

                <strong>
                  {recruiterCompany.name ||
                    "N/A"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Industry
                </span>

                <strong>
                  {recruiterCompany.industry ||
                    "N/A"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Location
                </span>

                <strong>
                  {recruiterCompany.location ||
                    "N/A"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Company Size
                </span>

                <strong>
                  {recruiterCompany.companySize ||
                    "N/A"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Website
                </span>

                <strong>
                  {recruiterCompany.website ||
                    "N/A"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Company ID
                </span>

                <strong>
                  {recruiterCompany.id}
                </strong>

              </div>


              <div
                style={{
                  gridColumn: "1 / -1"
                }}
              >

                <span>
                  Description
                </span>

                <strong>
                  {recruiterCompany.description ||
                    "No description available."
                  }
                </strong>

              </div>

            </div>


            <button
              type="button"
              className="view-btn"
              onClick={() => {
                setCompanyError("");
                setEditingCompany(true);
              }}
            >
              ✏️ Edit Company Profile
            </button>

          </div>

        ) : (

          <div className="job-form-card">

            <div className="form-header">

              <div>

                <h3>
                  Edit Company Profile
                </h3>

                <p>
                  Update your company's
                  information.
                </p>

              </div>

            </div>


            <form
              className="job-form"
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={companyForm.name}
                    onChange={handleChange}
                    placeholder="e.g. TCS"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Industry
                  </label>

                  <input
                    type="text"
                    name="industry"
                    value={companyForm.industry}
                    onChange={handleChange}
                    placeholder="e.g. Information Technology"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={companyForm.location}
                    onChange={handleChange}
                    placeholder="e.g. Pune"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Company Size
                  </label>

                  <input
                    type="text"
                    name="companySize"
                    value={companyForm.companySize}
                    onChange={handleChange}
                    placeholder="e.g. 10000+"
                  />

                </div>


                <div className="form-group form-full">

                  <label>
                    Website
                  </label>

                  <input
                    type="url"
                    name="website"
                    value={companyForm.website}
                    onChange={handleChange}
                    placeholder="https://www.example.com"
                  />

                </div>


                <div className="form-group form-full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={companyForm.description}
                    onChange={handleChange}
                    placeholder="Describe your company..."
                    rows="6"
                  />

                </div>

              </div>


              <div className="form-actions">

                <button
                  type="submit"
                  className="apply-btn"
                  disabled={companySaving}
                >
                  {companySaving
                    ? "Saving..."
                    : "Save Changes"
                  }
                </button>


                <button
                  type="button"
                  className="view-btn"
                  onClick={() => {
                    setCompanyError("");
                    setEditingCompany(false);
                  }}
                  disabled={companySaving}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

      </section>

    );

  };
const ResumeBuilderPage = () => {
  const [resume, setResume] = useState({
    name: "",
    email: "",
    phone: "",
    location: "Maharashtra, India",
    summary:
      "Java Full Stack Developer with knowledge of Java, Spring Boot, SQL and React.",
    skills: "",
    education: "",
    projects:
      "Smart Placement Platform — Java, Spring Boot, MySQL, React",
    experience: "Fresher",
    github: "",
    linkedin: ""
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const token = localStorage.getItem("token");

        // Load student profile
        const profileResponse = await fetch(
          "http://localhost:8080/api/student/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile");
        }

        const profile = await profileResponse.json();

        // Load saved resume
        const resumeResponse = await fetch(
          "http://localhost:8080/api/resume",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!resumeResponse.ok) {
          throw new Error("Failed to load resume");
        }

        const savedResume = await resumeResponse.json();

        setResume((prev) => ({
          ...prev,

          name: profile.user?.name || "",
          email: profile.user?.email || "",

          phone: savedResume.phone || profile.phone || "",

          location:
            savedResume.location || "Maharashtra, India",

          summary:
            savedResume.summary ||
            "Java Full Stack Developer with knowledge of Java, Spring Boot, SQL and React.",

          skills:
            savedResume.skills ||
            profile.skills ||
            "",

          education:
            savedResume.education ||
            `${profile.degree || "B.Tech"} ${
              profile.branch || "Computer Science"
            } — ${profile.college || ""}, ${
              profile.graduationYear || ""
            }`,

          projects:
            savedResume.projects ||
            "Smart Placement Platform — Java, Spring Boot, MySQL, React",

          experience:
            savedResume.experience ||
            "Fresher",

          github:
            savedResume.github ||
            profile.githubUrl ||
            "",

          linkedin:
            savedResume.linkedin ||
            profile.linkedinUrl ||
            ""
        }));
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, []);

  const handleChange = (e) => {
    setResume({
      ...resume,
      [e.target.name]: e.target.value
    });
  };
const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:8080/api/resume",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(resume)
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save resume");
    }

    const savedResume = await response.json();

    setResume((prev) => ({
      ...prev,
      ...savedResume
    }));

    alert("Resume saved successfully!");
    setEditing(false);

  } catch (error) {
    console.error("Error saving resume:", error);
    alert("Failed to save resume");
  }
};

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <section className="profile-section">
        <div className="profile-card">
          <h2>Loading Resume...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-section">
      <div className="section-header">
        <div>
          <h1>📄 Resume Builder</h1>
          <p>Create and preview your professional resume</p>
        </div>

        <button
          className="view-btn"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "👀 Preview Resume" : "✏️ Edit Resume"}
        </button>
      </div>

      {editing ? (
        <div className="profile-card">
          <h2>Resume Information</h2>

          <div className="profile-grid">
            {/* Full Name */}
            <div>
              <label>Full Name</label>
              <input
                name="name"
                value={resume.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label>Email</label>
              <input
                name="email"
                value={resume.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div>
              <label>Phone</label>
              <input
                name="phone"
                value={resume.phone}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div>
              <label>Location</label>
              <input
                name="location"
                value={resume.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Professional Summary</label>
            <textarea
              name="summary"
              value={resume.summary}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Skills</label>
            <textarea
              name="skills"
              value={resume.skills}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Education</label>
            <textarea
              name="education"
              value={resume.education}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Projects</label>
            <textarea
              name="projects"
              value={resume.projects}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Experience</label>
            <textarea
              name="experience"
              value={resume.experience}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="profile-grid" style={{ marginTop: "20px" }}>
            <div>
              <label>GitHub</label>
              <input
                name="github"
                value={resume.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label>LinkedIn</label>
              <input
                name="linkedin"
                value={resume.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          {/* SAVE / CANCEL */}
          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "10px"
            }}
          >
            <button
              type="button"
              className="view-btn"
              onClick={handleSave}
            >
              💾 Save Resume
            </button>

            <button
              type="button"
              className="view-btn"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-card resume-preview">

          <div style={{ textAlign: "center" }}>
            <h1>{resume.name}</h1>

            <p>
              {resume.email}
              {resume.phone && ` | ${resume.phone}`}
              {resume.location && ` | ${resume.location}`}
            </p>

            <p>
              {resume.github && (
                <a
                  href={resume.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}

              {resume.github && resume.linkedin && " | "}

              {resume.linkedin && (
                <a
                  href={resume.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              )}
            </p>
          </div>

          <hr />

          <h2>Professional Summary</h2>
          <p>{resume.summary}</p>

          <h2>Technical Skills</h2>
          <p>{resume.skills}</p>

          <h2>Education</h2>
          <p>{resume.education}</p>

          <h2>Projects</h2>
          <p>{resume.projects}</p>

          <h2>Experience</h2>
          <p>{resume.experience}</p>

          <div
            style={{
              textAlign: "center",
              marginTop: "30px"
            }}
          >
            <button
              className="view-btn"
              onClick={handlePrint}
            >
              📄 Download / Print Resume
            </button>
          </div>

        </div>
      )}
    </section>
  );
};
  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigateTo = (section) => {

    setActiveSection(section);
    setSelectedJob(null);

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="app">


      {/* NAVBAR */}

      <nav className="navbar">

        <div
          className="logo"
          onClick={() =>
            navigateTo("dashboard")
          }
        >
          SmartPlacement
        </div>


        {/* ==========================
            STUDENT NAVIGATION
        ========================== */}

        {userRole === "STUDENT" && (

          <div className="nav-links">

            <span
              className={
                activeSection === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("dashboard")
              }
            >
              Dashboard
            </span>


            <span
              className={
                activeSection === "jobs"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("jobs")
              }
            >
              Jobs
            </span>


            <span
              className={
                activeSection === "applications"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("applications")
              }
            >
              Applications
            </span>


            <span
              className={
                activeSection === "profile"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("profile")
              }
            >
              Profile
            </span>

            <button
              className={activeSection === "resume" ? "active" : ""}
              onClick={() => navigateTo("resume")}
            >
              📄 Resume Builder
            </button>

          </div>


        )}


        {/* ==========================
            RECRUITER NAVIGATION
        ========================== */}

        {userRole === "RECRUITER" && (

          <div className="nav-links">

            <span
              className={
                activeSection === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("dashboard")
              }
            >
              Dashboard
            </span>


            <span
              className={
                activeSection === "manage-jobs"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("manage-jobs")
              }
            >
              Manage Jobs
            </span>


            <span
              className={
                activeSection === "applicants"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("applicants")
              }
            >
              Applicants
            </span>


            <span
              className={
                activeSection === "profile"
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigateTo("profile")
              }
            >
              Profile
            </span>

          </div>

        )}


        {/* ROLE */}

        <span className="role-badge">
          {userRole || "USER"}
        </span>


        {/* LOGOUT */}

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </nav>


      {/* MAIN */}

      <main className="dashboard">


        {/* ==========================
            STUDENT JOB DETAILS
        ========================== */}

        {selectedJob ? (

          <section className="job-details-panel">

            <div className="job-details-header">

              <div>

                <h2>
                  {selectedJob.jobTitle}
                </h2>

                <p>
                  {selectedJob.companyName}
                  {" • "}
                  {selectedJob.location}
                </p>

              </div>


              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="job-info-grid">

              <div className="job-info">

                <span>
                  💰 Salary
                </span>

                <strong>
                  ₹
                  {(selectedJob.salary / 100000)
                    .toFixed(1)}
                  {" "}
                  LPA
                </strong>

              </div>


              <div className="job-info">

                <span>
                  💼 Job Type
                </span>

                <strong>
                  {selectedJob.jobType ||
                    "Full Time"}
                </strong>

              </div>


              <div className="job-info">

                <span>
                  🎓 Minimum CGPA
                </span>

                <strong>
                  {selectedJob.minimumCgpa}
                </strong>

              </div>


              <div className="job-info">

                <span>
                  👨‍💻 Experience
                </span>

                <strong>
                  {selectedJob.experienceRequired}
                  {" "}
                  years
                </strong>

              </div>

            </div>


            <div className="job-description">

              <h3>
                Job Description
              </h3>

              <p>
                {selectedJob.description ||
                  "No job description available."
                }
              </p>

            </div>


            <div className="required-skills">

              <h3>
                Required Skills
              </h3>

              <p>
                {selectedJob.requiredSkills ||
                  "No skills specified."
                }
              </p>

            </div>


            <div className="match-box">

              <div>

                <span>
                  🎯 Your Skill Match
                </span>

                <strong>
                  {selectedJob.skillMatch}%
                </strong>

              </div>


              <div>

                <span>
                  🎓 CGPA
                </span>

                <strong>
                  {selectedJob.cgpaEligible
                    ? "✓ Eligible"
                    : "✗ Not Eligible"
                  }
                </strong>

              </div>


              <div>

                <span>
                  ⭐ Recommendation
                </span>

                <strong>
                  {selectedJob.recommendation}
                </strong>

              </div>

            </div>


            <div className="job-details-actions">

              {hasApplied(
                selectedJob.jobId
              ) ? (

                <button
                  type="button"
                  className="apply-btn applied-btn"
                  disabled
                >
                  ✓ Already Applied
                </button>

              ) : (

                <button
                  type="button"
                  className="apply-btn"
                  onClick={() =>
                    handleApply(
                      selectedJob.jobId
                    )
                  }
                >
                  Apply Now
                </button>

              )}

            </div>

          </section>

        ) : (

          <>

            {/* STUDENT */}

            {userRole === "STUDENT" && (

              <>
                {activeSection === "dashboard" && (
                  <DashboardPage />
                )}

                {activeSection === "jobs" && (
                  <JobsPage />
                )}

                {activeSection === "applications" && (
                  <ApplicationsPage />
                )}

                {activeSection === "profile" && (
                  <StudentProfilePage />
                )}
            {activeSection === "resume" && userRole === "STUDENT" && (
                          <ResumeBuilderPage />
                        )}
              </>

            )}


            {/* RECRUITER */}

            {userRole === "RECRUITER" && (

              <>
                {activeSection === "dashboard" && (
                  <RecruiterDashboard />
                )}

                {activeSection === "manage-jobs" && (
                  <ManageJobsPage />
                )}

                {activeSection === "applicants" && (
                  <ApplicantsPage />
                )}

                {activeSection === "profile" && (
                  <RecruiterProfilePage />
                )}

              </>

            )}

          </>

        )}

      </main>

    </div>

  );

}


export default App;

