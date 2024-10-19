import React, {useEffect, useState} from 'react';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {Href, useNavigation, useRouter} from 'expo-router';
import {
  Button,
  Card,
  H2,
  H3,
  ListItem,
  ScrollView,
  Text,
  View,
  XStack,
  YGroup,
  YStack,
  Image,
  Spinner,
  H4,
} from 'tamagui';
import {ArrowRight, MapPin} from '@tamagui/lucide-icons';
import useKennelData, {
  Kennel,
} from '../../../api/firebase/kennels/useKennelData';

export default function HomeScreen() {
  const router = useRouter();

  const currentUser = useCurrentUser();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  //const styles = dynamicStyles(theme, appearance)
  const colorSet = theme.colors[appearance];
  const upcomingLitters: any = []; // This should be populated with actual data
  const [populatedKennels, setPopulatedKennels] = useState([] as any);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }
  }, [currentUser?.id]);

  const {
    kennels: highlightedKennels,
    loading: kennelsLoading,
    error: kennelsError,
    fetchAllKennels,
    fetchKennelBreeds,
  } = useKennelData();

  useEffect(() => {
    fetchAllKennels();
  }, []);

  useEffect(() => {
    const populateKennelBreeds = async () => {
      const populatedKennelsData = await Promise.all(
        highlightedKennels.map(async (kennel) => {
          const breeds = await fetchKennelBreeds(kennel.id);
          console.log('kennel breeds', breeds);
          return {...kennel, breeds};
        })
      );
      setPopulatedKennels(populatedKennelsData);
    };

    if (highlightedKennels.length > 0) {
      populateKennelBreeds();
    }
  }, [highlightedKennels]);

  const KennelCard = ({kennel}) => (
    <Card
      bordered
      elevate
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/(kennels)/${kennel.id}` as Href)}
    >
      <Card.Header padding={0}>
        <ListItem
          title={kennel.name}
          subTitle={
            <XStack gap='$2' alignItems='center'>
              <MapPin size={16} color={colorSet.primaryForeground} />
              <Text fontSize='$2' color={colorSet.primaryForeground}>
                {kennel.location}
              </Text>
            </XStack>
          }
        ></ListItem>
      </Card.Header>

      <Card.Footer padded>
        <YGroup gap='$2'>
          {kennelsLoading ? (
            <Spinner size='small' />
          ) : (
            kennel.breeds &&
            kennel.breeds.map((breed, index) => (
              <YGroup.Item>
                <XStack key={index} gap='$2' alignItems='center'>
                  <Image
                    source={{
                      uri:
                        breed.images[0]?.thumbnailURL ||
                        'https://via.placeholder.com/50',
                    }}
                    width={40}
                    height={40}
                    borderRadius='$2'
                  />
                  <YStack>
                    <Text fontSize='$3' fontWeight='bold'>
                      {breed.breedName}
                    </Text>
                    <Text fontSize='$2' color={colorSet.primaryForeground}>
                      {breed.breedGroup}
                    </Text>
                  </YStack>
                </XStack>
              </YGroup.Item>
            ))
          )}
        </YGroup>
      </Card.Footer>

      <Card.Background>
        <Image
          source={{
            uri: kennel.coverImage || 'https://via.placeholder.com/300x200',
          }}
          resizeMode='cover'
          width='100%'
          height='100%'
          opacity={0.2}
        />
      </Card.Background>
    </Card>
  );

  const LitterCard = ({litter}) => (
    <Card
      bordered
      elevate
      size='$4'
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/litter/${litter.id}` as Href)}
    >
      <Card.Header padded>
        <H2>{litter.breed}</H2>
        <Text>{`Expected: ${litter.expectedDate}`}</Text>
      </Card.Header>
      <Card.Footer padded>
        <XStack flex={1} />
        <Button size='$3' circular icon={ArrowRight} />
      </Card.Footer>
    </Card>
  );

  return (
    <ScrollView style={{flex: 1, backgroundColor: colorSet.primaryBackground}}>
      <YStack padding='$4' gap='$4'>
        <XStack gap='$2'>
          <MapPin color={colorSet.primaryForeground} />
          <Text>
            {currentUser.location?.latitude}, {currentUser.location?.longitude}
          </Text>
        </XStack>

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
                icon={
                  <ArrowRight size='$2' color={colorSet.primaryForeground} />
                }
                chromeless
              ></Button>
            </Card.Footer>

            <Card.Background
              backgroundColor={colorSet.secondaryForeground}
              borderRadius={16}
            />
          </Card>

          <Card bordered flex={1}>
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

        <H3 fontWeight='bold'>{localized('Highlighted Kennels')}</H3>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack>
            {populatedKennels.map((kennel) => (
              <KennelCard key={kennel.id} kennel={kennel} />
            ))}
          </XStack>
        </ScrollView>

        <H3 fontWeight='bold'>{localized('Upcoming Litters')}</H3>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack>
            {upcomingLitters.map((litter) => (
              <LitterCard key={litter.id} litter={litter} />
            ))}
          </XStack>
        </ScrollView>
      </YStack>
    </ScrollView>
  );
}
