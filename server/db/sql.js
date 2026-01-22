// db/sql.js
require("dotenv").config();
const mysql = require("mysql2/promise");

// Create a connection pool with optimized settings for serverless
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // update db_user
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simplified initialization function with connection management
const initializeDatabase = async () => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    const database = process.env.DB_DATABASE;

    // Use Promise.all to run table creations concurrently and reduce timeout risk
    await Promise.all([
      connection.query(`
        CREATE TABLE IF NOT EXISTS ${database}.users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          full_name VARCHAR(255)
        )
      `),
      connection.query(`
        CREATE TABLE IF NOT EXISTS ${database}.posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          details TEXT NOT NULL,
          image_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author) REFERENCES ${database}.users(email)
        )
      `),
      connection.query(`
        CREATE TABLE IF NOT EXISTS ${database}.tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
        )
      `),
      connection.query(`
        CREATE TABLE IF NOT EXISTS ${database}.post_tags (
          post_id INT NOT NULL,
          tag_id INT NOT NULL,
          PRIMARY KEY (post_id, tag_id),
          FOREIGN KEY (post_id) REFERENCES ${database}.posts(id),
          FOREIGN KEY (tag_id) REFERENCES ${database}.tags(id)
        )
      `),
      connection.query(`
        CREATE TABLE IF NOT EXISTS ${database}.likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          post_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_email) REFERENCES ${database}.users(email),
          FOREIGN KEY (post_id) REFERENCES ${database}.posts(id)
        )
      `),
      connection.query(`
        CREATE TABLE IF NOT EXISTS ${database}.comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          author VARCHAR(255) NOT NULL,
          text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES ${database}.posts(id),
          FOREIGN KEY (author) REFERENCES ${database}.users(email)
        )
      `),
    ]);

    // Insert predefined tags
    const predefinedTags = [
      "JavaScript",
      "React",
      "Node.js",
      "Database",
      "Web Development",
      "Java",
      "PHP",
      "C++",
      "C",
      "Next.js",
      "Go",
      "HTML",
      "CSS",
      "Tailwind.css",
      "Express.js",
      "Laravel",
      "Bootstrap",
      "Dart",
      "Swift",
      "SASS",
      "SCSS",
      "OOP",
      "Data Structures",
      "Angular",
      "Vue",
      "Mongo DB",
      "SQL",
      "Bash",
      "Spring",
      "Redis",
      "AWS",
      "Django",
      "Python",
      "Machine Learning",
      "AI",
      "Docker",
      "React Native",
      "C#",
    ];

    // Insert tags with error handling
    for (const tag of predefinedTags) {
      try {
        await connection.query(
          `INSERT IGNORE INTO ${database}.tags (name) VALUES (?)`,
          [tag],
        );
      } catch (tagError) {
        console.warn(`Error inserting tag ${tag}:`, tagError);
      }
    }

    console.log("Database tables initialized and predefined tags inserted");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  } finally {
    // Always release the connection back to the pool
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  initializeDatabase,
};
