import React, {useEffect, useState} from 'react';
import {ArrowRight} from '@tamagui/lucide-icons';
import {router, Href} from 'expo-router';
import {LinearGradient} from 'tamagui/linear-gradient';
import {View, Text, Button, Card, XStack, Image, YStack, YGroup} from 'tamagui';
import {useTheme} from '../../../../dopebase';
import {useBreedMatch} from '../../../../hooks/useBreedMatch';
import {Breed} from '../../../../api/firebase/breeds/useBreedData';

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
          pathname: '/explore/breeds/[breed_name]',
          params: {
            breed_name: breed.name.toLowerCase().replace(/\s+/g, '-'),
          },
        })
      }
      pressTheme
      overflow='hidden'
      aspectRatio={1 / 1}
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
          end={[1, 1]}
          fullscreen
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          zIndex={1}
        />
      </Card.Background>

      {matchPercentage && (
        <Card.Header padded zIndex={2}>
          <XStack
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
          </XStack>
        </Card.Header>
      )}

      <Card.Footer padding='$4'>
        <XStack justifyContent='space-between' width='100%' flex={1}>
          <Text
            color={colorSet.foregroundContrast}
            fontSize={24}
            fontWeight='bold'
          >
            {breed.name}
          </Text>

          {/* <Button
            borderRadius='$10'
            icon={<ArrowRight size='$2' color={colorSet.foregroundContrast} />}
            chromeless
          /> */}
        </XStack>
      </Card.Footer>
    </Card>
  );
};

export default BreedCard;
