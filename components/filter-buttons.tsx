import {X, Filter} from '@tamagui/lucide-icons';
import {memo, useCallback} from 'react';
import {useRefinementList} from 'react-instantsearch-core';
import {XStack, ScrollView, Button, Text} from 'tamagui';

interface FilterButtonsProps {
  setFilterSheetOpen: (open: boolean) => void;
}

// Filter Buttons Component
export const FilterButtons = memo(function FilterButtons({
  setFilterSheetOpen,
}: FilterButtonsProps) {
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

  const selectedItems = [
    ...(breedGroupItems.items || [])
      .filter((item) => item.isRefined)
      .map((item) => ({
        ...item,
        attributeType: 'breedGroup' as const,
        refine: () => breedGroupItems.refine(item.value),
      })),
    ...(traitGroupItems.items || [])
      .filter((item) => item.isRefined)
      .map((item) => ({
        ...item,
        attributeType: 'trait_group' as const,
        refine: () => traitGroupItems.refine(item.value),
      })),
    ...(traitItems.items || [])
      .filter((item) => item.isRefined)
      .map((item) => ({
        ...item,
        attributeType: 'trait' as const,
        refine: () => traitItems.refine(item.value),
      })),
  ];

  const handleFilterPress = useCallback(() => {
    setFilterSheetOpen(true);
  }, [setFilterSheetOpen]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap='$2' paddingRight='$4'>
        <Button
          icon={<Filter size={16} />}
          onPress={handleFilterPress}
          theme='gray'
          size='$3'
        >
          Filters
        </Button>

        {selectedItems.map((item) => (
          <Button
            key={`${item.attributeType}-${item.label}`}
            onPress={item.refine}
            theme='active'
            size='$3'
            iconAfter={<X size={14} />}
          >
            <Text textTransform='capitalize'>{item.label}</Text>
          </Button>
        ))}
      </XStack>
    </ScrollView>
  );
});
