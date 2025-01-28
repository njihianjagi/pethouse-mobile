import React, {useRef} from 'react';
import {FlatList, Dimensions} from 'react-native';
import {XStack, Image, Button, View, Spinner} from 'tamagui';
import {Upload, Trash} from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';

interface ImageSelectorProps {
  images: {downloadURL?: string; thumbnailURL?: string; uploading?: boolean}[];
  onSelectImage: (imageUri: string) => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
  cardSize?: number;
  uploading?: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  images,
  onSelectImage,
  onRemoveImage,
  maxImages = Infinity,
  cardSize = 100,
  uploading = false,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      onSelectImage(result.assets[0].uri);

      // Scroll to end after a short delay to ensure new item is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 32) / 3.5; // Accounting for padding

  const renderImageItem = ({
    item,
    index,
  }: {
    item: {
      downloadURL?: string;
      thumbnailURL?: string;
      uploading?: boolean;
    };
    index: number;
  }) => (
    <View
      style={{
        width: itemWidth,
        padding: 8,
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Image
        source={{uri: item.downloadURL || item.thumbnailURL}}
        width={itemWidth - 16}
        height={itemWidth - 16}
        borderRadius='$2'
        opacity={item.uploading ? 0.5 : 1}
      />
      {item.uploading && (
        <Spinner
          position='absolute'
          top='50%'
          left='50%'
          marginTop={-20}
          marginLeft={-20}
        />
      )}
      <Button
        onPress={() => onRemoveImage(index)}
        icon={<Trash size='$1' />}
        size='$2'
        circular
        position='absolute'
        top={8}
        right={8}
      />
    </View>
  );

  const renderUploadButton = () => (
    <View
      style={{
        width: itemWidth,
        padding: 8,
        alignItems: 'center',
      }}
    >
      <Button
        onPress={handleSelectImage}
        icon={<Upload size='$1' />}
        width={itemWidth - 16}
        height={itemWidth - 16}
        borderRadius='$2'
        backgroundColor='$gray5'
        disabled={
          images.length >= maxImages || images.some((img) => img.uploading)
        }
      />
    </View>
  );

  // Dynamically create data with upload button and refresh uploading state
  const dataWithUploadButton = [
    ...images,
    ...(images.length < maxImages && !images.some((img) => img.uploading)
      ? [{isUploadButton: true}]
      : []),
  ];

  return (
    <FlatList
      ref={flatListRef}
      data={dataWithUploadButton}
      renderItem={({item, index}) =>
        'isUploadButton' in item
          ? renderUploadButton()
          : renderImageItem({item, index})
      }
      keyExtractor={(item, index) =>
        'isUploadButton' in item ? 'upload-button' : index.toString()
      }
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 8,
      }}
    />
  );
};

export default ImageSelector;
