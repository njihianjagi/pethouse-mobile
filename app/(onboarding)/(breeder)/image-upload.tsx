import React, {useState, useEffect} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {YStack, Text, XStack, View, ScrollView, Button, Image} from 'tamagui';
import * as ImagePicker from 'expo-image-picker';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';

const ImageUploadScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const [images, setImages] = useState<{
    profile?: string;
    dogs: string[];
  }>({
    profile: currentUser?.images?.find((img) => img.type === 'profile')?.url,
    dogs:
      currentUser?.images
        ?.filter((img) => img.type === 'dogs')
        .map((img) => img.url) || [],
  });

  const pickImage = async (type: 'profile' | 'dogs') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'profile') {
        setImages((prev) => ({...prev, profile: result.assets[0].uri}));
      } else {
        setImages((prev) => ({
          ...prev,
          dogs: [...(prev.dogs || []), result.assets[0].uri],
        }));
      }
    }
  };

  const handleContinue = async () => {
    if (!images.profile || images.dogs.length === 0) {
      Alert.alert(
        localized('Error'),
        localized('Please upload at least one profile and one dog image')
      );
      return;
    }

    try {
      const imageData = [
        {
          id: Date.now().toString(),
          url: images.profile,
          type: 'profile',
        },
        ...images.dogs.map((url) => ({
          id: Date.now().toString(),
          url,
          type: 'dogs',
        })),
      ];

      const userData = {
        ...currentUser,
        images: imageData,
        onboardingComplete: true,
      };

      await updateUser(currentUser?.id, userData);
      dispatch(setUserData(userData));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert(
        localized('Error'),
        localized('Failed to upload images. Please try again.')
      );
    }
  };

  return (
    <ScrollView>
      <YStack space='$4' padding='$4'>
        <Text>Upload Profile Image</Text>
        <Button onPress={() => pickImage('profile')}>
          {images.profile ? 'Change Profile Image' : 'Select Profile Image'}
        </Button>
        {images.profile && (
          <Image source={{uri: images.profile}} width={200} height={200} />
        )}

        <Text>Upload Dog Images (at least one)</Text>
        <Button onPress={() => pickImage('dogs')}>Add Dog Image</Button>
        <XStack flexWrap='wrap'>
          {images.dogs.map((uri, index) => (
            <Image key={index} source={{uri}} width={100} height={100} />
          ))}
        </XStack>

        <Button
          onPress={handleContinue}
          disabled={!images.profile || images.dogs.length === 0}
        >
          Continue
        </Button>
      </YStack>
    </ScrollView>
  );
};

export default ImageUploadScreen;
