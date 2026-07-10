// ScaleUp Chennai Admin Dashboard Module
import { 
  db, 
  collection, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  onSnapshot,
} from "./firebase.js";
import { initRouteGuard, logoutAdmin } from "./auth.js";
import { showToast, printRegistrationSlip } from "./utils.js";

// Initialize route guard for security
initRouteGuard('dashboard');

// Global registrations cache (holds real-time data)
let registrations = [];
let filteredRegistrations = [];

// Pagination Configuration
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

// Chart references (to update them dynamically)
let charts = {
  daily: null,
  monthly: null,
  language: null,
  mode: null,
  qualification: null,
  status: null
};

// DOM References
const loader = document.getElementById("dashboardLoader");
const overviewView = document.getElementById("view-overview");
const registrationsView = document.getElementById("view-registrations");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const menuOverview = document.getElementById("menu-overview");
const menuRegistrations = document.getElementById("menu-registrations");
const btnLogout = document.getElementById("btnLogout");

// Search & Filter elements
const tableSearch = document.getElementById("tableSearch");
const filterDate = document.getElementById("filterDate");
const filterMode = document.getElementById("filterMode");

// Table elements
const tableBody = document.getElementById("registrationsTableBody");
const paginationInfo = document.getElementById("paginationInfo");
const btnPrevPage = document.getElementById("btnPrevPage");
const btnNextPage = document.getElementById("btnNextPage");

// Detail Modal elements
const modalOverlay = document.getElementById("detailModalOverlay");
const btnCloseModal = document.getElementById("btnCloseDetailModal");
const detailGrid = document.getElementById("detailGrid");
const adminStatusSelect = document.getElementById("adminStatusSelect");
const adminNotes = document.getElementById("adminNotes");
const btnSaveAdmin = document.getElementById("btnSaveDetailAdmin");
const btnCancelAdmin = document.getElementById("btnCancelDetailSave");

let currentViewingId = null;

// Page initialization
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupRealtimeListener();
  setupFilterListeners();
  setupModalListeners();
  setupExportButtons();
});

// Sidebar & Mobile menu navigation
function setupNavigation() {
  menuOverview.addEventListener("click", () => {
    menuOverview.classList.add("active");
    menuRegistrations.classList.remove("active");
    overviewView.style.display = "block";
    registrationsView.style.display = "none";
    pageTitle.innerText = "Dashboard Overview";
    pageSubtitle.innerText = "Real-time candidate metrics and registration trends";
    closeMobileSidebar();
  });

  menuRegistrations.addEventListener("click", () => {
    menuOverview.classList.remove("active");
    menuRegistrations.classList.add("active");
    overviewView.style.display = "none";
    registrationsView.style.display = "block";
    pageTitle.innerText = "Candidate Registrations";
    pageSubtitle.innerText = "Manage, filter, search, and update applicants";
    closeMobileSidebar();
  });

  btnLogout.addEventListener("click", () => {
    logoutAdmin();
  });

  // Mobile menu sidebar handling
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuBtn.classList.toggle("active");
      sidebar.classList.toggle("active");
      sidebarOverlay.classList.toggle("active");
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      closeMobileSidebar();
    });
  }
}

function closeMobileSidebar() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  
  if (mobileMenuBtn) mobileMenuBtn.classList.remove("active");
  if (sidebar) sidebar.classList.remove("active");
  if (sidebarOverlay) sidebarOverlay.classList.remove("active");
}

// Real-time Firestore synchronizer
function setupRealtimeListener() {
  const regCollectionRef = collection(db, "registrations");
  const q = query(regCollectionRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    registrations = [];
    snapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Process data and update dashboard components
    updateDashboardMetrics();
    updateDashboardCharts();
    applyFilters(); // Table view update

    // Dismiss initial loader
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 1000);
    }
  }, (error) => {
    console.error("Real-time snapshot error:", error);
    showToast("Error syncing database records.", "error");
  });
}

// Update KPI Metric Cards
function updateDashboardMetrics() {
  document.getElementById("cardTotal").innerText = registrations.length;

  // Today's counter
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  const todayCount = registrations.filter(r => {
    if (!r.createdAt) return false;
    const time = r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt;
    return time >= startOfToday;
  }).length;
  document.getElementById("cardToday").innerText = todayCount;

  // Pending Follow-ups (New status)
  const pendingCount = registrations.filter(r => r.status === "New" || r.status === "pending" || r.status === "active").length;
  document.getElementById("cardPending").innerText = pendingCount;

  // Modes counter
  const onlineCount = registrations.filter(r => r.trainingMode === "Online").length;
  const offlineCount = registrations.filter(r => r.trainingMode === "Offline").length;
  document.getElementById("cardOnline").innerText = onlineCount;
  document.getElementById("cardOffline").innerText = offlineCount;

  // Requests counter
  const placementCount = registrations.filter(r => r.placement === "Yes").length;
  const internshipCount = registrations.filter(r => r.internship === "Yes").length;
  document.getElementById("cardPlacement").innerText = placementCount;
  document.getElementById("cardInternship").innerText = internshipCount;
}

// Render or Update Analytics Charts
function updateDashboardCharts() {
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  const textColor = theme === "dark" ? "#94a3b8" : "#475569";
  const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(7, 27, 53, 0.05)";

  // A. DAILY REGISTRATIONS (LINE CHART - LAST 7 DAYS)
  const dailyData = getDailyCounts();
  if (charts.daily) {
    charts.daily.data.labels = dailyData.labels;
    charts.daily.data.datasets[0].data = dailyData.values;
    charts.daily.update();
  } else {
    const ctx = document.getElementById("chartDaily").getContext("2d");
    charts.daily = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dailyData.labels,
        datasets: [{
          label: 'Registrations',
          data: dailyData.values,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
        }
      }
    });
  }

  // B. MONTHLY REGISTRATIONS (BAR CHART)
  const monthlyData = getMonthlyCounts();
  if (charts.monthly) {
    charts.monthly.data.labels = monthlyData.labels;
    charts.monthly.data.datasets[0].data = monthlyData.values;
    charts.monthly.update();
  } else {
    const ctx = document.getElementById("chartMonthly").getContext("2d");
    charts.monthly = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          data: monthlyData.values,
          backgroundColor: '#ff8a00',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
        }
      }
    });
  }

  // C. LANGUAGE PREFERENCE (DOUGHNUT)
  const langData = getPreferenceCount("language", ["English", "Tamil", "Both"]);
  if (charts.language) {
    charts.language.data.datasets[0].data = langData;
    charts.language.update();
  } else {
    const ctx = document.getElementById("chartLanguage").getContext("2d");
    charts.language = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['English', 'Tamil', 'Both'],
        datasets: [{
          data: langData,
          backgroundColor: ['#00d4ff', '#ff8a00', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor } }
        }
      }
    });
  }

  // D. TRAINING MODE PREFERENCE (PIE)
  const modeData = getPreferenceCount("trainingMode", ["Online", "Offline", "Either"]);
  if (charts.mode) {
    charts.mode.data.datasets[0].data = modeData;
    charts.mode.update();
  } else {
    const ctx = document.getElementById("chartTrainingMode").getContext("2d");
    charts.mode = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Online', 'Offline', 'Either'],
        datasets: [{
          data: modeData,
          backgroundColor: ['#8b5cf6', '#10b981', '#64748b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor } }
        }
      }
    });
  }

  // E. EDUCATION QUALIFICATION BREAKDOWN (BAR)
  const qualLabels = ["School Student", "10th Pass", "12th Pass", "Diploma", "Undergraduate", "Postgraduate", "Other"];
  const qualValues = getPreferenceCount("highestQualification", qualLabels);
  if (charts.qualification) {
    charts.qualification.data.datasets[0].data = qualValues;
    charts.qualification.update();
  } else {
    const ctx = document.getElementById("chartQualification").getContext("2d");
    charts.qualification = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: qualLabels,
        datasets: [{
          data: qualValues,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bars
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
          y: { grid: { display: false }, ticks: { color: textColor } }
        }
      }
    });
  }

  // F. CURRENT STATUS BREAKDOWN (DOUGHNUT)
  const statusLabels = ["School Student", "College Student", "Fresher", "Job Seeker", "Working Professional", "Career Restarter", "Business Owner"];
  const statusValues = getPreferenceCount("status", statusLabels);
  if (charts.status) {
    charts.status.data.datasets[0].data = statusValues;
    charts.status.update();
  } else {
    const ctx = document.getElementById("chartStatus").getContext("2d");
    charts.status = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: statusLabels,
        datasets: [{
          data: statusValues,
          backgroundColor: '#ec4899',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
        }
      }
    });
  }
}

// Helpers for data aggregations
function getDailyCounts() {
  const dates = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    dates[dateStr] = 0;
  }

  registrations.forEach(r => {
    if (!r.createdAt) return;
    const time = r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt;
    const dateStr = new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (dates[dateStr] !== undefined) {
      dates[dateStr]++;
    }
  });

  return {
    labels: Object.keys(dates),
    values: Object.values(dates)
  };
}

function getMonthlyCounts() {
  const months = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    months[label] = 0;
  }

  registrations.forEach(r => {
    if (!r.createdAt) return;
    const time = r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt;
    const date = new Date(time);
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
    if (months[label] !== undefined) {
      months[label]++;
    }
  });

  return {
    labels: Object.keys(months),
    values: Object.values(months)
  };
}

function getPreferenceCount(field, optionsList) {
  const counts = optionsList.reduce((acc, opt) => {
    acc[opt] = 0;
    return acc;
  }, {});

  registrations.forEach(r => {
    const val = r[field];
    if (counts[val] !== undefined) {
      counts[val]++;
    }
  });

  return optionsList.map(opt => counts[opt]);
}

// Searching and filtering table records
function setupFilterListeners() {
  tableSearch.addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
  });
  filterDate.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
  filterMode.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
  
  const filterStatus = document.getElementById("filterStatus");
  if (filterStatus) {
    filterStatus.addEventListener("change", () => {
      currentPage = 1;
      applyFilters();
    });
  }

  // Pagination controls
  btnPrevPage.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  btnNextPage.addEventListener("click", () => {
    const maxPage = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
    if (currentPage < maxPage) {
      currentPage++;
      renderTable();
    }
  });
}

function applyFilters() {
  const searchVal = tableSearch.value.trim().toLowerCase();
  const dateVal = filterDate.value;
  const modeVal = filterMode.value;
  const statusVal = document.getElementById("filterStatus")?.value || "all";

  filteredRegistrations = registrations.filter(r => {
    // 1. Text Search (covers Name, Mobile, Email, and Registration Number)
    const searchMatch = !searchVal || 
      (r.fullName && r.fullName.toLowerCase().includes(searchVal)) ||
      (r.registrationNumber && r.registrationNumber.toString().includes(searchVal)) ||
      (r.mobile && r.mobile.includes(searchVal)) ||
      (r.email && r.email.toLowerCase().includes(searchVal)) ||
      (r.locality && r.locality.toLowerCase().includes(searchVal));

    // 2. Training Mode
    const modeMatch = modeVal === "all" || r.trainingMode.toLowerCase() === modeVal;

    // 3. Status Filter
    const statusMatch = statusVal === "all" || r.status === statusVal;

    // 4. Date Frame
    let dateMatch = true;
    if (dateVal !== "all" && r.createdAt) {
      const time = r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt;
      const createdDate = new Date(time);
      const today = new Date();
      
      if (dateVal === "today") {
        dateMatch = createdDate.toDateString() === today.toDateString();
      } else if (dateVal === "week") {
        const diff = today.getTime() - createdDate.getTime();
        dateMatch = diff <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateVal === "month") {
        dateMatch = createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear();
      }
    }

    return searchMatch && modeMatch && statusMatch && dateMatch;
  });

  renderTable();
}

// Render dynamic registrations table rows
function renderTable() {
  tableBody.innerHTML = "";
  
  if (filteredRegistrations.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No matching registrations found.</td></tr>`;
    paginationInfo.innerText = "Showing 0-0 of 0 registrations";
    btnPrevPage.disabled = true;
    btnNextPage.disabled = true;
    return;
  }

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, filteredRegistrations.length);
  const pageItems = filteredRegistrations.slice(startIdx, endIdx);

  pageItems.forEach(item => {
    const tr = document.createElement("tr");
    
    // Status visual details
    const statusText = item.status || "New";
    let statusClass = "status-badge new";
    if (statusText === "Contacted") statusClass = "status-badge contacted";
    if (statusText === "Joined") statusClass = "status-badge joined";
    if (statusText === "Rejected") statusClass = "status-badge rejected";

    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--accent);">${item.registrationNumber}</td>
      <td>${item.fullName}</td>
      <td>${item.mobile}</td>
      <td>${item.locality}</td>
      <td>${item.trainingMode}</td>
      <td><span class="${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-btns">
          <button class="icon-btn btn-view" data-id="${item.id}" title="View Details">👁️</button>
          <button class="icon-btn btn-print-slip" data-id="${item.id}" title="Print Slip">🖨️</button>
          <button class="icon-btn delete-btn" data-id="${item.id}" title="Delete Record">🗑️</button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Update actions button binds
  document.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", (e) => {
      openDetailModal(e.target.dataset.id);
    });
  });

  document.querySelectorAll(".btn-print-slip").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const regId = e.target.dataset.id;
      const record = registrations.find(r => r.id === regId);
      if (record) printRegistrationSlip(record);
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      deleteRegistrationRecord(e.target.dataset.id);
    });
  });

  // Update Page metrics
  paginationInfo.innerText = `Showing ${startIdx + 1}-${endIdx} of ${filteredRegistrations.length} registrations`;
  btnPrevPage.disabled = currentPage === 1;
  const maxPage = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
  btnNextPage.disabled = currentPage >= maxPage;
}

// Modal View Candidate Sheet Details
function setupModalListeners() {
  btnCloseModal.addEventListener("click", () => {
    closeDetailModal();
  });
  
  btnCancelAdmin.addEventListener("click", () => {
    closeDetailModal();
  });

  btnSaveAdmin.addEventListener("click", async () => {
    if (!currentViewingId) return;

    btnSaveAdmin.disabled = true;
    btnSaveAdmin.innerHTML = "Saving...";

    const statusVal = adminStatusSelect.value;
    const notesVal = adminNotes.value.trim();



    try {
      const docRef = doc(db, "registrations", currentViewingId);
      await updateDoc(docRef, {
        status: statusVal,
        notes: notesVal
      });

      showToast("Candidate details updated successfully.", "success");
      closeDetailModal();
    } catch (error) {
      console.error("Error updating document:", error);
      showToast("Failed to save changes.", "error");
    } finally {
      btnSaveAdmin.disabled = false;
      btnSaveAdmin.innerHTML = "Save Changes";
    }
  });

  // Close modal when clicking outside
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeDetailModal();
    }
  });
}

function openDetailModal(id) {
  const item = registrations.find(r => r.id === id);
  if (!item) return;

  currentViewingId = id;
  
  // Populate candidate data grid sheet
  detailGrid.innerHTML = `
    <div class="detail-item">
      <h4>Registration ID</h4>
      <p style="color: var(--accent); font-weight: bold; font-size: 1.15rem;">${item.registrationNumber}</p>
    </div>
    <div class="detail-item">
      <h4>Date Submitted</h4>
      <p>${new Date(item.createdAt?.seconds ? item.createdAt.seconds * 1000 : Date.now()).toLocaleString('en-IN')}</p>
    </div>
    <div class="detail-item">
      <h4>Full Name</h4>
      <p>${item.fullName}</p>
    </div>
    <div class="detail-item">
      <h4>Gender & Age</h4>
      <p>${item.gender} (${item.age})</p>
    </div>
    <div class="detail-item">
      <h4>Mobile Number</h4>
      <p>${item.mobile}</p>
    </div>
    <div class="detail-item">
      <h4>WhatsApp Number</h4>
      <p>${item.whatsapp}</p>
    </div>
    <div class="detail-item">
      <h4>Email Address</h4>
      <p>${item.email}</p>
    </div>
    <div class="detail-item">
      <h4>Locality & Pin</h4>
      <p>${item.locality} - ${item.pinCode}</p>
    </div>
    <div class="detail-item">
      <h4>Highest Qualification</h4>
      <p>${item.highestQualification}</p>
    </div>
    <div class="detail-item">
      <h4>Course / stream</h4>
      <p>${item.courseStudying} (${item.major || 'N/A'})</p>
    </div>
    <div class="detail-item full-width">
      <h4>School / College</h4>
      <p>${item.college || 'N/A'}</p>
    </div>
    <div class="detail-item">
      <h4>Professional Status</h4>
      <p>${item.status}</p>
    </div>
    <div class="detail-item">
      <h4>Assets (Laptop / Phone)</h4>
      <p>Laptop: ${item.laptop} | Phone: ${item.smartphone}</p>
    </div>
    <div class="detail-item">
      <h4>Training Mode (Lang)</h4>
      <p>${item.trainingMode} (${item.language})</p>
    </div>
    <div class="detail-item">
      <h4>Internship & Placement</h4>
      <p>Internship Interest: ${item.internship} | Placement Req: ${item.placement}</p>
    </div>
    <div class="detail-item full-width">
      <h4>Reason for Joining</h4>
      <p style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--border-glass); line-height: 1.5; font-size: 0.9rem;">
        ${item.reason}
      </p>
    </div>
  `;

  // Set admin states
  adminStatusSelect.value = item.status || "New";
  adminNotes.value = item.notes || "";

  modalOverlay.classList.add("active");
}

function closeDetailModal() {
  modalOverlay.classList.remove("active");
  currentViewingId = null;
}

// Delete registration record safely
async function deleteRegistrationRecord(id) {
  const item = registrations.find(r => r.id === id);
  if (!item) return;

  if (!confirm(`Are you sure you want to delete registration ${item.registrationNumber} (${item.fullName})?`)) {
    return;
  }



  try {
    // 1. Delete main registration document
    await deleteDoc(doc(db, "registrations", id));

    // 2. Clear uniqueness tokens in background so they can register again
    if (item.email) {
      await deleteDoc(doc(db, "uniqueEmails", item.email.toLowerCase()));
    }
    if (item.mobile) {
      await deleteDoc(doc(db, "uniqueMobiles", item.mobile));
    }

    showToast("Registration deleted successfully.", "success");
  } catch (error) {
    console.error("Error deleting registration:", error);
    showToast("Failed to delete record.", "error");
  }
}

// Exports Handler: CSV and Print Page
function setupExportButtons() {
  document.getElementById("btnExportCSV").addEventListener("click", () => {
    exportToCSV();
  });

  document.getElementById("btnPrintTable").addEventListener("click", () => {
    printTableList();
  });
}

function exportToCSV() {
  if (filteredRegistrations.length === 0) {
    showToast("No records available to export.", "warning");
    return;
  }

  // Define headers matching requested schema
  const headers = [
    "Registration Number",
    "Full Name",
    "Mobile",
    "WhatsApp",
    "Email",
    "Gender",
    "Age",
    "Locality",
    "PIN Code",
    "Highest Qualification",
    "Course Studying",
    "Major/Specialization",
    "School/College",
    "Current Status",
    "Laptop/Desktop",
    "Smartphone",
    "Training Mode",
    "Language",
    "Internship Interest",
    "Placement Support",
    "Reason for Joining",
    "Verification Status",
    "Notes"
  ];

  // Map rows
  const csvRows = [headers.join(",")];
  
  filteredRegistrations.forEach(r => {
    const values = [
      r.registrationNumber,
      `"${(r.fullName || '').replace(/"/g, '""')}"`,
      `"${r.mobile || ''}"`,
      `"${r.whatsapp || ''}"`,
      `"${r.email || ''}"`,
      r.gender,
      r.age,
      `"${(r.locality || '').replace(/"/g, '""')}"`,
      r.pinCode,
      `"${r.highestQualification || ''}"`,
      `"${r.courseStudying || ''}"`,
      `"${(r.major || '').replace(/"/g, '""')}"`,
      `"${(r.college || '').replace(/"/g, '""')}"`,
      `"${r.status || ''}"`,
      r.laptop,
      r.smartphone,
      r.trainingMode,
      r.language,
      r.internship,
      r.placement,
      `"${(r.reason || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      r.status,
      `"${(r.notes || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`
    ];
    csvRows.push(values.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `scaleup_registrations_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("CSV Exported successfully.", "success");
}

function printTableList() {
  if (filteredRegistrations.length === 0) {
    showToast("No records available to print.", "warning");
    return;
  }

  const printWindow = window.open('', '_blank');
  
  let rowsHtml = "";
  filteredRegistrations.forEach(r => {
    rowsHtml += `
      <tr>
        <td>${r.registrationNumber}</td>
        <td>${r.fullName}</td>
        <td>${r.mobile}</td>
        <td>${r.locality}</td>
        <td>${r.trainingMode} (${r.language})</td>
        <td>${r.status === 'contacted' ? 'Contacted' : 'Pending'}</td>
      </tr>
    `;
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Registrations Printout</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #071b35; }
        h2 { border-bottom: 2px solid #00d4ff; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
        th, td { padding: 10px; border-bottom: 1px solid #ddd; }
        th { background: #f0f4f9; font-weight: bold; }
        @media print {
          th { background: #f0f4f9 !important; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body onload="window.print()">
      <h2>ScaleUp Chennai Registrations List (${filteredRegistrations.length} candidates)</h2>
      <table>
        <thead>
          <tr>
            <th>Reg ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Locality</th>
            <th>Mode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
