import React from 'react';
import {ArrowRight} from '@tamagui/lucide-icons';
import {router, Href} from 'expo-router';
import {LinearGradient} from 'tamagui/linear-gradient';
import {View, Text, Button, Card, XStack, Image} from 'tamagui';
import {useTheme} from '../../../dopebase';

const BreedCard = ({breed}) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  return (
    <Card
      bordered
      flex={1}
      margin={5}
      onPress={() =>
        router.push(
          `(explore)/${breed.name.toLowerCase().replace(/\s+/g, '-')}` as Href
        )
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
        <Text
          color={colorSet.primaryBackground}
          fontSize={24}
          fontWeight='bold'
        >
          {breed.name}
        </Text>
      </Card.Header>

      <Card.Footer zIndex={2}>
        <XStack flex={1} />
        <Button
          borderRadius='$10'
          icon={<ArrowRight size='$2' color={colorSet.primaryBackground} />}
          chromeless
        />
      </Card.Footer>
    </Card>
  );
};

export default BreedCard;
