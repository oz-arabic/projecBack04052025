/**
 * API Routes
 *
 * All routes in this file are prefixed with /api (configured in server.js)
 * Example: router.get('/article/:id') becomes accessible at /api/article/:id
 *
 * Authentication:
 * - Protected routes require a valid JWT token in the Authorization header
 * - Use requireAuth middleware for endpoints that need authentication
 * - Use optionalAuth for endpoints that work for both authenticated and anonymous users
 */

const express = require("express");
const { getArticleById } = require("../modules/articles/getArticleById");
const { getDictionaryData } = require("../modules/articles/getDictionaryData");
const {
  getBinyanList,
} = require("../modules/articles/binyanListandTables/getBinyanList");
const {
  getTable,
} = require("../modules/articles/binyanListandTables/getTable");

// Import authentication middleware
const { requireAuth, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// PUBLIC/FREEMIUM ROUTES - Accessible to all users
// ─────────────────────────────────────────────────────────────
// Article data is accessible to everyone (for video preview)
router.get("/article/:id", optionalAuth, getArticleById);

// ─────────────────────────────────────────────────────────────
// PROTECTED ROUTES - Require authentication
// ─────────────────────────────────────────────────────────────
// These routes require a valid JWT token
// User info is available in req.user for all protected routes
router.get("/dictionary", requireAuth, getDictionaryData); // /dictionary?articleId=1
router.get("/dictionary/:id", requireAuth, getDictionaryData); // keep this for single-entry lookups
router.get("/verb-tables", requireAuth, getBinyanList);
router.get("/verb-tables/binyan", requireAuth, getTable);

// ─────────────────────────────────────────────────────────────
// USER-SPECIFIC ROUTES (Examples for future implementation)
// ─────────────────────────────────────────────────────────────
// Uncomment and implement these when you add user-specific features:

// Get user's starred/favorite items
// router.get("/user/starred", requireAuth, getUserStarred);

// Add item to user's favorites
// router.post("/user/starred/:itemId", requireAuth, addToStarred);

// Remove item from favorites
// router.delete("/user/starred/:itemId", requireAuth, removeFromStarred);

// Get user's learning progress
// router.get("/user/progress", requireAuth, getUserProgress);

// Update user's learning progress
// router.put("/user/progress", requireAuth, updateUserProgress);

// Get user profile/settings
// router.get("/user/profile", requireAuth, getUserProfile);

// Update user profile/settings
// router.put("/user/profile", requireAuth, updateUserProfile);

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES (if needed in the future)
// ─────────────────────────────────────────────────────────────
// If you want some endpoints to be accessible without authentication:

// Health check endpoint (no auth required)
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
