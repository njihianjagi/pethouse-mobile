import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Spinner,
  YStack,
  ListItem,
  Separator,
  YGroup,
  Avatar,
  ScrollView,
} from 'tamagui';
import useKennelData from '../../../api/firebase/kennels/useKennelData';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useTheme} from '../../../dopebase';
import {
  ChevronRight,
  Dog,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from '@tamagui/lucide-icons';
import {logout} from '../../../redux/reducers/auth';
import {useRouter} from 'expo-router';
import {useAuth} from '../../../hooks/useAuth';

const ProfileScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const {getKennelByUserId, kennels, loading} = useKennelData();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const authManager = useAuth();

  const [kennel, setKennel] = useState({} as any);
  // const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'breeder') {
      getKennelByUserId(currentUser.id || currentUser.uid).then((kennel) => {
        if (kennels) {
          setKennel(kennel);
        }
      });
    }
  }, [currentUser]);

  // const handleUpdateProfile = async () => {
  //   setIsUpdating(true);
  //   try {
  //     await updateUser(currentUser.id, {
  //       /* updated user data */
  //     });
  //     // Optionally, update local state or show a success message
  //   } catch (error) {
  //     console.error('Error updating user details:', error);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

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
      {currentUser?.role === 'breeder' && loading ? (
        <Spinner
          size='large'
          color={theme.colors[appearance].primaryForeground}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            width: '100%',
            backgroundColor: colorSet.primaryBackground,
          }}
        >
          <YStack p='$4' gap='$6' width='100%'>
            <YStack alignItems='center' gap='$4'>
              <Avatar circular size='$12'>
                <Avatar.Image
                  accessibilityLabel='Cam'
                  src={currentUser.profilePictureURL}
                />
                <Avatar.Fallback backgroundColor='$blue10' />
              </Avatar>

              <YStack gap='$2' alignItems='center'>
                <Text
                  fontSize='$8'
                  fontWeight='bold'
                  color={colorSet.primaryForeground}
                >
                  {currentUser.username ||
                    `${currentUser.firstName} ${currentUser.lastName}` ||
                    currentUser.displayName}
                </Text>

                <Text>{currentUser.phoneNumber || currentUser.email}</Text>

                <Text>
                  Joined {new Date(currentUser.createdAt).toLocaleDateString()}
                </Text>
              </YStack>
            </YStack>

            <YGroup bordered width='100%'>
              <ListItem
                title='Profile'
                subTitle='View and edit your profile'
                icon={User}
                iconAfter={ChevronRight}
                pressTheme
              />
              <Separator />
              {currentUser.role === 'breeder' ? (
                <ListItem
                  icon={Dog}
                  title='Kennel'
                  subTitle='Manage your breeds and services'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('(profile)/kennel')}
                />
              ) : (
                <ListItem
                  icon={Dog}
                  title='Breed preferences'
                  subTitle='Manage your preferred breeds'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('(profile)/preferences')}
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
        </ScrollView>
      )}
    </View>
  );
};

export default ProfileScreen;
