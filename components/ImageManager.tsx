import React from 'react';
import {XStack, Image, Button, ScrollView} from 'tamagui';
import {Upload, Trash} from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import {storageAPI} from '../api/firebase/media';

interface ImageManagerProps {
  images: {downloadURL: string; thumbnailURL: string}[];
  onAddImage: (newImage: {downloadURL: string; thumbnailURL: string}) => void;
  onRemoveImage: (index: number) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onAddImage,
  onRemoveImage,
}) => {
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const uploadedImageUrl = await storageAPI.uploadMedia({uri: imageUri});
      const newImage = {
        downloadURL: uploadedImageUrl,
        thumbnailURL: uploadedImageUrl,
      };
      onAddImage(newImage as any);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{flex: 1}}
    >
      <XStack gap='$2' p='$2'>
        {images.map((image, index) => (
          <XStack key={index}>
            <Image
              source={{uri: image.downloadURL}}
              width={100}
              height={100}
              borderRadius='$2'
            />
            <Button
              onPress={() => onRemoveImage(index)}
              icon={<Trash size='$1' />}
              size='$2'
              circular
              position='absolute'
              top={0}
              right={0}
            />
          </XStack>
        ))}
        <Button
          onPress={handleSelectImage}
          icon={<Upload size='$1' />}
          width={100}
          height={100}
          borderRadius='$2'
          backgroundColor='$gray5'
        />
      </XStack>
    </ScrollView>
  );
};

export default ImageManager;
