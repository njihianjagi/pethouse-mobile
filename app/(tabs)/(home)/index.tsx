import React, {useState, useEffect} from 'react';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Href, useRouter} from 'expo-router';
import {
  Card,
  H3,
  ListItem,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
import {ArrowRight, MapPin} from '@tamagui/lucide-icons';
import {useListingData} from '../../../api/firebase/listings/useListingData';
import {RecommendedBreeds} from '../explore/breeds/recommended-breeds';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {EmptyStateCard} from '../../../components/EmptyStateCard';
import {TraitSelector} from '../../../components/TraitSelector';

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {
    filteredBreeds,
    updateFilter,
    loading: breedsLoading,
    traitGroups,
    traitPreferences,
  } = useBreedSearch();

  const {listings, loading: listingsLoading} = useListingData();
  const [isTraitSelectorOpen, setIsTraitSelectorOpen] = useState(false);
  const [userPreferencesSet, setUserPreferencesSet] = useState(false);

  const PetCard = ({listing}) => (
    <Card
      bordered
      elevate
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/(listings)/${listing.id}` as Href)}
    >
      <Card.Header padded>
        <ListItem
          title={listing.name}
          subTitle={
            <XStack gap='$2' alignItems='center'>
              <MapPin size={16} color={colorSet.primaryForeground} />
              <Text fontSize='$2' color={colorSet.primaryForeground}>
                {listing.location}
              </Text>
            </XStack>
          }
        />
      </Card.Header>
      <Card.Footer padded>
        <Text fontSize='$2'>{listing.breed}</Text>
        <Text fontSize='$2'>{listing.age}</Text>
      </Card.Footer>
    </Card>
  );

  const LitterCard = ({litter}) => (
    <Card
      bordered
      elevate
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/(litters)/${litter.id}` as Href)}
    >
      <Card.Header padded>
        <H3>{litter.breed}</H3>
        <Text>{`Expected: ${litter.expectedDate}`}</Text>
      </Card.Header>
      <Card.Footer padded>
        <Text fontSize='$2'>{`Puppies: ${litter.puppyCount}`}</Text>
      </Card.Footer>
    </Card>
  );

  useEffect(() => {
    if (currentUser?.traitPreferences) {
      const userPreferencesSet =
        currentUser.traitPreferences &&
        Object.keys(currentUser.traitPreferences).length > 0;

      setUserPreferencesSet(userPreferencesSet);
      updateFilter('traitPreferences', currentUser.traitPreferences);
    }
  }, [currentUser?.id]);

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <ScrollView
        style={{flex: 1, backgroundColor: colorSet.primaryBackground}}
      >
        <YStack padding='$4' gap='$4'>
          <XStack gap='$2' alignItems='center'>
            <MapPin color={colorSet.primaryForeground} />
            <Text>
              {currentUser?.location?.latitude},{' '}
              {currentUser?.location?.longitude}
            </Text>
          </XStack>

          {currentUser?.role === 'seeker' && (
            <YStack gap='$4'>
              <EmptyStateCard
                title={
                  userPreferencesSet
                    ? localized('Find Your Next Pet')
                    : localized('Find Your Perfect Match')
                }
                description={
                  userPreferencesSet
                    ? "Let breeders know what you're looking for in your next furry friend"
                    : 'Discover your ideal furry companion based on your lifestyle and preferences'
                }
                buttonText={
                  userPreferencesSet
                    ? localized('Create Listing')
                    : localized(' Get Started')
                }
                onPress={
                  userPreferencesSet
                    ? () => router.push('/(listings)/(create)/wanted')
                    : () => setIsTraitSelectorOpen(true)
                }
                buttonIcon={<ArrowRight color='$gray9' size='$1' />}
                backgroundImage={
                  userPreferencesSet
                    ? require('../../../assets/images/hero_2.png')
                    : require('../../../assets/images/hero.jpg')
                }
                backgroundColor={colorSet.secondaryForeground}
                color={colorSet.foregroundContrast}
              />
            </YStack>
          )}

          {/* <MatchingBreeders userBreeds={currentUser.userBreeds} /> */}

          {/* <YStack gap='$4'>
          <XStack justifyContent='space-between' alignItems='center'>
            <H3 fontWeight='bold'>{localized('Latest Pet Listings')}</H3>
            <Button onPress={() => router.push('/(listings)')}>
              {localized('See All')}
            </Button>
          </XStack>
          {listingsLoading ? (
            <Spinner />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap='$2'>
                {listings.slice(0, 5).map((listing) => (
                  <PetCard key={listing.id} listing={listing} />
                ))}
              </XStack>
            </ScrollView>
          )}
        </YStack>

        <YStack gap='$4'>
          <XStack justifyContent='space-between' alignItems='center'>
            <H3 fontWeight='bold'>{localized('Upcoming Litters')}</H3>
            <Button onPress={() => router.push('/(litters)')}>
              {localized('See All')}
            </Button>
          </XStack>
          {littersLoading ? (
            <Spinner />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap='$2'>
                {litters.slice(0, 5).map((litter) => (
                  <LitterCard key={litter.id} litter={litter} />
                ))}
              </XStack>
            </ScrollView>
          )}
        </YStack> */}
        </YStack>
      </ScrollView>

      <TraitSelector
        isOpen={isTraitSelectorOpen}
        onClose={() => setIsTraitSelectorOpen(false)}
        traitGroups={traitGroups}
        traitPreferences={traitPreferences}
        updateFilter={updateFilter}
      />
    </View>
  );
}
