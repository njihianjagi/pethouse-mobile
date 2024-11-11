// ... existing imports ...
import {Button, Card, XStack, Text, ListItem} from 'tamagui';
import {LinearGradient} from 'tamagui/linear-gradient';
import {useTheme} from '../dopebase';
import {ImageBackground} from 'react-native';
import {ArrowRight} from '@tamagui/lucide-icons';

// New component for the empty state card
export const EmptyStateCard = ({
  title,
  description,
  buttonText,
  onPress,
  icon,
  backgroundImage,
  backgroundColor,
  color,
}): any => {
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  return (
    <Card size='$6' flex={1} overflow='hidden' onPress={onPress} pressTheme>
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
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
              zIndex={1}
            />
          </ImageBackground>
        ) : (
          <Card.Background backgroundColor={backgroundColor} />
        )}
      </Card.Background>

      {/* <Card.Background
        backgroundColor={colorSet.primaryForeground}
        borderRadius={16}
      /> */}

      <Card.Header zIndex={2}>
        <Text color={color} fontSize={24} fontWeight='bold'>
          {title}
        </Text>
        <Text color={color} fontSize={16}>
          {description}
        </Text>
      </Card.Header>

      <Card.Footer zIndex={2} padded>
        <XStack flex={1} />
        <Button
          borderRadius='$10'
          icon={<ArrowRight size='$2' color={color} />}
          chromeless
        />
      </Card.Footer>
    </Card>
  );
};
