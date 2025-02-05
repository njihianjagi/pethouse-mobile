import React, {useState, useEffect} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {YStack, Text, View, Button, Spinner, Image} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {useRouter} from 'expo-router';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useDispatch} from 'react-redux';
import {setUserData} from '../../../redux/reducers/auth';
import {useTheme} from '../../../dopebase';
import ImageSelector from '@/components/ImageSelector';
import firebaseStorage from '../../../api/firebase/media/storage';
import ParallaxScrollView from '../../../components/ParallaxScrollView';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 3;

const ImageUploadScreen = () => {
  const {localized} = useTranslations();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<
    {
      localUri?: string;
      downloadURL?: string;
      thumbnailURL?: string;
      uploading?: boolean;
    }[]
  >(
    (currentUser?.kennel &&
      currentUser.kennel.images &&
      currentUser.kennel.images?.map((img) => ({
        downloadURL: img.url,
        thumbnailURL: img.url,
      }))) ||
      []
  );

  const handleSelectImage = async (imageUri: string) => {
    // Simply add the local image to the list without uploading
    setImages((prevImages) => {
      // Check if we've reached max images
      if (prevImages.length >= 10) {
        Alert.alert(
          localized('Error'),
          localized('Maximum number of images reached')
        );
        return prevImages;
      }
      return [...prevImages, {localUri: imageUri}];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (images.length === 0) {
      Alert.alert(localized('Error'), localized('Please upload an image'));
      return;
    }

    // Start uploading all images that haven't been uploaded yet
    const imagesToUpload = images.filter((img) => !img.downloadURL);

    // Update state to show uploading status
    setImages((prevImages) =>
      prevImages.map((img) =>
        !img.downloadURL ? {...img, uploading: true} : img
      )
    );

    try {
      setSaving(true);
      // Upload images sequentially
      const uploadedImages: any = await Promise.all(
        imagesToUpload.map(async (img) => {
          const result = await firebaseStorage.uploadMedia({uri: img.localUri});
          return result;
        })
      );

      // Update images with upload results
      setImages((prevImages) =>
        prevImages.map((img) => {
          const uploadedImage = uploadedImages.find(
            (uploaded) => uploaded.thumbnailURL === img.localUri
          );
          return uploadedImage
            ? {
                downloadURL: uploadedImage.downloadURL,
                thumbnailURL: uploadedImage.thumbnailURL,
                uploading: false,
              }
            : img;
        })
      );

      // Prepare image data for user update
      const imageData = images.map((img) => ({
        id: Date.now().toString(),
        url: img.downloadURL || img.localUri,
        type: 'profile', // Default to profile type
      }));

      const userData = {
        ...currentUser,
        kennel: {
          ...currentUser.kennel,
          images: imageData,
        },
        onboardingComplete: true,
      };

      const updatedUser = await updateUser(currentUser?.id, userData);
      dispatch(setUserData({user: updatedUser}));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error updating user:', error);

      // Reset uploading state on error
      setImages((prevImages) =>
        prevImages.map((img) => ({...img, uploading: false}))
      );

      Alert.alert(
        localized('Error'),
        localized('Failed to upload image. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParallaxScrollView
      headerImage={
        <Image source={require('../../../assets/images/doggo.png')} />
      }
      headerBackgroundColor={{
        dark: colorSet.primaryBackground,
        light: colorSet.primaryBackground,
      }}
    >
      <YStack padding='$4' gap='$4' flex={1} height='100%'>
        <YStack gap='$4' padding='$4'>
          <Text
            style={{
              fontSize: 14,
              color: colorSet.primaryForeground,
              textAlign: 'center',
              opacity: 0.8,
            }}
          >
            {localized('Step')} {CURRENT_STEP} {localized('of')} {TOTAL_STEPS}
          </Text>

          <Text
            style={{
              fontSize: 40,
              fontWeight: 'bold',
              color: colorSet.primaryForeground,
              marginTop: 0,
              marginBottom: 0,
              textAlign: 'center',
            }}
          >
            {localized('Upload Images')}
          </Text>

          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              textAlign: 'center',
              color: colorSet.primaryForeground,
            }}
          >
            {localized(
              'Upload an image of your dogs & kennel. This will be visible to other users.'
            )}
          </Text>
        </YStack>

        <YStack gap='$4'>
          <ImageSelector
            images={images.map((img) => ({
              downloadURL: img.downloadURL || img.localUri,
              thumbnailURL: img.thumbnailURL || img.localUri,
            }))}
            onSelectImage={handleSelectImage}
            onRemoveImage={handleRemoveImage}
            maxImages={10}
            cardSize={170}
            uploading={images.some((img) => img.uploading)}
          />

          <Button
            onPress={handleContinue}
            backgroundColor={colorSet.secondaryForeground}
            color={colorSet.primaryForeground}
            disabled={loading || images.some((img) => img.uploading)}
            icon={
              saving ? (
                <Spinner color={colorSet.primaryForeground} />
              ) : undefined
            }
          >
            {saving ? '' : localized('Complete Profile')}
          </Button>
        </YStack>
      </YStack>
    </ParallaxScrollView>
  );
};

export default ImageUploadScreen;
