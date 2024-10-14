import React, {useEffect} from 'react';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useNavigation, useRouter} from 'expo-router';
import {
  Button,
  Card,
  H2,
  ScrollView,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
import {ArrowRight, MapPin} from '@tamagui/lucide-icons';

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
  const highlightedBreeders: any = []; // This should be populated with actual data
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
      onPress={() => router.push(`/breeder/${breeder.id}`)}
    >
      <Card.Header padded>
        <H2>{breeder.name}</H2>
        <Text>{breeder.location}</Text>
      </Card.Header>
      <Card.Footer padded>
        <XStack flex={1} />
        <Button size='$3' circular icon={ArrowRight} />
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
      onPress={() => router.push(`/litter/${litter.id}`)}
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
      <YStack padding='$4'>
        <H2>{localized('Highlighted Breeders')}</H2>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack>
            {highlightedBreeders.map((breeder) => (
              <BreederCard key={breeder.id} breeder={breeder} />
            ))}
          </XStack>
        </ScrollView>

        <H2>{localized('Upcoming Litters')}</H2>
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
