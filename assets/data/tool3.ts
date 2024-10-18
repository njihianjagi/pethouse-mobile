import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';

async function scrapeImage(dogName: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://dogtime.com/dog-breeds/${dogName}`
    );

    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const img = $(
        'img.attachment-post-thumbnail.size-post-thumbnail.wp-post-image'
      );

      let imageUrl = null as any;

      // First, try to get the image from srcset
      const srcset = img.attr('srcset');
      if (srcset) {
        const srcsetUrls = srcset.split(',').map((s) => s.trim().split(' '));
        const highestResUrl = srcsetUrls.reduce((prev, curr) => {
          const prevWidth = parseInt(prev[1]);
          const currWidth = parseInt(curr[1]);
          return currWidth > prevWidth ? curr : prev;
        })[0];

        if (highestResUrl) {
          imageUrl = highestResUrl;
        }
      }

      // If no suitable image found in srcset, fall back to src
      if (!imageUrl) {
        imageUrl = img.attr('src');
      }

      if (imageUrl) {
        return imageUrl;
      }
    }

    console.log(
      `Failed to fetch image for ${dogName}: No suitable image found`
    );
    return null;
  } catch (error: any) {
    console.error(`Error fetching image for ${dogName}:`, error.message);
    return null;
  }
}
async function main() {
  try {
    const dogBreedsData = await fs.readFile(
      './breeds_with_group_and_traits.json',
      'utf-8'
    );
    const dogBreeds = JSON.parse(dogBreedsData);

    for (const breed of dogBreeds) {
      const dogName = breed.name.toLowerCase().replace(/\s+/g, '-');
      const imageUrl = await scrapeImage(dogName);

      if (imageUrl) {
        breed.image = imageUrl;
        console.log(`Successfully scraped image for ${breed.name}`);
      } else {
        console.log(
          `Skipping image for ${breed.name} due to error or not found`
        );
      }
    }

    await fs.writeFile(
      'updated-dog-breeds-with-images.json',
      JSON.stringify(dogBreeds, null, 2)
    );
    console.log(
      'Updated data with images has been written to updated-dog-breeds-with-images.json'
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
