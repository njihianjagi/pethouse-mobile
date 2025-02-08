import React from 'react';
import {YStack, XStack, Input, Text, Card} from 'tamagui';
import BreedSelector from '../../../../components/breed-selector';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Platform} from 'react-native';
import {useRouter} from 'expo-router';
import {Button} from 'tamagui';

const BasicInfoStep = ({formData, onChange, localized}) => {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange('expectedDate', selectedDate.toISOString());
    }
  };

  const handleContinue = () => {
    if (formData.breedId && formData.expectedDate) {
      router.push('/litter/parents');
    }
  };

  return (
    <YStack gap='$4' padding='$4'>
      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$5' fontWeight='bold'>
            {localized('Breed Information')}
          </Text>

          <BreedSelector
            // selectedBreed={formData.breedId}
            onSelectBreed={(breed) => {
              onChange('breedId', breed.id);
              onChange('breedName', breed.name);
            }}
            open={false}
            onOpenChange={() => {}}
          />

          {formData.breedId && (
            <Input
              placeholder={localized('Variety (if applicable)')}
              value={formData.variety}
              onChangeText={(text) => onChange('variety', text)}
            />
          )}
        </YStack>
      </Card>

      <Card elevate bordered padding='$4'>
        <YStack gap='$4'>
          <Text fontSize='$5' fontWeight='bold'>
            {localized('Litter Details')}
          </Text>

          <Input
            placeholder={localized('Litter Name/Identifier')}
            value={formData.name}
            onChangeText={(text) => onChange('name', text)}
          />

          <Button onPress={() => setShowDatePicker(true)} theme='alt2'>
            {formData.expectedDate
              ? new Date(formData.expectedDate).toLocaleDateString()
              : localized('Select Expected Date')}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.expectedDate || Date.now())}
              mode='date'
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </YStack>
      </Card>

      <Button
        theme='active'
        onPress={handleContinue}
        disabled={!formData.breedId || !formData.expectedDate}
      >
        {localized('Continue')}
      </Button>
    </YStack>
  );
};

export default BasicInfoStep;
