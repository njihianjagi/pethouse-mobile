import React, {useEffect} from 'react';
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
} from 'tamagui';
import {ArrowRight, MapPin} from '@tamagui/lucide-icons';
import useKennelData from '../../../api/firebase/kennels/useKennelData';

export default function HomeScreen() {
  const router = useRouter();

  const currentUser = useCurrentUser();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  //const styles = dynamicStyles(theme, appearance)
  const colorSet = theme.colors[appearance];

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }
  }, [currentUser?.id]);

  // TODO: Fetch highlighted breeders and upcoming litters based on user preferences
  const {
    kennels: highlightedBreeders,
    loading: kennelsLoading,
    error: kennelsError,
    fetchAllKennels,
  } = useKennelData();

  useEffect(() => {
    fetchAllKennels();
  }, []);

  const upcomingLitters: any = []; // This should be populated with actual data

  const BreederCard = ({breeder}) => (
    <Card
      bordered
      elevate
      size='$4'
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/breeder/${breeder.id}` as Href)}
    >
      <Card.Header padded>
        <Text>{breeder.name}</Text>
        <Text>{breeder.location}</Text>
      </Card.Header>

      <Card.Footer>
        <YGroup>
          {breeder.breeds.map((breed, index) => (
            <YGroup.Item key={index}>
              <ListItem>
                <ListItem.Text>{breed.name}</ListItem.Text>
                <Image
                  source={{uri: breed.images[0]?.thumbnailURL}}
                  width={50}
                  height={50}
                />
              </ListItem>
            </YGroup.Item>
          ))}
        </YGroup>
      </Card.Footer>
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

        <H3 fontWeight='bold'>{localized('Highlighted Breeders')}</H3>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack>
            {highlightedBreeders.map((breeder) => (
              <BreederCard key={breeder.id} breeder={breeder} />
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
