import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { HapticsService } from '@/services/haptics';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleOnPress?: number;
  opacityOnPress?: number;
  enableHaptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'warning' | 'success' | 'error';
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

/**
 * AnimatedPressable - A reusable animated pressable component
 * Provides scale and opacity feedback on press for premium interactive feel
 */
export function AnimatedPressable({
  children,
  style,
  scaleOnPress = 0.96,
  opacityOnPress = 0.8,
  enableHaptic = true,
  hapticType = 'light',
  springConfig = { damping: 15, stiffness: 400 },
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = (event: any) => {
    scale.value = withSpring(scaleOnPress, springConfig);
    opacity.value = withTiming(opacityOnPress, { duration: 100 });
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, { duration: 100 });
    onPressOut?.(event);
  };

  const handlePress = (event: any) => {
    if (enableHaptic) {
      switch (hapticType) {
        case 'light':
          HapticsService.light();
          break;
        case 'medium':
          HapticsService.medium();
          break;
        case 'heavy':
          HapticsService.heavy();
          break;
        case 'selection':
          HapticsService.selection();
          break;
        case 'warning':
          HapticsService.warning();
          break;
        case 'success':
          HapticsService.success();
          break;
        case 'error':
          HapticsService.error();
          break;
      }
    }
    onPress?.(event);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/**
 * AnimatedButton - Specialized button with stronger press feedback
 */
export function AnimatedButton(props: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      scaleOnPress={0.95}
      opacityOnPress={0.9}
      hapticType="medium"
      {...props}
    />
  );
}

/**
 * AnimatedCard - Card component with subtle press feedback
 */
export function AnimatedCard(props: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      scaleOnPress={0.98}
      opacityOnPress={0.9}
      hapticType="light"
      springConfig={{ damping: 20, stiffness: 300 }}
      {...props}
    />
  );
}

/**
 * AnimatedIconButton - Icon button with quick, responsive feedback
 */
export function AnimatedIconButton(props: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      scaleOnPress={0.92}
      opacityOnPress={0.7}
      hapticType="light"
      springConfig={{ damping: 12, stiffness: 500 }}
      {...props}
    />
  );
}
