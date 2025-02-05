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
} from 'tamagui';
import {
  Dog,
  Users,
  ShoppingBag,
  Settings2,
  Search,
  ChevronDown,
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
  isOpen,
  onClose,
  type,
}: {
  isOpen: boolean;
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

  const onFilterPress = (value: string, attributeType: string) => {
    switch (attributeType) {
      case 'breedGroup':
        breedGroupItems.refine(value);
        break;
      case 'trait_group':
        traitGroupItems.refine(value);
        break;
      case 'trait':
        traitItems.refine(value);
        break;
      default:
        break;
    }
  };

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding='$4' space>
        <Sheet.Handle />

        <ScrollView>
          <H4>Filter {type}s</H4>

          <YStack gap='$2'>
            <YStack gap='$2'>
              <Label>Breed Group</Label>

              {breedGroupItems.items.map((item) => (
                <XStack key={item.label} space alignItems='center'>
                  <Checkbox
                    checked={item.isRefined}
                    onCheckedChange={() =>
                      onFilterPress(item.value, 'breedGroup')
                    }
                  >
                    <Checkbox.Indicator />
                  </Checkbox>
                  <Text textTransform='capitalize'>{item.label} group</Text>

                  <Text>({item.count})</Text>
                </XStack>
              ))}
            </YStack>

            <YStack gap='$2'>
              {traitGroups.map((group) => {
                const groupItem: any = traitGroupItems.items.find(
                  (t) => t.label === group.name
                );
                const groupTraits = traitItems.items.filter((t) =>
                  group.traits.some((gt) => gt.name === t.label)
                );

                return (
                  <YStack key={group.name} gap='$2'>
                    <XStack alignItems='center' gap='$2'>
                      {/* <Checkbox
                        checked={groupItem?.isRefined}
                        onCheckedChange={() =>
                          traitGroupItems?.refine(groupItem.value)
                        }
                      >
                        <Checkbox.Indicator />
                      </Checkbox> */}
                      <Label>{group.name}</Label>

                      <Text>({groupItem?.count || 0})</Text>
                    </XStack>

                    <YStack pl='$4' gap='$2'>
                      {groupTraits.map((trait) => (
                        <XStack key={trait.label} gap='$2' alignItems='center'>
                          <Checkbox
                            checked={trait.isRefined}
                            onCheckedChange={() =>
                              traitItems.refine(trait.value)
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
              {/* {traitItems.items.map((item) => (
                <XStack key={item.label} space alignItems='center'>
                  <Checkbox
                    checked={item.isRefined}
                    onCheckedChange={() => onFilterPress(item.value, 'trait')}
                  >
                    <Checkbox.Indicator />
                  </Checkbox>
                  <Text>{item.label}</Text>

                  <Text>({item.count})</Text>
                </XStack>
              ))} */}
            </YStack>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

function getFilterAttribute(
  type: SearchType,
  attributeType?: 'breedGroup' | 'trait_group' | 'trait'
) {
  switch (type) {
    case 'breed':
      if (attributeType === 'breedGroup') return 'breedGroup';
      if (attributeType === 'trait_group') return 'traits.name';
      if (attributeType === 'trait') return 'traits.traits.name';
      return ['breed_group', 'traits.name', 'traits.traits.name'];
    case 'breeder':
      return 'specialties';
    case 'listing':
      return 'category';
    default:
      return '';
  }
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

  const allItems = [
    ...(breedGroupItems.items || []).map((item) => ({
      ...item,
      attributeType: 'breedGroup',
    })),
    ...(traitGroupItems.items || []).map((item) => ({
      ...item,
      attributeType: 'trait_group',
    })),
  ];

  const onFilterPress = (value: string, attributeType: string) => {
    switch (attributeType) {
      case 'breedGroup':
        console.log('breedGroup', value);
        breedGroupItems.refine(value);
        break;
      case 'trait_group':
        traitGroupItems.refine(value);
        break;
      default:
        break;
    }
  };

  // console.log('allItems', allItems);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap='$2' paddingRight='$4'>
        <Button
          key={33}
          onPress={() => setFilterSheetOpen(true)}
          theme='active'
          size='$3'
          icon={<MaterialCommunityIcons name='filter-variant' size={20} />}
        ></Button>

        {allItems.map((item) => (
          <Button
            key={`${item.attributeType}-${item.label}`}
            onPress={() => onFilterPress(item.value, item.attributeType)}
            theme={item.isRefined ? 'active' : 'gray'}
            backgroundColor={item.isRefined ? '$blue10' : '$gray2'}
            size='$3'
            // iconAfter={<ChevronDown />}
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
  const [hasInitialData, setHasInitialData] = React.useState(false);

  const {items, isFirstPage, isLastPage, showMore, sendEvent} =
    useInfiniteHits<SearchHit>();

  useEffect(() => {
    if (items.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [items, hasInitialData]);

  const {results} = useInstantSearch();
  // Add this debug log
  // useEffect(() => {
  //   if (results) {
  //     console.log('Algolia Results Metadata:', {
  //       facets: results.facets,
  //       // params: results.params,
  //       queryID: results.queryID,
  //     });
  //   }
  // }, [results]);

  const renderHit = ({item}: {item: SearchHit}) => {
    return <BreedCard breed={item as BreedHit} index={0} />;
  };

  const {status} = useInstantSearch();
  const isLoading = status === 'loading' || status === 'stalled';

  if (isLoading && !hasInitialData) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Spinner size='large' color={colorSet.primaryForeground} />
      </View>
    );
  }
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
        !isLastPage && isLoading ? (
          <Spinner size='small' color={colorSet.primaryForeground} />
        ) : null
      }
    />
  );
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
          isOpen={filterSheetOpen}
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
