/**
 * Authentication Middleware for Express Backend
 *
 * This middleware verifies Supabase JWT tokens from frontend requests.
 * It ensures only authenticated users can access protected endpoints.
 *
 * Usage:
 * const { requireAuth, optionalAuth } = require('./middleware/authMiddleware');
 *
 * // Protected route - requires authentication
 * router.get('/protected', requireAuth, controller);
 *
 * // Optional auth - works for both logged in and anonymous
 * router.get('/public', optionalAuth, controller);
 */

const { supaBaseClient } = require("../services/supaBaseClient");

/**
 * Middleware: Require Authentication
 *
 * Verifies JWT token and blocks request if invalid or missing.
 * Adds user object to req.user if successful.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function requireAuth(req, res, next) {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required. Please log in.",
      });
    }

    // Extract JWT token (format: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token format",
      });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supaBaseClient.client.auth.getUser(token);

    if (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token. Please log in again.",
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found",
      });
    }

    // Attach user info to request object
    // Controllers can now access req.user
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      metadata: user.user_metadata,
      created_at: user.created_at,
    };

    // Log successful authentication (optional, remove in production if needed)
    console.log(`✅ Authenticated user: ${user.email} (${user.id})`);

    // Continue to the next middleware/controller
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify authentication",
    });
  }
}

/**
 * Middleware: Optional Authentication
 *
 * Verifies JWT token if present, but allows request to continue even if missing.
 * Useful for endpoints that work for both authenticated and anonymous users.
 *
 * If authenticated: req.user will be populated
 * If anonymous: req.user will be null
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue as anonymous user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const {
      data: { user },
      error,
    } = await supaBaseClient.client.auth.getUser(token);

    if (error || !user) {
      // Token is invalid, but that's okay for optional auth
      req.user = null;
      console.log("⚠️ Optional auth: Invalid token, continuing as anonymous");
    } else {
      // Token is valid, attach user
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        metadata: user.user_metadata,
        created_at: user.created_at,
      };
      console.log(`✅ Optional auth: User ${user.email} authenticated`);
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Don't block the request, continue as anonymous
    req.user = null;
    next();
  }
}

/**
 * Middleware: Check User Role (for role-based access control)
 *
 * Use this after requireAuth to check if user has specific role.
 *
 * Example:
 * router.delete('/admin/delete', requireAuth, checkRole('admin'), controller);
 *
 * @param {string|Array<string>} allowedRoles - Role(s) allowed to access the endpoint
 * @returns {Function} Express middleware function
 */
function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const userRole = req.user.role || "user";
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
}

/**
 * Middleware: Require Admin Role
 *
 * Convenience middleware that combines requireAuth + checkRole('admin')
 *
 * Example:
 * router.post('/admin/articles', requireAdmin, createArticle);
 *
 * @returns {Function} Express middleware function
 */
async function requireAdmin(req, res, next) {
  // First verify authentication
  try {
    await requireAuth(req, res, () => {});
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  // Then check admin role
  const userRole = req.user?.role || "user";

  if (userRole !== "admin") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin access required",
    });
  }

  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  checkRole,
  requireAdmin,
};
