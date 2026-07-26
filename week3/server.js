const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;
const db = new sqlite3.Database("./tasks.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER DEFAULT 0
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {

        if (row.count === 0) {

            db.run("INSERT INTO tasks (title, done) VALUES (?, ?)", ["Learn Node.js", 0]);
            db.run("INSERT INTO tasks (title, done) VALUES (?, ?)", ["Learn Express", 0]);
            db.run("INSERT INTO tasks (title, done) VALUES (?, ?)", ["Build REST API", 1]);

        }

    });

});

app.use(express.json());

// In-memory tasks


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

    db.all("SELECT * FROM tasks", [], (err, rows) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);

    });

});

// Get task by id
app.get("/tasks/:id", (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT * FROM tasks WHERE id = ?",
        [id],
        (err, row) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ message: "Task not found" });
            }

            res.json(row);

        }
    );

});

// Create task
app.post("/tasks", (req, res) => {

    const { title, done } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    db.run(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        [title, done ? 1 : 0],
        function (err) {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                id: this.lastID,
                title,
                done: done ? 1 : 0
            });

        }
    );

});

// Update task
app.put("/tasks/:id", (req, res) => {

    const id = req.params.id;
    const { title, done } = req.body;

    db.run(
        "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
        [title, done ? 1 : 0, id],
        function (err) {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Task not found" });
            }

            res.json({
                id,
                title,
                done: done ? 1 : 0
            });

        }
    );

});

// Delete task
app.delete("/tasks/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM tasks WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: "Task not found" });
            }

            res.json({
                message: "Task deleted successfully"
            });

        }
    );

});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});