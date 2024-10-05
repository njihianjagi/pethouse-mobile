import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Text,
  I18nManager,
  Platform,
  StyleSheet,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  useTheme,
  useTranslations,
  ActivityIndicator,
  Alert,
} from '../../dopebase';
import {useAuth} from '../../hooks/useAuth';
import {localizedErrorMessage} from '../../utils/ErrorCode';

const ResetPasswordScreen = (props) => {
  const authManager = useAuth();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const styles = dynamicStyles(theme, appearance);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSendPasswordResetEmail = () => {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValidEmail = re.test(email?.trim());

    if (isValidEmail) {
      setIsLoading(true);
      authManager.sendPasswordResetEmail(email.trim()).then((response) => {
        setIsLoading(false);

        if (response.error) {
          return Alert.alert(
            '',
            localizedErrorMessage(response.error, localized),
            [{text: localized('OK')}],
            {
              cancelable: false,
            }
          );
        }

        Alert.alert(
          localized('Link sent successfully'),
          localized(
            'Kindly check your email and follow the link to reset your password.'
          ),
          [
            {
              text: localized('OK'),
              onPress: () => props.navigation.goBack(),
            },
          ],
          {cancelable: false}
        );
      });
    } else {
      Alert.alert(
        localized('Invalid email'),
        localized('The email entered is invalid. Please try again'),
        [{text: localized('OK')}],
        {cancelable: false}
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{flex: 1, width: '100%'}}
        keyboardShouldPersistTaps='always'
      >
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Image style={styles.backArrowStyle} source={theme.icons.backArrow} />
        </TouchableOpacity>
        <Text style={styles.title}>{localized('Reset Password')}</Text>
        <TextInput
          style={styles.InputContainer}
          placeholder={localized('E-mail')}
          placeholderTextColor='#aaaaaa'
          onChangeText={(text) => setEmail(text)}
          value={email}
          underlineColorAndroid='transparent'
          autoCapitalize='none'
        />
        <TouchableOpacity
          style={styles.sendContainer}
          onPress={() => onSendPasswordResetEmail()}
        >
          <Text style={styles.sendText}>{localized('Send')}</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      {isLoading && <ActivityIndicator />}
    </View>
  );
};

export default ResetPasswordScreen;

const dynamicStyles = (theme, colorScheme) => {
  const colorSet = theme.colors[colorScheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorSet.primaryBackground,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colorSet.primaryForeground,
      marginTop: 25,
      marginBottom: 50,
      alignSelf: 'stretch',
      textAlign: 'left',
      marginLeft: 35,
    },
    sendContainer: {
      width: '70%',
      backgroundColor: colorSet.primaryForeground,
      borderRadius: 25,
      padding: 10,
      marginTop: 30,
      alignSelf: 'center',
      alignItems: 'center',
    },
    sendText: {
      color: '#ffffff',
    },
    InputContainer: {
      height: 42,
      borderWidth: 1,
      borderColor: colorSet.grey3,
      backgroundColor: colorSet.primaryBackground,
      paddingLeft: 10,
      color: colorSet.primaryText,
      width: '80%',
      alignSelf: 'center',
      marginTop: 20,
      alignItems: 'center',
      borderRadius: 25,
    },
    backArrowStyle: {
      resizeMode: 'contain',
      tintColor: colorSet.primaryForeground,
      width: 25,
      height: 25,
      marginTop: Platform.OS === 'ios' ? 50 : 20,
      marginLeft: 10,
      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
    },
  });
};
