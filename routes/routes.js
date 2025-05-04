const express = require("express");
const { getArticleById } = require("../modules/articles/getArticleById");
const { getDictionaryData } = require("../modules/articles/getDictionaryData");

const router = express.Router();

router.get("/article/:id", getArticleById);
router.get("/dictionary/:id", getDictionaryData);

module.exports = router;
