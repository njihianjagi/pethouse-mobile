import React, {useState, useEffect} from 'react';
import {ScrollView} from 'react-native';
import {View, YStack, Text, XStack, Card, Button} from 'tamagui';
import {
  Litter,
  useLitterData,
} from '../../../api/firebase/litters/useLitterData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {ArrowRight} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import {useKennelData} from '../../../api/firebase/kennels/useKennelData';

const LittersScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();

  const {fetchLittersByKennelId} = useLitterData();
  const {getKennelByUserId} = useKennelData();

  const [litters, setLitters] = useState([] as Litter[]);

  useEffect(() => {
    const fetchLitters = async () => {
      if (currentUser) {
        const kennel = await getKennelByUserId(
          currentUser.id || currentUser.uid
        );
        if (kennel) {
          const kennelLitters = await fetchLittersByKennelId(kennel.id);
          setLitters(kennelLitters);
        }
      }
    };

    fetchLitters();
  }, [currentUser.id]);

  const renderLitterCard = (litter) => (
    <Card
      key={litter.id}
      bordered
      elevate
      size='$4'
      animation='bouncy'
      scale={0.9}
      hoverStyle={{scale: 0.925}}
      pressStyle={{scale: 0.875}}
      onPress={() => router.push(`/(litters)/${litter.id}`)}
    >
      <Card.Header padded>
        <Text fontSize='$5' fontWeight='bold'>
          {litter.breed} Litter
        </Text>
      </Card.Header>
      <Card.Footer padded>
        <XStack flex={1} justifyContent='space-between'>
          <Text fontSize='$3'>
            Born: {new Date(litter.birthDate).toLocaleDateString()}
          </Text>
          <Text fontSize='$3'>Puppies: {litter.puppyCount}</Text>
        </XStack>
      </Card.Footer>
    </Card>
  );

  return (
    <View flex={1} backgroundColor={colorSet.primaryBackground}>
      <ScrollView>
        <YStack padding='$4' gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Litters')}
          </Text>
          {litters.length === 0 ? (
            <Card
              bordered
              elevate
              size='$4'
              onPress={() => router.push('/create-litter')}
            >
              <Card.Header padded>
                <Text fontSize='$5' fontWeight='bold'>
                  {localized('Create New Litter')}
                </Text>
              </Card.Header>
              <Card.Footer padded>
                <Button icon={ArrowRight}>{localized('Get Started')}</Button>
              </Card.Footer>
            </Card>
          ) : (
            <XStack flexWrap='wrap' justifyContent='space-between'>
              {litters.map(renderLitterCard)}
            </XStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
};

export default LittersScreen;
