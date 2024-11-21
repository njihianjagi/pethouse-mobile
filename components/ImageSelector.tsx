import React from 'react';
import {XStack, Image, Button, ScrollView} from 'tamagui';
import {Upload, Trash} from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import {storageAPI} from '../api/firebase/media';

interface ImageSelectorProps {
  images: {downloadURL: string; thumbnailURL: string}[];
  onSelectImage: (imageUri: string) => void; // Changed to pass URI only
  onRemoveImage: (index: number) => void;
  maxImages?: number;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  images,
  onSelectImage,
  onRemoveImage,
  maxImages = Infinity, // Default to unlimited if not specified
}) => {
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      onSelectImage(result.assets[0].uri);
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
        {/* Only show upload button if we haven't reached maxImages */}
        {images.length < maxImages && (
          <Button
            onPress={handleSelectImage}
            icon={<Upload size='$1' />}
            width={100}
            height={100}
            borderRadius='$2'
            backgroundColor='$gray5'
          />
        )}
      </XStack>
    </ScrollView>
  );
};

export default ImageSelector;
