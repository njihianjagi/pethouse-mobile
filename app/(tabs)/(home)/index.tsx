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
  Input,
  XGroup,
} from 'tamagui';
import {ArrowRight, Filter, MapPin, Plus, Search} from '@tamagui/lucide-icons';
import {useLitterData} from '../../../api/firebase/litters/useLitterData';
import {useListingData} from '../../../api/firebase/listings/useListingData';
import {RecommendedBreeds} from '../../../components/RecommendedBreeds';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {MatchingBreeders} from '../../../components/MatchingBreeders';
import {EmptyStateCard} from '../../../components/EmptyStateCard';
import {TraitSelector} from '../../../components/TraitSelector';
import {ImageBackground} from 'react-native';
import {LinearGradient} from 'tamagui/linear-gradient';

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
  const {litters, loading: littersLoading} = useLitterData();
  const [isTraitSelectorOpen, setIsTraitSelectorOpen] = useState(false);

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
    console.log('usrr', currentUser);
    if (currentUser?.traitPreferences) {
      console.log('traitprefs', currentUser.traitPreferences);
      updateFilter('traitPreferences', currentUser.traitPreferences);
    }
  }, [currentUser?.id]);

  const BreederCTA = () => {
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

  const SeekerCTA = () => {
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
  const BreederCTA2 = () => {
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
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <ScrollView
        style={{flex: 1, backgroundColor: colorSet.primaryBackground}}
      >
        <YStack padding='$4' gap='$4'>
          <XStack gap='$2' alignItems='center'>
            <MapPin color={colorSet.primaryForeground} />
            <Text>
              {currentUser.location?.latitude},{' '}
              {currentUser.location?.longitude}
            </Text>
          </XStack>

          <Card bordered>
            <Card.Header>
              <YStack gap='$2'>
                <Text
                  fontSize={24}
                  fontWeight='bold'
                  color={colorSet.primaryBackground}
                >
                  Find Your Perfect Match
                </Text>
                <Text fontSize='$5' color={colorSet.primaryBackground}>
                  Discover your ideal furry companion based on your lifestyle
                  and preferences
                </Text>
              </YStack>
            </Card.Header>

            <Card.Footer padded>
              <XGroup flex={1}>
                <XGroup.Item>
                  <Input
                    flex={1}
                    borderColor={colorSet.gray3}
                    borderWidth={1}
                    placeholder='Search breeds, traits...'
                  />
                </XGroup.Item>
                <XGroup.Item>
                  <Button
                    icon={<ArrowRight color='$gray9' size='$1' />}
                    onPress={() => router.push('/(tabs)/(explore)')}
                    borderWidth={1}
                    borderColor='$gray6'
                  />
                </XGroup.Item>
              </XGroup>
            </Card.Footer>

            <Card.Background
              backgroundColor={colorSet.secondaryForeground}
              borderRadius={16}
            >
              <ImageBackground
                source={require('../../../assets/images/hero.jpg')}
                style={{width: '100%', height: '100%'}}
                resizeMode='cover'
              >
                <LinearGradient
                  start={[0, 0]}
                  end={[0, 1]}
                  fullscreen
                  colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
                  zIndex={1}
                />
              </ImageBackground>
            </Card.Background>
          </Card>

          {currentUser.role === 'seeker' && (
            <YStack gap='$4'>
              {traitPreferences && Object.keys(traitPreferences).length > 0 ? (
                <RecommendedBreeds
                  loading={breedsLoading}
                  filteredBreeds={filteredBreeds}
                  traitPreferences={traitPreferences}
                  updateFilter={updateFilter}
                  traitGroups={traitGroups}
                  onSelectBreed={(breed) =>
                    router.push({
                      pathname: '/(tabs)/(explore)/[breed_name]',
                      params: {breed_name: breed.name},
                    })
                  }
                />
              ) : (
                <EmptyStateCard
                  title='find your perfect match'
                  backgroundImage={require('../../../assets/images/doggos.jpeg')}
                  description=''
                  buttonText='Set Preferences'
                  onPress={() => setIsTraitSelectorOpen(true)}
                  icon={
                    <ArrowRight size='$1' color={colorSet.primaryBackground} />
                  }
                  backgroundColor={colorSet.secondaryForeground}
                  color={colorSet.primaryBackground}
                />
              )}
            </YStack>
          )}

          <MatchingBreeders userBreeds={currentUser.userBreeds} />

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
