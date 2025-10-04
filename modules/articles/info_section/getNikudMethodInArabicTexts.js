const dotenv = require("dotenv");
const { supaBaseClient } = require("../../../services/supaBaseClient");

dotenv.config();

/**
 * GET /api/info/arabic-vowels
 * Returns rows from nikud_method_in_arabic_texts in stable order.
 * Columns returned:
 *  - id
 *  - name_in_hebrew_taatic_and_arabic
 *  - explanations_and_examples
 */
async function getNikudMethodInArabicTexts(req, res) {
  try {
    const { data, error } = await supaBaseClient.client
      .from("nikud_method_in_arabic_texts")
      .select(`id, name_in_hebrew_taatic_and_arabic, explanations_and_examples`)
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Supabase error [nikud_method_in_arabic_texts]:",
        error.message
      );
      return res
        .status(500)
        .json({ error: "Error fetching nikud_method_in_arabic_texts" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json([]);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getNikudMethodInArabicTexts };
