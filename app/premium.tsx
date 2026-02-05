import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import type { AdaptyPaywall, AdaptyPaywallProduct } from 'react-native-adapty';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { SubscriptionService } from '@/services/subscription';
import { HapticsService } from '@/services/haptics';
import { SkeletonLoader } from '@/components/SkeletonLoader';

const { width } = Dimensions.get('window');

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accentColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'infinite',
    title: 'Unlimited Scans',
    description: 'Scan unlimited contracts and URLs without daily limits',
    accentColor: colors.primary,
  },
  {
    icon: 'camera',
    title: 'Deep Screenshot Analysis',
    description: 'Advanced AI-powered screenshot threat detection',
    accentColor: '#00b8ff',
  },
  {
    icon: 'flash',
    title: 'Priority AI Expert',
    description: 'Get faster, more detailed responses from our AI consultant',
    accentColor: '#ff8c00',
  },
  {
    icon: 'shield-checkmark',
    title: 'Advanced Protection',
    description: 'Access to all security features and real-time alerts',
    accentColor: colors.success,
  },
  {
    icon: 'trending-up',
    title: 'Early Access',
    description: 'Be the first to try new security features',
    accentColor: '#9d4edd',
  },
  {
    icon: 'desktop',
    title: 'Multi-Device Sync',
    description: 'Seamless experience across all your devices',
    accentColor: '#f72585',
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AdaptyPaywallProduct | null>(null);

  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);
  const badgeRotate = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Shimmer animation
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Badge rotation
    badgeRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    loadPaywall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPaywall = async () => {
    try {
      setLoading(true);
      const paywallData = await SubscriptionService.getPaywall();

      if (paywallData) {
        const paywallProducts = await SubscriptionService.getPaywallProducts(paywallData);
        setProducts(paywallProducts);

        // Auto-select annual if available, otherwise first product
        const annualProduct = paywallProducts.find((p) =>
          p.vendorProductId.toLowerCase().includes('annual')
        );
        setSelectedProduct(annualProduct || paywallProducts[0] || null);
      }
    } catch (error) {
      console.error('Error loading paywall:', error);
      Alert.alert('Error', 'Failed to load subscription options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) {
      HapticsService.warning();
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    HapticsService.heavy();

    // Animate button
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    try {
      setPurchasing(true);
      const result = await SubscriptionService.purchaseProduct(selectedProduct);

      if (result.cancelled) {
        // User cancelled - no action needed
        return;
      }

      if (result.success && result.isPro) {
        HapticsService.success();
        Alert.alert('Welcome to Cryptoshield Pro! 🎉', 'You now have unlimited access to all premium features.', [
          {
            text: 'Get Started',
            onPress: () => router.back(),
          },
        ]);
      } else if (!result.success) {
        HapticsService.error();
        Alert.alert(
          'Purchase Pending',
          'Your purchase is being processed. This may take a few moments.'
        );
      }
    } catch {
      HapticsService.error();
      Alert.alert('Purchase Failed', 'There was an error processing your purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      HapticsService.medium();
      setRestoring(true);
      const result = await SubscriptionService.restorePurchases();

      if (result.isPro) {
        HapticsService.success();
        Alert.alert('Purchases Restored', 'Your Cryptoshield Pro subscription has been restored successfully.', [
          {
            text: 'Continue',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
    } catch {
      HapticsService.error();
      Alert.alert('Restore Failed', 'There was an error restoring your purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * (width + 100) - 100 }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const badgeRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${badgeRotate.value}deg` }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getProductPeriod = (product: AdaptyPaywallProduct): string => {
    const period = product.subscription?.subscriptionPeriod;
    if (!period) return '';

    const unitLower = period.unit?.toLowerCase();
    if (unitLower === 'year') {
      return 'Year';
    }
    if (unitLower === 'month') {
      return 'Month';
    }
    return 'Subscription';
  };

  const isAnnual = (product: AdaptyPaywallProduct): boolean => {
    const period = product.subscription?.subscriptionPeriod;
    const unitLower = period?.unit?.toLowerCase();
    return unitLower === 'year' || product.vendorProductId.toLowerCase().includes('annual');
  };

  const getMonthlyPrice = (product: AdaptyPaywallProduct): string | null => {
    if (!isAnnual(product) || !product.price?.amount) return null;
    const monthlyAmount = product.price.amount / 12;
    return product.price.currencySymbol
      ? `${product.price.currencySymbol}${monthlyAmount.toFixed(2)}`
      : null;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background - Midnight theme */}
      <LinearGradient
        colors={['#0a0e27', '#0d1b2a', '#0a0e27']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          HapticsService.light();
          router.back();
        }}
      >
        <BlurView intensity={30} tint="dark" style={styles.closeButtonBlur}>
          <Ionicons name="close" size={28} color={colors.text} />
        </BlurView>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header with Shimmering Badge */}
        <View style={styles.headerContainer}>
          <Animated.View style={[styles.premiumBadge, pulseStyle, badgeRotateStyle]}>
            <LinearGradient
              colors={[colors.primary, '#00b8ff', colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumBadgeGradient}
            >
              <Ionicons name="shield-checkmark" size={56} color="#0a0e27" />

              {/* Shimmer overlay */}
              <View style={styles.shimmerContainer}>
                <Animated.View style={[styles.shimmer, shimmerStyle]}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>
              </View>
            </LinearGradient>

            {/* Outer glow ring */}
            <View style={styles.badgeGlowRing} />
          </Animated.View>

          <Text style={styles.headerTitle}>
            Crypto<Text style={styles.headerTitleAccent}>shield</Text>
            <Text style={styles.proText}> Pro</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Unlock unlimited protection and advanced security features
          </Text>
        </View>

        {/* Features Grid with Glassmorphism */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <BlurView key={index} intensity={25} tint="dark" style={styles.featureCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.featureCardGradient}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    {
                      backgroundColor: `${feature.accentColor}22`,
                      shadowColor: feature.accentColor,
                    },
                  ]}
                >
                  <Ionicons name={feature.icon} size={28} color={feature.accentColor} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </LinearGradient>
            </BlurView>
          ))}
        </View>

        {/* Pricing Options */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <SkeletonLoader height={140} style={{ marginBottom: spacing.md }} />
            <SkeletonLoader height={140} />
          </View>
        ) : products.length > 0 ? (
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>

            {products.map((product) => {
              const isSelected = selectedProduct?.vendorProductId === product.vendorProductId;
              const annual = isAnnual(product);
              const monthlyPrice = getMonthlyPrice(product);

              return (
                <TouchableOpacity
                  key={product.vendorProductId}
                  style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                  onPress={() => {
                    HapticsService.selection();
                    setSelectedProduct(product);
                  }}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={isSelected ? 40 : 25} tint="dark" style={styles.packageBlur}>
                    <LinearGradient
                      colors={
                        isSelected
                          ? [`${colors.primary}33`, `${colors.primary}11`]
                          : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']
                      }
                      style={styles.packageCardGradient}
                    >
                      {annual && (
                        <View style={styles.bestValueBadge}>
                          <LinearGradient
                            colors={['#00ff88', '#00cc66']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bestValueGradient}
                          >
                            <Text style={styles.bestValueText}>BEST VALUE</Text>
                          </LinearGradient>
                        </View>
                      )}

                      <View style={styles.packageCardContent}>
                        <View style={styles.packageLeft}>
                          <Text style={styles.packageTitle}>{getProductPeriod(product)}</Text>
                          {monthlyPrice && (
                            <Text style={styles.packageMonthlyPrice}>{monthlyPrice}/month</Text>
                          )}
                          <Text style={styles.packageDescription}>{product.localizedDescription}</Text>
                        </View>

                        <View style={styles.packageRight}>
                          <Text style={styles.packagePrice}>
                            {SubscriptionService.getFormattedPrice(product)}
                          </Text>
                          <View
                            style={[
                              styles.radioButton,
                              isSelected && styles.radioButtonSelected,
                            ]}
                          >
                            {isSelected && (
                              <LinearGradient
                                colors={[colors.primary, '#00b8ff']}
                                style={styles.radioButtonInner}
                              />
                            )}
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.warning} />
            <Text style={styles.errorText}>
              Subscription options are not available at the moment.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPaywall}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA Button */}
        {!loading && products.length > 0 && (
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={purchasing || !selectedProduct}
              style={[styles.ctaButton, (purchasing || !selectedProduct) && styles.ctaButtonDisabled]}
              activeOpacity={0.85}
            >
              <BlurView intensity={40} tint="dark" style={styles.ctaBlur}>
                <LinearGradient
                  colors={[colors.primary, '#00b8ff', colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {purchasing ? (
                    <ActivityIndicator size="small" color="#0a0e27" />
                  ) : (
                    <>
                      <Text style={styles.ctaText}>Upgrade to Pro</Text>
                      <Ionicons name="arrow-forward" size={24} color="#0a0e27" />
                    </>
                  )}
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          Subscriptions will be charged to your account through the App Store. Your subscription
          will automatically renew unless canceled at least 24 hours before the end of the current
          period. Manage your subscription in App Store settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl + 20,
    right: spacing.lg,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  closeButtonBlur: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + 50,
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  premiumBadge: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  premiumBadgeGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 60,
  },
  shimmer: {
    width: 100,
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
  badgeGlowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: `${colors.primary}44`,
    top: -5,
    left: -5,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerTitleAccent: {
    color: colors.primary,
  },
  proText: {
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    height: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  featureCardGradient: {
    flex: 1,
    padding: spacing.md,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loadingContainer: {
    marginBottom: spacing.xl,
  },
  pricingContainer: {
    marginBottom: spacing.xl,
  },
  pricingTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  packageCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  packageCardSelected: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  packageBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  packageCardGradient: {
    padding: spacing.lg,
  },
  bestValueBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  bestValueGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  bestValueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#0a0e27',
  },
  packageCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  packageTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  packageMonthlyPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  packageDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  packageRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  packagePrice: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: '#0a0e27',
  },
  ctaButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaBlur: {
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 4,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#0a0e27',
  },
  restoreButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  restoreButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
