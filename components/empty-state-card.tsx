import {Card, Button, Text, YStack} from 'tamagui';
import {useTheme} from '../dopebase';
import {LinearGradient} from 'tamagui/linear-gradient';
import {ImageBackground} from 'react-native';
import {ArrowRight} from '@tamagui/lucide-icons';

export interface EmptyStateCardProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  // Icons
  headerIcon?: any;
  buttonIcon?: any;
  // Styling
  backgroundImage?: number;
  backgroundColor?: string;
  color?: string;
  // Layout customization
  headerAlign?: any;
  buttonAlign?: any;
  buttonPosition?: 'top' | 'bottom';
  // Component styles
  cardStyle?: any;
  headerStyle?: any;
  titleStyle?: any;
  descriptionStyle?: any;
  buttonStyle?: any;
  buttonTextStyle?: any;
  // Spacing
  gap?: number | string;
  padding?: number | string;
}

// New component for the empty state card
export const EmptyStateCard = ({
  title,
  description,
  buttonText,
  onPress,
  // Icons
  headerIcon,
  buttonIcon = <ArrowRight size={20} />,
  // Styling
  backgroundImage,
  backgroundColor,
  color,
  // Layout
  headerAlign = 'left',
  buttonAlign = 'center',
  buttonPosition = 'bottom',
  // Component styles
  cardStyle,
  headerStyle,
  titleStyle,
  descriptionStyle,
  buttonStyle,
  buttonTextStyle,
  // Spacing
  gap = '$2',
  padding = '$4',
}: EmptyStateCardProps): JSX.Element => {
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const headerContent = (
    <YStack gap='$2' justifyContent={headerAlign} style={headerStyle}>
      {headerIcon && <YStack ai='center'>{headerIcon}</YStack>}
      <Text
        color={color}
        fontSize={24}
        fontWeight='bold'
        textAlign={headerAlign}
        style={titleStyle}
      >
        {title}
      </Text>
      <Text
        color={color}
        fontSize={16}
        textAlign={headerAlign}
        style={descriptionStyle}
      >
        {description}
      </Text>
    </YStack>
  );

  const buttonContent = (
    <Button
      theme='active'
      borderColor='$gray6'
      iconAfter={buttonIcon}
      alignSelf={buttonAlign}
      style={buttonStyle}
      onPress={onPress}
    >
      <Text style={buttonTextStyle}>{buttonText}</Text>
    </Button>
  );

  return (
    <Card size='$6' flex={1} overflow='hidden' pressTheme style={cardStyle}>
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

      <YStack f={1} p={padding} gap={gap}>
        {buttonPosition === 'top' && buttonContent}
        {headerContent}
        {buttonPosition === 'bottom' && buttonContent}
      </YStack>
    </Card>
  );
};
