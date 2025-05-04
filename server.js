const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });
const { initSupaBaseClient } = require("./services/supaBaseClient");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
initSupaBaseClient();

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key. Check your .env file.");
  process.exit(1); // Stop the server if credentials are missing
}

try {
  initSupaBaseClient(); // Initialize Supabase client
} catch (error) {
  console.error("Error initializing Supabase:", error);
  process.exit(1); // Stop the server if Supabase fails to initialize
}

// Import routes
const router = require("./routes/routes");
app.use("/api", router); // Prefix all routes with '/api'

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
