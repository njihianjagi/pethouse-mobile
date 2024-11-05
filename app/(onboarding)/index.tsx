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
  Card,
  Switch,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash,
  Circle,
  Heart,
  Home,
  Plus,
  Scissors,
} from '@tamagui/lucide-icons';
import {TraitSelector} from '../../components/TraitSelector';
import {BreedRecommendations} from '../../components/BreedRecommendations';
import {useBreedSearch} from '../../hooks/useBreedSearch';
import BreedSelector from '../../components/BreedSelector';
import {updateUser} from '../../api/firebase/users/userClient';
import useBreedData, {
  Breed,
  UserBreed,
} from '../../api/firebase/breeds/useBreedData';
import useKennelData from '../../api/firebase/kennels/useKennelData';
import {setUserData} from '../../redux/reducers/auth';
import {useDispatch} from 'react-redux';
import LocationSelector from '../../components/LocationSelector';

const OnboardingSteps = {
  tab1: {
    title: 'Welcome to Doghouse!',
    description: () => 'Tell us a bit about yourself to get started',
    cta: () => 'Continue',
  },
  tab2: {
    title: 'Your Preferences',
    description: (isBreeder) =>
      isBreeder
        ? 'Tell us about your kennel and where you are located.'
        : 'Tell us about your ideal pet companion.',
    cta: (isBreeder) => (isBreeder ? 'Set Kennel Info' : 'Set Preferences'),
  },
  tab3: {
    title: (isBreeder) => (isBreeder ? 'Your Breeds' : 'Browse Breeds'),
    description: (isBreeder) =>
      isBreeder
        ? 'Select the breeds you work with.'
        : 'Explore breeds that match your preferences.',
    cta: (isBreeder) => (isBreeder ? 'Complete Setup' : 'Find Your Match'),
  },
};

const OnboardingScreen = () => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: '',
    kennelName: '',
    description: '',
    location: '',
    selectedBreeds: [] as any[],
    hasKennel: true,
  });

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

  const {addUserBreed} = useBreedData(currentUser?.id);
  const {addKennel} = useKennelData();
  const {filteredBreeds, updateFilter, traitGroups, traitPreferences} =
    useBreedSearch();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();

  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const dispatch = useDispatch();

  const tabs = ['tab1', 'tab2', 'tab3'];
  const [activeTab, setActiveTab] = useState('tab1');
  const currentIndex = tabs.indexOf(activeTab);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));

    if (field === 'hasKennel') {
      setFormData((prev) => ({
        ...prev,
        kennelName: value
          ? ''
          : currentUser.username ||
            currentUser.firstName + ' ' + currentUser.lastName,
      }));
    }
  };

  const handleSelectBreed = (breed: Breed) => {
    setFormData((prev) => ({
      ...prev,
      selectedBreeds: [...prev.selectedBreeds, breed],
    }));
  };

  const handleRemoveBreed = (breedId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedBreeds: prev.selectedBreeds.filter(
        (breed) => breed.id !== breedId
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

      // Step 2: Check kennel info for breeders
      if (
        activeTab === 'tab2' &&
        formData.role === 'breeder' &&
        formData.hasKennel
      ) {
        if (!formData.kennelName) {
          Alert.alert('Error', 'Please enter your kennel name');
          return;
        }
      }

      if (activeTab === 'tab2' && formData.role === 'breeder') {
        if (!formData.location) {
          Alert.alert('Error', 'Please enter your location');
          return;
        }
      }
      // Step 3: Check breed selection for breeders
      if (
        activeTab === 'tab3' &&
        formData.role === 'breeder' &&
        formData.selectedBreeds.length === 0
      ) {
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

    const hasCompletedOnboarding =
      currentUser.role &&
      ((currentUser.role === 'seeker' && currentUser.traitPreferences) ||
        (currentUser.role === 'breeder' && currentUser.userBreeds?.length > 0));

    if (hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [currentUser, router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.role === 'breeder') {
        let kennelId;
        if (formData.hasKennel) {
          const kennel: any = await addKennel({
            name: formData.kennelName,
            location: formData.location,
            userId: currentUser.id,
          });
          kennelId = kennel.id;
        }

        const userBreeds = await Promise.all(
          formData.selectedBreeds.map((breed) =>
            addUserBreed({
              userId: currentUser.id,
              breedId: breed.id,
              breedName: breed.name,
              breedGroup: breed.breedGroup,
              isOwner: true,
              ...(kennelId ? kennelId : {}),
            })
          )
        );

        const response: any = updateUser(currentUser.id, {
          role: formData.role,
          ...(kennelId ? kennelId : {}),
          userBreeds,
        });

        await dispatch(
          setUserData({
            user: response.user,
          })
        );

        return router.replace('/(tabs)');
      } else {
        const response: any = await updateUser(currentUser.id, {
          traitPreferences: traitPreferences,
        });

        const userBreeds = await Promise.all(
          formData.selectedBreeds.map((breed) =>
            addUserBreed({
              userId: currentUser.id,
              breedId: breed.id,
              breedName: breed.name,
              breedGroup: breed.breedGroup,
              isOwner: false,
            })
          )
        );

        await updateUser(currentUser?.id, {
          role: formData.role,
          userBreeds,
          traitPreferences,
        });

        await dispatch(
          setUserData({
            user: response.user,
          })
        );

        return router.replace('/(tabs)');
      }
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
          <YGroup bordered>
            <YGroup.Item>
              <ListItem
                pressTheme
                padding='$4'
                theme='active'
                onPress={() => handleInputChange('role', 'seeker')}
                borderColor={
                  formData.role === 'seeker' ? '$gray3' : colorSet.grey0
                }
                title={
                  <Text
                    color={
                      formData.role === 'seeker'
                        ? colorSet.primaryForeground
                        : colorSet.primaryText
                    }
                  >
                    {localized('Dog Seeker')}
                  </Text>
                }
                subTitle={
                  <Text
                    fontSize='$3'
                    color={
                      formData.role === 'seeker'
                        ? colorSet.primaryForeground
                        : 'gray'
                    }
                  >
                    {localized('I am looking for a new dog')}
                  </Text>
                }
                iconAfter={
                  formData.role && formData.role === 'seeker' ? (
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
                borderColor={
                  formData.role === 'breeder' ? '$gray4' : colorSet.grey0
                }
                title={
                  <Text
                    color={
                      formData.role === 'breeder'
                        ? colorSet.primaryForeground
                        : colorSet.primaryText
                    }
                  >
                    {localized('Dog Breeder')}
                  </Text>
                }
                subTitle={
                  <Text
                    fontSize='$3'
                    color={
                      formData.role === 'breeder'
                        ? colorSet.primaryForeground
                        : 'gray'
                    }
                  >
                    {localized('I want to rehome my dog(s)')}
                  </Text>
                }
                iconAfter={
                  formData.role && formData.role === 'breeder' ? (
                    <CheckCircle color={colorSet.primaryForeground} />
                  ) : (
                    <Circle color='$gray9' />
                  )
                }
              />
            </YGroup.Item>
          </YGroup>
        );

      case 'tab2':
        return formData.role === 'breeder' ? (
          // Breeder kennel info form
          <YGroup bordered gap='$4'>
            <YGroup.Item>
              <YStack gap='$4'>
                <YStack>
                  <Input
                    placeholder={localized('Kennel Name')}
                    value={formData.kennelName}
                    onChangeText={(value) =>
                      handleInputChange('kennelName', value)
                    }
                  />
                  <XStack justifyContent='space-between' alignItems='center'>
                    <Text>I don't have a kennel. Use my username instead</Text>
                    <Switch
                      checked={!formData.hasKennel}
                      onCheckedChange={(checked) =>
                        handleInputChange('hasKennel', !checked)
                      }
                      backgroundColor={
                        !formData.hasKennel
                          ? colorSet.secondaryForeground
                          : colorSet.grey6
                      }
                    >
                      <Switch.Thumb
                        animation='quicker'
                        backgroundColor={colorSet.primaryForeground}
                      />
                    </Switch>
                  </XStack>
                </YStack>
              </YStack>
            </YGroup.Item>

            <YGroup.Item>
              <Input
                placeholder={localized('Location')}
                value={formData.location}
                onPressIn={() => setIsLocationSheetOpen(true)}
              />
            </YGroup.Item>
          </YGroup>
        ) : (
          // Seeker preferences
          <TraitSelector
            currentIndex={currentIndex}
            traitGroups={traitGroups || {}}
            traitPreferences={traitPreferences}
            updateFilter={updateFilter}
          />
        );

      case 'tab3':
        return formData.role === 'breeder' ? (
          <YStack gap='$4'>
            <YGroup>
              {formData.selectedBreeds.map((breed) => (
                <YGroup.Item key={breed.name}>
                  <ListItem
                    title={<Text textTransform='capitalize'>{breed.name}</Text>}
                    subTitle={`${breed.breedGroup} group`}
                    onPress={() => handleRemoveBreed(breed.id!)}
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
                  : localized('Add Breed')
              }
            />
          </YStack>
        ) : (
          <BreedRecommendations
            filteredBreeds={filteredBreeds}
            onSelectBreed={() => {}}
          />
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
                {OnboardingSteps[activeTab].description(formData.role)}
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
                  >
                    <Text>Step {index + 1}</Text>
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
