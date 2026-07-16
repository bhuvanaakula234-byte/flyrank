const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory tasks
let tasks = [
  { id: 1, title: "Learn Node.js", done: false },
  { id: 2, title: "Learn Express", done: false },
  { id: 3, title: "Build REST API", done: true }
];

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to FlyRank Week 1 REST API");
});

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Get task by id
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(task);
});

// Create task
app.post("/tasks", (req, res) => {

  const { title, done } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    done: done || false
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// Update task
app.put("/tasks/:id", (req, res) => {

  const id = parseInt(req.params.id);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.title = req.body.title;
  task.done = req.body.done;

  res.json(task);
});

// Delete task
app.delete("/tasks/:id", (req, res) => {

  const id = parseInt(req.params.id);

  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks.splice(index, 1);

  res.json({ message: "Task deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});