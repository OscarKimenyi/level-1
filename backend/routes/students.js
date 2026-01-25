const express = require("express");
const router = express.Router();

// In-memory storage
let students = [
  { id: 1, name: "Pius Baraka", age: 21, course: "Software Engineering" },
  { id: 2, name: "Ahmed Ahmed", age: 22, course: "Computer Engineering" },
  { id: 3, name: "Issa Dedero", age: 25, course: "Cyber Security" },
];

let nextId = 4;

// Get all students
router.get("/", (req, res) => {
  res.json(students);
});

// Get a single student by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find((s) => s.id === id);
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

// POST create a new student
router.post("/", (req, res) => {
  try {
    // Debug: Log what we're receiving
    console.log("POST Request Body:", req.body);

    const { name, age, course } = req.body;

    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    // Basic validation
    if (!name || !age || !course) {
      return res.status(400).json({
        error: "Name, age, and course are required",
        received: req.body,
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({ error: "Name must be a string" });
    }
    if (typeof name !== "string") {
      return res.status(400).json({ error: "Name must be a string" });
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return res
        .status(400)
        .json({ error: "Age must be a number between 16 and 100" });
    }

    const newStudent = {
      id: nextId++,
      name: name.trim(),
      age: ageNum,
      course: course.trim(),
    };

    students.push(newStudent);
    console.log("Created student:", newStudent);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("POST Error:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// PUT update student
router.put("/:id", (req, res) => {
  try {
    console.log("PUT Request Body:", req.body);

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const { name, age, course } = req.body;

    const studentIndex = students.findIndex((s) => s.id === id);

    if (studentIndex === -1) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Validation for updates
    if (name && typeof name !== "string") {
      return res.status(400).json({ error: "Name must be a string" });
    }

    if (age) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        return res
          .status(400)
          .json({ error: "Age must be a number between 16 and 100" });
      }
    }
    const updatedStudent = {
      ...students[studentIndex],
      name: name ? name.trim() : students[studentIndex].name,
      age: age ? parseInt(age) : students[studentIndex].age,
      course: course ? course.trim() : students[studentIndex].course,
    };

    students[studentIndex] = updatedStudent;
    console.log("Updated student:", updatedStudent);
    res.json(updatedStudent);
  } catch (error) {
    console.error("PUT Error:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// DELETE a student
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = students.length;

  students = students.filter((s) => s.id !== id);

  if (students.length < initialLength) {
    res.json({ message: "Student deleted successfully" });
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

module.exports = router;
