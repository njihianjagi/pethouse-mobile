import React from 'react';
import {MapPin, Star} from '@tamagui/lucide-icons';
import {router} from 'expo-router';
import {LinearGradient} from 'tamagui/linear-gradient';
import {Text, Image, Card, XStack, YStack} from 'tamagui';
import {useTheme} from '../dopebase';
import {BreederProfile} from '../api/firebase/users/userClient';

interface BreederCardProps {
  breeder: BreederProfile;
  index: number;
}

const DEFAULT_IMAGE = 'https://placehold.co/600x400/png';

const BreederCard = ({breeder, index}: BreederCardProps) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const displayImage =
    breeder.kennel?.images?.[0]?.thumbnailURL || DEFAULT_IMAGE;
  const location = breeder.kennel?.location?.name || 'Location unknown';
  const rating = breeder.rating || 0;
  const reviewCount = breeder.reviewCount || 0;

  return (
    <Card
      key={index}
      bordered
      width={120}
      height={120}
      margin={5}
      onPress={() => router.push(`/(tabs)/explore/breeders/${breeder.id}`)}
      pressTheme
      overflow='hidden'
    >
      <Card.Background>
        <Image
          source={{uri: displayImage}}
          width='100%'
          height='100%'
          objectFit='cover'
        />
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          fullscreen
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          zIndex={1}
        />
      </Card.Background>

      <Card.Footer padding='$4'>
        <YStack gap='$2'>
          <Text
            color='$color.foregroundContrast'
            fontSize={24}
            fontWeight='bold'
          >
            {breeder.kennel?.name
              ? breeder.kennel.name
              : breeder.firstName + ' ' + breeder.lastName}
          </Text>

          <XStack gap='$2' alignItems='center'>
            <MapPin size={16} color='$color.foregroundContrast' />
            <Text color='$color.foregroundContrast' fontSize={16}>
              {location}
            </Text>
          </XStack>

          <XStack gap='$2' alignItems='center'>
            <Star size={16} color='$color.foregroundContrast' />
            <Text color='$color.foregroundContrast' fontSize={16}>
              {rating.toFixed(1)} ({reviewCount})
            </Text>
          </XStack>
        </YStack>
      </Card.Footer>
    </Card>
  );
};

export default BreederCard;
