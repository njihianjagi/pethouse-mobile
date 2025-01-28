import React from 'react';
import {Card, YStack, XStack, Image, Text, Button, Spacer} from 'tamagui';
import {useTheme, useTranslations} from '../../../dopebase';
import {LinearGradient} from 'tamagui/linear-gradient';
import {Trash} from '@tamagui/lucide-icons';

const UserBreedCard = ({userBreed, handleRemoveBreed}) => {
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Card
      key={userBreed.breedId}
      elevate
      bordered
      p='$4'
      borderRadius='$4'
      height='$16'
    >
      <Card.Header padding='$0'>
        <XStack justifyContent='space-between' width='100%' flex={1}>
          <Spacer />
          <Button
            theme='active'
            chromeless
            size='$3'
            onPress={() => handleRemoveBreed(userBreed.breedId)}
            icon={<Trash color='$red1' size='$1' />}
          ></Button>
        </XStack>
      </Card.Header>

      <Card.Background>
        <Image
          source={{uri: userBreed.images[0] || ''}}
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

      <Card.Footer>
        <XStack
          justifyContent='space-between'
          alignItems='center'
          width='100%'
          flex={1}
        >
          <YStack>
            <Text
              color={colorSet.foregroundContrast}
              fontSize={24}
              fontWeight='bold'
            >
              {userBreed.breedName}
            </Text>
            <Text
              color={colorSet.foregroundContrast}
            >{`${userBreed.breedGroup} group`}</Text>
          </YStack>
        </XStack>
      </Card.Footer>
    </Card>
  );
};

export default UserBreedCard;
