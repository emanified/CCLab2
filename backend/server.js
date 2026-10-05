const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "supabase" });
});

// GET all students
app.get("/api/students", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("students")
            .select("*");

        if (error) {
            console.error("SELECT error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ADD a student
app.post("/api/students", async (req, res) => {
    const { name, email, department, semester } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
    }

    try {
        const { data, error } = await supabase
            .from("students")
            .insert([{ name, email, department, semester }])
            .select();

        if (error) {
            console.error("INSERT error:", error);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({
            message: "Student added successfully",
            id: data[0].id
        });
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
