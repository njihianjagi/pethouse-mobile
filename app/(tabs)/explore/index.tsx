import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {
  InstantSearch,
  useSearchBox,
  useInfiniteHits,
  useRefinementList,
  Configure,
  useInstantSearch,
} from 'react-instantsearch-core';
import {useRouter} from 'expo-router';
import {
  Text,
  YStack,
  XStack,
  Button,
  Input,
  H4,
  Spinner,
  Checkbox,
  XGroup,
  Sheet,
  View,
  ScrollView,
  H5,
  Label,
  RadioGroup,
} from 'tamagui';
import {
  Dog,
  Users,
  ShoppingBag,
  Settings2,
  Search,
  ChevronDown,
  Filter,
  X,
} from '@tamagui/lucide-icons';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from '../../../dopebase';
import {Breed} from '../../../api/firebase/breeds/useBreedData';

import {searchClient} from '../../../api/algoliasearch/client';
import {BreederProfile} from '../../../api/firebase/users/userClient';
import BreedCard from '../../../components/breed-card';
import {SortSheet} from '../../../components/sort-sheet';
import {useBreedSearch} from '../../../hooks/useBreedSearch';

// Types for search hits
type BreedHit = Breed & {
  type: 'breed';
  objectID: string;
};

type KennelHit = BreederProfile & {
  type: 'kennel';
  objectID: string;
};

type ListingHit = {
  type: 'listing';
  objectID: string;
  // Add other listing fields
};

type SearchHit = BreedHit | KennelHit | ListingHit;

type SearchType = 'breed' | 'breeder' | 'listing';

// Custom SearchBox component using Tamagui Input
function CustomSearchBox() {
  const {query, refine} = useSearchBox();

  return (
    <XGroup>
      <XGroup.Item>
        <Button
          chromeless
          icon={<Search size='$1' />}
          pr='0'
          pl='$3'
          theme='active'
          themeShallow
          backgroundColor='$gray2'
          borderColor='$gray3'
          borderRightWidth={0}
          color='$gray10'
        />
      </XGroup.Item>
      <XGroup.Item>
        <Input
          f={1}
          placeholder='Search...'
          value={query}
          onChangeText={refine}
          autoCapitalize='none'
          autoCorrect={false}
          autoFocus={false}
          borderLeftWidth={0}
        />
      </XGroup.Item>
    </XGroup>
  );
}

// Filter Sheet Component
function FilterSheet({
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
            <Sheet.Handle />
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

// Filter Buttons Component
function FilterButtons({
  setFilterSheetOpen,
}: {
  setFilterSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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

  // Get only the refined (selected) items
  const selectedItems = [
    ...(breedGroupItems.items || [])
      .filter((item) => item.isRefined)
      .map((item) => ({
        ...item,
        attributeType: 'breedGroup',
        refine: () => breedGroupItems.refine(item.value),
      })),
    ...(traitGroupItems.items || [])
      .filter((item) => item.isRefined)
      .map((item) => ({
        ...item,
        attributeType: 'trait_group',
        refine: () => traitGroupItems.refine(item.value),
      })),
    ...(traitItems.items || [])
      .filter((item) => item.isRefined)
      .map((item) => ({
        ...item,
        attributeType: 'trait',
        refine: () => traitItems.refine(item.value),
      })),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap='$2' paddingRight='$4'>
        <Button
          icon={<Filter size={16} />}
          onPress={() => setFilterSheetOpen(true)}
          theme='gray'
          size='$3'
        >
          Filters
        </Button>

        {selectedItems.map((item) => (
          <Button
            key={`${item.attributeType}-${item.label}`}
            onPress={() => item.refine()}
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
}

function SearchResults() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {items, isFirstPage, isLastPage, showMore, sendEvent} =
    useInfiniteHits<SearchHit>();

  const renderHit = ({item}: {item: SearchHit}) => {
    return <BreedCard breed={item as BreedHit} index={0} />;
  };

  const {status} = useInstantSearch();

  if ((status === 'loading' || status === 'stalled') && isFirstPage) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Spinner size='large' color={colorSet.primaryForeground} />
      </View>
    );
  } else {
    return (
      <FlatList
        data={items}
        numColumns={2}
        renderItem={renderHit}
        keyExtractor={(item) => item.objectID}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{gap: 10}}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!isLastPage) {
            showMore();
          }
        }}
        ListFooterComponent={() =>
          !isLastPage && (status === 'loading' || status === 'stalled') ? (
            <Spinner size='small' color={colorSet.primaryForeground} />
          ) : null
        }
      />
    );
  }
}

// Results Info Component
function ResultsInfo({onSortPress}: {onSortPress: any}) {
  const {results} = useInstantSearch();
  const {items} = useInfiniteHits<SearchHit>();
  const totalHits = results?.nbHits ?? 0;

  return (
    <XStack justifyContent='space-between' alignItems='center'>
      <Text color='$gray11' fontSize='$2'>
        Showing {items?.length ?? 0} of {totalHits} results
      </Text>
      <Button
        chromeless
        iconAfter={<MaterialCommunityIcons name='sort' size={16} />}
        onPress={onSortPress}
        theme='gray'
      >
        <Text fontSize='$2'>Sort</Text>
      </Button>
    </XStack>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>('breed');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <YStack f={1} padding='$4' gap='$4'>
      <InstantSearch
        searchClient={searchClient}
        indexName={`${searchType}s`}
        stalledSearchDelay={500}
        initialUiState={{search: {hitsPerPage: 20}}}
      >
        {/* Search Type Toggle */}
        {/* <SearchTypeToggle
          searchType={searchType}
          setSearchType={setSearchType}
        /> */}

        <YStack gap='$2'>
          {/* <XGroup alignItems='center' gap='$2'>
            <XGroup.Item>
            
            </XGroup.Item>
            <XGroup.Item>
              <Button
                theme='active'
                icon={<Settings2 size='$1' />}
                onPress={() => setFilterSheetOpen(true)}
              />
            </XGroup.Item>
          </XGroup> */}

          <CustomSearchBox />
          {/* Horizontal Filter Buttons */}
          <FilterButtons setFilterSheetOpen={setFilterSheetOpen} />

          <ResultsInfo onSortPress={setSortSheetOpen} />
        </YStack>

        <SearchResults />

        {/* Filter Sheet */}
        <FilterSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          type={searchType}
        />

        {/* Sort Sheet */}
        <SortSheet
          open={sortSheetOpen}
          onOpenChange={setSortSheetOpen}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <Configure
          hitsPerPage={20}
          facets={['breedGroup', 'traits.name']}
          // sortBy={sortBy === 'relevance' ? undefined : [sortBy]}
        />
      </InstantSearch>
    </YStack>
  );
}
