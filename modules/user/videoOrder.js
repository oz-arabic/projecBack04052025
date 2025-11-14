/**
 * Video Order Management
 * 
 * Handles fetching and updating user's custom video/article order
 * Stores order as array of article IDs in user_preferences table
 */

const { supaBaseClient } = require("../../services/supaBaseClient");

/**
 * Get user's custom video order
 * @param {string} userId - The user's ID from auth
 * @returns {Promise<{success: boolean, order: number[]|null, error?: string}>}
 */
async function getUserVideoOrder(userId) {
  try {
    const { data, error } = await supaBaseClient.client
      .from("user_preferences")
      .select("video_order")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no row exists yet, that's okay - return null
      if (error.code === "PGRST116") {
        return { success: true, order: null };
      }
      console.error("Error fetching video order:", error);
      return { success: false, order: null, error: error.message };
    }

    return { success: true, order: data?.video_order || null };
  } catch (err) {
    console.error("Exception in getUserVideoOrder:", err);
    return { success: false, order: null, error: err.message };
  }
}

/**
 * Update user's custom video order
 * @param {string} userId - The user's ID from auth
 * @param {number[]} order - Array of article IDs in desired order
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateUserVideoOrder(userId, order) {
  try {
    // Validate order is an array
    if (!Array.isArray(order)) {
      return { success: false, error: "Order must be an array" };
    }

    // Upsert: insert if not exists, update if exists
    const { error } = await supaBaseClient.client
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          video_order: order,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error("Error updating video order:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Exception in updateUserVideoOrder:", err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getUserVideoOrder,
  updateUserVideoOrder,
};

