/**
 * Starred Items Management
 * 
 * Handles fetching and updating user's starred/favorited dictionary items
 * Stores items as JSONB array in user_preferences table
 */

const { supaBaseClient } = require("../../services/supaBaseClient");

/**
 * Get user's starred items
 * @param {string} userId - The user's ID from auth
 * @returns {Promise<{success: boolean, items: array|null, error?: string}>}
 */
async function getUserStarredItems(userId) {
  try {
    const { data, error } = await supaBaseClient.client
      .from("user_preferences")
      .select("starred_items")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no row exists yet, that's okay - return empty array
      if (error.code === "PGRST116") {
        return { success: true, items: [] };
      }
      console.error("Error fetching starred items:", error);
      return { success: false, items: [], error: error.message };
    }

    return { success: true, items: data?.starred_items || [] };
  } catch (err) {
    console.error("Exception in getUserStarredItems:", err);
    return { success: false, items: [], error: err.message };
  }
}

/**
 * Update user's starred items (complete replace)
 * @param {string} userId - The user's ID from auth
 * @param {array} items - Array of starred item objects
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateUserStarredItems(userId, items) {
  try {
    // Validate items is an array
    if (!Array.isArray(items)) {
      return { success: false, error: "Items must be an array" };
    }

    // Upsert: insert if not exists, update if exists
    const { error } = await supaBaseClient.client
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          starred_items: items,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error("Error updating starred items:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Exception in updateUserStarredItems:", err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getUserStarredItems,
  updateUserStarredItems,
};

