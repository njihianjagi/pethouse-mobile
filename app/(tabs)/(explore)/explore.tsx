import React, {useLayoutEffect, useCallback, useState} from 'react';
import {FlatList, ScrollView} from 'react-native';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useNavigation, useRouter} from 'expo-router';
import {Text, View, XStack, Button, YStack, Input, Card} from 'tamagui';
import {MapPin, ListFilter, ArrowRight, LogOut} from '@tamagui/lucide-icons';
import {logout} from '../../../api/firebase/auth/authClient';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {BreedFilterSheet} from './filter';

export default function ExploreScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {
    searchText,
    handleSearchChange,
    filteredBreeds,
    loading: breedsLoading,
  } = useBreedSearch();

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: localized('Explore Breeds'),
      headerRight: () => (
        <Button
          onPress={onLogout}
          chromeless
          icon={<LogOut size='$1' />}
          color={colorSet.primaryForeground}
          size='$4'
        />
      ),
      headerStyle: {
        backgroundColor: colorSet.primaryBackground,
        borderBottomColor: colorSet.hairline,
      },
      headerTintColor: colorSet.primaryText,
    });
  }, []);

  const onLogout = useCallback(() => {
    logout();
    router.push('/');
  }, []);

  const CardItem = ({breed}) => (
    <Card bordered flex={1} margin={5}>
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
            onChangeText={handleSearchChange}
            placeholder={localized('Search by breed')}
          />

          <Button
            size='$4'
            theme='active'
            icon={ListFilter}
            onPress={() => setFilterSheetOpen(true)}
          />
        </XStack>
        {/* 
        <XStack>
          <Text fontSize={24} fontWeight='bold'>
            Explore Breeds
          </Text>
        </XStack> */}

        {breedsLoading ? (
          <Text>Loading breeds...</Text>
        ) : (
          <ScrollView>
            <FlatList
              data={filteredBreeds}
              renderItem={({item, index}) => (
                <XStack flex={1}>
                  <CardItem breed={item} />
                  {index % 2 === 0 && index + 1 < filteredBreeds.length && (
                    <CardItem breed={filteredBreeds[index + 1]} />
                  )}
                </XStack>
              )}
              keyExtractor={(item) => item.name}
              numColumns={1}
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
