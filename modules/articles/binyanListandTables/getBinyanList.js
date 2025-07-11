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

    /* 2) Pivot rows → column-arrays
       --------------------------------------------------
       raw data looks like:
       [
         { binyan_list_shlemim: 'בניין 1', binyan_list_kfulim: 'בניין 1', ... },
         { binyan_list_shlemim: 'בניין 2', binyan_list_kfulim: 'בניין 2', ... },
         …
       ]
       We want:
       {
         binyan_list_shlemim: ['בניין 1', 'בניין 2', …],
         binyan_list_kfulim:   ['בניין 1', 'בניין 2', …],
         …
       }
    */
    const lists = {
      binyan_list_shlemim: [],
      binyan_list_kfulim: [],
      binyan_list_gizrat_Pei_vav_yud: [],
      binyan_list_gizrat_3ayn_vav_yud: [],
      binyan_list_gizrat_Lamed_vav_yud: [],
    };

    data.forEach((row) => {
      Object.keys(lists).forEach((col) => {
        if (row[col]) lists[col].push(row[col]);
      });
    });

    return res.status(200).json(lists);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getBinyanList };
