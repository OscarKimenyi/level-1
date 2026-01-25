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
  const { name, age, course } = req.body;

  // Basic validation
  if (!name || !age || !course) {
    return res
      .status(400)
      .json({ error: "Name, age, and course are required" });
  }

  const newStudent = {
    id: nextId++,
    name,
    age: parseInt(age),
    course,
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT update student
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age, course } = req.body;

  const studentIndex = students.findIndex((s) => s.id === id);
  if (studentIndex !== -1) {
    return res.status(400).json({ error: "Student not found" });
  }

  // Update student details
  students[studentIndex] = {
    ...students[studentIndex],
    name: name || students[studentIndex].name,
    age: age ? parseInt(age) : students[studentIndex].age,
    course: course || students[studentIndex].course,
  };
  res.json(students[studentIndex]);
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
