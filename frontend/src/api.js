const API_BASE_URL = "http://localhost:8080/api";

// ==========================================
// STUDENT APIs
// ==========================================

export async function getRecommendedJobs(token) {
  const response = await fetch(
    `${API_BASE_URL}/jobs/recommended`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommended jobs");
  }

  return response.json();
}


export async function applyForJob(jobId, token) {
  const response = await fetch(
    `${API_BASE_URL}/applications/apply/${jobId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const message = await response.text();

  if (!response.ok) {
    console.log("Apply API Status:", response.status);
    console.log("Apply API Response:", message);

    throw new Error(
      message || "Failed to apply for job"
    );
  }

  return message;
}


export async function getMyApplications(token) {
  const response = await fetch(
    `${API_BASE_URL}/applications/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}


// ==========================================
// RECRUITER APIs
// ==========================================

// Get recruiter dashboard statistics
export async function getRecruiterStats(token) {
  const response = await fetch(
    `${API_BASE_URL}/applications/recruiter/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recruiter statistics");
  }

  return response.json();
}


// Get all jobs belonging to recruiter's company
export async function getRecruiterJobs(token) {
  const response = await fetch(
    `${API_BASE_URL}/jobs/recruiter`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recruiter jobs");
  }

  return response.json();
}


// Get all applicants for recruiter's company
export async function getRecruiterApplications(token) {
  const response = await fetch(
    `${API_BASE_URL}/applications/recruiter`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recruiter applications");
  }

  return response.json();
}


// ==========================================
// RECRUITER JOB MANAGEMENT APIs
// ==========================================

// Create a new job
export async function createJob(jobData, token) {
  const response = await fetch(
    `${API_BASE_URL}/jobs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create job");
  }

  return response.json();
}


// Update an existing job
export async function updateJob(jobId, jobData, token) {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update job");
  }

  return response.json();
}


// Delete an existing job
export async function deleteJob(jobId, token) {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const message = await response.text();

  if (!response.ok) {
    throw new Error(
      message || "Failed to delete job"
    );
  }

  return message;
}


// ==========================================
// APPLICATION STATUS
// ==========================================

// Update application status
export async function updateApplicationStatus(
  applicationId,
  status,
  token
) {
  const response = await fetch(
    `${API_BASE_URL}/applications/${applicationId}/status?status=${status}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const message = await response.text();

  if (!response.ok) {
    throw new Error(
      message || "Failed to update application status"
    );
  }

  return message;
}


// ==========================================
// RECRUITER COMPANY PROFILE APIs
// ==========================================

// Get logged-in recruiter's company
export async function getMyCompany(token) {
  const response = await fetch(
    `${API_BASE_URL}/companies/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch company profile");
  }

  return response.json();
}


// Update logged-in recruiter's company
export async function updateMyCompany(companyData, token) {
  const response = await fetch(
    `${API_BASE_URL}/companies/my`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(companyData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update company profile");
  }

  return response.json();
}

