// ... existing imports ...
import {Button, Card, XStack, Text} from 'tamagui';
import {LinearGradient} from 'tamagui/linear-gradient';
import {useTheme} from '../dopebase';
import {ImageBackground} from 'react-native';

// New component for the empty state card
export const EmptyStateCard = ({
  title,
  buttonText,
  onPress,
  icon,
  backgroundImage,
  backgroundColor,
}): any => {
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  return (
    <Card
      elevate
      size='$4'
      bordered
      flex={1}
      margin={5}
      overflow='hidden'
      onPress={onPress}
      pressTheme
    >
      <Card.Background>
        {backgroundImage ? (
          <ImageBackground
            source={backgroundImage}
            style={{width: '100%', height: '100%'}}
            resizeMode='cover'
          >
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
              zIndex={1}
            />
          </ImageBackground>
        ) : (
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            fullscreen
            colors={[backgroundColor || 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
            zIndex={1}
          />
        )}
      </Card.Background>

      <Card.Header padded zIndex={2}>
        <Text
          color={colorSet.primaryBackground}
          fontSize={24}
          fontWeight='bold'
        >
          {title}
        </Text>
      </Card.Header>

      <Card.Footer zIndex={2}>
        <XStack flex={1} />
        <Button borderRadius='$10' iconAfter={icon} chromeless>
          <Text color={colorSet.primaryText}>{buttonText}</Text>
        </Button>
      </Card.Footer>
    </Card>
  );
};
