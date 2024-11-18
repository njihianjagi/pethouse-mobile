import React, {useEffect, useState} from 'react';
import {ArrowRight} from '@tamagui/lucide-icons';
import {router, Href} from 'expo-router';
import {LinearGradient} from 'tamagui/linear-gradient';
import {View, Text, Button, Card, XStack, Image, YStack} from 'tamagui';
import {useTheme} from '../../../dopebase';
import {useBreedMatch} from '../../../hooks/useBreedMatch';
import {Breed} from '../../../api/firebase/breeds/useBreedData';

interface BreedCardProps {
  breed: Breed;
  index: number;
  traitPreferences?: any;
}

const BreedCard = ({breed, index, traitPreferences}: BreedCardProps) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const {calculateBreedMatch} = useBreedMatch();
  const [matchPercentage, setMatchPercentage] = useState(null as any);

  useEffect(() => {
    if (traitPreferences) {
      const matchPercentage = Math.round(
        calculateBreedMatch(breed, traitPreferences)
      );

      setMatchPercentage(matchPercentage);
    }
  }, [breed, traitPreferences]);

  return (
    <Card
      key={index}
      bordered
      flex={1}
      margin={5}
      onPress={() =>
        router.push({
          pathname: '/(explore)/[breed_name]',
          params: {breed_name: breed.name.toLowerCase().replace(/\s+/g, '-')},
        })
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
        <YStack>
          <Text
            color={colorSet.foregroundContrast}
            fontSize={24}
            fontWeight='bold'
          >
            {breed.name}
          </Text>
          <Text color={colorSet.foregroundContrast}>
            {breed.breedGroup} group
          </Text>
        </YStack>
      </Card.Header>

      <Card.Footer zIndex={2}>
        <XStack flex={1} alignItems='center' justifyContent='space-between'>
          {traitPreferences && (
            <XStack borderRadius='$4' paddingHorizontal='$4'>
              <Text
                fontWeight='bold'
                color={
                  matchPercentage > 70 ? colorSet.foregroundContrast : '$gray10'
                }
              >
                {matchPercentage}% Match
              </Text>
            </XStack>
          )}

          <Button
            borderRadius='$10'
            icon={<ArrowRight size='$2' color={colorSet.foregroundContrast} />}
            chromeless
          />
        </XStack>
      </Card.Footer>

      {/* <XStack
        position='absolute'
        top={8}
        right={8}
        backgroundColor='$background'
        borderRadius='$4'
        padding='$2'
      >
        <Text
          fontWeight='bold'
          color={matchPercentage > 70 ? '$green10' : '$gray10'}
        >
          {matchPercentage}% Match
        </Text>
      </XStack> */}
    </Card>
  );
};

export default BreedCard;
