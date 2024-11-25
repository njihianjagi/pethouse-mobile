import {ScrollView} from 'react-native';
import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {Sheet, Input, YStack} from 'tamagui';
import {useTheme, useTranslations} from '../dopebase';

interface LocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSelectorProps {
  isLocationSheetOpen: boolean;
  setIsLocationSheetOpen: (open: boolean) => void;
  handleInputChange: (location: LocationData) => void;
  currentLocation?: LocationData;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isLocationSheetOpen,
  setIsLocationSheetOpen,
  handleInputChange,
  currentLocation,
}) => {
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Sheet
      open={isLocationSheetOpen}
      onOpenChange={(open) => setIsLocationSheetOpen(open)}
      snapPointsMode='percent'
      snapPoints={[60]}
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
              console.log(data, details);
              if (details) {
                const location: LocationData = {
                  name: details.name || data.description,
                  address: details.formatted_address || data.description,
                  city: '',
                  state: '',
                  country: '',
                };

                // Parse address components
                details.address_components?.forEach((component) => {
                  if (component.types.includes('locality')) {
                    location.city = component.long_name;
                  } else if (
                    component.types.includes('administrative_area_level_1')
                  ) {
                    location.state = component.long_name;
                  } else if (component.types.includes('country')) {
                    location.country = component.long_name;
                  }
                });

                // Add coordinates if available
                if (details.geometry?.location) {
                  location.coordinates = {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  };
                }
                console.log(location);

                handleInputChange(location);
                setIsLocationSheetOpen(false);
              }
            }}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
              language: 'en',
              types: 'address',
              components: 'country:ke',
            }}
            textInputProps={{
              InputComp: Input,
              placeholder: localized('Search for a location'),
              placeholderTextColor: '$gray10',
              textColor: colorSet.primaryText,
            }}
            fetchDetails={true}
          />
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
};

export default LocationSelector;
