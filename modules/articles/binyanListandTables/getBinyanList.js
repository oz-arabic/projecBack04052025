// modules/articles/binyanListandTables/getBinyanList.js
const dotenv = require("dotenv");
const { supaBaseClient } = require("../../../services/supaBaseClient");

dotenv.config();

/**
 * GET /api/verb-tables
 * Returns the five different “binyan lists”, each as an array.
 */
async function getBinyanList(req, res) {
  try {
    /* 1) Fetch *all* rows, all five columns */
    const { data, error } = await supaBaseClient.client
      .from("binyanim_list")
      .select(
        `
          binyan_list_shlemim,
          binyan_list_kfulim,
          binyan_list_gizrat_Pei_vav_yud,
          binyan_list_gizrat_3ayn_vav_yud,
          binyan_list_gizrat_Lamed_vav_yud

        `
      );

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({ error: "Error fetching binyan lists" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No binyan lists found" });
    }

    const lists = {
      binyan_list_shlemim: [],
      binyan_list_kfulim: [],
      binyan_list_gizrat_Pei_vav_yud: [],
      binyan_list_gizrat_3ayn_vav_yud: [],
      binyan_list_gizrat_Lamed_vav_yud: [],
    };

    data.forEach((row) => {
      Object.keys(lists).forEach((col) => {
        const val = row[col];
        // Skip null, undefined, empty strings or purely whitespace entries
        if (val !== null && val !== undefined && String(val).trim() !== "") {
          lists[col].push(val);
        }
      });
    });

    return res.status(200).json(lists);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getBinyanList };
