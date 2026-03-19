CREATE DATABASE IF NOT EXISTS profile_db;
USE profile_db;

CREATE TABLE IF NOT EXISTS user_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    college VARCHAR(255),
    email VARCHAR(100),
    github VARCHAR(255),
    linkedin VARCHAR(255),
    hobbies TEXT,
    bio TEXT,
    profile_image VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    degree VARCHAR(100),
    institution VARCHAR(255),
    start_year INT,
    end_year INT,
    grade VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES user_profile(id)
);

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    skill_name VARCHAR(100),
    category VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES user_profile(id)
);

CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    description TEXT,
    year INT,
    FOREIGN KEY (user_id) REFERENCES user_profile(id)
);

-- Insert Mock Data
INSERT INTO user_profile (name, college, email, github, linkedin, hobbies, bio, profile_image) VALUES
('Sanjay', 'Engineering College', 'sanjay@example.com', 'https://github.com/sanjay', 'https://linkedin.com/in/sanjay', 'Coding, Reading, Gaming', 'I am a 2nd year student from a rural background. I love problem solving and eager to learn.', '/images/profile.jpg');

INSERT INTO education (user_id, degree, institution, start_year, end_year, grade) VALUES
(1, 'B.Tech Computer Science', 'Engineering College', 2024, 2028, '8.5 CGPA (Current)'),
(1, '12th Grade', 'Rural High School', 2022, 2024, '60%'),
(1, '10th Grade', 'Local School', 2020, 2022, '55%');

INSERT INTO skills (user_id, skill_name, category) VALUES
(1, 'C++', 'Language'),
(1, 'Java', 'Language'),
(1, 'MySQL', 'Database'),
(1, 'Problem Solving', 'Soft Skill'),
(1, 'Node.js', 'Backend');

INSERT INTO achievements (user_id, title, description, year) VALUES
(1, 'Hackathon Winner', 'Won 1st prize at college level coding hackathon.', 2025),
(1, 'Open Source Contributor', 'Contributed to various student-led open source projects.', 2025);
