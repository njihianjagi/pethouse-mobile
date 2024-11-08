import React, {useEffect, useState} from 'react';
import {useRouter} from 'expo-router';
import {Alert, StyleSheet} from 'react-native';
import {
  YStack,
  XStack,
  Button,
  Text,
  View,
  Image,
  ScrollView,
  Spinner,
  Tabs,
  Separator,
  YGroup,
  ListItem,
  Input,
  Select,
  ToggleGroup,
  XGroup,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash,
  Circle,
  Home,
} from '@tamagui/lucide-icons';
import BreedSelector from '../../components/BreedSelector';
import {updateUser} from '../../api/firebase/users/userClient';
import useBreedData, {
  Breed,
  UserBreed,
} from '../../api/firebase/breeds/useBreedData';
import {setUserData} from '../../redux/reducers/auth';
import {useDispatch} from 'react-redux';
import LocationSelector from '../../components/LocationSelector';

const OnboardingSteps = {
  tab1: {
    title: 'Profile',
    description: () => 'Tell us a bit about yourself to get started',
    cta: () => 'Continue',
  },
  tab2: {
    title: 'Breeds',
    description: () => 'Select breeds you are interested in.',
    cta: () => 'Continue',
  },
  tab3: {
    title: 'Listing',
    description: (isBreeder) =>
      isBreeder
        ? 'List your first pet for adoption.'
        : 'Tell us about your ideal pet companion',
    cta: () => 'Complete Setup',
  },
};

const OnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: '',
    name: currentUser?.firstName || currentUser?.username || '',
    location: '',
    selectedBreeds: [] as UserBreed[],
  });

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const {addUserBreed} = useBreedData(currentUser?.id);

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();

  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const dispatch = useDispatch();

  const tabs = ['tab1', 'tab2'];
  const [activeTab, setActiveTab] = useState('tab1');
  const currentIndex = tabs.indexOf(activeTab);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSelectBreed = (breed: Breed) => {
    // Check if breed is already selected
    const isBreedAlreadySelected = formData.selectedBreeds.some(
      (selectedBreed) => selectedBreed.breedId === breed.id
    );

    if (isBreedAlreadySelected) {
      Alert.alert('Error', 'You have already selected this breed');
      return;
    }

    const userBreed = {
      breedName: breed.name,
      breedId: breed.id,
      breedGroup: breed.breedGroup,
      userId: currentUser.id,
      isOwner: formData.role === 'breeder',
    } as UserBreed;

    setFormData((prev) => ({
      ...prev,
      selectedBreeds: [...prev.selectedBreeds, userBreed],
    }));
  };

  const handleRemoveBreed = (breedId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedBreeds: prev.selectedBreeds.filter(
        (breed) => breed.breedId !== breedId
      ),
    }));
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      // Step 1: Check role selection
      if (activeTab === 'tab1' && !formData.role) {
        Alert.alert('Error', 'Please select your role');
        return;
      }

      if (activeTab === 'tab1' && !formData.location) {
        Alert.alert('Error', 'Please enter your location');
        return;
      }
      // Step 3: Check breed selection for breeders
      if (activeTab === 'tab2' && formData.selectedBreeds.length === 0) {
        Alert.alert('Error', 'Please select at least one breed');
        return;
      }

      setActiveTab(tabs[currentIndex + 1]);
    } else {
      handleSave();
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    console.log(currentUser);
    const hasCompletedOnboarding =
      currentUser.role && currentUser.userBreeds?.length > 0;

    if (hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [currentUser, router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const userBreeds = (
        await Promise.all(
          formData.selectedBreeds.map((breed) => addUserBreed(breed))
        )
      ).filter(Boolean);

      const response: any = updateUser(currentUser.id, {
        role: formData.role,
        userBreeds,
        location: {...currentUser.location, address: formData.location},
      });

      await dispatch(
        setUserData({
          user: response.user,
        })
      );

      return router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeTab) {
      case 'tab1':
        return (
          <YStack gap='$4'>
            <XGroup>
              <XGroup.Item>
                <Button theme='active' icon={<Home />} />
              </XGroup.Item>

              <XGroup.Item>
                <Input
                  flex={1}
                  placeholder='Location'
                  value={formData.location}
                  onPressIn={() => setIsLocationSheetOpen(true)}
                />
              </XGroup.Item>
            </XGroup>

            <YGroup bordered>
              <YGroup.Item>
                <ListItem
                  pressTheme
                  padding='$4'
                  theme='active'
                  onPress={() => handleInputChange('role', 'seeker')}
                  title='Dog Seeker'
                  subTitle='I am looking for a new dog'
                  iconAfter={
                    formData.role === 'seeker' ? (
                      <CheckCircle color={colorSet.primaryForeground} />
                    ) : (
                      <Circle color='$gray9' />
                    )
                  }
                />
              </YGroup.Item>
              <Separator />
              <YGroup.Item>
                <ListItem
                  pressTheme
                  padding='$4'
                  theme='active'
                  onPress={() => handleInputChange('role', 'breeder')}
                  title='Dog Breeder'
                  subTitle='I want to rehome my dog(s)'
                  iconAfter={
                    formData.role === 'breeder' ? (
                      <CheckCircle color={colorSet.primaryForeground} />
                    ) : (
                      <Circle color='$gray9' />
                    )
                  }
                />
              </YGroup.Item>
            </YGroup>
          </YStack>
        );

      case 'tab2':
        return (
          <YStack gap='$4'>
            <YGroup>
              {formData.selectedBreeds.map((breed) => (
                <YGroup.Item key={breed.breedName}>
                  <ListItem
                    title={
                      <Text textTransform='capitalize'>{breed.breedName}</Text>
                    }
                    subTitle={`${breed.breedGroup} group`}
                    onPress={() => handleRemoveBreed(breed.breedId!)}
                    iconAfter={Trash}
                  />
                  <Separator />
                </YGroup.Item>
              ))}
            </YGroup>

            <BreedSelector
              onSelectBreed={handleSelectBreed}
              userBreeds={formData.selectedBreeds}
              buttonText={
                formData.selectedBreeds?.length
                  ? localized('Add Another Breed')
                  : localized('Select Breed')
              }
            />
          </YStack>
        );
    }
  };

  return (
    <View
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      {loading ? (
        <Spinner size='large' color={colorSet.primaryForeground} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack padding='$4' gap='$4'>
            <YStack gap='$4' padding='$4'>
              <View style={styles?.logo}>
                <Image style={styles.logoImage} source={theme.icons?.logo} />
              </View>

              <Text style={styles.title}>
                Hey, {currentUser?.firstName || currentUser?.username}
              </Text>

              <Text style={styles.caption}>
                {OnboardingSteps[activeTab].description(
                  formData.role === 'breeder'
                )}
              </Text>
            </YStack>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              flexDirection='column'
              gap='$4'
            >
              <Tabs.List>
                {tabs.map((tab, index) => (
                  <Tabs.Tab
                    key={tab}
                    value={tab}
                    flex={1}
                    backgroundColor={
                      activeTab === tab
                        ? colorSet.secondaryForeground
                        : colorSet.grey0
                    }
                    bordered
                  >
                    <Text>{OnboardingSteps[tab].title}</Text>
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              <Tabs.Content value={activeTab}>
                {renderStepContent()}
              </Tabs.Content>
            </Tabs>

            <XStack justifyContent='space-between'>
              <Button
                onPress={handleBack}
                chromeless
                icon={<ChevronLeft />}
                disabled={currentIndex === 0 || loading}
                opacity={currentIndex === 0 ? 0.5 : 1}
              >
                Back
              </Button>

              {currentIndex !== tabs.length - 1 && (
                <Button
                  onPress={handleNext}
                  disabled={currentIndex === tabs.length - 1}
                  opacity={currentIndex === tabs.length - 1 ? 0.5 : 1}
                  iconAfter={<ChevronRight />}
                >
                  {OnboardingSteps[activeTab].cta(formData.role)}
                </Button>
              )}

              {currentIndex === tabs.length - 1 && (
                <Button
                  onPress={handleSave}
                  disabled={loading}
                  iconAfter={loading ? <Spinner /> : <ChevronRight />}
                >
                  {loading ? '' : 'Save'}
                </Button>
              )}
            </XStack>
          </YStack>
        </ScrollView>
      )}

      <LocationSelector
        isLocationSheetOpen={isLocationSheetOpen}
        setIsLocationSheetOpen={setIsLocationSheetOpen}
        handleInputChange={handleInputChange}
      />
    </View>
  );
};

export default OnboardingScreen;

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
