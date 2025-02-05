import React from 'react';
import {YStack, XStack, Text, Select, Input, Switch, Button} from 'tamagui';
import {useTranslations} from '../dopebase';
import {Filter} from '@tamagui/lucide-icons';

interface ListingFiltersProps {
  filters: {
    type?: 'puppy' | 'litter' | 'wanted';
    breed?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    sex?: 'male' | 'female' | 'either';
    age?: {
      min: number;
      max: number;
    };
    registration?: boolean;
    health?: {
      vaccinated?: boolean;
      dewormed?: boolean;
      microchipped?: boolean;
      healthTested?: boolean;
    };
  };
  onFiltersChange: (filters: any) => void;
}

export const ListingFilters = ({
  filters,
  onFiltersChange,
}: ListingFiltersProps) => {
  const {localized} = useTranslations();
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <YStack p='$4' gap='$4'>
      <XStack ai='center' jc='space-between'>
        <Text fontSize='$6' fontWeight='bold'>
          {localized('Filters')}
        </Text>
        <Button
          icon={Filter}
          variant='outlined'
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? localized('Hide Filters') : localized('Show Filters')}
        </Button>
      </XStack>

      {isExpanded && (
        <YStack gap='$4'>
          <Select
            value={filters.type}
            onValueChange={(value) =>
              onFiltersChange({...filters, type: value})
            }
          >
            <Select.Item index={0} value='puppy'>
              {localized('Puppies')}
            </Select.Item>
            <Select.Item index={1} value='litter'>
              {localized('Litters')}
            </Select.Item>
            <Select.Item index={2} value='wanted'>
              {localized('Wanted')}
            </Select.Item>
          </Select>

          <YStack gap='$2'>
            <Text>{localized('Price Range')}</Text>
            <XStack gap='$4'>
              <Input
                flex={1}
                value={filters.priceRange?.min?.toString()}
                onChangeText={(value) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: {
                      ...filters.priceRange,
                      min: parseInt(value) || 0,
                    },
                  })
                }
                keyboardType='numeric'
                placeholder={localized('Min')}
              />
              <Input
                flex={1}
                value={filters.priceRange?.max?.toString()}
                onChangeText={(value) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: {
                      ...filters.priceRange,
                      max: parseInt(value) || 0,
                    },
                  })
                }
                keyboardType='numeric'
                placeholder={localized('Max')}
              />
            </XStack>
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Health Requirements')}</Text>
            {Object.entries(filters.health || {}).map(([key, value]) => (
              <XStack key={key} gap='$2' alignItems='center'>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      health: {...filters.health, [key]: checked},
                    })
                  }
                />
                <Text>{localized(key)}</Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  );
};
