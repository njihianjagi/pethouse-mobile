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
} from 'tamagui';
import {
  Dog,
  Users,
  ShoppingBag,
  Settings2,
  Search,
} from '@tamagui/lucide-icons';

import {useTheme} from '../../../dopebase';
import {Breed} from '../../../api/firebase/breeds/useBreedData';

import {searchClient} from '../../../api/algoliasearch/client';
import {BreederProfile} from '../../../api/firebase/users/userClient';
import BreedCard from '../../../components/breed-card';
import {SortPopover} from '../../../components/sort-popover';
import {SortSheet} from '../../../components/Sort-sheet';

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
          autoFocus
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
  const {items, refine} = useRefinementList({
    attribute: getFilterAttribute(type),
  });

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[60]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding='$4' space>
        <Sheet.Handle />
        <H4>Filter {type}s</H4>
        <YStack space>
          {items.map((item) => (
            <XStack key={item.label} space alignItems='center'>
              <Checkbox
                checked={item.isRefined}
                onCheckedChange={() => refine(item.value)}
              >
                <Checkbox.Indicator>
                  <Text>{item.label}</Text>
                </Checkbox.Indicator>
              </Checkbox>
              <Text>({item.count})</Text>
            </XStack>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

function getFilterAttribute(type: SearchType) {
  switch (type) {
    case 'breed':
      return 'breed_group';
    case 'breeder':
      return 'specialties';
    case 'listing':
      return 'category';
    default:
      return '';
  }
}

function SearchResults(isLoading) {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {items, isFirstPage, isLastPage, showMore, sendEvent} =
    useInfiniteHits<SearchHit>();

  const renderHit = ({item}: {item: SearchHit}) => {
    // switch (item.type) {
    //   case 'breed':
    return <BreedCard breed={item as BreedHit} index={0} />;
    //   case 'kennel':
    //     return <BreederCard breeder={item as KennelHit} index={0} />;
    //   default:
    //     return null;
    // }
  };

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

function SearchLoader({
  onLoadingChange,
}: {
  onLoadingChange: (isLoading: boolean) => void;
}) {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  const {status} = useInstantSearch();
  const isLoading = status === 'loading' || status === 'stalled';

  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  return <Spinner color={colorSet.primaryForeground} />;
}

// Results Info Component
function ResultsInfo({onSortPress}: {onSortPress: () => void}) {
  const {results} = useInstantSearch();
  const {items} = useInfiniteHits<SearchHit>();
  const totalHits = results?.nbHits ?? 0;

  return (
    <XStack justifyContent='space-between' alignItems='center'>
      <Text color='$gray11'>
        Showing {items?.length ?? 0} of {totalHits} results
      </Text>
      <Button
        chromeless
        icon={<Settings2 size='$1' />}
        onPress={onSortPress}
        theme='gray'
      >
        Sort
      </Button>
    </XStack>
  );
}

const SearchTypeToggle = ({
  searchType,
  setSearchType,
}: {
  searchType: SearchType;
  setSearchType: (searchType: SearchType) => void;
}) => {
  return (
    <XStack gap='$2'>
      <Button
        theme={searchType === 'breed' ? 'active' : 'gray'}
        onPress={() => setSearchType('breed')}
        icon={<Dog />}
        flex={1}
      >
        Breeds
      </Button>
      <Button
        theme={searchType === 'breeder' ? 'active' : 'gray'}
        onPress={() => setSearchType('breeder')}
        icon={<Users />}
        flex={1}
      >
        Breeders
      </Button>
      <Button
        theme={searchType === 'listing' ? 'active' : 'gray'}
        onPress={() => setSearchType('listing')}
        icon={<ShoppingBag />}
        flex={1}
      >
        Listings
      </Button>
    </XStack>
  );
};

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
        <SearchTypeToggle
          searchType={searchType}
          setSearchType={setSearchType}
        />

        <YStack gap='$2'>
          <XGroup alignItems='center' gap='$2'>
            <XGroup.Item>
              <CustomSearchBox />
            </XGroup.Item>

            <XGroup.Item>
              <Button
                theme='active'
                icon={<Settings2 size='$1' />}
                onPress={() => setFilterSheetOpen(true)}
              />
            </XGroup.Item>
          </XGroup>

          {/* Results Counter and Sort */}
          <ResultsInfo onSortPress={() => setSortSheetOpen(true)} />
        </YStack>

        {isLoading && <SearchLoader onLoadingChange={setIsLoading} />}
        <SearchResults isLoading={isLoading} />

        <FilterSheet
          isOpen={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          type={searchType}
        />

        <SortSheet
          isOpen={sortSheetOpen}
          onClose={() => setSortSheetOpen(false)}
          value={sortBy}
          onChange={(value) => {
            setSortBy(value);
            setSortSheetOpen(false);
          }}
        />

        <Configure
          hitsPerPage={20}
          // sortBy={sortBy === 'relevance' ? undefined : [sortBy]}
        />
      </InstantSearch>
    </YStack>
  );
}
