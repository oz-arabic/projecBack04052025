const dotenv = require("dotenv");
const { supaBaseClient } = require("../../services/supaBaseClient");

dotenv.config();

async function getDictionaryData(req, res) {
  try {
    const articleId = req.query.articleId;
    const dictionaryId = req.params.id;
    const rawTerm = req.query.term;
    const searchTerm = rawTerm ? rawTerm.trim() : null;

    let query = supaBaseClient.client
      .from("001_SY_lemraya_Dictionary")
      .select(
        "id, taatic_text, arabic_text, arabic_text_tashkil, translation, tence, guf, wazen, shoresh, extras, gizrat_of_verb, article_id"
      );

    // If dictionaryId is present in the URL, fetch by dictionary id (for single-entry lookup)
    // If you have an articleId, use ONLY that filter (for multi-entry lookups)
    if (articleId) {
      query = query.eq("article_id", articleId);
    } else if (dictionaryId) {
      // Only use id filter if articleId isn't present (for single-entry lookups)
      query = query.eq("id", dictionaryId);
    }

    if (searchTerm) {
      query = query.or(
        `taatic_text.ilike.%${searchTerm}%,arabic_text.ilike.%${searchTerm}%,arabic_text_tashkil.ilike.%${searchTerm}%,translation.ilike.%${searchTerm}%,tence.ilike.%${searchTerm}%,guf.ilike.%${searchTerm}%,wazen.ilike.%${searchTerm}%,shoresh.ilike.%${searchTerm}%,extras.ilike.%${searchTerm}%,gizrat_of_verb.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("❌ Supabase query error:", error);
      return res
        .status(500)
        .json({ error: "Error retrieving dictionary data" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No dictionary entry found" });
    }

    const formattedData = data.map((entry) => ({
      id: entry.dictionary_id, // <<--- THIS is now the id for frontend matching!
      ...entry,
    }));

    // console.log("📡 Final Dictionary Response:", formattedData);
    res.json(formattedData);
  } catch (err) {
    console.error("❌ Unexpected server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getDictionaryData };
