const axios = require('axios');
const cheerio = require('cheerio');
const newspapers = require('./newspapers');

exports.handler = async (event, context) => {
  const articles = [];

  for (const newspaper of newspapers) {
    try {
      const response = await axios.get(newspaper.address, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text().trim().replace(/\s{2,}/g, " ").replace(/\n/g, "");
        let url = $(this).attr("href");

        if (!url.startsWith("http")) {
          url = new URL(url, newspaper.base).href;
        }

        if (!url.includes('twitter.com')) {
          articles.push({
            title,
            url,
            source: newspaper.name,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(articles),
  };
};
