// modules/articles/info_section/getArabicAndTaaticMapTable.js
const dotenv = require("dotenv");
const { supaBaseClient } = require("../../../services/supaBaseClient");

dotenv.config();

/**
 * GET /api/info/arabic-taatic-map
 * Returns a combined payload from three Supabase tables:
 *  - arabic_letter_map
 *  - arabic_letter_map_for_sub_rows
 *  - table_just_for_header (sub_title only)
 */
async function getArabicAndTaaticMapTable(req, res) {
  try {
    const { data: arabicLetterMap, error: mapErr } = await supaBaseClient.client
      .from("arabic_letter_map")
      .select(
        `extras, my_ta_system_map, the_arab_letter, name_of_letter_ta, name_of_letter_ar`
      )
      .order("id", { ascending: true });

    if (mapErr) {
      console.error("Supabase error [arabic_letter_map]:", mapErr.message);
      return res
        .status(500)
        .json({ error: "Error fetching arabic_letter_map" });
    }

    const { data: arabicLetterMapSubRows, error: subErr } =
      await supaBaseClient.client
        .from("arabic_letter_map_for_sub_rows")
        .select(
          `extras, my_ta_system_map, the_arab_letter, name_of_letter_ta, name_of_letter_ar`
        )
        .order("id", { ascending: true });

    if (subErr) {
      console.error(
        "Supabase error [arabic_letter_map_for_sub_rows]:",
        subErr.message
      );
      return res
        .status(500)
        .json({ error: "Error fetching arabic_letter_map_for_sub_rows" });
    }

    const { data: headerRows, error: headerErr } = await supaBaseClient.client
      .from("table_just_for_header")
      .select(`sub_title`)
      .order("id", { ascending: true });

    if (headerErr) {
      console.error(
        "Supabase error [table_just_for_header]:",
        headerErr.message
      );
      return res
        .status(500)
        .json({ error: "Error fetching table_just_for_header" });
    }

    const headers = Array.isArray(headerRows)
      ? headerRows.map((r) => r.sub_title)
      : [];

    console.log(
      `[info/arabic-taatic-map] counts -> headers: ${headers.length}, map: ${
        arabicLetterMap?.length || 0
      }, subRows: ${arabicLetterMapSubRows?.length || 0}`
    );

    return res.status(200).json({
      headers,
      arabicLetterMap: arabicLetterMap || [],
      arabicLetterMapSubRows: arabicLetterMapSubRows || [],
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getArabicAndTaaticMapTable };
