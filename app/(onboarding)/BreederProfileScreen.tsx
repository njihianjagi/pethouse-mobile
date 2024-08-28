import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, YStack, Input, Button, Select, Text, Image, Sheet, Adapt } from 'tamagui';
import { useBreedData } from '../../api/firebase/breeds/useBreedData';
import { useKennelData } from '../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Check } from '@tamagui/lucide-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useTheme } from '../../dopebase';
import { updateUser } from '../../api/firebase/users/userClient';

const BreederProfileScreen = () => {
  const { currentUser } = useCurrentUser();
  const { allBreeds, loading: breedsLoading } = useBreedData();
  const { addKennel, updateKennel, getKennelByUserId, loading: kennelLoading } = useKennelData();

  const [kennelName, setKennelName] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState([] as any);
  const [selectedBreeds, setSelectedBreeds] = useState([] as any);
  const [existingKennel, setExistingKennel] = useState(null as any);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const { theme, appearance } = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  useEffect(() => {
    if (currentUser) {
      getKennelByUserId(currentUser.uid).then(kennel => {
        if (kennel) {
          setExistingKennel(kennel);
          setKennelName(kennel.name);
          setLocation(kennel.location);
          setServices(kennel.services || []);
          setSelectedBreeds(kennel.breeds || []);
        }
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    const kennelData = {
      name: kennelName,
      location,
      services,
      breeds: selectedBreeds,
      userId: currentUser.uid,
    };

    if (existingKennel) {
      await updateKennel(existingKennel.id, kennelData);
    } else {
      const newKennelId = await addKennel(kennelData);
      await updateUser(currentUser.uid, { kennelId: newKennelId });
    }

    // Navigate to the next screen or dashboard
  };

  return (
    <View  
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor={colorSet.primaryBackground}
    >
      <YStack p="$8" gap="$6">
        <YStack gap="$4">
          <View style={styles?.logo}>
            <Image
              style={styles.logoImage}
              source={theme.icons?.logo}
            />
          </View>

          <Text style={styles.title}>
            Awesome, almost there!
          </Text>
          <Text style={styles.caption}>
            Complete your profile to connect with potential buyers and showcase your kennel.
          </Text>
        </YStack>

        <YStack gap="$4">
          <Input
            placeholder="Kennel Name"
            value={kennelName}
            onChangeText={setKennelName}
          />

          <Input
            placeholder="Kennel Location"
            value={location}
            onFocus={() => setIsSheetOpen(true)}
            onChangeText={setLocation}
          />

          <Select 
            open={isSelectOpen} 
            onOpenChange={setIsSelectOpen} 
            value={services.join(',')} 
            onValueChange={(value) => {
              const newServices = services.includes(value)
                ? services.filter((s) => s !== value)
                : [...services, value];
              setServices(newServices);
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select Services" />
            </Select.Trigger>
            <Select.Content>
              <Select.Viewport>
                {['breeding', 'boarding', 'training', 'grooming'].map((service, index) => (
                  <Select.Item index={index} key={service} value={service}>
                    <Select.ItemText>{service}</Select.ItemText>
                    <Select.ItemIndicator>
                      {services.includes(service) && <Check size={16} />}
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>

          <Select 
            value={selectedBreeds.join(',')} 
            onValueChange={(value) => {
              const newSelectedBreeds = selectedBreeds.includes(value)
                ? selectedBreeds.filter((b) => b !== value)
                : [...selectedBreeds, value];
              setSelectedBreeds(newSelectedBreeds);
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select Breeds" />
            </Select.Trigger>

            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>

            <Select.Content zIndex={200000}>
              <Select.Viewport minWidth={200}>
                <Select.Group>
                  <Select.Label>Breeds</Select.Label>
                  {allBreeds.map((breed, index) => (
                    <Select.Item index={index} key={breed.id} value={breed.id}>
                      <Select.ItemText>{breed.name}</Select.ItemText>
                      <Select.ItemIndicator marginLeft="auto">
                        {selectedBreeds.includes(breed.id) && <Check size={16} />}
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <Button
          onPress={handleSave} 
          theme="active"  
          backgroundColor={colorSet.secondaryForeground} 
          color={colorSet.primaryForeground}
        >
          {existingKennel ? 'Update Profile' : 'Create Profile'}
        </Button>
      </YStack>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <Sheet.Overlay />
        <Sheet.Frame>
          <View flex={1}>
            <GooglePlacesAutocomplete
              placeholder="Search for a location"
              onPress={(data, details = null) => {
                setLocation(data.description);
                setIsSheetOpen(false); // Close the sheet after selection
              }}
              query={{
                key: 'AIzaSyAsA_NXnLAmxVq4UGGpHyt3SmpyHveI-UE',
                language: 'en',
              }}
              textInputProps={{
                InputComp: Input,
                leftIcon: { type: 'font-awesome', name: 'chevron-left' },
                errorStyle: { color: 'red' },
              }}
            />
          </View>
        </Sheet.Frame>
      </Sheet>
    </View>
  );
};

export default BreederProfileScreen;

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({    
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 0,
      marginBottom: 0,
      textAlign: 'center',
    },
    caption: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      color: colorSet.primaryForeground,
    },
    logo: {
      width: 'auto',
      height: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      width: 200,
      height: 150,
      resizeMode: 'contain',
      tintColor: '',
    },
  });
};