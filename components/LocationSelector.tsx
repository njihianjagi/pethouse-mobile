import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import {config} from '@tamagui/config/v3';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {Sheet, Input} from 'tamagui';
import {useTranslations} from '../dopebase';

const LocationSelector = ({
  isLocationSheetOpen,
  setIsLocationSheetOpen,
  handleInputChange,
}) => {
  const {localized} = useTranslations();

  return (
    <Sheet
      open={isLocationSheetOpen}
      onOpenChange={setIsLocationSheetOpen}
      snapPointsMode='percent'
      snapPoints={[50]}
    >
      <Sheet.Overlay />
      <Sheet.Frame padding='$4' backgroundColor='$background'>
        <ScrollView
          contentContainerStyle={{flex: 1}}
          keyboardShouldPersistTaps='handled'
          horizontal={true}
        >
          <GooglePlacesAutocomplete
            placeholder={localized('Search for a location')}
            onPress={(data, details = null) => {
              handleInputChange('location', data.description);
              setIsLocationSheetOpen(false);
            }}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
              language: 'en',
            }}
            textInputProps={{
              InputComp: Input,
            }}
          />
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
};

export default LocationSelector;
