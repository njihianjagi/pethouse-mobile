import React, {useState} from 'react';
import {
  YStack,
  XStack,
  Text,
  Card,
  Button,
  Spinner,
  Image,
  Dialog,
} from 'tamagui';
import {useTranslations} from '../../../../dopebase';
import {useRouter} from 'expo-router';
import {useLitterForm} from '../../../../hooks/useLitterForm';
import {Check, X} from '@tamagui/lucide-icons';

export default function SubmitLitterListing() {
  const {localized} = useTranslations();
  const router = useRouter();
  const {formData, loading, error, handleSubmit} = useLitterForm();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    handleSubmit();
  };

  const renderHealthSummary = () => (
    <YStack gap='$2'>
      <Text fontWeight='bold'>{localized('Health Testing')}</Text>
      {formData.health?.vaccinations?.map((vacc) => (
        <XStack key={vacc.type} justifyContent='space-between'>
          <Text>{vacc.label}</Text>
          {vacc.completed && <Check color='$green10' />}
        </XStack>
      ))}
    </YStack>
  );

  const renderRequirementsSummary = () => (
    <YStack gap='$2'>
      <Text fontWeight='bold'>{localized('Requirements')}</Text>
      {Object.entries(formData.requirements || {}).map(([key, value]) => (
        <XStack key={key} justifyContent='space-between'>
          <Text>{key}</Text>
          <Text>
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
          </Text>
        </XStack>
      ))}
    </YStack>
  );

  const renderMediaPreview = () => (
    <YStack gap='$2'>
      <Text fontWeight='bold'>{localized('Media')}</Text>
      <XStack flexWrap='wrap' gap='$2'>
        {formData.media?.images?.map((image, index) => (
          <Image
            key={index}
            source={{uri: image.thumbnailURL}}
            width={80}
            height={80}
            borderRadius='$2'
          />
        ))}
      </XStack>
      {formData.media?.videos?.length ? (
        <Text color='$gray11'>
          {formData.media.videos.length} {localized('videos attached')}
        </Text>
      ) : null}
    </YStack>
  );

  return (
    <YStack gap='$4' padding='$4'>
      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$6' fontWeight='bold'>
            {localized('Review Listing')}
          </Text>

          <YStack gap='$2'>
            <Text fontWeight='bold'>{localized('Basic Information')}</Text>
            <Text>Breed: {formData.breed?.breedName}</Text>
            <Text>
              Expected Date:{' '}
              {new Date(formData.expectedDate!).toLocaleDateString()}
            </Text>
          </YStack>

          <YStack gap='$2'>
            <Text fontWeight='bold'>{localized('Parents')}</Text>
            <Text>Sire: {formData.parents?.sire?.name}</Text>
            <Text>Dam: {formData.parents?.dam?.name}</Text>
          </YStack>

          {renderMediaPreview()}
          {renderHealthSummary()}
          {renderRequirementsSummary()}

          <YStack gap='$2'>
            <Text fontWeight='bold'>{localized('Pricing')}</Text>
            <Text>Base Price: ${formData.price?.base}</Text>
            <Text>Deposit: ${formData.price?.deposit}</Text>
          </YStack>
        </YStack>
      </Card>

      <XStack gap='$4'>
        <Button theme='alt2' onPress={() => router.back()} flex={1}>
          {localized('Edit')}
        </Button>
        <Button
          theme='active'
          onPress={() => setShowConfirm(true)}
          flex={1}
          disabled={loading}
        >
          {localized('Submit Listing')}
        </Button>
      </XStack>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <YStack gap='$4' padding='$4'>
              <Dialog.Title>{localized('Confirm Submission')}</Dialog.Title>
              <Text>
                {localized('Are you sure you want to submit this listing?')}
              </Text>
              <XStack gap='$4' justifyContent='flex-end'>
                <Button
                  theme='alt2'
                  onPress={() => setShowConfirm(false)}
                  icon={X}
                >
                  {localized('Cancel')}
                </Button>
                <Button
                  theme='active'
                  onPress={handleConfirmSubmit}
                  icon={loading ? () => <Spinner /> : Check}
                  disabled={loading}
                >
                  {localized('Confirm')}
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {error && (
        <Text color='$red10' textAlign='center'>
          {error.message}
        </Text>
      )}
    </YStack>
  );
}
