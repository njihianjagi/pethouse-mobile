import React from 'react';
import {Stack} from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown: false}} />
      <Stack.Screen
        name='[breedName]'
        options={{headerShown: true, title: 'Breed Details'}}
      />
    </Stack>
  );
}
