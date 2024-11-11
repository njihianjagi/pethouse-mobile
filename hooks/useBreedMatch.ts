import {Breed} from '../api/firebase/breeds/useBreedData';
import {TraitPreferences} from './useBreedSearch';

// Weights for different trait categories
const CATEGORY_WEIGHTS = {
  Adaptability: 1.2,
  'All-around friendliness': 1.5,
  'Health And Grooming Needs': 1.0,
  Trainability: 1.3,
  'Exercise needs': 1.4,
};

export const useBreedMatch = () => {
  const calculateTraitMatch = (
    breed: Breed,
    traitName: string,
    preference: boolean | number,
    traitGroup: string
  ): number => {
    // Find the trait in the breed's traits
    const traitValue = breed.traits
      .find((group) => group.name === traitGroup)
      ?.traits.find((t) => t.name === traitName);

    if (!traitValue) return 0;

    const normalizeScore = (score: number) => (score - 1) / 4;
    const normalizedBreedScore = normalizeScore(traitValue.score);

    if (typeof preference === 'boolean') {
      const threshold = 0.5;
      const reverseLogic = [
        'Shedding',
        'Drooling',
        'Tendency To Bark Or Howl',
        'Prey Drive',
      ];

      if (reverseLogic.includes(traitName)) {
        return preference === normalizedBreedScore <= threshold ? 1 : 0;
      }
      return preference === normalizedBreedScore >= threshold ? 1 : 0;
    } else {
      // For numeric preferences, calculate distance-based match
      const preferenceRanges = {
        0: {min: 0, max: 0.3}, // Low
        1: {min: 0.3, max: 0.7}, // Medium
        2: {min: 0.7, max: 1.0}, // High
      };

      const range = preferenceRanges[preference];
      if (!range) return 0;

      const {min, max} = range;
      if (normalizedBreedScore >= min && normalizedBreedScore <= max) {
        return 1;
      }
      // Partial match based on distance to range
      const distance = Math.min(
        Math.abs(normalizedBreedScore - min),
        Math.abs(normalizedBreedScore - max)
      );
      return Math.max(0, 1 - distance);
    }
  };

  const calculateBreedMatch = (
    breed: Breed,
    preferences: TraitPreferences
  ): number => {
    if (!breed.traits || Object.keys(preferences).length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(preferences).forEach(([traitName, preference]) => {
      // Find the trait group for this trait
      const traitGroup = breed.traits.find((group) =>
        group.traits.some((t) => t.name === traitName)
      );

      if (traitGroup) {
        const weight = CATEGORY_WEIGHTS[traitGroup.name] || 1;
        const matchScore = calculateTraitMatch(
          breed,
          traitName,
          preference,
          traitGroup.name
        );

        totalScore += matchScore * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  };

  return {
    calculateBreedMatch,
  };
};
