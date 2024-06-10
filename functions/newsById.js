const axios = require('axios');
const cheerio = require('cheerio');
const newspapers = require('./newspapers');

exports.handler = async (event, context) => {
  const newspaperId = event.path.split('/').pop();
  const newspaper = newspapers.find((np) => np.name === newspaperId);

  if (!newspaper) {
    return {
      statusCode: 404,
      body: 'Newspaper not found',
    };
  }

  try {
    const response = await axios.get(newspaper.address, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const specificArticles = [];

    $('a:contains("climate")', html).each(function () {
      const title = $(this).text().trim().replace(/\s{2,}/g, " ").replace(/\n/g, "");
      let url = $(this).attr("href");

      if (!url.startsWith("http")) {
        url = new URL(url, newspaper.base).href;
      }

      if (!url.includes('twitter.com')) {
        specificArticles.push({
          title,
          url,
          source: newspaperId,
        });
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(specificArticles),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: 'Error fetching articles',
    };
  }
};
