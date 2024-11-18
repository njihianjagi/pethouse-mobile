import React from 'react';
import {enableReactTracking} from '@legendapp/state/config/enableReactTracking';
import {observer} from '@legendapp/state/react';

// Enable React tracking
enableReactTracking({
  auto: true,
});

export const StoreProvider = observer(
  ({children}: {children: React.ReactNode}) => {
    return children;
  }
);
