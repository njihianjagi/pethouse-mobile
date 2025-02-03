import React from 'react';
import {YStack, XStack, Text, Card, Button, Progress} from 'tamagui';
import {useTranslations} from '../../../../dopebase';
import {useRouter} from 'expo-router';
import {useLitterForm} from '../../../../hooks/useLitterForm';
import {Check, AlertCircle, ChevronRight} from '@tamagui/lucide-icons';

const STEPS = [
  {
    key: 'basic-info',
    title: 'Basic Information',
    description: 'Enter basic details about your litter',
    validate: (formData) =>
      !!(formData.breed?.breedId && formData.expectedDate),
  },
  {
    key: 'media',
    title: 'Photos & Videos',
    description: 'Add photos and videos',
    validate: (formData) =>
      !!(formData.media?.images?.length || formData.media?.videos?.length),
  },
  {
    key: 'parents',
    title: 'Parent Information',
    description: 'Add details about the sire and dam',
    validate: (formData) => !!(formData.parents?.sire && formData.parents?.dam),
  },
  {
    key: 'health',
    title: 'Health Testing',
    description: 'Add health testing information',
    validate: (formData, validateStep) => validateStep('health'),
  },
  {
    key: 'requirements',
    title: 'Requirements',
    description: 'Set adoption requirements',
    validate: (formData, validateStep) => validateStep('requirements'),
  },
  {
    key: 'pricing',
    title: 'Pricing & Registration',
    description: 'Set pricing and registration details',
    validate: (formData) => !!(formData.price?.base && formData.price?.deposit),
  },
];

export default function LitterListingIndex() {
  const {localized} = useTranslations();
  const router = useRouter();
  const {formData, validateStep} = useLitterForm();

  const completedSteps = STEPS.filter((step) =>
    step.validate(formData, validateStep)
  ).length;

  const progress = (completedSteps / STEPS.length) * 100;

  return (
    <YStack gap='$4' padding='$4'>
      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Create Litter Listing')}
          </Text>

          <Progress value={progress}>
            <Progress.Indicator animation='bouncy' />
          </Progress>

          <Text color='$gray11'>
            {completedSteps} of {STEPS.length} steps completed
          </Text>
        </YStack>
      </Card>

      {STEPS.map((step) => {
        const isComplete = step.validate(formData, validateStep);

        return (
          <Button
            key={step.key}
            onPress={() => router.push(`/litter/${step.key}`)}
            theme={isComplete ? 'active' : 'alt2'}
          >
            <XStack flex={1} alignItems='center' justifyContent='space-between'>
              <YStack flex={1}>
                <Text fontWeight='bold'>{localized(step.title)}</Text>
                <Text fontSize='$3' color='$gray11'>
                  {localized(step.description)}
                </Text>
              </YStack>

              <XStack alignItems='center' gap='$2'>
                {isComplete ? (
                  <Check color='$green10' />
                ) : (
                  <AlertCircle color='$yellow10' />
                )}
                <ChevronRight />
              </XStack>
            </XStack>
          </Button>
        );
      })}

      <Button
        theme='active'
        onPress={() => router.push('/litter/submit')}
        disabled={completedSteps < STEPS.length}
      >
        {localized('Review & Submit')}
      </Button>
    </YStack>
  );
}
