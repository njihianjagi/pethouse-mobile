import React from 'react';
import {Linking, View} from 'react-native';
import {useTheme, useTranslations} from '../dopebase';
import {Text} from 'tamagui';

const TermsOfUseView = (props) => {
  const {tosLink, privacyPolicyLink, style} = props;
  const {theme, appearance} = useTheme();
  const {localized} = useTranslations();

  return (
    <View style={style}>
      <Text
        style={{fontSize: 12, color: theme.colors[appearance].secondaryText}}
      >
        {localized('By continuing you agree with our')}
      </Text>
      <Text>
        <Text
          style={{
            color: theme.colors[appearance].primaryForeground,
            fontSize: 12,
          }}
          onPress={() => Linking.openURL(tosLink)}
        >
          {localized('Terms of Use')}
        </Text>
        {privacyPolicyLink?.length > 0 && (
          <Text style={{fontSize: 12}}>
            {localized(' and ')}
            <Text
              style={{
                color: theme.colors[appearance].primaryForeground,
                fontSize: 12,
              }}
              onPress={() => Linking.openURL(privacyPolicyLink)}
            >
              {localized('Privacy Policy')}
            </Text>
          </Text>
        )}
      </Text>
    </View>
  );
};

export default TermsOfUseView;
