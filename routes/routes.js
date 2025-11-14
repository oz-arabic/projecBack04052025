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
const {
  getUserVideoOrder,
  updateUserVideoOrder,
} = require("../modules/user/videoOrder");
const {
  getUserStarredItems,
  updateUserStarredItems,
} = require("../modules/user/starredItems");

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

// ─────────────────────────────────────────────────────────────
// VIDEO ORDER ROUTES - User's custom video order
// ─────────────────────────────────────────────────────────────

// Get user's custom video order
router.get("/user/video-order", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getUserVideoOrder(userId);

    if (!result.success) {
      // If it's a "table doesn't exist" error, return empty order
      // This allows the feature to work even if DB setup is pending
      console.warn("Video order fetch failed, returning null:", result.error);
      return res.json({ order: null });
    }

    res.json({ order: result.order });
  } catch (error) {
    console.error("Error in GET /user/video-order:", error);
    // Return null order instead of error to allow graceful degradation
    res.json({ order: null });
  }
});

// Update user's custom video order
router.put("/user/video-order", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { order } = req.body;

    if (!order || !Array.isArray(order)) {
      return res.status(400).json({ error: "Order must be an array" });
    }

    const result = await updateUserVideoOrder(userId, order);

    if (!result.success) {
      console.error("Failed to update video order:", result.error);
      // Check if it's a table-doesn't-exist error
      if (result.error?.includes("relation") || result.error?.includes("does not exist")) {
        return res.status(500).json({ 
          error: "Database table not set up yet. Please run the SQL setup script." 
        });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json({ success: true, message: "Video order updated successfully" });
  } catch (error) {
    console.error("Error in PUT /user/video-order:", error);
    res.status(500).json({ error: "Failed to update video order" });
  }
});

// ─────────────────────────────────────────────────────────────
// STARRED ITEMS ROUTES - User's starred/favorited items
// ─────────────────────────────────────────────────────────────

// Get user's starred items
router.get("/user/starred", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getUserStarredItems(userId);

    if (!result.success) {
      console.warn("Starred items fetch failed, returning empty array:", result.error);
      return res.json({ items: [] });
    }

    res.json({ items: result.items });
  } catch (error) {
    console.error("Error in GET /user/starred:", error);
    res.json({ items: [] });
  }
});

// Update user's starred items
router.put("/user/starred", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    const result = await updateUserStarredItems(userId, items);

    if (!result.success) {
      console.error("Failed to update starred items:", result.error);
      return res.status(500).json({ error: result.error });
    }

    res.json({ success: true, message: "Starred items updated successfully" });
  } catch (error) {
    console.error("Error in PUT /user/starred:", error);
    res.status(500).json({ error: "Failed to update starred items" });
  }
});

module.exports = router;
