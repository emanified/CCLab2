const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_db",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "mysql" });
});

app.get("/api/students", async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM students");
        connection.release();
        res.json(rows);
    } catch (err) {
        console.error("SELECT error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/students", async (req, res) => {
    const { name, email, department, semester } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            "INSERT INTO students (name, email, department, semester) VALUES (?, ?, ?, ?)",
            [name, email, department, semester]
        );
        connection.release();

        res.status(201).json({
            message: "Student added successfully",
            id: result.insertId
        });
    } catch (err) {
        console.error("INSERT error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
