// API Configuration
const API_URL = "http://localhost:3000/api/students";

// DOM Elements
const studentForm = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const courseSelect = document.getElementById("course");
const addBtn = document.querySelector('button[type="submit"]');
const updateBtn = document.getElementById("updateBtn");
const cancelBtn = document.getElementById("cancelBtn");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const totalStudentsSpan = document.getElementById("totalStudents");
const deleteModal = document.getElementById("deleteModal");
const deleteStudentName = document.getElementById("deleteStudentName");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

// State variables
let students = [];
let currentStudentId = null;
let studentToDelete = null;

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
  // Form submission
  studentForm.addEventListener("submit", handleFormSubmit);

  // Update and Cancel buttons
  updateBtn.addEventListener("click", handleUpdate);
  cancelBtn.addEventListener("click", cancelEdit);

  // Search functionality
  searchInput.addEventListener("input", filterStudents);

  // Refresh button
  refreshBtn.addEventListener("click", loadStudents);

  // Delete modal buttons
  confirmDeleteBtn.addEventListener("click", confirmDelete);
  cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
}

// Load all students from API
async function loadStudents() {
  try {
    showLoading();
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    students = await response.json();
    displayStudents(students);
    updateStats();
  } catch (error) {
    console.error("Error loading students:", error);
    showError(
      "Failed to load students. Please check if the backend server is running.",
    );
  }
}

// Display students in the table
function displayStudents(studentsToDisplay) {
  if (studentsToDisplay.length === 0) {
    studentTable.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">
                    <i class="fas fa-user-slash"></i> No students found
                </td>
            </tr>
        `;
    return;
  }

  studentTable.innerHTML = studentsToDisplay
    .map(
      (student) => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.course}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="openDeleteModal(${student.id}, '${student.name}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Show loading state
function showLoading() {
  studentTable.innerHTML = `
        <tr>
            <td colspan="5" class="loading">
                <i class="fas fa-spinner fa-spin"></i> Loading students...
            </td>
        </tr>
    `;
}

// Show error message
function showError(message) {
  studentTable.innerHTML = `
        <tr>
            <td colspan="5" class="no-data" style="color: #e74c3c;">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </td>
        </tr>
    `;
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const studentData = {
    name: nameInput.value.trim(),
    age: ageInput.value,
    course: courseSelect.value,
  };

  // Validation
  if (!studentData.name || !studentData.age || !studentData.course) {
    alert("Please fill in all fields");
    return;
  }

  addStudent(studentData);
}

// Add a new student
async function addStudent(studentData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const newStudent = await response.json();

    // Add to local array
    students.push(newStudent);

    // Update display
    displayStudents(students);
    updateStats();

    // Reset form
    resetForm();

    // Show success message
    showNotification(
      `Student "${newStudent.name}" added successfully!`,
      "success",
    );
  } catch (error) {
    console.error("Error adding student:", error);
    showNotification("Failed to add student. Please try again.", "error");
  }
}

// Edit student - populate form with student data
async function editStudent(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const student = await response.json();

    // Populate form
    nameInput.value = student.name;
    ageInput.value = student.age;
    courseSelect.value = student.course;

    // Set current student ID
    currentStudentId = id;

    // Show update/cancel buttons, hide add button
    addBtn.style.display = "none";
    updateBtn.style.display = "inline-flex";
    cancelBtn.style.display = "inline-flex";

    // Scroll to form
    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error fetching student for edit:", error);
    showNotification("Failed to load student data for editing.", "error");
  }
}

// Handle update
async function handleUpdate() {
  const studentData = {
    name: nameInput.value.trim(),
    age: ageInput.value,
    course: courseSelect.value,
  };

  // Validation
  if (!studentData.name || !studentData.age || !studentData.course) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${currentStudentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const updatedStudent = await response.json();

    // Update in local array
    const index = students.findIndex((s) => s.id === currentStudentId);
    if (index !== -1) {
      students[index] = updatedStudent;
    }

    // Update display
    displayStudents(students);
    updateStats();

    // Reset form
    resetForm();

    // Show success message
    showNotification(
      `Student "${updatedStudent.name}" updated successfully!`,
      "success",
    );
  } catch (error) {
    console.error("Error updating student:", error);
    showNotification("Failed to update student. Please try again.", "error");
  }
}

// Cancel edit mode
function cancelEdit() {
  resetForm();
}

// Reset form to initial state
function resetForm() {
  studentForm.reset();
  currentStudentId = null;
  addBtn.style.display = "inline-flex";
  updateBtn.style.display = "none";
  cancelBtn.style.display = "none";
}

// Open delete confirmation modal
function openDeleteModal(id, name) {
  studentToDelete = id;
  deleteStudentName.textContent = name;
  deleteModal.style.display = "flex";
}

// Close delete modal
function closeDeleteModal() {
  deleteModal.style.display = "none";
  studentToDelete = null;
}

// Confirm and execute delete
async function confirmDelete() {
  if (!studentToDelete) return;

  try {
    const response = await fetch(`${API_URL}/${studentToDelete}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Remove from local array
    students = students.filter((s) => s.id !== studentToDelete);

    // Update display
    displayStudents(students);
    updateStats();

    // Close modal
    closeDeleteModal();

    // Show success message
    showNotification("Student deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting student:", error);
    showNotification("Failed to delete student. Please try again.", "error");
    closeDeleteModal();
  }
}

// Filter students based on search input
function filterStudents() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (!searchTerm) {
    displayStudents(students);
    return;
  }

  const filtered = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm) ||
      student.course.toLowerCase().includes(searchTerm) ||
      student.age.toString().includes(searchTerm) ||
      student.id.toString().includes(searchTerm),
  );

  displayStudents(filtered);
}

// Update statistics
function updateStats() {
  totalStudentsSpan.textContent = students.length;
}

// Show notification (simple alert for now)
function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `;

  // Add some basic styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#2ecc71" : "#e74c3c"};
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
