import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Spinner,
  YStack,
  ListItem,
  Separator,
  YGroup,
  Image,
  Button,
  Avatar,
  ListItemTitle,
  ListItemSubtitle,
  Spacer,
} from 'tamagui';
import useKennelData from '../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../hooks/useCurrentUser';
import {useTheme} from '../../dopebase';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {updateUser} from '../../api/firebase/users/userClient';
import {
  Badge,
  ChevronRight,
  Dog,
  HelpCircle,
  Home,
  LogOut,
  Pencil,
  Settings,
  User,
} from '@tamagui/lucide-icons';
import {logout} from '../../redux/auth';
import {useRouter} from 'expo-router';
import {useAuth} from '../../hooks/useAuth';

const profile = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const {getKennelByUserId, kennels, loading} = useKennelData();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const [kennel, setKennel] = useState({} as any);
  const [isUpdating, setIsUpdating] = useState(false);

  const authManager = useAuth();

  useEffect(() => {
    if (currentUser?.role === 'breeder') {
      getKennelByUserId(currentUser.id || currentUser.uid).then((kennel) => {
        if (kennels) {
          setKennel(kennel);
        }
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateUser(currentUser.id, {
        /* updated user data */
      });
      // Optionally, update local state or show a success message
    } catch (error) {
      console.error('Error updating user details:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onLogout = useCallback(() => {
    logout();
    authManager.logout(currentUser);
    router.push('/');
  }, []);

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
        <KeyboardAwareScrollView
          style={{width: '100%', height: '100%'}}
          keyboardShouldPersistTaps='always'
        >
          <YStack p='$4' gap='$6'>
            <YStack alignItems='center' gap='$4'>
              <Avatar circular size='$12'>
                <Avatar.Image
                  accessibilityLabel='Cam'
                  src={currentUser.profilePictureURL}
                />
                <Avatar.Fallback backgroundColor='$blue10' />
              </Avatar>

              <YStack justifyContent='center'>
                <Text
                  fontSize='$6'
                  fontWeight='bold'
                  color={colorSet.primaryForeground}
                >
                  {currentUser.username || 'Username'}
                </Text>

                <Text>{currentUser.phoneNumber}</Text>
              </YStack>

              <Separator />
              <Text>
                Joined {new Date(currentUser.createdAt).toLocaleDateString()}
              </Text>
            </YStack>

            <YGroup bordered>
              <ListItem
                title='Profile'
                subTitle='View and edit your profile'
                icon={User}
                iconAfter={ChevronRight}
              />
              <Separator />
              {currentUser.role === 'breeder' ? (
                <ListItem
                  icon={Dog}
                  title='Kennel'
                  subTitle='Manage your breeds and services'
                  iconAfter={ChevronRight}
                />
              ) : (
                <ListItem
                  icon={Dog}
                  title='Breed preferences'
                  subTitle='Manage your preferred breeds'
                  iconAfter={ChevronRight}
                />
              )}
              <Separator />

              <Separator />
              <ListItem
                icon={Settings}
                title='Settings'
                subTitle='Account settings'
                iconAfter={ChevronRight}
              />
            </YGroup>

            <YGroup bordered>
              <ListItem
                icon={HelpCircle}
                title='Help & Contact'
                iconAfter={ChevronRight}
              />
              <Separator />

              <Separator />
              <ListItem
                icon={LogOut}
                title='Log out'
                iconAfter={ChevronRight}
                onPress={onLogout}
              />
            </YGroup>
          </YStack>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default profile;
