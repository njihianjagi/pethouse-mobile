import React from 'react';
import {YStack, XStack, Text, Card, Switch, Select, Button} from 'tamagui';
import {useTranslations} from '../../../../dopebase';
import {useRouter} from 'expo-router';
import {useLitterForm} from '../../../../hooks/useLitterForm';

const REQUIREMENTS = {
  boolean: [
    {key: 'application', label: 'Application Required'},
    {key: 'contract', label: 'Contract Required'},
    {key: 'spayNeuter', label: 'Spay/Neuter Agreement'},
    {key: 'returnPolicy', label: 'Return Policy'},
    {key: 'homeCheck', label: 'Home Check Required'},
    {key: 'references', label: 'References Required'},
    {key: 'experience', label: 'Previous Experience Required'},
    {key: 'yard', label: 'Yard Required'},
    {key: 'fence', label: 'Fenced Yard Required'},
  ],
  select: [
    {
      key: 'otherPets',
      label: 'Other Pets',
      options: [
        {value: 'allowed', label: 'Allowed'},
        {value: 'no-dogs', label: 'No Dogs'},
        {value: 'no-cats', label: 'No Cats'},
        {value: 'none', label: 'No Other Pets'},
      ],
    },
    {
      key: 'children',
      label: 'Children',
      options: [
        {value: 'allowed', label: 'Allowed'},
        {value: 'no-young-children', label: 'No Young Children'},
        {value: 'none', label: 'No Children'},
      ],
    },
  ],
} as const;

export default function RequirementsStep() {
  const {localized} = useTranslations();
  const router = useRouter();
  const {formData, handleChange, validateStep} = useLitterForm();

  return (
    <YStack gap='$4' padding='$4'>
      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Basic Requirements')}
          </Text>

          {REQUIREMENTS.boolean.map((req) => (
            <XStack
              key={req.key}
              justifyContent='space-between'
              alignItems='center'
            >
              <Text>{localized(req.label)}</Text>
              <Switch
                checked={formData.requirements?.[req.key] ?? false}
                onCheckedChange={(checked) =>
                  handleChange('requirements', {
                    ...formData.requirements,
                    [req.key]: checked,
                  })
                }
              />
            </XStack>
          ))}
        </YStack>
      </Card>

      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Household Requirements')}
          </Text>

          {REQUIREMENTS.select.map((req) => (
            <XStack
              key={req.key}
              justifyContent='space-between'
              alignItems='center'
            >
              <Text flex={1}>{localized(req.label)}</Text>
              <Select
                value={formData.requirements?.[req.key] ?? 'allowed'}
                onValueChange={(value) =>
                  handleChange('requirements', {
                    ...formData.requirements,
                    [req.key]: value,
                  })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>

                <Select.Content>
                  {req.options.map((option, index) => (
                    <Select.Item
                      index={index}
                      key={option.value}
                      value={option.value}
                    >
                      <Select.ItemText>
                        {localized(option.label)}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </XStack>
          ))}
        </YStack>
      </Card>

      <Button
        theme='active'
        onPress={() => router.push('/litter/pricing')}
        disabled={!validateStep('requirements')}
      >
        {localized('Continue')}
      </Button>
    </YStack>
  );
}
