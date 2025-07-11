const express = require("express");
const { getArticleById } = require("../modules/articles/getArticleById");
const { getDictionaryData } = require("../modules/articles/getDictionaryData");
const {
  getBinyanList,
} = require("../modules/articles/binyanListandTables/getBinyanList");
const {
  getTable,
} = require("../modules/articles/binyanListandTables/getTable");

const router = express.Router();

router.get("/article/:id", getArticleById);
router.get("/dictionary", getDictionaryData); // /dictionary?articleId=1
router.get("/dictionary/:id", getDictionaryData); // keep this for single-entry lookups
router.get("/verb-tables", getBinyanList);

router.get("/verb-tables/binyan", getTable);

module.exports = router;
