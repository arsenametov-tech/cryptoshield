import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accentColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'shield-checkmark',
    title: 'AI-Powered Security Scanning',
    description: 'Advanced algorithms analyze smart contracts and websites in real-time, detecting scams, honeypots, and malicious patterns before you invest.',
    accentColor: colors.primary,
  },
  {
    id: '2',
    icon: 'chatbubbles',
    title: 'Your Personal Security Expert',
    description: 'Chat with our AI consultant 24/7. Get instant answers about crypto safety, analyze screenshots, and receive expert guidance on any project.',
    accentColor: '#00b8ff',
  },
  {
    id: '3',
    icon: 'bulb',
    title: 'Knowledge Base & Learning',
    description: 'Access comprehensive guides on phishing, rug pulls, social engineering, and more. Stay educated and protected in the crypto world.',
    accentColor: '#ff8c00',
  },
  {
    id: '4',
    icon: 'checkmark-circle',
    title: 'Stay Protected',
    description: 'Receive daily security tips, track your scan history, and get instant alerts about emerging threats in the crypto space.',
    accentColor: colors.success,
  },
];

const PaginationDot = React.memo(({ index, scrollX }: { index: number; scrollX: Animated.SharedValue<number> }) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
});

PaginationDot.displayName = 'PaginationDot';

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== undefined) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@cryptoshield_onboarding_complete', 'true');
    router.replace('/(tabs)');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('@cryptoshield_onboarding_complete', 'true');
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return <SlideItem item={item} index={index} scrollX={scrollX} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary, colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex === slides.length - 1 ? (
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.background} />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <BlurView intensity={20} tint="dark" style={styles.nextButtonBlur}>
                <Text style={styles.nextText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </BlurView>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const SlideItem = React.memo(({
  item,
  index,
  scrollX,
}: {
  item: OnboardingSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const pulseAnimation = useSharedValue(1);

  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulseAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  return (
    <Animated.View style={[styles.slide, animatedStyle]}>
      {/* Icon Container with Glassmorphism */}
      <View style={styles.iconContainer}>
        <BlurView intensity={40} tint="dark" style={styles.iconBlur}>
          <Animated.View style={iconAnimatedStyle}>
            <View style={[styles.iconCircle, { shadowColor: item.accentColor }]}>
              <LinearGradient
                colors={[`${item.accentColor}33`, `${item.accentColor}11`]}
                style={styles.iconGradient}
              >
                <Ionicons name={item.icon} size={64} color={item.accentColor} />
              </LinearGradient>
            </View>
          </Animated.View>
        </BlurView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.decorativeLine, { backgroundColor: item.accentColor }]} />
      </View>
    </Animated.View>
  );
});

SlideItem.displayName = 'SlideItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.xl + 20,
    right: spacing.lg,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconBlur: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  iconGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 38,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  decorativeContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    alignItems: 'center',
  },
  decorativeLine: {
    width: 60,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  bottomSection: {
    position: 'absolute',
    bottom: spacing.xxl + 20,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  getStartedButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  getStartedText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
});
