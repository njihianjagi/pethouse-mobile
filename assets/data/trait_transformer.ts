import fs from 'fs/promises';

interface Trait {
  name: string;
  score: number;
}

interface DogBreed {
  name: string;
  traits: {[key: string]: Trait};
}

interface TraitBreeds {
  [traitName: string]: string[];
}

async function createBreedsByTraits() {
  try {
    // Read the updated-dog-breeds.json file
    const dogBreedsData = await fs.readFile('updated-dog-breeds.json', 'utf-8');
    const dogBreeds: DogBreed[] = JSON.parse(dogBreedsData);

    const traitBreeds: TraitBreeds = {};

    // Process each dog breed
    dogBreeds.forEach((breed) => {
      if (breed.traits) {
        Object.values(breed.traits).forEach((trait) => {
          if (!traitBreeds[trait.name]) {
            traitBreeds[trait.name] = [];
          }
          traitBreeds[trait.name].push(breed.name);
        });
      }
    });

    // Write the result to breeds_by_traits.json
    await fs.writeFile(
      'breeds_by_traits.json',
      JSON.stringify(traitBreeds, null, 2)
    );
    console.log(
      'Breeds by traits data has been written to breeds_by_traits.json'
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

createBreedsByTraits();
