import React, {useState, useEffect} from 'react';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Href, useRouter} from 'expo-router';
import {
  Button,
  Card,
  H3,
  ListItem,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
  Spinner,
  Tabs,
  Separator,
} from 'tamagui';
import {ArrowRight, Filter, MapPin, Plus, Search} from '@tamagui/lucide-icons';
import {useLitterData} from '../../../api/firebase/litters/useLitterData';
import {useListingData} from '../../../api/firebase/listings/useListingData';
import {BreedRecommendations} from '../../../components/BreedRecommendations';
import {useBreedSearch} from '../../../hooks/useBreedSearch';

const HomeScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [activeTab, setActiveTab] = useState('pets');

  const {
    filteredBreeds,
    updateFilter,
    loading: breedsLoading,
  } = useBreedSearch();
  const {listings, loading: listingsLoading} = useListingData();
  const {litters, loading: littersLoading} = useLitterData();

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

  const SeekerCTA = () => {
    return (
      <XStack gap='$4'>
        <Card bordered flex={1}>
          <Card.Header padded>
            <Text
              color={colorSet.primaryForeground}
              fontSize={24}
              fontWeight='bold'
            >
              Discover your new pet
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

        <Card
          bordered
          flex={1}
          pressTheme
          onPress={() => router.push('/(listings)/create')}
        >
          <Card.Header padded>
            <Text
              color={colorSet.secondaryForeground}
              fontSize={24}
              fontWeight='bold'
            >
              List your pet for adoption
            </Text>
          </Card.Header>

          <Card.Footer padded>
            <XStack flex={1} />
            <Button
              borderRadius='$10'
              icon={
                <ArrowRight size='$2' color={colorSet.secondaryForeground} />
              }
              chromeless
            ></Button>
          </Card.Footer>

          <Card.Background
            backgroundColor={colorSet.primaryForeground}
            borderRadius={16}
          />
        </Card>
      </XStack>
    );
  };

  const SeekerCTA2 = () => {
    return (
      <XStack gap='$4'>
        <Card
          bordered
          flex={1}
          pressTheme
          onPress={() => router.push('/(tabs)/breeds')}
        >
          <Card.Header padded>
            <Text fontSize='$5' fontWeight='bold'>
              Discover Breeds
            </Text>
            <Text fontSize='$3' color={colorSet.secondaryText}>
              Find your perfect match
            </Text>
          </Card.Header>
          <Card.Footer padded>
            <Button icon={ArrowRight} chromeless />
          </Card.Footer>
          <Card.Background backgroundColor={colorSet.secondaryBackground} />
        </Card>

        <Card
          bordered
          flex={1}
          pressTheme
          onPress={() => router.push('/(tabs)/breeders')}
        >
          <Card.Header padded>
            <Text fontSize='$5' fontWeight='bold'>
              Meet Breeders
            </Text>
            <Text fontSize='$3' color={colorSet.secondaryText}>
              Connect with experts
            </Text>
          </Card.Header>
          <Card.Footer padded>
            <Button icon={ArrowRight} chromeless />
          </Card.Footer>
          <Card.Background backgroundColor={colorSet.secondaryBackground} />
        </Card>
      </XStack>
    );
  };
  const BreederCTA = () => {
    return (
      <XStack gap='$4'>
        <Card
          bordered
          flex={1}
          onPress={() => router.push('/(listings)/create')}
        >
          <Card.Header padded>
            <Text
              color={colorSet.primaryForeground}
              fontSize={24}
              fontWeight='bold'
            >
              Looking to rehome your pet?
            </Text>
          </Card.Header>
          <Card.Footer padded>
            <XStack flex={1} />
            <Button
              borderRadius='$10'
              iconAfter={<Plus size='$2' color={colorSet.primaryForeground} />}
              chromeless
            >
              List for adoption{' '}
            </Button>
          </Card.Footer>
          <Card.Background
            backgroundColor={colorSet.secondaryForeground}
            borderRadius={16}
          />
        </Card>

        <Card bordered flex={1} onPress={() => router.push('/add-litter')}>
          <Card.Header padded>
            <Text
              color={colorSet.secondaryForeground}
              fontSize={24}
              fontWeight='bold'
            >
              Expecting a new litter?
            </Text>
          </Card.Header>
          <Card.Footer padded>
            <XStack flex={1} />
            <Button
              borderRadius='$10'
              icon={<Plus size='$2' color={colorSet.secondaryForeground} />}
              chromeless
            >
              Add for booking
            </Button>
          </Card.Footer>
          <Card.Background
            backgroundColor={colorSet.primaryForeground}
            borderRadius={16}
          />
        </Card>
      </XStack>
    );
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: colorSet.primaryBackground}}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2' alignItems='center'>
          <MapPin color={colorSet.primaryForeground} />
          <Text>
            {currentUser.location?.latitude}, {currentUser.location?.longitude}
          </Text>
        </XStack>

        <YStack gap='$2'>
          <Text fontSize='$8' fontWeight='bold' color={colorSet.primaryText}>
            Find Your Perfect Match
          </Text>
          <Text fontSize='$5' color={colorSet.secondaryText}>
            Discover your ideal furry companion based on your lifestyle and
            preferences
          </Text>
        </YStack>

        {/* Search & Filter */}
        <XStack gap='$2'>
          <Button
            flex={1}
            icon={Search}
            onPress={() => router.push('/(tabs)/search')}
            backgroundColor={colorSet.background}
            borderColor={colorSet.border}
            borderWidth={1}
          >
            Search breeds, traits...
          </Button>
          <Button
            icon={Filter}
            onPress={() => router.push('/(tabs)/filters')}
            backgroundColor={colorSet.background}
            borderColor={colorSet.border}
            borderWidth={1}
          />
        </XStack>

        {currentUser.role === 'breeder' ? <BreederCTA /> : <SeekerCTA />}

        {/* Breed Recommendations */}
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            Recommended Breeds
          </Text>

          <BreedRecommendations
            filteredBreeds={filteredBreeds}
            onSelectBreed={(breed) =>
              router.push({
                pathname: '/(tabs)/(explore)/[breed_name]',
                params: {breed_name: breed.name},
              })
            }
          />
        </YStack>

        <YStack gap='$4'>
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
        </YStack>
      </YStack>
    </ScrollView>
  );
};

export default HomeScreen;
