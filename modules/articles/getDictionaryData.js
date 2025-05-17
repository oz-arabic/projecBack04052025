const dotenv = require("dotenv");
const { supaBaseClient } = require("../../services/supaBaseClient");

dotenv.config();

async function getDictionaryData(req, res) {
  try {
    const articleId = req.query.articleId; // ✅ Use req.query for articleId
    const dictionaryId = req.params.id; // ✅ Rename for clarity
    const rawTerm = req.query.term;
    const searchTerm = rawTerm ? rawTerm.trim() : null;

    // Validate `dictionaryId` before making a query
    if (!dictionaryId || isNaN(dictionaryId)) {
      return res.status(400).json({ error: "Invalid dictionary ID" });
    }

    // Prepare the query: Filter by dictionary ID and article ID
    let query = supaBaseClient.client
      .from("001_SY_lemraya_Dictionary")
      .select(
        "id, taatic_text, arabic_text, arabic_text_tashkil, translation, tence, guf, wazen, shoresh, extras, gizrat_of_verb"
      )
      .eq("id", dictionaryId);

    if (articleId) {
      query = query.eq("article_id", articleId); // ✅ Only filter by article_id if provided
    }

    // If a search term is provided, refine the query
    if (searchTerm) {
      query = query.or(
        `taatic_text.ilike.%${searchTerm}%,arabic_text.ilike.%${searchTerm}%,arabic_text_tashkil.ilike.%${searchTerm}%,translation.ilike.%${searchTerm}%,tence.ilike.%${searchTerm}%,guf.ilike.%${searchTerm}%,wazen.ilike.%${searchTerm}%,shoresh.ilike.%${searchTerm}%,extras.ilike.%${searchTerm}%,gizrat_of_verb.ilike.%${searchTerm}%`
      ); // ✅ Uses `ILIKE` for case-insensitive partial matching
    }

    const { data, error } = await query;
    if (error) {
      console.error("❌ Supabase query error:", error);
      return res
        .status(500)
        .json({ error: "Error retrieving dictionary data" });
    }

    // ✅ Ensure data is properly formatted with correct column names
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ error: "No dictionary entry found for this ID" });
    }

    // ✅ Rename `id` to `dictionary_id` before returning response
    const formattedData = data.map((entry) => ({
      dictionary_id: entry.id, // ✅ Convert `id` to `dictionary_id`
      ...entry, // ✅ Keep all other properties unchanged
    }));

    console.log("📡 Final Dictionary Response:", formattedData); // ✅ Debugging

    res.json(formattedData); // ✅ Send the correctly formatted response
  } catch (err) {
    console.error("❌ Unexpected server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getDictionaryData };
