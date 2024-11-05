import React from 'react';
import {Pressable} from 'react-native';
import {YStack, XStack, Text, ListItem, Separator, YGroup} from 'tamagui';
import {Star, StarOff, ChevronRight} from '@tamagui/lucide-icons';
import {useTheme} from '../dopebase';

interface TraitSelectorProps {
  currentIndex: number;
  traitGroups: any;
  traitPreferences: any;
  updateFilter: any;
}

export const TraitSelector = ({
  currentIndex,
  traitGroups,
  traitPreferences,
  updateFilter,
}: TraitSelectorProps) => {
  const {theme, appearance} = useTheme();

  const renderStarRating = (traitName: string, currentRating: number = 0) => {
    return (
      <XStack gap='$0.5' alignItems='center'>
        {[1, 2, 3, 4, 5].map((score) => (
          <Pressable
            key={score}
            onPress={() =>
              updateFilter('traitPreferences', {[traitName]: score})
            }
          >
            {score <= (currentRating || 0) ? (
              <Star size={24} color={theme.colors[appearance].primary} />
            ) : (
              <StarOff
                size={24}
                color={theme.colors[appearance].primary}
                // opacity={0.5}
              />
            )}
          </Pressable>
        ))}
      </XStack>
    );
  };

  const renderTraitOption = (trait) => {
    const traitKey = trait.name.toLowerCase().replace(/\s+/g, '_');
    return (
      <YStack key={traitKey}>
        <ListItem pressStyle={{opacity: 0.8}} paddingVertical='$3'>
          <XStack flex={1} justifyContent='space-between' alignItems='center'>
            <Text>{trait.name}</Text>
            {renderStarRating(traitKey, traitPreferences[traitKey] as number)}
          </XStack>
        </ListItem>
        <Separator />
      </YStack>
    );
  };

  return (
    <YStack gap='$4'>
      <YGroup separator={<Separator />} gap='$2'>
        <YGroup.Item>
          <ListItem
            title={Object.keys(traitGroups[currentIndex])[0]}
            iconAfter={ChevronRight}
          />
        </YGroup.Item>
        {Object.entries(traitGroups[currentIndex].traits).map(([_, trait]) =>
          renderTraitOption(trait)
        )}
      </YGroup>
    </YStack>
  );
};
