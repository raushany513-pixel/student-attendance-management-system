const KEY_STUDENTS = "sam_students_v1";
const KEY_ATTENDANCE = "sam_attendance_v1";

const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);

let students = JSON.parse(localStorage.getItem(KEY_STUDENTS) || "[]");
let attendance = JSON.parse(localStorage.getItem(KEY_ATTENDANCE) || "{}");

function saveData() {
  localStorage.setItem(KEY_STUDENTS, JSON.stringify(students));
  localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(attendance));
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function seedDemoData() {
  if (students.length) return;
  students = [
    {id: crypto.randomUUID(), roll:"155", name:"Raushan Kumar Yadav", branch:"IT", year:"2ndd", section:"C"},
    {id: crypto.randomUUID(), roll:"148", name:"Rahul Maurya", branch:"IT", year:"2nd", section:"C"},
    {id: crypto.randomUUID(), roll:"103", name:"Raghav verma", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"104", name:"Ayushi mishra", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"105", name:"Rohan Yadav", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"139", name:"Pratiyush Prabhat", branch:"IT", year:"2ndd", section:"C"},
    {id: crypto.randomUUID(), roll:"113", name:"Divyanshi", branch:"IT", year:"2nd", section:"C"},
    {id: crypto.randomUUID(), roll:"106", name:"Ayush Verma", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"107", name:"Ananya Gupta", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"108", name:"Ashwani kumar", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"109", name:"Divyansh Sharma", branch:"IT", year:"2nd", section:"C"},
    {id: crypto.randomUUID(), roll:"110", name:"Shanu Kumar", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"111", name:"Mohit kumar", branch:"IT", year:"3rd", section:"C"},
    {id: crypto.randomUUID(), roll:"112", name:"Rustam kumar", branch:"IT", year:"3rd", section:"C"}

  ];
  saveData();
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"});
}

function login() {
  $("loginPage").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("todayText").textContent = new Date().toLocaleDateString("en-IN", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
  renderAll();
}

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("username").value.trim() === "JSSATE" && $("password").value === "JSSATE123") {
    login();
  } else {
    showToast("Invalid username or password");
  }
});

$("logoutBtn").addEventListener("click", () => {
  $("app").classList.add("hidden");
  $("loginPage").classList.remove("hidden");
  $("loginForm").reset();
});

function navigate(section) {
  document.querySelectorAll(".content-section").forEach(s => s.classList.remove("active-section"));
  $(section).classList.add("active-section");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === section));
  const titles = {dashboard:"Dashboard",students:"Students",attendance:"Mark Attendance",records:"Attendance Records",reports:"Reports"};
  $("pageTitle").textContent = titles[section];
  if (section === "attendance") renderAttendance();
  if (section === "records") renderRecords();
  if (section === "reports") renderReports();
}

document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.section)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.go)));

function renderDashboard() {
  const date = today();
  const day = attendance[date] || {};
  const present = students.filter(s => day[s.id] === "Present").length;
  const absent = students.filter(s => day[s.id] === "Absent").length;
  $("totalStudents").textContent = students.length;
  $("presentToday").textContent = present;
  $("absentToday").textContent = absent;
  $("todayPercent").textContent = students.length ? Math.round(present / students.length * 100) + "%" : "0%";

  const recent = students.slice(-5).reverse();
  $("recentStudents").innerHTML = recent.length ? recent.map(s =>
    `<div class="mini-row"><span><b>${escapeHtml(s.name)}</b><br><small>${escapeHtml(s.roll)} · ${escapeHtml(s.branch)}</small></span><span>${escapeHtml(s.section)}</span></div>`
  ).join("") : `<p class="muted">No students added yet.</p>`;
}

function renderStudents() {
  const q = $("studentSearch").value.toLowerCase();
  const filtered = students.filter(s => [s.name,s.roll,s.branch,s.section].some(v => v.toLowerCase().includes(q)));
  $("studentsTable").innerHTML = filtered.length ? filtered.map(s => `
    <tr>
      <td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.branch)}</td>
      <td>${escapeHtml(s.year)}</td><td>${escapeHtml(s.section)}</td>
      <td><button class="delete-btn" onclick="deleteStudent('${s.id}')">Delete</button></td>
    </tr>`).join("") : `<tr><td colspan="6" class="muted">No students found.</td></tr>`;
}

window.deleteStudent = function(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  if (!confirm(`Delete ${s.name}?`)) return;
  students = students.filter(x => x.id !== id);
  Object.keys(attendance).forEach(date => { delete attendance[date][id]; });
  saveData();
  renderAll();
  showToast("Student deleted");
};

$("studentSearch").addEventListener("input", renderStudents);

$("openStudentModal").addEventListener("click", () => $("studentModal").classList.remove("hidden"));
$("closeModal").addEventListener("click", () => $("studentModal").classList.add("hidden"));
$("studentModal").addEventListener("click", e => { if (e.target === $("studentModal")) $("studentModal").classList.add("hidden"); });

$("studentForm").addEventListener("submit", e => {
  e.preventDefault();
  const roll = $("studentRoll").value.trim();
  const name = $("studentName").value.trim();
  if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase())) {
    showToast("Roll number already exists");
    return;
  }
  students.push({
    id: crypto.randomUUID(), roll, name,
    branch:$("studentBranch").value, year:$("studentYear").value, section:$("studentSection").value
  });
  saveData();
  e.target.reset();
  $("studentModal").classList.add("hidden");
  renderAll();
  showToast("Student added successfully");
});

$("attendanceDate").value = today();
$("recordDate").value = today();

function getDayData(date) {
  if (!attendance[date]) attendance[date] = {};
  return attendance[date];
}

function renderAttendance() {
  const date = $("attendanceDate").value || today();
  $("attendanceDate").value = date;
  const day = getDayData(date);
  const q = $("attendanceSearch").value.toLowerCase();
  const filtered = students.filter(s => [s.name,s.roll,s.branch].some(v => v.toLowerCase().includes(q)));

  $("attendanceTable").innerHTML = filtered.length ? filtered.map(s => {
    const status = day[s.id] || "";
    return `<tr>
      <td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.branch)}</td>
      <td><button class="status-btn ${status==="Present"?"present":"neutral"}" onclick="setStatus('${s.id}','Present')">Present</button></td>
      <td><button class="status-btn ${status==="Absent"?"absent":"neutral"}" onclick="setStatus('${s.id}','Absent')">Absent</button></td>
      <td><b>${status || "Not Marked"}</b></td>
    </tr>`;
  }).join("") : `<tr><td colspan="6" class="muted">No students found.</td></tr>`;

  updateAttendanceStats(date);
}

window.setStatus = function(id, status) {
  const date = $("attendanceDate").value;
  const day = getDayData(date);
  day[id] = status;
  renderAttendance();
};

function updateAttendanceStats(date) {
  const day = attendance[date] || {};
  const present = students.filter(s => day[s.id] === "Present").length;
  const absent = students.filter(s => day[s.id] === "Absent").length;
  $("attTotal").textContent = students.length;
  $("attPresent").textContent = present;
  $("attAbsent").textContent = absent;
  $("attPercent").textContent = students.length ? Math.round(present / students.length * 100) + "%" : "0%";
}

$("attendanceDate").addEventListener("change", renderAttendance);
$("attendanceSearch").addEventListener("input", renderAttendance);

$("markAllPresent").addEventListener("click", () => {
  const day = getDayData($("attendanceDate").value);
  students.forEach(s => day[s.id] = "Present");
  renderAttendance();
});
$("markAllAbsent").addEventListener("click", () => {
  const day = getDayData($("attendanceDate").value);
  students.forEach(s => day[s.id] = "Absent");
  renderAttendance();
});
$("saveAttendance").addEventListener("click", () => {
  const date = $("attendanceDate").value;
  const day = attendance[date] || {};
  const marked = students.filter(s => day[s.id]).length;
  if (!students.length) return showToast("Add students first");
  if (marked !== students.length) return showToast("Please mark attendance for every student");
  saveData();
  renderAll();
  showToast(`Attendance saved for ${formatDate(date)}`);
});

function renderRecords() {
  const date = $("recordDate").value || today();
  const q = $("recordSearch").value.toLowerCase();
  const day = attendance[date] || {};
  const rows = students.filter(s => !q || [s.name,s.roll,s.branch].some(v => v.toLowerCase().includes(q)));
  $("recordsTable").innerHTML = rows.length ? rows.map(s => `
    <tr><td>${formatDate(date)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.branch)}</td>
    <td><span class="status-btn ${day[s.id]==="Present"?"present":day[s.id]==="Absent"?"absent":"neutral"}">${day[s.id] || "Not Marked"}</span></td></tr>
  `).join("") : `<tr><td colspan="5" class="muted">No records found.</td></tr>`;
}

$("recordDate").addEventListener("change", renderRecords);
$("recordSearch").addEventListener("input", renderRecords);

function renderReports() {
  $("reportsTable").innerHTML = students.length ? students.map(s => {
    let total = 0, present = 0;
    Object.values(attendance).forEach(day => {
      if (day[s.id]) { total++; if (day[s.id] === "Present") present++; }
    });
    const absent = total - present;
    const pct = total ? (present / total * 100).toFixed(1) : "0.0";
    return `<tr><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.branch)}</td><td>${total}</td><td>${present}</td><td>${absent}</td><td><b>${pct}%</b></td></tr>`;
  }).join("") : `<tr><td colspan="7" class="muted">No students found.</td></tr>`;
}

$("exportCsv").addEventListener("click", () => {
  const rows = [["Roll No","Name","Branch","Year","Section","Total Classes","Present","Absent","Attendance %"]];
  students.forEach(s => {
    let total=0,present=0;
    Object.values(attendance).forEach(day => { if(day[s.id]){total++; if(day[s.id]==="Present")present++;} });
    rows.push([s.roll,s.name,s.branch,s.year,s.section,total,present,total-present,total ? (present/total*100).toFixed(1) : "0.0"]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "attendance-report.csv"; a.click();
  URL.revokeObjectURL(url);
  showToast("CSV report exported");
});

function renderAll() {
  renderDashboard();
  renderStudents();
  renderAttendance();
  renderRecords();
  renderReports();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

seedDemoData();
