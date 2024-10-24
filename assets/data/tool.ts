interface DogElement {
  breedName: string;
  image: string;
  description: string;
  dogInfo: {
    height: string;
    weight: string;
    life: string;
    breedGroup: string;
  };
}

(async (): Promise<void> => {
  const response = await fetch('https://dogtime.com/dog-breeds/profiles/');
  const html = await response.text();
  const parser = new DOMParser();
  const data = parser.parseFromString(html, 'text/html');

  const dogs = data.querySelectorAll('.list-item');

  const results: DogElement[] = [];

  for (const dog of dogs) {
    const image =
      dog.querySelector('.list-item-breed-img')?.getAttribute('src') || '';
    const name = dog.querySelector('.list-item-title')?.textContent || '';

    const element: DogElement = {
      breedName: name.toLowerCase(),
      image,
      description: '',
      dogInfo: {
        height: '',
        weight: '',
        life: '',
        breedGroup: '',
      },
    };

    const dogName = setName(name);

    const response2 = await fetch(`https://dogtime.com/dog-breeds/${dogName}`);
    const html2 = await response2.text();
    const data2 = parser.parseFromString(html2, 'text/html');

    const description =
      data2.querySelector('.breeds-single-content p')?.textContent || '';
    element.description = description;

    const statsWrapper = data2.querySelectorAll(
      '.breed-vital-stats-wrapper'
    )[0];
    if (statsWrapper) {
      const dataHeight = statsWrapper.children[1]?.textContent || '';
      const height = dataHeight.replace('Height:', '').trim().toLowerCase();

      const dataWeight = statsWrapper.children[2]?.textContent || '';
      const weight = dataWeight.replace('Weight:', '').trim().toLowerCase();

      const dataLife = statsWrapper.children[3]?.textContent || '';
      const life = dataLife.replace('Life Span:', '').trim().toLowerCase();

      const dataBreed = statsWrapper.children[0]?.textContent || '';
      const breed = dataBreed
        .replace('Dog Breed Group:', '')
        .trim()
        .toLowerCase();

      element.dogInfo = {height, weight, life, breedGroup: breed};
    }

    results.push(element);
  }

  console.log(JSON.stringify(results));
})();

function setName(name: string): string {
  let nameString = name.split(' ').join('-');
  nameString = nameString.replace('', '');

  if (nameString === 'Korean-Jindo-Dog') {
    nameString = 'jindo';
  }
  if (nameString === 'Xoloitzcuintli') {
    nameString = 'xoloitzuintli';
  }

  return nameString.toLowerCase();
}
