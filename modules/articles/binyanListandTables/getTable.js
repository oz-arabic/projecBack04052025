// modules/articles/binyanListandTables/getTable.js
const dotenv = require("dotenv");
const { supaBaseClient } = require("../../../services/supaBaseClient");

dotenv.config();

/**
 * GET  /api/verb-tables/:wazenId?          (optional param)
 *
 * If :wazenId is given → one wazen (its rows).
 * Otherwise           → all rows for every wazen.
 *
 * ─ Columns returned (exact order) ─
 *   masdar | b_pauul | b_poel | tzivui_1 | tzivui_2 | tzivui_3 |
 *   hove_atid_c | hove_atid_b | hove_atid_a | avar_b | avar_a | guf | wazen_id
 */
async function getTable(req, res) {
  try {
    const { wazenId } = req.params; // /verb-tables/1  → wazenId = "1"

    /* 1) Build base query */
    let query = supaBaseClient.client
      .from("awzan_table_1")
      .select(
        `
        masdar,
        b_pauul,
        b_poel,
        tzivui_1,
        tzivui_2,
        tzivui_3,
        hove_atid_c,
        hove_atid_b,
        hove_atid_a,
        avar_b,
        avar_a,
        guf,
        wazen_id
      `
      )
      .order("guf", { ascending: true }); // secondary sort

    /* Optional single–wazen filter */
    if (wazenId) {
      query = query.eq("wazen_id", wazenId); // several rows, one wazen
    }

    /* 2) Run query */
    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({ error: "Error fetching verb table" });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No records found" });
    }

    /* 3) Re-order so the “header” row (guf === 'גוף') comes first
          & package nicely for the client. */
    const header = data.find((r) => r.guf === "גוף") || null;
    const rows = data.filter((r) => r.guf !== "גוף");

    return res.status(200).json({ header, rows });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getTable };
