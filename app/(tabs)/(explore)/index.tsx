import React, {useState, useEffect} from 'react';
import {FlatList, ScrollView} from 'react-native';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useNavigation, useRouter} from 'expo-router';
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
} from 'tamagui';
import {ListFilter, ArrowRight, ChevronDown} from '@tamagui/lucide-icons';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {useDispatch} from 'react-redux';
import {SortPopover} from './sort';
import {BreedFilterSheet} from './filter';

export default function ExploreScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useDispatch();

  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const {
    searchText,
    filteredBreeds,
    traitPreferences,
    updateFilter,
    loading: breedsLoading,
    sortOption,
  } = useBreedSearch();

  useEffect(() => {
    if (currentUser?.traitPreferences) {
      dispatch(updateFilter('traitPreferences', currentUser.traitPreferences));
    }
  }, [currentUser, dispatch]);

  const CardItem = ({breed}) => (
    <Card
      bordered
      flex={1}
      margin={5}
      onPress={() =>
        router.push(
          `(explore)/${breed.name.toLowerCase().replace(/\s+/g, '-')}`
        )
      }
      pressTheme
    >
      <Card.Header padded>
        <Text
          color={colorSet.primaryForeground}
          fontSize={24}
          fontWeight='bold'
        >
          {breed.name}
        </Text>
      </Card.Header>

      <Card.Footer padded>
        <XStack flex={1} />
        <Button
          borderRadius='$10'
          icon={<ArrowRight size='$2' color={colorSet.primaryForeground} />}
          chromeless
        ></Button>
      </Card.Footer>

      <Card.Background
        backgroundColor={colorSet.secondaryForeground}
        borderRadius={16}
      />
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

        <XStack justifyContent='space-between' alignItems='center'>
          <SortPopover sortOption={sortOption} />

          <Text fontSize='$4' color={colorSet.primaryForeground}>
            {
              Object.keys(traitPreferences).filter(
                (key) => traitPreferences[key] !== null
              ).length
            }{' '}
            Traits Filtered
          </Text>
        </XStack>

        {breedsLoading ? (
          <Spinner
            size='large'
            color={colorSet.primaryForeground}
            margin='auto'
          />
        ) : filteredBreeds.length === 0 ? (
          <Text>No breeds match your current filters.</Text>
        ) : (
          <ScrollView>
            <FlatList
              data={filteredBreeds}
              renderItem={({item, index}) => (
                <XStack flex={1} key={index}>
                  <CardItem breed={item} />
                </XStack>
              )}
              keyExtractor={(item) => item.name}
              numColumns={2}
              scrollEnabled={false}
            />
          </ScrollView>
        )}
      </YStack>

      <BreedFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
      />
    </View>
  );
}
