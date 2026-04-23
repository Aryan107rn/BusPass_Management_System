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
  CREATE TABLE IF NOT EXISTS passes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    route VARCHAR(255)
  )
`).then(() => {
  console.log("Database table 'passes' ensured to exist.");
}).catch(err => {
  console.error("Failed to initialize database table:", err);
});

// test route
app.get("/", (req, res) => {
  res.send("Server working");
});

// add pass
app.post("/pass", async (req, res) => {
  const { name, age, route } = req.body;

  const result = await pool.query(
    "INSERT INTO passes (name, age, route) VALUES ($1, $2, $3) RETURNING *",
    [name, age, route]
  );

  res.json(result.rows[0]);
});

// get passes
app.get("/passes", async (req, res) => {
  const result = await pool.query("SELECT * FROM passes ORDER BY id DESC");
  res.json(result.rows);
});

// delete pass
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