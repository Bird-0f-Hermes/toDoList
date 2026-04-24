import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import pg from "pg";
dotenv.config();

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
  connectionString: process.env.POSTGRES_URL,
});
db.connect();
db.on("connect", () => console.log("✅ Connected to PostgreSQL"));
db.on("error", (err) => console.error("❌ PostgreSQL Error:", err));

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : "*",
    methods: "*",
    allowedHeaders: "*",
  }),
);
//////////////////////////////////////////////////////////////////////////////////////////////
let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.post("/api/list", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    res.json({
      title: "Today",        // or pull this from DB if you have a lists table
      items: result.rows,    // [{ id, title }, ...]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch list" });
  }
});

app.post("/api/add", async (req, res) => {
  const { newItem } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING *",
      [newItem]
    );
    res.json(result.rows[0]);   // returns { id, title } of the new item
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.post("/api/edit", async (req, res) => {
  const { updatedItemId, updatedItemTitle } = req.body;
  try {
    const result = await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING *",
      [updatedItemTitle, updatedItemId]
    );
    res.json(result.rows[0]);   // returns updated { id, title }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit item" });
  }
});

app.post("/api/delete", async (req, res) => {
  const { deleteItemId } = req.body;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [deleteItemId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
