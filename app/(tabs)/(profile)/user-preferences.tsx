import React, {useEffect, useState} from 'react';
import {
  Sheet,
  YStack,
  XStack,
  Button,
  Text,
  Switch,
  ToggleGroup,
  ScrollView,
  ListItem,
  YGroup,
  Separator,
  View,
  Spinner,
} from 'tamagui';
import {useBreedSearch} from '../../../hooks/useBreedSearch';
import {useTheme} from '../../../dopebase';
import {X} from '@tamagui/lucide-icons';
import useCurrentUser from '../../../hooks/useCurrentUser';

export default function BreedPreferences() {
  const {traitCategories, traitPreferences, updateFilter} = useBreedSearch();

  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  const currentUser = useCurrentUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (currentUser?.traitPreferences) {
      updateFilter('traitPreferences', currentUser.traitPreferences);
    }
    setLoading(false);
  }, [currentUser]);

  const renderTraitOption = (option) => {
    if (option.type === 'switch') {
      return (
        <ListItem key={option.name}>
          <ListItem.Text>{option.label}</ListItem.Text>
          <Switch
            backgroundColor={
              !!traitPreferences[option.name] ? colorSet.grey3 : colorSet.grey0
            }
            checked={!!traitPreferences[option.name]}
            onCheckedChange={(value) =>
              updateFilter('traitPreferences', {[option.name]: value})
            }
          >
            <Switch.Thumb
              animation='quicker'
              backgroundColor={colorSet.primaryForeground}
            />
          </Switch>
        </ListItem>
      );
    } else if (option.type === 'toggle') {
      return (
        <ListItem key={option.name} width='100%'>
          <YStack flex={1} gap='$4'>
            <ListItem.Text>
              {option.name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </ListItem.Text>
            <ToggleGroup
              type='single'
              value={traitPreferences[option.name]?.toString()}
              onValueChange={(value) =>
                updateFilter('traitPreferences', {
                  [option.name]: parseInt(value),
                })
              }
              flex={1}
            >
              {option.values.map((value, index) => (
                <ToggleGroup.Item key={value} value={index.toString()} flex={1}>
                  <Text color={colorSet.primaryText}>{value}</Text>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </YStack>
        </ListItem>
      );
    }
  };

  return (
    <View
      flex={1}
      alignItems='center'
      justifyContent='center'
      backgroundColor={colorSet.primaryBackground}
    >
      <YStack flex={1} width='100%' padding='$4'>
        {loading ? (
          <Spinner />
        ) : (
          <ScrollView marginTop='$4'>
            <YStack paddingBottom='$12' gap='$4'>
              {traitCategories.map((category) => (
                <YGroup key={category.name} bordered>
                  <YGroup.Item>
                    <ListItem
                      title={category.name}
                      subTitle={category.caption}
                    />
                  </YGroup.Item>
                  {category.options.map(renderTraitOption)}

                  <Separator />
                </YGroup>
              ))}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </View>
  );
}
