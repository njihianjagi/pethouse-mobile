import React, {useState} from 'react';
import {Pressable} from 'react-native';
import {
  YStack,
  XStack,
  Text,
  ListItem,
  Separator,
  YGroup,
  Circle,
  Sheet,
  Button,
} from 'tamagui';
import {Star, StarOff, ChevronRight, CheckCircle} from '@tamagui/lucide-icons';
import {useTheme} from '../dopebase';
interface TraitSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  traitGroups: any;
  traitPreferences: any;
  updateFilter: any;
}

export const TraitSelector = ({
  isOpen,
  onClose,
  traitGroups,
  traitPreferences,
  updateFilter,
}: TraitSelectorProps) => {
  const {theme, appearance} = useTheme();

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const currentGroup = traitGroups[currentGroupIndex];

  const handleNext = () => {
    if (currentGroupIndex < traitGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

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

  const renderTraitOption = (trait: {name: string; score: number}) => {
    const traitKey = trait.name.toLowerCase().replace(/\s+/g, '_');
    return (
      <YStack key={traitKey}>
        <ListItem
          pressTheme
          pressStyle={{opacity: 0.8}}
          paddingVertical='$3'
          title={<Text>{trait.name}</Text>}
        >
          <XStack flex={1} justifyContent='space-between' alignItems='center'>
            {renderStarRating(traitKey, traitPreferences[traitKey] as number)}
          </XStack>
        </ListItem>
        <Separator />
      </YStack>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose} snapPoints={[80]}>
      <Sheet.Overlay />
      <Sheet.Frame>
        <YStack padding='$4' gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {currentGroup?.name}
          </Text>

          <YGroup>
            {currentGroup?.traits.map((trait) => (
              <YGroup.Item key={trait}>
                <ListItem
                  title={trait}
                  onPress={() => updateFilter(trait, !traitPreferences[trait])}
                  iconAfter={
                    traitPreferences[trait] ? <CheckCircle /> : <Circle />
                  }
                />
              </YGroup.Item>
            ))}

            {/* Map through traits array instead of using Object.entries */}
            {currentGroup.traits &&
              currentGroup.traits.map((trait) => (
                <YGroup.Item key={trait.name}>
                  {renderTraitOption(trait)}
                </YGroup.Item>
              ))}
          </YGroup>
          <XStack justifyContent='space-between'>
            <Button
              onPress={handleBack}
              disabled={currentGroupIndex === 0}
              chromeless
            >
              Back
            </Button>
            <Button onPress={handleNext}>
              {currentGroupIndex === traitGroups.length - 1 ? 'Done' : 'Next'}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
