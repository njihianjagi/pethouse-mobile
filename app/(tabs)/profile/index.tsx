import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  YStack,
  ListItem,
  Separator,
  YGroup,
  Avatar,
  ScrollView,
} from 'tamagui';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useTheme} from '../../../dopebase';
import {
  ChevronRight,
  Dog,
  HelpCircle,
  LogOut,
  User,
} from '@tamagui/lucide-icons';
import {logout} from '../../../redux/reducers/auth';
import {useRouter} from 'expo-router';
import {useAuth} from '../../../hooks/useAuth';

const ProfileScreen = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const authManager = useAuth();

  // const handleUpdateProfile = async () => {
  //   setIsUpdating(true);
  //   try {
  //     await updateUser(currentUser?.id, {
  //       /* updated user data */
  //     });
  //     // Optionally, update local state or show a success message
  //   } catch (error) {
  //     console.error('Error updating user details:', error);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  useEffect(() => {
    if (!currentUser.id) {
      router.replace('/(auth)/welcome');
    }
  }, [currentUser]);

  const onLogout = useCallback(() => {
    logout();
    authManager.logout(currentUser);
    router.replace('/(auth)/welcome');
  }, []);

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
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
                src={currentUser?.profilePictureURL}
              />
              <Avatar.Fallback backgroundColor='$blue10' />
            </Avatar>

            <YStack gap='$2' alignItems='center'>
              <Text
                fontSize='$8'
                fontWeight='bold'
                color={colorSet.primaryForeground}
              >
                {currentUser?.username ||
                  `${currentUser?.firstName} ${currentUser?.lastName}` ||
                  currentUser?.displayName}
              </Text>

              <Text>{currentUser?.phoneNumber || currentUser?.email}</Text>

              <Text>
                Joined {new Date(currentUser?.createdAt).toLocaleDateString()}
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
              onPress={() => router.push('/(profile)/edit')}
            />
            <Separator />
            {currentUser?.role === 'breeder' ? (
              <>
                {currentUser?.isKennelOwner && (
                  <>
                    <ListItem
                      icon={Dog}
                      title='Kennel'
                      subTitle='Manage your kennel information'
                      iconAfter={ChevronRight}
                      pressTheme
                      onPress={() => router.push('/(profile)/kennel')}
                    />
                    <Separator />
                  </>
                )}
                <ListItem
                  icon={Dog}
                  title='Breeds'
                  subTitle='View and manage your breeds'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('/(profile)/breeds')}
                />
                <Separator />
                <ListItem
                  icon={Dog}
                  title='Listings'
                  subTitle='View and manage your listings'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('/(profile)/listings')}
                />
                <Separator />
                <ListItem
                  icon={Dog}
                  title='Litters'
                  subTitle='View and manage your litters'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('/(profile)/litters')}
                />
              </>
            ) : (
              <>
                <ListItem
                  icon={Dog}
                  title='Your Breeds'
                  subTitle='View and manage your breeds'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('/(profile)/breeds')}
                />
                <Separator />
                <ListItem
                  icon={Dog}
                  title='Breed preferences'
                  subTitle='Manage your breed preferences'
                  iconAfter={ChevronRight}
                  pressTheme
                  onPress={() => router.push('/(profile)/preferences')}
                />
              </>
            )}
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
    </View>
  );
};

export default ProfileScreen;
