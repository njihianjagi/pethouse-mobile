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
  Sheet,
  H4,
  Select,
  Spinner,
  Checkbox,
  XGroup,
} from 'tamagui';
import {Dog, Users, ShoppingBag, Filter} from '@tamagui/lucide-icons';

import {useTheme} from '../../../dopebase';
import {Breed} from '../../../api/firebase/breeds/useBreedData';
import {Kennel} from '../../../api/firebase/kennels/useKennelData';

import {searchClient} from '../../../api/algoliasearch/client';
import BreedCard from './breeds/breed-card';
import BreederCard from './breeders/breeder-card';
import {BreederProfile} from '../../../api/firebase/users/userClient';

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
    <Input
      f={1}
      placeholder='Search...'
      value={query}
      onChangeText={refine}
      autoCapitalize='none'
      autoCorrect={false}
    />
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

function SearchResults() {
  const {items, isLastPage, showMore, sendEvent} = useInfiniteHits<SearchHit>();

  console.log('items', items);
  const renderHit = ({item}: {item: SearchHit}) => {
    switch (item.type) {
      case 'breed':
        return <BreedCard breed={item as BreedHit} index={0} />;
      case 'kennel':
        return <BreederCard breeder={item as KennelHit} index={0} />;
      default:
        return null;
    }
  };

  return (
    <FlatList
      data={items}
      renderItem={renderHit}
      keyExtractor={(item) => item.objectID}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{gap: 10}}
      onEndReached={() => !isLastPage && showMore()}
      onEndReachedThreshold={0.5}
    />
  );
}

function SearchLoader({
  children,
  onLoadingChange,
}: {
  children: React.ReactNode;
  onLoadingChange: (isLoading: boolean) => void;
}) {
  const {status} = useInstantSearch();
  const isLoading = status === 'loading' || status === 'stalled';
  console.log(isLoading);
  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  return <>{children}</>;
}

export default function ExploreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [searchType, setSearchType] = useState<SearchType>('breed');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);

  // Effect to handle loading state when searchType changes
  useEffect(() => {
    setIsLoading(true);
    // Simulate async operation
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [searchType]);

  return (
    <YStack f={1} padding='$4' gap='$4'>
      <InstantSearch
        searchClient={searchClient}
        indexName={`${searchType}s`}
        stalledSearchDelay={500} // Show loading after 500ms of stalled search
      >
        {/* <Configure
          hitsPerPage={20}
          distinct={true}
          filters={`type:${searchType}`}
        /> */}

        {/* Search Bar with Type Toggle */}
        <XGroup gap='$2' alignItems='center'>
          <XGroup.Item>
            <Button
              theme='active'
              icon={<Filter />}
              onPress={() => setFilterSheetOpen(true)}
            />
          </XGroup.Item>
          <XGroup.Item>
            <CustomSearchBox />
          </XGroup.Item>
        </XGroup>

        {/* Search Type Toggle */}
        <XStack gap='$2'>
          <Button
            theme={searchType === 'breed' ? 'active' : 'gray'}
            onPress={() => setSearchType('breed')}
            icon={<Dog />}
          >
            Breeds
          </Button>
          <Button
            theme={searchType === 'breeder' ? 'active' : 'gray'}
            onPress={() => setSearchType('breeder')}
            icon={<Users />}
          >
            Breeders
          </Button>
          <Button
            theme={searchType === 'listing' ? 'active' : 'gray'}
            onPress={() => setSearchType('listing')}
            icon={<ShoppingBag />}
          >
            Listings
          </Button>
        </XStack>

        <SearchLoader onLoadingChange={setIsLoading}>
          {/* Existing UI components */}
          {isLoading && <Spinner />}
          {!isLoading && <SearchResults />}
        </SearchLoader>

        {/* Filter Sheet */}
        <FilterSheet
          isOpen={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          type={searchType}
        />
      </InstantSearch>
    </YStack>
  );
}
