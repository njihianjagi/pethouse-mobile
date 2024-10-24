import fauth from '@react-native-firebase/auth';
import ffirestore from '@react-native-firebase/firestore';
import ffunctions from '@react-native-firebase/functions';
import fstorage from '@react-native-firebase/storage';
import fmessaging from '@react-native-firebase/messaging';

export const db = ffirestore();
export const auth = fauth;
export const firestore = ffirestore;
export const functions = ffunctions;
export const storage = fstorage();
export const messaging = fmessaging;
