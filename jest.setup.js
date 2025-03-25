import '@testing-library/jest-native/extend-expect';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import ReanimatedMock from 'react-native-reanimated/mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => AsyncStorageMock);

// Mock Supabase client
jest.mock('../api/supabase/client', () => ({
    supabase: {
        from: jest.fn(),
        auth: {
            signInWithPassword: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
        },
    },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        setOptions: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
    }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    ReanimatedMock.default.call = () => { };
    return ReanimatedMock;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
    enableScreens: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
    PanGestureHandler: 'PanGestureHandler',
    State: {},
    ScrollView: 'ScrollView',
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
    launchCamera: jest.fn(),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => 'MapView');

// Mock react-native-geolocation-service
jest.mock('react-native-geolocation-service', () => ({
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
}));

// Mock react-native-config
jest.mock('react-native-config', () => ({
    SUPABASE_URL: 'test-supabase-url',
    SUPABASE_ANON_KEY: 'test-supabase-anon-key',
    ALGOLIA_APP_ID: 'test-algolia-app-id',
    ALGOLIA_SEARCH_KEY: 'test-algolia-search-key',
})); 