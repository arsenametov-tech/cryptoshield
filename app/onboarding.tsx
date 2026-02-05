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
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  SharedValue,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticsService } from '@/services/haptics';
import { t } from '@/services/i18n';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accentColor: string;
  gradientColors: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'shield-checkmark',
    title: t('onboarding.slide1.title'),
    description: t('onboarding.slide1.description'),
    accentColor: colors.primary,
    gradientColors: [colors.primary, '#00ffd5'],
  },
  {
    id: '2',
    icon: 'scan-circle',
    title: t('onboarding.slide2.title'),
    description: t('onboarding.slide2.description'),
    accentColor: '#00b8ff',
    gradientColors: ['#00b8ff', '#0099ff'],
  },
  {
    id: '3',
    icon: 'library',
    title: t('onboarding.slide3.title'),
    description: t('onboarding.slide3.description'),
    accentColor: '#ff8c00',
    gradientColors: ['#ff8c00', '#ffaa33'],
  },
];

const PaginationDot = React.memo(
  ({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) => {
    const dotStyle = useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

      const dotWidth = interpolate(scrollX.value, inputRange, [10, 32, 10], Extrapolate.CLAMP);

      const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);

      return {
        width: dotWidth,
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.dot, dotStyle]}>
        <LinearGradient
          colors={[colors.primary, '#00ffd5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dotGradient}
        />
      </Animated.View>
    );
  }
);

PaginationDot.displayName = 'PaginationDot';

// Animated Radar Component
const RadarScanner = () => {
  const rotation = useSharedValue(0);
  const pulse1 = useSharedValue(1);
  const pulse2 = useSharedValue(1);
  const pulse3 = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    pulse1.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );

    pulse2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 666 }),
        withTiming(1.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );

    pulse3.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 1333 }),
        withTiming(1.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
  }, [rotation, pulse1, pulse2, pulse3]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulse1Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1.value }],
    opacity: interpolate(pulse1.value, [1, 1.4], [0.6, 0]),
  }));

  const pulse2Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2.value }],
    opacity: interpolate(pulse2.value, [0, 1, 1.4], [0, 0.6, 0]),
  }));

  const pulse3Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse3.value }],
    opacity: interpolate(pulse3.value, [0, 1, 1.4], [0, 0.6, 0]),
  }));

  return (
    <View style={styles.radarContainer}>
      {/* Pulse rings */}
      <Animated.View style={[styles.pulseRing, pulse1Style]} />
      <Animated.View style={[styles.pulseRing, pulse2Style]} />
      <Animated.View style={[styles.pulseRing, pulse3Style]} />

      {/* Main radar circle */}
      <View style={styles.radarCircle}>
        <BlurView intensity={30} tint="dark" style={styles.radarBlur}>
          <LinearGradient
            colors={[`${colors.primary}44`, `${colors.primary}11`]}
            style={styles.radarGradient}
          >
            <View style={styles.radarGrid}>
              <View style={styles.radarLine} />
              <View style={[styles.radarLine, { transform: [{ rotate: '90deg' }] }]} />
            </View>

            {/* Rotating scanner beam */}
            <Animated.View style={[styles.scannerBeam, rotationStyle]} />

            {/* Center icon */}
            <View style={styles.radarCenter}>
              <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const handleScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== undefined && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== currentIndex) {
          HapticsService.selection();
          setCurrentIndex(newIndex);
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleGetStarted = async () => {
    // Heavy haptic feedback with scale animation
    HapticsService.heavy();

    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    // Add a slight delay for the animation
    setTimeout(async () => {
      HapticsService.success();
      await AsyncStorage.setItem('@cryptoshield_onboarding_complete', 'true');
      router.replace('/(tabs)');
    }, 150);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return <SlideItem item={item} index={index} scrollX={scrollX} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient - Midnight theme */}
      <LinearGradient
        colors={['#0a0e27', '#0d1b2a', '#0a0e27']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative glow effects */}
      <View style={styles.decorativeGlow1} />
      <View style={styles.decorativeGlow2} />

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
        {/* Pagination Dots with glow */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        {/* Get Started Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <BlurView intensity={40} tint="dark" style={styles.buttonBlur}>
              <LinearGradient
                colors={[colors.primary, '#00b8ff', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonGlow} />
                <Text style={styles.getStartedText}>{t('onboarding.getStarted')}</Text>
                <Ionicons name="arrow-forward" size={24} color="#0a0e27" />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const SlideItem = React.memo(
  ({
    item,
    index,
    scrollX,
  }: {
    item: OnboardingSlide;
    index: number;
    scrollX: SharedValue<number>;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

      const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolate.CLAMP);

      const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolate.CLAMP);

      const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolate.CLAMP);

      return {
        transform: [{ scale }, { translateY }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.slide, animatedStyle]}>
        {/* Render radar for first slide, icon for others */}
        {index === 0 ? (
          <RadarScanner />
        ) : (
          <View style={styles.iconContainer}>
            <BlurView intensity={50} tint="dark" style={styles.iconBlur}>
              <LinearGradient
                colors={[`${item.accentColor}44`, `${item.accentColor}11`]}
                style={styles.iconGradient}
              >
                <View style={[styles.iconGlowRing, { shadowColor: item.accentColor }]} />
                <Ionicons name={item.icon} size={72} color={item.accentColor} />
              </LinearGradient>
            </BlurView>
          </View>
        )}

        {/* Content Card with Glassmorphism */}
        <BlurView intensity={30} tint="dark" style={styles.contentCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.contentGradient}
          >
            <View style={[styles.accentBar, { backgroundColor: item.accentColor }]} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  }
);

SlideItem.displayName = 'SlideItem';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  decorativeGlow1: {
    position: 'absolute',
    top: height * 0.2,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  decorativeGlow2: {
    position: 'absolute',
    bottom: height * 0.3,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#00b8ff',
    opacity: 0.08,
    shadowColor: '#00b8ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  radarContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl + spacing.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  radarCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
  },
  radarBlur: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  radarGradient: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  radarGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: `${colors.primary}44`,
  },
  scannerBeam: {
    position: 'absolute',
    width: '50%',
    height: 2,
    right: '50%',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconContainer: {
    marginBottom: spacing.xxl + spacing.lg,
  },
  iconBlur: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  iconGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconGlowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  contentCard: {
    width: width - spacing.xl * 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  contentGradient: {
    padding: spacing.xl,
  },
  accentBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  title: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 38,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bottomSection: {
    position: 'absolute',
    bottom: spacing.xxl + 30,
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
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  dotGradient: {
    flex: 1,
  },
  getStartedButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  buttonBlur: {
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 4,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    opacity: 0.1,
  },
  getStartedText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#0a0e27',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
