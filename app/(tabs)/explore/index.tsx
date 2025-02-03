import React, {useState, useEffect, useCallback} from 'react';
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
  SelectProps,
} from 'tamagui';
import {
  Dog,
  Users,
  ShoppingBag,
  Filter,
  Settings2,
  Search,
} from '@tamagui/lucide-icons';

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

// Sort Sheet Component
function SortSheet({
  isOpen,
  onClose,
  sortBy,
  onSortChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}) {
  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[40]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding='$4' space>
        <Sheet.Handle />
        <H4>Sort By</H4>
        <YStack space>
          <XStack space alignItems='center'>
            <Select value={sortBy} onValueChange={onSortChange}>
              <Select.Trigger width='100%' iconAfter={Settings2}>
                <Select.Value placeholder='Sort by...' />
              </Select.Trigger>

              <Select.Content>
                <Select.ScrollUpButton />
                <Select.Viewport>
                  <Select.Group>
                    <Select.Item index={0} value='relevance'>
                      <Select.ItemText>Relevance</Select.ItemText>
                    </Select.Item>
                    <Select.Item index={1} value='created_at:desc'>
                      <Select.ItemText>Newest</Select.ItemText>
                    </Select.Item>
                    <Select.Item index={2} value='created_at:asc'>
                      <Select.ItemText>Oldest</Select.ItemText>
                    </Select.Item>
                    <Select.Item index={3} value='name:asc'>
                      <Select.ItemText>Name A-Z</Select.ItemText>
                    </Select.Item>
                    <Select.Item index={4} value='name:desc'>
                      <Select.ItemText>Name Z-A</Select.ItemText>
                    </Select.Item>
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
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
          sortBy={sortBy}
          onSortChange={(value) => {
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
