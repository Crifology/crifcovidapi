const PORT = process.env.PORT || 8080; //deploying on Heroku

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { contains } = require("cheerio/lib/static");

const app = express();

const newsSites = [
  {
    name: "bbc",
    addr: "https://www.bbc.com/news/world",
    base: "https://www.bbc.com",
  },
  {
    name: "nbc",
    addr: "https://www.nbcnews.com/health/coronavirus",
    base: "",
  },
  {
    name: "cnn",
    addr: "https://www.cnn.com/specials/world/coronavirus-outbreak-intl-hnk",
    base: "https://www.cnn.com",
  },
  {
    name: "our world",
    addr: "https://ourworldindata.org/covid-vaccinations",
    base: "",
  },
  {
    name: "cnbc",
    addr: "https://www.cnbc.com/coronavirus/",
    base: "",
  },
];

const articles = [];

newsSites.forEach((newsSite) => {
  axios.get(newsSite.addr).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("Covid")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      articles.push({
        title,
        url: newsSite.base + url,
        source: newsSite.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("Welcome to My Covid Stats API Page!");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newsSiteId", (req, res) => {
  const newsSiteId = req.params.newsSiteId;

  const newsSiteAddress = newsSites.filter(
    (newsSite) => newsSite.name === newsSiteId
  )[0].addr;
  const newsSiteBase = newsSites.filter(
    (newsSite) => newsSite.name == newsSiteId
  )[0].base;

  axios
    .get(newsSiteAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("covid")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        articles.push({
          title,
          url: newsSiteBase + url,
          source: newsSiteId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
