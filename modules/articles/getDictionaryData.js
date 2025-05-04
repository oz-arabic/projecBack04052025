const dotenv = require("dotenv");
const { supaBaseClient } = require("../../services/supaBaseClient");

dotenv.config();

async function getDictionaryData(req, res) {
  try {
    const articleId = req.params.id;
    const rawTerm = req.query.term;
    const searchTerm = rawTerm ? rawTerm.trim() : null; // ✅ Avoids unnecessary `.trim()` calls

    // Validate `articleId` before making a query
    if (!articleId || isNaN(articleId)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    // Prepare the query: Filter by article ID
    let query = supaBaseClient.client
      .from("001_SY_lemraya_Dictionary")
      .select(
        "taatik, arabic, arabic_tashkil, translation, tence, guf, wazen, shoresh, extras, gizrat_of_verb"
      )
      .eq("article_id", articleId);

    // If a search term is provided, refine the query
    if (searchTerm) {
      query = query.or(
        `taatik.ilike.%${searchTerm}%,arabic.ilike.%${searchTerm}%,arabic_tashkil.ilike.%${searchTerm}%,translation.ilike.%${searchTerm}%,tence.ilike.%${searchTerm}%,guf.ilike.%${searchTerm}%,wazen.ilike.%${searchTerm}%,shoresh.ilike.%${searchTerm}%,extras.ilike.%${searchTerm}%,gizrat_of_verb.ilike.%${searchTerm}%`
      ); // ✅ Uses `ILIKE` instead of `eq` for case-insensitive and partial matches
    }

    const { data, error } = await query;
    if (error) {
      console.error("❌ Supabase query error:", error);
      return res
        .status(500)
        .json({ error: "Error retrieving dictionary data" });
    }

    // ✅ Remove exact search term matches from results (if applicable)
    let filteredData = data;
    if (searchTerm) {
      filteredData = data.map((row) => {
        const newRow = { ...row };
        for (const key in newRow) {
          if (newRow[key]?.trim() === searchTerm) {
            delete newRow[key]; // ✅ Removes column that exactly matched search term
          }
        }
        return newRow;
      });
    }

    res.json(filteredData);
  } catch (err) {
    console.error("❌ Unexpected server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getDictionaryData };
