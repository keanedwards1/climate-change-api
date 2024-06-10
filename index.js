// initialize local port
const PORT = process.env.PORT || 8000; // for deploying

// import libraries
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

// call and save express as "app"
const app = express();

const newspapers = [
  {
    name: "bbc",
    address: "https://www.bbc.co.uk/news/science_and_environment",
    base: "https://www.bbc.co.uk",
  },
  {
    name: "bloomberg",
    address: "https://www.bloomberg.com/green",
    base: "https://www.bloomberg.com",
  },
  {
    name: "ca",
    address:
      "https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/",
    base: "https://www.cityam.com/",
  },
  {
    name: "cnbc",
    address: "https://www.cnbc.com/climate/",
    base: "https://www.cnbc.com",
  },
  {
    name: "cnn",
    address: "https://www.cnn.com/specials/world/cnn-climate",
    base: "https://www.cnn.com",
  },
  {
    name: "dm",
    address:
      "https://www.dailymail.co.uk/news/climate_change_global_warming/index.html",
    base: "https://www.dailymail.co.uk",
  },
  {
    name: "standard",
    address: "https://www.standard.co.uk/topic/climate-change",
    base: "https://www.standard.co.uk",
  },
  {
    name: "tg",
    address: "https://www.theguardian.com/environment/climate-crisis",
    base: "https://www.theguardian.com/",
  },
  {
    name: "lt",
    address: "https://www.latimes.com/environment",
    base: "https://www.latimes.com/",
  },
  {
    name: "ng",
    address: "https://www.nationalgeographic.com/environment/",
    base: "https://www.nationalgeographic.com",
  },
  {
    name: "nature",
    address: "https://www.nature.com/subjects/climate-change",
    base: "https://www.nature.com",
  },
  {
    name: "npr",
    address: "https://www.npr.org/sections/climate/",
    base: "https://www.npr.org",
  },
  {
    name: "nyt",
    address: "https://www.nytimes.com/international/section/climate",
    base: "https://www.nytimes.com/",
  },
  {
    name: "nyp",
    address: "https://nypost.com/tag/climate-change/",
    base: "https://nypost.com/",
  },
  {
    name: "sa",
    address: "https://www.scientificamerican.com/climate-change/",
    base: "https://www.scientificamerican.com",
  },
  {
    name: "smh",
    address: "https://www.smh.com.au/environment/climate-change",
    base: "https://www.smh.com.au",
  },
  {
    name: "sun",
    address: "https://www.thesun.co.uk/topic/climate-change-environment/",
    base: "https://www.thesun.co.uk/",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/climate-change",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "times",
    address: "https://www.thetimes.co.uk/environment/climate-change",
    base: "https://www.thetimes.co.uk/",
  },
  {
    name: "un",
    address: "https://www.un.org/climatechange",
    base: "https://www.un.org/",
  },
  {
    name: "wp",
    address: "https://www.washingtonpost.com/climate-environment/",
    base: "https://www.washingtonpost.com",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(
        function () {
          const title = $(this)
            .text()
            .trim()
            .replace(/\s{2,}/g, " ")
            .replace(/\n/g, "")
            .replace(
              /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\s• /g,
              ""
            )
            .replace(
              /\b\d{2}:\d{2}\s\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December),?/g,
              ""
            )
            .replace(
              /The coastal road being eroded by climate change, published at \d{2}:\d{2}\s\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December) /g,
              ""
            )
            .replace(
              /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\s•/g,
              ""
            )
            .replace(
                /Column: /g,
                ""
            );
          let url = $(this).attr("href");

          if (!url.startsWith("http")) {
            url = new URL(url, newspaper.base).href;
          }

          // Filter out unwanted results
          if (!url.includes('twitter.com')) {
            articles.push({
              title,
              url,
              source: newspaper.name,
            });
          }
        }
      );
    })
    .catch((err) => {
      if (err.response && err.response.status === 403) {
        console.log(`403 error for ${newspaper.name}: ${newspaper.address}`);
      } else if (err.response && err.response.status === 404) {
        console.log(`404 error for ${newspaper.name}: ${newspaper.address}`);
      } else {
        console.log(err);
      }
    });
});

app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;

  const newspaper = newspapers.find((newspaper) => newspaper.name === newspaperId);
  const newspaperAddress = newspaper.address;
  const newspaperBase = newspaper.base;

  axios
    .get(newspaperAddress, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this)
          .text()
          .trim()
          .replace(/\s{2,}/g, " ")
          .replace(/\n/g, "")
          .replace(
            /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\s•/g,
            ""
          )
          .replace(
            /\b\d{2}:\d{2}\s\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December),?/g,
            ""
          )
          .replace(
            /The coastal road being eroded by climate change, published at \d{2}:\d{2}\s\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December)/g,
            ""
          )
          .replace(
            /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\s•/g,
            ""
          );
        let url = $(this).attr("href");

        if (!url.startsWith("http")) {
          url = new URL(url, newspaperBase).href;
        }

        // Filter out unwanted results
        if (!url.includes('twitter.com')) {
          specificArticles.push({
            title,
            url,
            source: newspaperId,
          });
        }
      });
      res.json(specificArticles);
    })
    .catch((err) => {
      if (err.response && err.response.status === 403) {
        console.log(`403 error for ${newspaperId}: ${newspaperAddress}`);
      } else if (err.response && err.response.status === 404) {
        console.log(`404 error for ${newspaperId}: ${newspaperAddress}`);
      } else {
        console.log(err);
      }
    });
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
