import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';
import {TraitGroup} from '../../hooks/useBreedSearch';

async function scrapeData(dogName: string, notFoundBreeds) {
  try {
    const response = await axios.get(
      `https://dogtime.com/dog-breeds/${dogName}`
    );

    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const traits = extractTraits($);
      return traits;
    } else {
      notFoundBreeds.push(dogName);

      console.log(
        `Failed to fetch data for ${dogName}: Status code ${response.status}`
      );
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`Breed not found: ${dogName}`);
      notFoundBreeds.push(dogName);

      return null;
    } else {
      notFoundBreeds.push(dogName);

      console.error(`Error fetching data for ${dogName}:`, error);
      return null;
    }
  }
}

function extractTraits($) {
  const traitGroups = [] as any;

  // Process each main accordion group
  $('.xe-breed-accordion').each((_, groupElement) => {
    const $group = $(groupElement);

    // Get group name from the heading
    const groupName = $group
      .find('.xe-breed-accordion__summary-heading')
      .text()
      .trim();

    // Calculate group score from selected stars
    const groupScore = $group.find(
      '.xe-breed-accordion__summary .xe-breed-star.xe-breed-star--selected'
    ).length;

    // Initialize group object
    traitGroups.push({
      name: groupName,
      score: groupScore,
      traits: [], // Change to array instead of object
    });

    // Process individual traits within the group
    $group
      .find('.xe-breed-characteristics-list__item')
      .each((_, traitElement) => {
        const $trait = $(traitElement);
        const traitName = $trait
          .find('.xe-breed-characteristics-list__heading')
          .text()
          .trim();
        const traitScore = $trait.find(
          '.xe-breed-accordion__item-summary .xe-breed-star.xe-breed-star--selected'
        ).length;

        traitGroups.map((group) => {
          if (group.name === groupName) {
            group.traits.push({
              name: traitName,
              score: traitScore,
            });
          }
        });
      });
  });

  return traitGroups;
}

async function main() {
  try {
    const dogBreedsData = await fs.readFile(
      './breeds_with_group_and_traits.json',
      'utf-8'
    );
    const dogBreeds = JSON.parse(dogBreedsData);

    // const limitedDogBreeds = dogBreeds.slice(0, 3);
    const notFoundBreeds: string[] = [];

    for (const element of dogBreeds) {
      const dogName = element.name.toLowerCase().replace(/\s+/g, '-');
      const traits = await scrapeData(dogName, notFoundBreeds);

      if (traits) {
        element.traits = traits;
        console.log(`Successfully scraped traits for ${element.name}`);
      } else {
        console.log(`Skipping ${element.name} due to error or not found`);
      }
    }

    try {
      await fs.writeFile(
        'updated-dog-breeds.json',
        JSON.stringify(dogBreeds, null, 2)
      );
      console.log('Updated data has been written to updated-dog-breeds.json');
    } catch (writeError) {
      console.error('Error writing to not_found_breeds.json:', writeError);
    }

    try {
      await fs.writeFile(
        'not_found_breeds.json',
        JSON.stringify(notFoundBreeds, null, 2)
      );
      console.log(
        'Updated not found breeds list saved to not_found_breeds.json'
      );
    } catch (writeError) {
      console.error('Error writing to not_found_breeds.json:', writeError);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
