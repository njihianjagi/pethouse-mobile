import React, {useEffect, useState} from 'react';
import {Pressable} from 'react-native';
import {
  YStack,
  XStack,
  Text,
  ListItem,
  Separator,
  YGroup,
  Sheet,
  Button,
  Spinner,
  Switch,
} from 'tamagui';
import {
  Star,
  StarOff,
  ChevronRight,
  CheckCircle,
  Circle,
  X,
  CircleDot,
} from '@tamagui/lucide-icons';
import {useTheme} from '../dopebase';
import {updateUser} from '../api/firebase/users/userClient';
import useCurrentUser from '../hooks/useCurrentUser';
import {setUserData} from '../redux/reducers/auth';
import {useDispatch} from 'react-redux';
interface TraitSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  traitGroups: any;
  traitPreferences: any;
  updateFilter: any;
}

export const TraitSelector = ({
  isOpen,
  onClose,
  traitGroups,
  traitPreferences,
  updateFilter,
}: TraitSelectorProps) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const currentUser = useCurrentUser();
  const dispatch = useDispatch();

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const currentGroup = traitGroups[currentGroupIndex];
  const [tempPreferences, setTempPreferences] = useState({});

  const [loading, setLoading] = useState(false);

  // Initialize temp preferences when opening sheet
  useEffect(() => {
    if (isOpen) {
      setTempPreferences(traitPreferences || {});
      setCurrentGroupIndex(0);
    }
  }, [isOpen, traitPreferences]);

  const handleUpdatePreference = (traitName: string, value: boolean) => {
    setTempPreferences((prev) => ({
      ...prev,
      [traitName]: value,
    }));
  };

  const handleClose = async () => {
    try {
      setLoading(true);
      // Only update preferences if we completed all groups
      if (currentGroupIndex === traitGroups.length - 1) {
        // Update user preferences in Firebase
        if (currentUser?.id) {
          const response: any = await updateUser(currentUser.id, {
            traitPreferences: tempPreferences,
          });

          const user = response.user;
          dispatch(setUserData({user}));
        }

        // Update local breed search filter
        updateFilter('traitPreferences', tempPreferences);
      }

      onClose();
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentGroupIndex < traitGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

  // const renderStarRating = (traitName: string, currentRating: number = 0) => {
  //   return (
  //     <XStack gap='$0.5' alignItems='center'>
  //       {[1, 2, 3, 4, 5].map((score) => (
  //         <Pressable
  //           key={score}
  //           onPress={() => handleUpdatePreference(traitName, score)}
  //         >
  //           {score <= (currentRating || 0) ? (
  //             <CircleDot size={24} color={theme.colors[appearance].primary} />
  //           ) : (
  //             <Circle
  //               size={24}
  //               color={theme.colors[appearance].primary}
  //               // opacity={0.5}
  //             />
  //           )}
  //         </Pressable>
  //       ))}
  //     </XStack>
  //   );
  // };

  // const renderTraitOption = (trait: {name: string; score: number}) => {
  //   // const traitKey = trait.name.toLowerCase().replace(/\s+/g, '_');
  //   return (
  //     <YStack key={trait.name}>
  //       <ListItem
  //         pressTheme
  //         pressStyle={{opacity: 0.8}}
  //         paddingVertical='$3'
  //         title={<Text>{trait.name}</Text>}
  //       >
  //         <XStack flex={1} justifyContent='space-between' alignItems='center'>
  //           {renderStarRating(
  //             trait.name,
  //             tempPreferences[trait.name] as number
  //           )}
  //         </XStack>
  //       </ListItem>
  //       <Separator />
  //     </YStack>
  //   );
  // };

  const renderTraitOption = (trait) => (
    <ListItem key={trait.name}>
      <ListItem.Text>{trait.name}</ListItem.Text>
      <Switch
        backgroundColor={
          !!tempPreferences[trait.name]
            ? colorSet.secondaryForeground
            : '$gray3'
        }
        checked={!!tempPreferences[trait.name]}
        onCheckedChange={(value) => handleUpdatePreference(trait.name, value)}
      >
        <Switch.Thumb
          animation='quicker'
          backgroundColor={
            !!tempPreferences[trait.name]
              ? colorSet.primaryForeground
              : '$gray6'
          }
        />
      </Switch>
    </ListItem>
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      snapPointsMode='fit'
    >
      <Sheet.Overlay />
      <Sheet.Frame>
        <YStack padding='$4' gap='$4'>
          <XStack justifyContent='space-between' alignItems='center'>
            <Text fontSize='$6' fontWeight='bold'>
              Select traits
            </Text>
            <Button chromeless icon={<X size='$1' />} />
          </XStack>

          <YGroup padding='$2'>
            <YGroup.Item>
              <ListItem
                title={
                  <Text fontSize='$6' fontWeight='bold'>
                    {currentGroup?.name}
                  </Text>
                }
              />
            </YGroup.Item>
            <Separator />
            {/* Map through traits array instead of using Object.entries */}
            {currentGroup.traits &&
              currentGroup.traits.map((trait) => (
                <YGroup.Item key={trait.name}>
                  {renderTraitOption(trait)}
                </YGroup.Item>
              ))}
          </YGroup>
          <XStack justifyContent='space-between'>
            <Button
              onPress={handleBack}
              disabled={currentGroupIndex === 0}
              chromeless
            >
              Back
            </Button>
            <Button onPress={handleNext}>
              {loading ? (
                <Spinner />
              ) : currentGroupIndex === traitGroups.length - 1 ? (
                'Done'
              ) : (
                'Next'
              )}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};
