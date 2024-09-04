const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const breedName = 'golden retriever'; // Replace with the desired breed name
const url = `https://unsplash.com/s/photos/${breedName}`;

async function scrapeImages() {
  try {
    await request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const images = $('img[src^="https://images.unsplash.com/photo-"]');
        images.each((i, image) => {
          const imageUrl = $(image).attr('src');
          const altText = $(image).attr('alt');
          const imageName = altText ? altText.replace(/ /g, '_').toLowerCase() : `${breedName}_${i}`;
          request(imageUrl).pipe(fs.createWriteStream(`./images/${imageName}.jpg`));
        });
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

scrapeImages();
