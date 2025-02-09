import {useState, useEffect} from 'react';
import {useRefinementList, useInstantSearch} from 'react-instantsearch-core';
import {
  ScrollView,
  Button,
  Sheet,
  YStack,
  H4,
  Label,
  RadioGroup,
  XStack,
  Checkbox,
  Spinner,
  Text,
} from 'tamagui';
import {useBreedSearch} from '../hooks/useBreedSearch';

type SearchType = 'breed' | 'breeder' | 'listing';

// Filter Sheet Component
export default function FilterSheet2({
  open,
  onClose,
  type,
}: {
  open: boolean;
  onClose: () => void;
  type: SearchType;
}) {
  const {traitGroups} = useBreedSearch();

  const breedGroupItems = useRefinementList({
    attribute: 'breedGroup',
    limit: 50,
    sortBy: ['count:desc'],
  });

  const traitGroupItems = useRefinementList({
    attribute: 'traits.name',
    limit: 50,
    sortBy: ['count:desc'],
  });

  const traitItems = useRefinementList({
    attribute: 'traits.traits.name',
    limit: 50,
    sortBy: ['count:desc'],
  });

  const {status} = useInstantSearch();
  // Track temporary selections
  const [tempSelections, setTempSelections] = useState<{
    breedGroup?: string;
    traitGroups: string[];
    traits: string[];
  }>(() => ({
    breedGroup: breedGroupItems.items.find((item) => item.isRefined)?.value,
    traitGroups: traitGroupItems.items
      .filter((item) => item.isRefined)
      .map((item) => item.value),
    traits: traitItems.items
      .filter((item) => item.isRefined)
      .map((item) => item.value),
  }));

  // Update temp selections when sheet opens
  useEffect(() => {
    if (open) {
      setTempSelections({
        breedGroup: breedGroupItems.items.find((item) => item.isRefined)?.value,
        traitGroups: traitGroupItems.items
          .filter((item) => item.isRefined)
          .map((item) => item.value),
        traits: traitItems.items
          .filter((item) => item.isRefined)
          .map((item) => item.value),
      });
    }
  }, [open]);

  const toggleSelection = (
    value: string,
    type: 'breedGroup' | 'traitGroups' | 'traits'
  ) => {
    setTempSelections((prev) => {
      if (type === 'breedGroup') {
        // For breed groups, just set the single value
        return {
          ...prev,
          breedGroup: value === prev.breedGroup ? undefined : value,
        };
      }

      // For other types, toggle in array
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {...prev, [type]: updated};
    });
  };

  const isSelected = (
    value: string,
    type: 'breedGroup' | 'traitGroups' | 'traits'
  ) => {
    if (type === 'breedGroup') {
      return tempSelections.breedGroup === value;
    }
    return tempSelections[type].includes(value);
  };

  // const removeSelection = (
  //   value: string,
  //   type: 'breedGroup' | 'traitGroups' | 'traits'
  // ) => {
  //   setTempSelections((prev) => {
  //     if (type === 'breedGroup') {
  //       return {...prev, breedGroup: undefined};
  //     }
  //     return {
  //       ...prev,
  //       [type]: prev[type].filter((v) => v !== value),
  //     };
  //   });
  // };

  const applyFilters = () => {
    // Apply breed group filter
    breedGroupItems.items.forEach((item) => {
      const shouldBeRefined = tempSelections.breedGroup === item.value;
      if (shouldBeRefined !== item.isRefined) {
        breedGroupItems.refine(item.value);
      }
    });

    // Apply trait filters
    traitItems.items.forEach((item) => {
      const shouldBeRefined = tempSelections.traits.includes(item.value);
      if (shouldBeRefined !== item.isRefined) {
        traitItems.refine(item.value);
      }
    });

    onClose();
  };

  const clearAll = () => {
    setTempSelections({
      breedGroup: undefined,
      traitGroups: [],
      traits: [],
    });
  };

  // Get selected items for display
  const selectedBreedGroup = breedGroupItems.items.find(
    (item) => item.value === tempSelections.breedGroup
  );
  const selectedTraits = traitItems.items.filter((item) =>
    tempSelections.traits.includes(item.value)
  );

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      snapPoints={[85]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame>
        <YStack f={1}>
          {/* Fixed Header */}
          <YStack
            padding='$4'
            borderBottomColor='$gray5'
            borderBottomWidth={1}
            backgroundColor='$background'
          >
            <Sheet.Handle theme='active' />
            <H4 paddingTop='$2'>Filter {type}s</H4>

            {/* Current Refinements */}
            {/* {(selectedBreedGroup || selectedTraits.length > 0) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                marginTop='$2'
              >
                <XStack gap='$2' paddingVertical='$2'>
                  {selectedBreedGroup && (
                    <Button
                      size='$3'
                      theme='active'
                      backgroundColor='$blue10'
                      onPress={() =>
                        removeSelection(selectedBreedGroup.value, 'breedGroup')
                      }
                      iconAfter={<X size={14} />}
                    >
                      <Text textTransform='capitalize'>
                        {selectedBreedGroup.label}
                      </Text>
                    </Button>
                  )}
                  {selectedTraits.map((trait) => (
                    <Button
                      key={trait.value}
                      size='$3'
                      theme='active'
                      backgroundColor='$blue10'
                      onPress={() => removeSelection(trait.value, 'traits')}
                      iconAfter={<X size={14} />}
                    >
                      <Text>{trait.label}</Text>
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            )} */}
          </YStack>

          {/* Scrollable Content */}
          <ScrollView>
            <YStack padding='$4' gap='$4'>
              <YStack gap='$2'>
                <Label>Breed Group</Label>
                <RadioGroup
                  value={tempSelections.breedGroup}
                  onValueChange={(value) =>
                    toggleSelection(value, 'breedGroup')
                  }
                >
                  <YStack gap='$2'>
                    {breedGroupItems.items.map((item) => (
                      <XStack key={item.label} space alignItems='center'>
                        <RadioGroup.Item value={item.value}>
                          <RadioGroup.Indicator />
                        </RadioGroup.Item>
                        <Text textTransform='capitalize'>
                          {item.label} group
                        </Text>
                        <Text>({item.count})</Text>
                      </XStack>
                    ))}
                  </YStack>
                </RadioGroup>
              </YStack>

              {traitGroups.map((group) => {
                const groupItem = traitGroupItems.items.find(
                  (t) => t.label === group.name
                );
                const groupTraits = traitItems.items.filter((t) =>
                  group.traits.some((gt) => gt.name === t.label)
                );

                if (groupTraits.length === 0) return null;

                return (
                  <YStack key={group.name} gap='$2'>
                    <XStack alignItems='center' gap='$2'>
                      <Label>{group.name}</Label>
                      <Text>({groupItem?.count || 0})</Text>
                    </XStack>

                    <YStack pl='$4' gap='$2'>
                      {groupTraits.map((trait) => (
                        <XStack key={trait.label} gap='$2' alignItems='center'>
                          <Checkbox
                            checked={isSelected(trait.value, 'traits')}
                            onCheckedChange={() =>
                              toggleSelection(trait.value, 'traits')
                            }
                          >
                            <Checkbox.Indicator />
                          </Checkbox>
                          <Text>{trait.label}</Text>
                          <Text>({trait.count})</Text>
                        </XStack>
                      ))}
                    </YStack>
                  </YStack>
                );
              })}
            </YStack>
          </ScrollView>

          {/* Fixed Footer */}
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
                disabled={status === 'loading' || status === 'stalled'}
              >
                Clear All
              </Button>
              <Button
                size='$4'
                theme='active'
                onPress={applyFilters}
                flex={1}
                disabled={status === 'loading' || status === 'stalled'}
                icon={
                  status === 'loading' || status === 'stalled' ? (
                    <Spinner size='small' />
                  ) : undefined
                }
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
