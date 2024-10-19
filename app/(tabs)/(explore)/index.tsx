import React, {useState, useEffect} from 'react';
import {FlatList, ScrollView} from 'react-native';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Href, useNavigation, useRouter} from 'expo-router';
import {
  Text,
  View,
  XStack,
  Button,
  YStack,
  Input,
  Card,
  Spinner,
  Popover,
  Image,
} from 'tamagui';
import {LinearGradient} from 'tamagui/linear-gradient';

import {ListFilter, ArrowRight, ChevronDown} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {useDispatch} from 'react-redux';
import {SortPopover} from './sort';
import {BreedFilterSheet} from './filter';

export default function ExploreScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    searchText,
    filteredBreeds,
    traitPreferences,
    updateFilter,
    loading: breedsLoading,
    sortOption,
    page,
    hasMore,
    loadMoreBreeds,
  } = useBreedSearch();

  useEffect(() => {
    if (searchText) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300); // Adjust this delay to match your debounce time in useBreedSearch
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchText]);

  const CardItem = ({breed}) => (
    <Card
      bordered
      flex={1}
      margin={5}
      onPress={() =>
        router.push(
          `(explore)/${breed.name.toLowerCase().replace(/\s+/g, '-')}` as Href
        )
      }
      pressTheme
      overflow='hidden'
    >
      <Card.Background>
        <Image
          source={{uri: breed.image || ''}}
          width='100%'
          height='100%'
          objectFit='cover'
        />
        <LinearGradient
          start={[0, 0]}
          end={[0, 1]}
          fullscreen
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
          zIndex={1}
        />
      </Card.Background>

      <Card.Header padded zIndex={2}>
        <Text
          color={colorSet.primaryBackground}
          fontSize={24}
          fontWeight='bold'
        >
          {breed.name}
        </Text>
      </Card.Header>

      <Card.Footer padded zIndex={2}>
        <XStack flex={1} />
        <Button
          borderRadius='$10'
          icon={<ArrowRight size='$2' color={colorSet.primaryBackground} />}
          chromeless
        />
      </Card.Footer>
    </Card>
  );

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2'>
          <Input
            flex={1}
            color={colorSet.secondaryText}
            value={searchText}
            onChangeText={(text) => updateFilter('searchText', text)}
            placeholder={localized('Search by breed')}
          />

          <Button
            size='$4'
            icon={<ListFilter size='$1' />}
            onPress={() => setFilterSheetOpen(true)}
          ></Button>
          {Object.keys(traitPreferences).some(
            (key) => traitPreferences[key] !== null
          ) && (
            <View
              position='absolute'
              margin={0}
              padding={0}
              top={0}
              right={0}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={colorSet.secondaryForeground}
            />
          )}
        </XStack>

        <XStack justifyContent='flex-end' alignItems='center'>
          <Text fontSize='$4' color={colorSet.primaryForeground}>
            {filteredBreeds.length} Breeds
          </Text>
          <SortPopover sortOption={sortOption} />
        </XStack>

        {isSearching || breedsLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          >
            <Spinner size='large' color={colorSet.primaryForeground} />
          </View>
        ) : filteredBreeds.length === 0 ? (
          <Text>No breeds match your current filters.</Text>
        ) : (
          <FlatList
            data={filteredBreeds}
            renderItem={({item, index}) => (
              <XStack flex={1} key={index}>
                <CardItem breed={item} />
              </XStack>
            )}
            keyExtractor={(item) => item.name}
            numColumns={2}
            onEndReached={loadMoreBreeds}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() =>
              hasMore ? (
                <Spinner size='large' color={colorSet.primaryForeground} />
              ) : null
            }
          />
        )}
      </YStack>

      <BreedFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
      />
    </View>
  );
}
