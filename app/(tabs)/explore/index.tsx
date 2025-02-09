import React, {useState, useCallback, memo, useMemo} from 'react';
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
  Spinner,
  XGroup,
  View,
  ScrollView,
} from 'tamagui';
import {Search, Filter, X} from '@tamagui/lucide-icons';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from '../../../dopebase';
import {Breed} from '../../../api/firebase/breeds/useBreedData';

import {searchClient} from '../../../api/algoliasearch/client';
import {BreederProfile} from '../../../api/firebase/users/userClient';
import BreedCard from '../../../components/breed-card';
import {SortSheet} from '../../../components/sort-sheet';
import {FilterSheet} from '../../../components/filter-sheet';
import {FilterButtons} from '../../../components/filter-buttons';
import FilterSheet2 from '../../../components/filter-sheet_2';

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

interface CustomSearchBoxProps {
  onSearch?: (query: string) => void;
}

// Custom SearchBox component using Tamagui Input
const CustomSearchBox = memo(function CustomSearchBox({
  onSearch,
}: CustomSearchBoxProps) {
  const {query, refine} = useSearchBox();

  const handleChange = useCallback(
    (text: string) => {
      refine(text);
      onSearch?.(text);
    },
    [refine, onSearch]
  );

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
          onChangeText={handleChange}
          autoCapitalize='none'
          autoCorrect={false}
          autoFocus={false}
          borderLeftWidth={0}
        />
      </XGroup.Item>
    </XGroup>
  );
});

interface SearchResultsProps {
  onEndReached?: () => void;
}

const LoadingSpinner = memo(function LoadingSpinner() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <View flex={1} justifyContent='center' alignItems='center'>
      <Spinner size='large' color={colorSet.primaryForeground} />
    </View>
  );
});

const ListFooterSpinner = memo(function ListFooterSpinner() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return <Spinner size='small' color={colorSet.primaryForeground} />;
});

const SearchResults = memo(function SearchResults({
  onEndReached,
}: SearchResultsProps) {
  const {items, isFirstPage, isLastPage, showMore} =
    useInfiniteHits<SearchHit>();
  const {status} = useInstantSearch();

  const renderHit = useCallback(({item}: {item: SearchHit}) => {
    return <BreedCard breed={item as BreedHit} index={0} />;
  }, []);

  const handleEndReached = useCallback(() => {
    if (!isLastPage) {
      showMore();
      onEndReached?.();
    }
  }, [isLastPage, showMore, onEndReached]);

  const isLoading = useMemo(
    () => (status === 'loading' || status === 'stalled') && isFirstPage,
    [status, isFirstPage]
  );

  console.log('isLoading', isLoading);

  const showFooterSpinner = useMemo(
    () => !isLastPage && (status === 'loading' || status === 'stalled'),
    [isLastPage, status]
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={items}
      numColumns={2}
      renderItem={renderHit}
      keyExtractor={(item) => item.objectID}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{gap: 10}}
      onEndReachedThreshold={0.8}
      onEndReached={handleEndReached}
      ListFooterComponent={showFooterSpinner ? <ListFooterSpinner /> : null}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
});

interface ResultsInfoProps {
  onSortPress: () => void;
}

const ResultsInfo = memo(function ResultsInfo({onSortPress}: ResultsInfoProps) {
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
});

export default function ExploreScreen() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>('breed');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const handleSortPress = useCallback(() => {
    setSortSheetOpen(true);
  }, []);

  const handleFilterClose = useCallback(() => {
    setFilterSheetOpen(false);
  }, []);

  const instantSearchProps = useMemo(
    () => ({
      searchClient,
      indexName: `${searchType}s`,
      stalledSearchDelay: 500,
      initialUiState: {search: {hitsPerPage: 20}},
      future: {
        preserveSharedStateOnUnmount: true,
      },
    }),
    [searchType]
  );

  const configureProps = useMemo(
    () => ({
      hitsPerPage: 20,
      facets: ['breedGroup', 'traits.name'],
    }),
    []
  );

  return (
    <InstantSearch {...instantSearchProps}>
      <YStack f={1} padding='$4' gap='$4'>
        <YStack gap='$2'>
          <CustomSearchBox />
          <FilterButtons setFilterSheetOpen={setFilterSheetOpen} />
          <ResultsInfo onSortPress={handleSortPress} />
        </YStack>

        <SearchResults />

        <FilterSheet2
          open={filterSheetOpen}
          onClose={handleFilterClose}
          type={searchType}
        />

        <SortSheet
          open={sortSheetOpen}
          onOpenChange={setSortSheetOpen}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <Configure {...configureProps} />
      </YStack>
    </InstantSearch>
  );
}
