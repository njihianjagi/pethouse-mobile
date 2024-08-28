import React, { memo } from 'react'
import { View } from 'react-native'
import { useTheme } from '../../..'
import { UIActivityIndicator } from 'react-native-indicators'
import dynamicStyles from './styles'
import { Spinner } from 'tamagui'

export const ActivityIndicator = memo((props) => {
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)
  return (
    <View style={styles.container}>
      <View style={styles.indicatorContainer}>
        {/* <UIActivityIndicator
          color="#f5f5f5"
          size={30}
          animationDuration={400}
        /> */}
        <Spinner size="large" color={theme.colors[appearance].secondaryForeground} />

        {/* {props.text && props.text.length > 1 ? (
          <Text>{props.text}</Text>
        ) : (
          <View />
        )} */}
      </View>
    </View>
  )
})
