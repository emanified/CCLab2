CREATE DATABASE student_db;

USE student_db;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    semester INT
);

INSERT INTO students (name, email, department, semester)
VALUES
('Ali Khan', 'ali@example.com', 'Computer Science', 5),
('Sara Ahmed', 'sara@example.com', 'Software Engineering', 4),
('Hamza Malik', 'hamza@example.com', 'Computer Science', 6);

SELECT * FROM students;
