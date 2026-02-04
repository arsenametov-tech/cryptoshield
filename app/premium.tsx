import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
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
} from 'react-native-reanimated';
import { PurchasesPackage } from 'react-native-purchases';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { SubscriptionService } from '@/services/subscription';

const { width } = Dimensions.get('window');

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'infinite',
    title: 'Unlimited Scans',
    description: 'Scan unlimited contracts and URLs without daily limits',
  },
  {
    icon: 'camera',
    title: 'Deep Screenshot Analysis',
    description: 'Advanced AI-powered screenshot threat detection',
  },
  {
    icon: 'flash',
    title: 'Priority AI Expert',
    description: 'Get faster, more detailed responses from our AI consultant',
  },
  {
    icon: 'shield-checkmark',
    title: 'Advanced Protection',
    description: 'Access to all security features and real-time alerts',
  },
  {
    icon: 'trending-up',
    title: 'Early Access',
    description: 'Be the first to try new security features',
  },
  {
    icon: 'desktop',
    title: 'Multi-Device Sync',
    description: 'Seamless experience across all your devices',
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Shimmer animation for the header
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animation for premium badge
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    loadOfferings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await SubscriptionService.getOfferings();

      if (offerings?.current?.availablePackages) {
        const availablePackages = offerings.current.availablePackages;
        setPackages(availablePackages);

        // Auto-select annual package if available, otherwise monthly
        const annualPackage = availablePackages.find(
          pkg => pkg.identifier === '$rc_annual' || pkg.packageType === 'ANNUAL'
        );
        const monthlyPackage = availablePackages.find(
          pkg => pkg.identifier === '$rc_monthly' || pkg.packageType === 'MONTHLY'
        );

        setSelectedPackage(annualPackage || monthlyPackage || availablePackages[0] || null);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    try {
      setPurchasing(true);
      const result = await SubscriptionService.purchasePackage(selectedPackage);

      if (result.success && result.isPro) {
        Alert.alert(
          'Welcome to Cryptoshield Pro! 🎉',
          'You now have unlimited access to all premium features.',
          [
            {
              text: 'Get Started',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert('Purchase Failed', 'There was an error processing your purchase. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const result = await SubscriptionService.restorePurchases();

      if (result.isPro) {
        Alert.alert(
          'Purchases Restored',
          'Your Cryptoshield Pro subscription has been restored successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'We could not find any previous purchases to restore.'
        );
      }
    } catch {
      Alert.alert('Restore Failed', 'There was an error restoring your purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmer.value * (width + 100) - 100 }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getPackageTitle = (pkg: PurchasesPackage) => {
    if (pkg.packageType === 'ANNUAL' || pkg.identifier.includes('annual')) {
      return 'Annual';
    }
    if (pkg.packageType === 'MONTHLY' || pkg.identifier.includes('monthly')) {
      return 'Monthly';
    }
    return pkg.product.title || 'Subscription';
  };

  const getPackageSavings = (pkg: PurchasesPackage) => {
    if (pkg.packageType === 'ANNUAL' || pkg.identifier.includes('annual')) {
      return 'Save 40%';
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <View style={styles.headerContainer}>
          <Animated.View style={[styles.premiumBadge, pulseStyle]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.premiumBadgeGradient}
            >
              <Ionicons name="shield-checkmark" size={48} color={colors.background} />
            </LinearGradient>
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmer, shimmerStyle]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </Animated.View>

          <Text style={styles.headerTitle}>
            Crypto<Text style={styles.headerTitleAccent}>shield</Text>
            <Text style={styles.proText}> Pro</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Unlock unlimited protection and advanced security features
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <BlurView key={index} intensity={20} tint="dark" style={styles.featureCard}>
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: `${colors.primary}22` },
                ]}
              >
                <Ionicons name={feature.icon} size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </BlurView>
          ))}
        </View>

        {/* Pricing Options */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading subscription options...</Text>
          </View>
        ) : packages.length > 0 ? (
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>

            {packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const savings = getPackageSavings(pkg);

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    isSelected && styles.packageCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(pkg)}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? [`${colors.primary}33`, `${colors.primaryDark}11`]
                        : ['transparent', 'transparent']
                    }
                    style={styles.packageCardGradient}
                  >
                    <View style={styles.packageCardContent}>
                      <View style={styles.packageLeft}>
                        <View style={styles.packageHeader}>
                          <Text style={styles.packageTitle}>{getPackageTitle(pkg)}</Text>
                          {savings && (
                            <View style={styles.savingsBadge}>
                              <Text style={styles.savingsText}>{savings}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.packageDescription}>
                          {pkg.product.description || 'Full access to all premium features'}
                        </Text>
                      </View>

                      <View style={styles.packageRight}>
                        <Text style={styles.packagePrice}>{formatPrice(pkg)}</Text>
                        <View
                          style={[
                            styles.radioButton,
                            isSelected && styles.radioButtonSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioButtonInner} />}
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
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
            <TouchableOpacity style={styles.retryButton} onPress={loadOfferings}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA Button */}
        {!loading && packages.length > 0 && (
          <TouchableOpacity
            style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing || !selectedPackage}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.ctaButtonGradient}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>Upgrade to Pro</Text>
                  <Ionicons name="arrow-forward" size={24} color={colors.background} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
          Subscriptions will be charged to your credit card through your App Store account. Your
          subscription will automatically renew unless canceled at least 24 hours before the end of
          the current period. Manage your subscription in App Store settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl + 20,
    right: spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.backgroundSecondary}99`,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + 40,
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  premiumBadge: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumBadgeGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 50,
  },
  shimmer: {
    width: 100,
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.huge,
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
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
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
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  packageCardGradient: {
    padding: spacing.lg,
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
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  packageTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  savingsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
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
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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
    color: colors.background,
  },
  ctaButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  ctaButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
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
