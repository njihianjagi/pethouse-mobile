import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {
  View,
  YStack,
  Input,
  Button,
  Select,
  Text,
  Image,
  Sheet,
  Adapt,
  Separator,
  XStack,
  styled,
  Card,
  Spinner,
  CardProps,
  H2,
  Paragraph,
  H3,
} from 'tamagui';
import {useBreedData} from '../../api/firebase/breeds/useBreedData';
import {useKennelData} from '../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../hooks/useCurrentUser';
import {Check, Plus, X} from '@tamagui/lucide-icons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {ActivityIndicator, useTheme, useTranslations} from '../../dopebase';
import {updateUser} from '../../api/firebase/users/userClient';
import {useConfig} from '../../config';
import {Heart, Home, Scissors, Bone} from '@tamagui/lucide-icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import allBreeds from '../../assets/data/breeds_with_group.json';

// @ts-ignore
navigator.geolocation = require('@react-native-community/geolocation');

const BreederProfileScreen = () => {
  const {currentUser} = useCurrentUser();
  const {
    addKennel,
    updateKennel,
    getKennelByUserId,
    loading: kennelLoading,
  } = useKennelData();

  const [kennelName, setKennelName] = useState('');
  const [location, setLocation] = useState('');

  const [selectedServices, setSelectedServices] = useState([] as any);

  const [selectedBreeds, setSelectedBreeds] = useState([] as any);
  const [existingKennel, setExistingKennel] = useState(null as any);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const [servicesVisible, setServicesVisible] = useState(false);
  const [breedsVisible, setBreedsVisible] = useState(false);

  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);
  const colorSet = theme?.colors[appearance];

  const config = useConfig();

  const {localized} = useTranslations();

  // useEffect(() => {
  //   if (currentUser) {
  //     getKennelByUserId(currentUser.uid).then((kennel) => {
  //       if (kennel) {
  //         setExistingKennel(kennel);
  //         setKennelName(kennel.name);
  //         setLocation(kennel.location);
  //         setSelectedServices(kennel.services || []);
  //         setSelectedBreeds(kennel.breeds || []);
  //       }
  //     });
  //   }
  // }, [currentUser]);

  const handleSelectService = (service) => {
    if (selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
    setServicesVisible(false);
  };

  const handleSelectBreed = (breed) => {
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter((b) => b !== breed));
    } else {
      setSelectedBreeds([...selectedBreeds, breed]);
    }
    setBreedsVisible(false);
  };

  const IconButton = styled(Button, {
    size: '$4',
    borderRadius: 100,
    paddingHorizontal: '$2',
    backgroundColor: '$background',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    hoverStyle: {
      backgroundColor: '$backgroundHover',
    },
  });

  const handleSave = async () => {
    const kennelData = {
      name: kennelName,
      location,
      services: selectedServices,
      breeds: selectedBreeds,
      userId: currentUser.uid,
    };

    if (existingKennel) {
      await updateKennel(existingKennel.id, kennelData);
    } else {
      const newKennelId = await addKennel(kennelData);
      await updateUser(currentUser.uid, {kennelId: newKennelId});
    }

    // Navigate to the next screen or dashboard
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      <KeyboardAwareScrollView
        style={{width: '100%', height: '100%'}}
        keyboardShouldPersistTaps='always'
      >
        <YStack p='$8' gap='$6'>
          <YStack gap='$4'>
            <View style={styles?.logo}>
              <Image style={styles.logoImage} source={theme.icons?.logo} />
            </View>

            <Text style={styles.title}>Awesome! Let's create your kennel</Text>
            <Text style={styles.caption}>
              Complete your profile to connect with potential buyers and
              showcase your kennel.
            </Text>
          </YStack>

          <YStack gap='$4'>
            <Input
              placeholder='Kennel Name'
              value={kennelName}
              onChangeText={setKennelName}
            />

            <Input
              placeholder='Kennel Location'
              value={location}
              onFocus={() => setIsLocationSheetOpen(true)}
              onChangeText={setLocation}
            />

            {/* <YStack gap="$4">
              <Text>Services</Text>

              <XStack gap="$2" flexWrap="wrap">

                {selectedServices.map((service) => (
                  <IconButton key={service.id} icon={service.icon} theme="active">
                    <Text paddingHorizontal="$1">{service.name}</Text>
                  </IconButton>
                ))}

                <IconButton variant="outlined" minWidth="$4" onPress={() => setServicesVisible(true)}>
                  <Plus size={16} />
                </IconButton>
              </XStack>
            </YStack> */}

            {/* <YStack gap='$4'>
              <Text>Breeds</Text>

              <XStack gap='$2' flexWrap='wrap'>
                {selectedBreeds.map((breed) => (
                  <IconButton
                    key={breed.id}
                    variant='outlined'
                    minWidth='$4'
                    onPress={() => setBreedsVisible(true)}
                  >
                    {breed.name}
                  </IconButton>
                ))}
                <IconButton
                  variant='outlined'
                  minWidth='$4'
                  onPress={() => setBreedsVisible(true)}
                >
                  <Plus size={16} />
                </IconButton>
              </XStack>
            </YStack> */}
            {/* 
            <ServicesSheet
              visible={servicesVisible}
              onClose={() => setServicesVisible(false)}
              onSelectService={handleSelectService}
              selectedServices={selectedServices}
            /> */}

            {/* {allBreeds && (
              <BreedsSheet
                visible={breedsVisible}
                onClose={() => setBreedsVisible(false)}
                allBreeds={allBreeds}
                onSelectBreed={handleSelectBreed}
                loadingBreeds={false}
              />
            )} */}
          </YStack>

          <Button
            onPress={handleSave}
            theme='active'
            backgroundColor={colorSet.secondaryForeground}
            color={colorSet.primaryForeground}
          >
            {localized('Create Kennel')}
          </Button>
        </YStack>

        <Sheet
          open={isLocationSheetOpen}
          onOpenChange={setIsLocationSheetOpen}
          snapPointsMode='percent'
          snapPoints={[50]}
        >
          <Sheet.Overlay />
          <Sheet.Frame>
            <View flex={1} padding='$4'>
              <GooglePlacesAutocomplete
                placeholder='Search for a location'
                onPress={(data, details = null) => {
                  setLocation(data.description);
                  setIsLocationSheetOpen(false);
                }}
                onFail={(error) => console.error(error)}
                query={{
                  key: config.googleMapsApiKey,
                  language: 'en',
                  components: 'country:ke',
                }}
                textInputProps={{
                  InputComp: Input,
                }}
                renderRightButton={() => (
                  <Button
                    onPress={() => setLocation('')}
                    marginLeft='$2'
                    iconAfter={<X size='$1' />}
                  />
                )}
              />
            </View>
          </Sheet.Frame>
        </Sheet>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default BreederProfileScreen;

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorSet.primaryBackground,
    },
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

const ServicesSheet = ({
  visible,
  onClose,
  onSelectService,
  selectedServices,
}) => {
  const {theme, appearance} = useTheme();

  const colorSet = theme?.colors[appearance];

  const services = [
    {id: 1, name: 'Breeding', icon: <Heart size='$1' />},
    {id: 2, name: 'Boarding', icon: <Home size='$1' />},
    {id: 3, name: 'Grooming', icon: <Scissors size='$1' />},
    {id: 4, name: 'Traning', icon: <Bone size='$1' />},
  ];

  return (
    <Sheet modal open={visible} onOpenChange={onClose} snapPointsMode='fit'>
      <Sheet.Frame>
        <Sheet.ScrollView>
          <YStack gap='$4' padding='$4'>
            <Text fontSize='$6' fontWeight='bold'>
              Select Services
            </Text>

            {services.map((service) => (
              <Card
                key={service.id}
                onPress={() => onSelectService(service)}
                padding='$4'
                borderRadius='$4'
                backgroundColor={
                  selectedServices.includes(service)
                    ? colorSet.background
                    : colorSet.backgroundHover
                }
                borderColor={
                  selectedServices.includes(service)
                    ? colorSet.primary
                    : colorSet.borderColor
                }
                borderWidth={2}
              >
                <XStack gap='$4'>
                  {service.icon}
                  <Text fontSize='$6'>{service.name}</Text>
                </XStack>
              </Card>
            ))}
          </YStack>
        </Sheet.ScrollView>
      </Sheet.Frame>
      <Sheet.Overlay />
    </Sheet>
  );
};

const BreedsSheet = ({
  visible,
  onClose,
  allBreeds,
  onSelectBreed,
  loadingBreeds,
}) => {
  const [searchText, setSearchText] = useState('');

  let filteredBreeds = allBreeds || [];

  const onSearchBreed = () => {
    return (filteredBreeds = allBreeds.filter((breed) =>
      breed.name.toLowerCase().includes(searchText.toLowerCase())
    ));
  };

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={onClose}
      snapPointsMode='mixed'
      snapPoints={['80%', '95%']}
    >
      <Sheet.Frame>
        <Sheet.ScrollView>
          <YStack gap='$4' padding='$4'>
            <Input
              value={searchText}
              onChangeText={setSearchText}
              placeholder='Search breeds'
              onTextInput={onSearchBreed}
            />
            <Separator />
            <YStack gap='$4' flexWrap='wrap' flexDirection='row'>
              {filteredBreeds.map((breed, index) => (
                <Card elevate size='$4' bordered key={breed?.id || index}>
                  <Card.Header padded>
                    <H3>{breed.name}</H3>
                    <Paragraph theme='alt2'>{breed.breedGroup}</Paragraph>
                  </Card.Header>
                  <Card.Footer padded>
                    <XStack flex={1} />
                    <Button borderRadius='$10'>Select</Button>
                  </Card.Footer>
                  <Card.Background>
                    <Image
                      objectFit='contain'
                      alignSelf='center'
                      source={{
                        width: 300,
                        height: 300,
                        uri: breed.image,
                      }}
                    />
                  </Card.Background>
                </Card>
                // <XStack
                //   key={breed.id}
                //   alignItems="center"
                //   padding="$4"
                //   borderWidth={1}
                //   borderColor="$gray4"
                //   borderRadius="$4"
                //   onPress={() => onSelectBreed(breed)}
                //   width="50%"
                // >
                //   <Image src={breed.image} width={48} height={48} marginRight="$2" />
                //   <Text>{breed.name}</Text>
                // </XStack>
              ))}
            </YStack>
          </YStack>
        </Sheet.ScrollView>
      </Sheet.Frame>
      <Sheet.Overlay />
    </Sheet>
  );
};
