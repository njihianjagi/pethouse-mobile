import {
  Button,
  Checkbox,
  H4,
  Label,
  RadioGroup,
  Sheet,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import {ScrollView} from 'react-native';
import {useEffect, useState, useCallback, memo} from 'react';
import {useRefinementList, useInstantSearch} from 'react-instantsearch-core';
import {useBreedSearch} from '../hooks/useBreedSearch';
import {useTheme} from '../dopebase';

type SearchType = 'breed' | 'breeder' | 'listing';
type SelectionType = 'breedGroup' | 'traitGroups' | 'traits';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  type: SearchType;
}

interface Selections {
  breedGroup?: string;
  traitGroups: string[];
  traits: string[];
}

interface TraitGroup {
  name: string;
  traits: Array<{name: string}>;
}

interface TraitGroupSectionProps {
  group: TraitGroup;
  groupTraits: any;
  isSelected: (value: string, type: SelectionType) => boolean;
  onToggleSelection: (value: string, type: SelectionType) => void;
}

const initialSelections: Selections = {
  breedGroup: undefined,
  traitGroups: [],
  traits: [],
};

const TraitGroupSection = memo(
  ({
    group,
    groupTraits,
    isSelected,
    onToggleSelection,
  }: TraitGroupSectionProps) => {
    if (groupTraits.length === 0) return null;

    return (
      <YStack gap='$2'>
        <XStack alignItems='center' gap='$2'>
          <Label>{group.name}</Label>
        </XStack>

        <YStack pl='$4' gap='$2'>
          {groupTraits.map((trait) => (
            <XStack key={trait.label} gap='$2' alignItems='center'>
              <Checkbox
                checked={isSelected(trait.value, 'traits')}
                onCheckedChange={() => onToggleSelection(trait.value, 'traits')}
              >
                <Checkbox.Indicator />
              </Checkbox>
              <Text>{trait.label}</Text>
            </XStack>
          ))}
        </YStack>
      </YStack>
    );
  }
);

export function FilterSheet({open, onClose, type}: FilterSheetProps) {
  const {traitGroups} = useBreedSearch();
  const {status} = useInstantSearch();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  // Get all available options from refinement lists
  const breedGroupItems = useRefinementList({
    attribute: 'breedGroup',
    limit: 50,
    sortBy: ['count:desc'],
    operator: 'and',
  });

  const traitGroupItems = useRefinementList({
    attribute: 'traits.name',
    limit: 50,
    sortBy: ['count:desc'],
    operator: 'and',
  });

  const traitItems = useRefinementList({
    attribute: 'traits.traits.name',
    limit: 50,
    sortBy: ['count:desc'],
    operator: 'and',
  });

  // Store initial options on mount
  const [initialOptions] = useState({
    breedGroups: breedGroupItems.items,
    traits: traitItems.items,
  });

  // Track temporary selections
  const [tempSelections, setTempSelections] = useState<Selections>(() => ({
    breedGroup: breedGroupItems.items.find((item) => item.isRefined)?.value,
    traitGroups: [],
    traits: traitItems.items
      .filter((item) => item.isRefined)
      .map((item) => item.value),
  }));

  // Reset selections when sheet opens
  useEffect(() => {
    if (open) {
      setTempSelections({
        breedGroup: breedGroupItems.items.find((item) => item.isRefined)?.value,
        traitGroups: [],
        traits: traitItems.items
          .filter((item) => item.isRefined)
          .map((item) => item.value),
      });
    }
  }, [open]);

  const toggleSelection = useCallback((value: string, type: SelectionType) => {
    setTempSelections((prev) => {
      if (type === 'breedGroup') {
        return {
          ...prev,
          breedGroup: value === prev.breedGroup ? undefined : value,
        };
      }

      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {...prev, [type]: updated};
    });
  }, []);

  const isSelected = useCallback(
    (value: string, type: SelectionType): boolean => {
      if (type === 'breedGroup') {
        return tempSelections.breedGroup === value;
      }
      return tempSelections[type].includes(value);
    },
    [tempSelections]
  );

  const applyFilters = useCallback(() => {
    // Clear all existing refinements first
    breedGroupItems.items.forEach((item) => {
      if (item.isRefined) {
        breedGroupItems.refine(item.value);
      }
    });

    traitItems.items.forEach((item) => {
      if (item.isRefined) {
        traitItems.refine(item.value);
      }
    });

    // Then apply new selections
    if (tempSelections.breedGroup) {
      breedGroupItems.refine(tempSelections.breedGroup);
    }

    tempSelections.traits.forEach((trait) => {
      traitItems.refine(trait);
    });

    onClose();
  }, [tempSelections, breedGroupItems, traitItems, onClose]);

  const clearAll = useCallback(() => {
    onClose();
    setTempSelections(initialSelections);

    breedGroupItems.items.forEach((item) => {
      if (item.isRefined) {
        breedGroupItems.refine(item.value);
      }
    });

    traitItems.items.forEach((item) => {
      if (item.isRefined) {
        traitItems.refine(item.value);
      }
    });
  }, [breedGroupItems, traitItems, onClose]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) onClose();
    },
    [onClose]
  );

  const isLoading = status === 'loading' || status === 'stalled';

  const renderBreedGroups = () => (
    <YStack gap='$2'>
      <Label>Breed Group</Label>
      <RadioGroup
        value={tempSelections.breedGroup}
        onValueChange={(value) => toggleSelection(value, 'breedGroup')}
      >
        <YStack gap='$2'>
          {initialOptions.breedGroups.map((item) => (
            <XStack key={item.label} gap='$2' alignItems='center'>
              <RadioGroup.Item value={item.value}>
                <RadioGroup.Indicator
                  backgroundColor={colorSet.primaryForeground}
                />
              </RadioGroup.Item>
              <Text textTransform='capitalize'>{item.label} group</Text>
            </XStack>
          ))}
        </YStack>
      </RadioGroup>
    </YStack>
  );

  const renderTraitGroups = () => (
    <>
      {traitGroups.map((group) => {
        const groupTraits = initialOptions.traits.filter((t) =>
          group.traits.some((gt) => gt.name === t.label)
        );

        if (groupTraits.length === 0) return null;

        return (
          <TraitGroupSection
            key={group.name}
            group={group}
            groupTraits={groupTraits}
            isSelected={isSelected}
            onToggleSelection={toggleSelection}
          />
        );
      })}
    </>
  );

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={handleOpenChange}
      snapPoints={[85]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame>
        <YStack f={1}>
          <YStack
            padding='$4'
            borderBottomColor='$gray5'
            borderBottomWidth={1}
            backgroundColor='$background'
          >
            <Sheet.Handle theme='active' />
            <H4 paddingTop='$2'>Filter {type}s</H4>
            <Text color='$gray11' paddingTop='$2' fontSize='$2'>
              Select options to narrow down your search results
            </Text>
          </YStack>

          <ScrollView>
            <YStack padding='$4' gap='$4'>
              {renderBreedGroups()}
              {renderTraitGroups()}
            </YStack>
          </ScrollView>

          <YStack
            padding='$4'
            borderTopColor='$gray5'
            borderTopWidth={1}
            backgroundColor='$background'
          >
            <XStack gap='$2'>
              <Button
                size='$4'
                theme='gray'
                onPress={clearAll}
                flex={1}
                disabled={isLoading}
                icon={isLoading ? <Spinner size='small' /> : undefined}
              >
                Clear All
              </Button>
              <Button
                size='$4'
                theme='active'
                onPress={applyFilters}
                flex={1}
                disabled={isLoading}
                icon={isLoading ? <Spinner size='small' /> : undefined}
              >
                Apply Filters
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
