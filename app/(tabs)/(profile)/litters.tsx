import React, {useEffect} from 'react';
import {Alert, ScrollView} from 'react-native';
import {
  View,
  YStack,
  Text,
  Card,
  Button,
  ListItem,
  Spinner,
  YGroup,
} from 'tamagui';
import {useLitterData} from '../../../api/firebase/litters/useLitterData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {ArrowRight, Trash} from '@tamagui/lucide-icons';
import {useTheme, useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';

const LittersScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const {localized} = useTranslations();

  const {litters, loading, error, fetchLitters, deleteLitter} = useLitterData();

  useEffect(() => {
    if (currentUser?.id) {
      fetchLitters({userId: currentUser.id});
    }
  }, [currentUser?.id]);

  // const renderLitterCard = (litter) => (
  //   <Card
  //     key={litter.id}
  //     bordered
  //     elevate
  //     size='$4'
  //     animation='bouncy'
  //     scale={0.9}
  //     hoverStyle={{scale: 0.925}}
  //     pressStyle={{scale: 0.875}}
  //     onPress={() => router.push(`/(litters)/${litter.id}`)}
  //   >
  //     <Card.Header padded>
  //       <Text fontSize='$5' fontWeight='bold'>
  //         {litter.breed} Litter
  //       </Text>
  //     </Card.Header>
  //     <Card.Footer padded>
  //       <XStack flex={1} justifyContent='space-between'>
  //         <Text fontSize='$3'>
  //           Born: {new Date(litter.birthDate).toLocaleDateString()}
  //         </Text>
  //         <Text fontSize='$3'>Puppies: {litter.puppyCount}</Text>
  //       </XStack>
  //     </Card.Footer>
  //   </Card>
  // );

  const handleDeleteLitter = async (litterId: string) => {
    try {
      await deleteLitter(litterId);
      Alert.alert('Success', 'Litter deleted successfully');
    } catch (error) {
      console.error('Error deleting litter:', error);
      Alert.alert('Error', 'Failed to delete litter. Please try again.');
    }
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent='center' alignItems='center'>
        <Spinner size='large' />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent='center' alignItems='center'>
        <Text>{error}</Text>
      </YStack>
    );
  }

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
            // <XStack flexWrap='wrap' justifyContent='space-between'>
            //   {litters.map(renderLitterCard)}
            // </XStack>
            <YGroup>
              {litters.map((litter) => (
                <YGroup.Item key={litter.id}>
                  <ListItem
                    title={litter.name}
                    subTitle={`${
                      litter.userBreed?.breedName || 'Unknown Breed'
                    } - ${litter.birthDate}`}
                    onPress={() => router.push(`/(litters)/${litter.id}`)}
                    iconAfter={
                      <Button
                        chromeless
                        icon={Trash}
                        onPress={() => handleDeleteLitter(litter.id!)}
                      />
                    }
                  />
                </YGroup.Item>
              ))}
            </YGroup>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
};

export default LittersScreen;
