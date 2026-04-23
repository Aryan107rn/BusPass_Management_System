import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INT
  );
  CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    route_name VARCHAR(255)
  );
  CREATE TABLE IF NOT EXISTS passes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    route_id INT REFERENCES routes(id) ON DELETE CASCADE,
    start_date DATE,
    expiry_date DATE
  );
`).then(() => {
  console.log("Database tables 'users', 'routes', 'passes' ensured to exist.");
}).catch(err => {
  console.error("Failed to initialize database tables:", err);
});

// test route
app.get("/", (req, res) => {
  res.send("Server working");
});

// --- Users Endpoints ---
app.post("/users", async (req, res) => {
  try {
    const { name, age } = req.body;
    const result = await pool.query("INSERT INTO users (name, age) VALUES ($1, $2) RETURNING *", [name, age]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes Endpoints ---
app.post("/routes", async (req, res) => {
  try {
    const { route_name } = req.body;
    const result = await pool.query("INSERT INTO routes (route_name) VALUES ($1) RETURNING *", [route_name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/routes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM routes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/routes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM routes WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Passes Endpoints ---
app.post("/pass", async (req, res) => {
  try {
    const { user_id, route_id, start_date, expiry_date } = req.body;
    const result = await pool.query(
      "INSERT INTO passes (user_id, route_id, start_date, expiry_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, route_id, start_date, expiry_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/passes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, u.name, u.age, r.route_name as route, p.start_date, p.expiry_date 
      FROM passes p 
      JOIN users u ON p.user_id = u.id 
      JOIN routes r ON p.route_id = r.id 
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/passes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM passes WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server started"));