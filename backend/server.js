const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/students");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/students", studentRoutes);

// Routes for testing
app.get("/", (req, res) => {
  res.json({
    message: "Student Management API",
    endpoints: {
      getAll: "GET /api/students",
      getOne: "GET /api/students/:id",
      create: "POST /api/students",
      update: "PUT /api/students/:id",
      delete: "DELETE /api/students/:id",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/students`);
});
