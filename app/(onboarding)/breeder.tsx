import React, {useState, useEffect} from 'react';
import {useRouter} from 'expo-router';
import {StyleSheet, Alert} from 'react-native';
import {
  YStack,
  XStack,
  Input,
  Button,
  Text,
  Spinner,
  Tabs,
  Separator,
  YGroup,
  ListItem,
  View,
  Image,
  ScrollView,
  Switch,
  Card,
} from 'tamagui';
import {useTheme, useTranslations} from '../../dopebase';
import useCurrentUser from '../../hooks/useCurrentUser';
import BreedSelector from '../../components/BreedSelector';
import useBreedData, {Breed} from '../../api/firebase/breeds/useBreedData';
import useKennelData from '../../api/firebase/kennels/useKennelData';
import {ChevronLeft, ChevronRight, Minus, Trash} from '@tamagui/lucide-icons';
import {updateUser} from '../../api/firebase/users/userClient';

const BreederOnboardingScreen = () => {
  const router = useRouter();
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();

  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];
  const styles = dynamicStyles(theme, appearance);

  const {addUserBreed} = useBreedData(currentUser?.id);
  const {addKennel} = useKennelData();

  const [formData, setFormData] = useState({
    kennelName: '',
    description: '',
    location: '',
    selectedBreeds: [] as Breed[],
    hasKennel: true,
  });
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('tab1');

  const tabs = ['tab1', 'tab2'];
  const currentIndex = tabs.indexOf(activeTab);
  const [currentStep, setCurrentStep] = useState(0);

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      if (formData.hasKennel && (!formData.kennelName || !formData.location)) {
        Alert.alert('Error', 'Please fill in all kennel information');
        return;
      }
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      handleSave();
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
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

  const handleSave = async () => {
    setLoading(true);
    try {
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

      updateUser(currentUser.id, {
        isBreeder: true,
        ...(kennelId ? kennelId : {}),
        userBreeds,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save breeder information');
    } finally {
      setLoading(false);
      router.push('/(tabs)');
    }
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      {loading ? (
        <Spinner
          size='large'
          color={theme.colors[appearance].primaryForeground}
        />
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

              <Text style={styles.title} textTransform='capitalize'>
                Hey, {currentUser?.firstName || currentUser.username}
              </Text>
              <Text style={styles.caption}>
                Tell us about the dog breeds you work with to help connect you
                with potential dog owners.
              </Text>
            </YStack>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              flexDirection='column'
              gap='$4'
            >
              <Tabs.List>
                <Tabs.Tab value='tab1' flex={1}>
                  <Text>{localized('Your Info')}</Text>
                </Tabs.Tab>
                <Tabs.Tab value='tab2' flex={1}>
                  <Text>{localized('Your Breeds')}</Text>
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Content value='tab1'>
                <YStack gap='$4'>
                  <YGroup gap='$4'>
                    <YGroup.Item>
                      <Input
                        placeholder={localized('Kennel Name')}
                        value={formData.kennelName}
                        onChangeText={(value) =>
                          handleInputChange('kennelName', value)
                        }
                        disabled={!formData.hasKennel}
                      />
                    </YGroup.Item>

                    <YGroup.Item>
                      <Input
                        placeholder={localized('Location')}
                        value={formData.location}
                        onChangeText={(value) =>
                          handleInputChange('location', value)
                        }
                        disabled={!formData.hasKennel}
                      />
                    </YGroup.Item>
                  </YGroup>

                  <Card>
                    <Card.Header>
                      <XStack
                        justifyContent='space-between'
                        alignItems='center'
                        gap='$2'
                      >
                        <Text>I don't have a kennel</Text>
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
                    </Card.Header>
                  </Card>
                </YStack>
              </Tabs.Content>

              <Tabs.Content value='tab2'>
                <YStack gap='$4'>
                  <YGroup>
                    {formData.selectedBreeds.map((breed) => (
                      <YGroup.Item key={breed.name}>
                        <ListItem
                          title={
                            <Text textTransform='capitalize'>{breed.name}</Text>
                          }
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
                    userBreeds={formData.selectedBreeds.map((breed) => ({
                      breedId: breed.id,
                      userId: currentUser.id,
                      breedName: breed.name,
                      breedGroup: breed.breedGroup,
                      isOwner: false,
                    }))}
                    buttonText={
                      formData.selectedBreeds?.length
                        ? localized('Add Another Breed')
                        : localized('Add Breed')
                    }
                  />
                </YStack>
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
                  Next
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
    </View>
  );
};

export default BreederOnboardingScreen;

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
