const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_MYSQL_PASSWORD",
    database: "student_db"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    console.log("Connected to MySQL!");
});

// GET all students
app.get("/api/students", (req, res) => {
    const sql = "SELECT * FROM students";

    db.query(sql, (err, results) => {
        if (err) {
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

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
