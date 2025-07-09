const dotenv = require("dotenv");
const { supaBaseClient } = require("../../services/supaBaseClient");

dotenv.config();

async function getArticleById(req, res) {
  const articleId = req.params.id;

  // Validate that articleId exists and is a number
  if (!articleId || isNaN(articleId)) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  // 1) Fetch the metadata from "root_data_2"
  const { data: metaData, error: metaError } = await supaBaseClient.client
    .from("root_data_2") // Table that stores URL, start_time, end_time
    .select(" URL, video_ends, video_strats")
    .eq("article_id", articleId)
    .maybeSingle(); // Ensures only one row is fetched, allows null without error

  if (metaError) {
    console.error("Error fetching metadata:", metaError.message);
    return res.status(500).json({ error: "Error fetching article metadata" });
  }

  if (!metaData) {
    return res
      .status(404)
      .json({ error: "No metadata found for this article" });
  }

  // 2) Fetch the transcription lines from "root_data"
  const { data: linesData, error: linesError } = await supaBaseClient.client
    .from("root_data")
    .select(
      "id, dictionary_id, line_index, word_index, start_time, end_time, arabic_text, taatic_text, arabic_text_tashkil, hebrew_words, punctuation_marks"
    )
    .eq("article_id", articleId)
    .order("line_index", { ascending: true })
    .order("word_index", { ascending: true });

  if (linesError) {
    console.error("Error fetching lines:", linesError.message);
    return res.status(500).json({ error: "Error fetching lines data" });
  }

  if (!linesData || linesData.length === 0) {
    return res
      .status(404)
      .json({ error: `No transcription found for article ID ${articleId}` });
  }

  // ✅ Fix duplication by using a Set to remove repeated words in the same line
  const groupedLines = new Map();

  linesData.forEach((row) => {
    let lineGroup = groupedLines.get(row.line_index);

    if (!lineGroup) {
      lineGroup = [];
      groupedLines.set(row.line_index, lineGroup);
    }

    if (!lineGroup.some((word) => word.word_index === row.word_index)) {
      lineGroup.push(row);
    }
  });

  // 5) Return final JSON response
  return res.json({
    lines: Object.fromEntries(groupedLines), // Converts Map to an object
    startTime: metaData.video_strats,
    endTime: metaData.video_ends,
    url: metaData.URL,
  });
}

module.exports = { getArticleById };
