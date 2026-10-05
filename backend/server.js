const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_db",
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        // Retry connection every 5 seconds
        setTimeout(() => {
            db.connect();
        }, 5000);
        return;
    }

    console.log("Connected to MySQL!");
});

// Handle connection errors
db.on('error', (err) => {
    console.error("Database error:", err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect();
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        setTimeout(() => db.connect(), 2000);
    }
    if (err.code === 'ER_AUTHENTICATION_PLUGIN_CACHING_SHA2_PASSWORD') {
        setTimeout(() => db.connect(), 2000);
    }
});

// GET all students
app.get("/api/students", (req, res) => {
    const sql = "SELECT * FROM students";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

// ADD a student
app.post("/api/students", (req, res) => {
    const { name, email, department, semester } = req.body;

    // Validate input
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    const sql = `
        INSERT INTO students 
        (name, email, department, semester)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, department, semester],
        (err, result) => {
            if (err) {
                console.error("Insert error:", err);
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Student added successfully",
                id: result.insertId
            });
        }
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
