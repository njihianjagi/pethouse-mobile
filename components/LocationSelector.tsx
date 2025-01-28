import {Dimensions} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {
  Sheet,
  Input,
  YStack,
  View,
  XStack,
  Text,
  Button,
  XGroup,
} from 'tamagui';
import {useTheme, useTranslations} from '../dopebase';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {Search, X} from '@tamagui/lucide-icons';

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

interface Prediction {
  place_id: string;
  description: string;
}

interface LocationSelectorProps {
  isLocationSheetOpen: boolean;
  setIsLocationSheetOpen: (open: boolean) => void;
  onChange: (location: LocationData) => void;
  currentLocation?: LocationData;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isLocationSheetOpen,
  setIsLocationSheetOpen,
  onChange,
  currentLocation,
}) => {
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  const mapRef = useRef<MapView>(null);
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const sessionToken = useRef<string>('');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Default to Nairobi coordinates or current location if available
  const initialRegion = {
    latitude: currentLocation?.coordinates?.latitude || -1.2921,
    longitude: currentLocation?.coordinates?.longitude || 36.8219,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    if (mapReady && mapRef.current) {
      // Force a re-render of the map
      mapRef.current.animateToRegion(region, 0);
    }
  }, [mapReady]);

  useEffect(() => {
    // Update region when currentLocation changes
    if (currentLocation?.coordinates && mapReady) {
      const newRegion = {
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      setMarkerPosition({
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
      });
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  }, [currentLocation, mapReady]);

  const [markerPosition, setMarkerPosition] = useState(
    currentLocation?.coordinates
      ? {
          latitude: currentLocation.coordinates.latitude,
          longitude: currentLocation.coordinates.longitude,
        }
      : null
  );

  useEffect(() => {
    // Generate a new session token when component mounts
    sessionToken.current = Math.random().toString(36).substring(2);
    return () => {
      sessionToken.current = '';
    };
  }, []);

  useEffect(() => {
    // Handle map loading error after timeout
    const timer = setTimeout(() => {
      if (!mapReady) {
        setMapError(
          'Map failed to load. Please check your internet connection and try again.'
        );
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [mapReady]);

  const fetchPredictions = async (input: string) => {
    if (!input) {
      setPredictions([]);
      return;
    }
    console.log(input);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&components=country:ke&key=${
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }&sessiontoken=${sessionToken.current}`
      );
      const data = await response.json();
      console.log(data);
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,name,geometry,address_component&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken.current}`
      );
      const data = await response.json();

      if (data.result) {
        const result = data.result;
        const location: LocationData = {
          name: result.name || result.formatted_address,
          address: result.formatted_address,
          city: '',
          state: '',
          country: '',
        };

        if (result.geometry?.location) {
          location.coordinates = {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          };

          const newRegion = {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };

          setRegion(newRegion);
          setMarkerPosition({
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          });

          if (mapReady && mapRef.current) {
            mapRef.current?.animateToRegion(newRegion, 1000);
          }
        }

        // Parse address components
        result.address_components?.forEach((component: any) => {
          if (component.types.includes('locality')) {
            location.city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            location.state = component.long_name;
          } else if (component.types.includes('country')) {
            location.country = component.long_name;
          }
        });

        onChange(location);
        setPredictions([]);
        setSearchInput(result.formatted_address);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const onMapPress = async (e: any) => {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    setMarkerPosition({latitude, longitude});

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results?.[0]) {
        const result = data.results[0];
        const location: LocationData = {
          name: result.formatted_address,
          address: result.formatted_address,
          city: '',
          state: '',
          country: '',
          coordinates: {latitude, longitude},
        };

        result.address_components?.forEach((component: any) => {
          if (component.types.includes('locality')) {
            location.city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            location.state = component.long_name;
          } else if (component.types.includes('country')) {
            location.country = component.long_name;
          }
        });

        onChange(location);
        setSearchInput(result.formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchInputRef = useRef('' as any);

  return (
    <Sheet
      open={isLocationSheetOpen}
      onOpenChange={(open) => setIsLocationSheetOpen(open)}
      snapPointsMode='percent'
      snapPoints={[80]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding='$4' backgroundColor='$background'>
        <YStack gap='$4'>
          <XGroup borderRadius='$4' style={{zIndex: 2}}>
            <XGroup.Item>
              <Input
                ref={searchInputRef}
                value={searchInput}
                onChangeText={(text) => {
                  setSearchInput(text);
                  fetchPredictions(text);
                }}
                placeholder={localized('Search for a location')}
                placeholderTextColor='$gray10'
                flex={1}
                borderTopRightRadius={0}
                borderBottomRightRadius={0}
                borderRightWidth={0}
                focusStyle={{
                  borderRightWidth: 0,
                }}
                onLayout={() => {
                  isLocationSheetOpen && searchInputRef.current?.focus();
                  setTimeout(() => {
                    isLocationSheetOpen && searchInputRef.current?.focus();
                  }, 100);
                }}
              />
            </XGroup.Item>
            <XGroup.Item>
              <Button
                icon={searchInput ? X : Search}
                onPress={() => {
                  if (searchInput) {
                    setSearchInput('');
                    setPredictions([]);
                  }
                }}
                borderTopLeftRadius={0}
                borderBottomLeftRadius={0}
                backgroundColor='$gray5'
              />
            </XGroup.Item>
          </XGroup>

          <View
            style={{
              position: 'relative',
              height: 300,
              backgroundColor: colorSet.primaryBackground,
            }}
          >
            <MapView
              ref={mapRef}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
              }}
              provider={PROVIDER_GOOGLE}
              initialRegion={region}
              onRegionChangeComplete={setRegion}
              onPress={onMapPress}
              onMapReady={() => {
                console.log('Map is ready');
                setMapReady(true);
              }}
              loadingEnabled={true}
              loadingIndicatorColor={colorSet.primaryForeground}
              loadingBackgroundColor={colorSet.primaryBackground}
              minZoomLevel={5}
              maxZoomLevel={20}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
              zoomEnabled={true}
              zoomControlEnabled={true}
              moveOnMarkerPress={false}
            >
              {markerPosition && mapReady && (
                <Marker
                  coordinate={markerPosition}
                  draggable
                  onDragEnd={(e) => onMapPress(e)}
                />
              )}
            </MapView>
            {mapError && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colorSet.primaryBackground,
                  borderRadius: 8,
                }}
              >
                <Text color='$red10' textAlign='center'>
                  {mapError}
                </Text>
              </View>
            )}
            {predictions.length > 0 && (
              <YStack
                backgroundColor='$background'
                borderRadius='$2'
                borderWidth={1}
                borderColor='$borderColor'
                position='absolute'
                top={0}
                left={0}
                right={0}
                zIndex={1}
                elevation={5}
                shadowColor='$shadowColor'
                shadowRadius={5}
                shadowOffset={{width: 0, height: 2}}
                shadowOpacity={0.25}
                maxHeight={200}
              >
                {predictions.map((prediction) => (
                  <XStack
                    key={prediction.place_id}
                    padding='$3'
                    pressStyle={{backgroundColor: '$gray5'}}
                    onPress={() => getPlaceDetails(prediction.place_id)}
                  >
                    <Text color='$color'>{prediction.description}</Text>
                  </XStack>
                ))}
              </YStack>
            )}
          </View>

          <Button
            onPress={() => setIsLocationSheetOpen(false)}
            backgroundColor={colorSet.secondaryForeground}
            color={colorSet.primaryForeground}
          >
            {localized('Confirm Location')}
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};

export default LocationSelector;
