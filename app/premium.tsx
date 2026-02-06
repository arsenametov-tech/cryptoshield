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
  TextInput,
  Keyboard,
  Platform,
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
  withDelay,
} from 'react-native-reanimated';
import type { AdaptyPaywallProduct } from 'react-native-adapty';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { SubscriptionService } from '@/services/subscription';
import { HapticsService } from '@/services/haptics';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { PromoCodeService, PromoCodeType } from '@/services/promoCode';
import { t } from '@/services/i18n';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramService } from '@/services/telegram';
import { TelegramStarsService, TELEGRAM_STARS_PRODUCTS } from '@/services/telegramStars';
import { ConfettiAnimation } from '@/components/ConfettiAnimation';

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
    title: t('premium.features.unlimitedScans.title'),
    description: t('premium.features.unlimitedScans.description'),
    accentColor: colors.primary,
  },
  {
    icon: 'camera',
    title: t('premium.features.deepScreenshot.title'),
    description: t('premium.features.deepScreenshot.description'),
    accentColor: '#00b8ff',
  },
  {
    icon: 'flash',
    title: t('premium.features.priorityAI.title'),
    description: t('premium.features.priorityAI.description'),
    accentColor: '#ff8c00',
  },
  {
    icon: 'shield-checkmark',
    title: t('premium.features.advancedProtection.title'),
    description: t('premium.features.advancedProtection.description'),
    accentColor: colors.success,
  },
  {
    icon: 'trending-up',
    title: t('premium.features.earlyAccess.title'),
    description: t('premium.features.earlyAccess.description'),
    accentColor: '#9d4edd',
  },
  {
    icon: 'desktop',
    title: t('premium.features.multiDevice.title'),
    description: t('premium.features.multiDevice.description'),
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
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [purchasingWithStars, setPurchasingWithStars] = useState(false);

  // Telegram integration
  const isInTelegram = Platform.OS === 'web' && TelegramService.isInTelegram();
  const telegram = useTelegram();

  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(1);
  const badgeRotate = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const promoInputHeight = useSharedValue(0);
  const promoInputOpacity = useSharedValue(0);
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

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

  // Setup Telegram Back Button and Main Button
  useEffect(() => {
    if (!isInTelegram || !telegram) return;

    // Show back button
    telegram.showBackButton(() => {
      router.back();
    });

    // Setup main button for purchase (if not showing promo input)
    if (!loading && products.length > 0 && selectedProduct && !showPromoInput) {
      telegram.showMainButton(t('premium.upgradeToPro'), handlePurchase);
    } else if (showPromoInput && promoCode.trim()) {
      telegram.showMainButton(t('premium.applyPromo'), handleApplyPromo);
    } else {
      telegram.hideMainButton();
    }

    return () => {
      if (telegram) {
        telegram.hideBackButton();
        telegram.hideMainButton();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, products, selectedProduct, showPromoInput, promoCode, isInTelegram]);

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

  const handlePurchaseWithStars = async (productId: string) => {
    if (!TelegramStarsService.isAvailable()) {
      Alert.alert(
        t('common.error'),
        'Telegram Stars payments are only available in Telegram Mini App'
      );
      return;
    }

    const product = TelegramStarsService.getProduct(productId);
    if (!product) return;

    HapticsService.heavy();
    setPurchasingWithStars(true);

    try {
      const result = await TelegramStarsService.purchaseWithStars(product);

      if (result.cancelled) {
        // User cancelled - no action needed
        return;
      }

      if (result.success) {
        HapticsService.success();
        setShowConfetti(true);

        setTimeout(() => {
          Alert.alert(t('premium.welcomeToPro'), t('premium.welcomeMessage'), [
            {
              text: t('common.continue'),
              onPress: () => router.back(),
            },
          ]);
        }, 1500);
      } else {
        HapticsService.error();
        Alert.alert(
          t('premium.purchaseFailed'),
          result.error || t('premium.purchaseFailedMessage')
        );
      }
    } catch {
      HapticsService.error();
      Alert.alert(t('premium.purchaseFailed'), t('premium.purchaseFailedMessage'));
    } finally {
      setPurchasingWithStars(false);
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
        setShowConfetti(true);

        setTimeout(() => {
          Alert.alert(t('premium.welcomeToPro'), t('premium.welcomeMessage'), [
            {
              text: t('common.continue'),
              onPress: () => router.back(),
            },
          ]);
        }, 1500);
      } else if (!result.success) {
        HapticsService.error();
        Alert.alert(
          t('premium.purchasePending'),
          t('premium.purchasePendingMessage')
        );
      }
    } catch {
      HapticsService.error();
      Alert.alert(t('premium.purchaseFailed'), t('premium.purchaseFailedMessage'));
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
        Alert.alert(t('premium.purchasesRestored'), t('premium.purchasesRestoredMessage'), [
          {
            text: t('common.continue'),
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert(t('premium.noPurchasesFound'), t('premium.noPurchasesFoundMessage'));
      }
    } catch {
      HapticsService.error();
      Alert.alert(t('premium.restoreFailed'), t('premium.restoreFailedMessage'));
    } finally {
      setRestoring(false);
    }
  };

  const togglePromoInput = () => {
    HapticsService.light();
    Keyboard.dismiss();

    const newShowState = !showPromoInput;
    setShowPromoInput(newShowState);

    if (newShowState) {
      promoInputHeight.value = withSpring(80, { damping: 15, stiffness: 150 });
      promoInputOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    } else {
      promoInputOpacity.value = withTiming(0, { duration: 200 });
      promoInputHeight.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 150 }));
    }
  };

  const showCelebrationAnimation = () => {
    celebrationScale.value = 0;
    celebrationOpacity.value = 1;

    celebrationScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    celebrationOpacity.value = withDelay(
      2000,
      withTiming(0, { duration: 500 })
    );
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      HapticsService.warning();
      return;
    }

    Keyboard.dismiss();
    HapticsService.heavy();

    setApplyingPromo(true);

    try {
      const result = await PromoCodeService.applyPromoCode(promoCode);

      if (result.success && result.promoData) {
        // Success! Show celebration animation
        HapticsService.success();
        HapticsService.heavy();
        HapticsService.heavy();

        showCelebrationAnimation();
        setShowConfetti(true);

        // Determine message based on promo type
        let message = '';
        let title = t('premium.promoSuccess');

        switch (result.promoData.type) {
          case PromoCodeType.BONUS_SCANS:
            message = t('premium.promoBonusScans', { count: result.promoData.value });
            break;
          case PromoCodeType.PRO_TRIAL:
            message = t('premium.promoTrialActivated', { days: result.promoData.value });
            break;
          case PromoCodeType.LIFETIME_PRO:
            message = t('premium.promoLifetimeActivated');
            break;
          default:
            message = t('premium.promoSuccessMessage');
        }

        setTimeout(() => {
          Alert.alert(title, message, [
            {
              text: t('common.continue'),
              onPress: () => router.back(),
            },
          ]);
        }, 1500);
      } else {
        HapticsService.error();
        const errorMessage = result.message === 'This promo code has already been used'
          ? t('premium.promoAlreadyUsed')
          : t('premium.invalidPromoCode');
        Alert.alert(t('common.error'), errorMessage);
      }
    } catch {
      HapticsService.error();
      Alert.alert(t('common.error'), t('premium.invalidPromoCode'));
    } finally {
      setApplyingPromo(false);
      setPromoCode('');
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

  const promoInputAnimatedStyle = useAnimatedStyle(() => ({
    height: promoInputHeight.value,
    opacity: promoInputOpacity.value,
  }));

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationOpacity.value,
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

      {/* Celebration Animation Overlay */}
      <Animated.View style={[styles.celebrationOverlay, celebrationAnimatedStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(147, 51, 234, 0.3)', 'rgba(79, 70, 229, 0.3)']}
          style={styles.celebrationGradient}
        >
          <Ionicons name="sparkles" size={80} color="#a78bfa" />
          <Text style={styles.celebrationText}>🎉</Text>
        </LinearGradient>
      </Animated.View>

      {/* Confetti Animation */}
      <ConfettiAnimation
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Close Button - Only show if not in Telegram (Telegram uses Back Button) */}
      {!isInTelegram && (
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
      )}

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
            <Text style={styles.proText}> {t('common.pro')}</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('premium.subtitle')}
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

        {/* Telegram Stars Pricing (if in Telegram) */}
        {isInTelegram && TelegramStarsService.isAvailable() && (
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>{t('premium.payWithStars')}</Text>
            <Text style={styles.pricingSubtitle}>Оплата через Telegram Stars</Text>

            {TELEGRAM_STARS_PRODUCTS.map((product) => {
              const isMonthly = product.period === 'monthly';
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.starsPackageCard}
                  onPress={() => handlePurchaseWithStars(product.id)}
                  disabled={purchasingWithStars}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={30} tint="dark" style={styles.packageBlur}>
                    <LinearGradient
                      colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
                      style={styles.packageCardGradient}
                    >
                      {!isMonthly && (
                        <View style={styles.bestValueBadge}>
                          <LinearGradient
                            colors={['#00ff88', '#00cc66']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bestValueGradient}
                          >
                            <Text style={styles.bestValueText}>{t('premium.bestValue')}</Text>
                          </LinearGradient>
                        </View>
                      )}

                      <View style={styles.packageCardContent}>
                        <View style={styles.packageLeft}>
                          <Text style={styles.packageTitle}>
                            {product.period === 'monthly' ? t('premium.monthly') : t('premium.lifetime')}
                          </Text>
                          <Text style={styles.packageDescription}>{product.description}</Text>
                        </View>

                        <View style={styles.packageRight}>
                          <Text style={styles.starsPrice}>
                            {TelegramStarsService.formatStarsAmount(product.starsAmount)}
                          </Text>
                          <Ionicons name="arrow-forward-circle" size={28} color="#FFD700" />
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Divider if both payment methods are available */}
        {isInTelegram && TelegramStarsService.isAvailable() && !loading && products.length > 0 && (
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        {/* Regular Pricing Options (Adapty/App Store) */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <SkeletonLoader height={140} style={{ marginBottom: spacing.md }} />
            <SkeletonLoader height={140} />
          </View>
        ) : products.length > 0 ? (
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>{t('premium.choosePlan')}</Text>

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
                            <Text style={styles.bestValueText}>{t('premium.bestValue')}</Text>
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
            <Text style={[styles.errorText, { marginTop: spacing.md, color: colors.primary }]}>
              Have a promo code? Use it below to unlock premium features.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPaywall}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA Button - Only show if not in Telegram (Telegram uses Main Button) */}
        {!isInTelegram && !loading && products.length > 0 && (
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
                      <Text style={styles.ctaText}>{t('premium.upgradeToPro')}</Text>
                      <Ionicons name="arrow-forward" size={24} color="#0a0e27" />
                    </>
                  )}
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Promo Code Section */}
        {!loading && (
          <View style={styles.promoSection}>
            {/* Promo Code Button */}
            <TouchableOpacity
              style={styles.promoButton}
              onPress={togglePromoInput}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.1)', 'rgba(79, 70, 229, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.promoButtonGradient}
              >
                <Ionicons name="gift" size={20} color="#a78bfa" />
                <Text style={styles.promoButtonText}>{t('premium.promoCode')}</Text>
                <Ionicons
                  name={showPromoInput ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#a78bfa"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Promo Code Input with Glassmorphism */}
            <Animated.View style={[styles.promoInputContainer, promoInputAnimatedStyle]}>
              <BlurView intensity={40} tint="dark" style={styles.promoInputBlur}>
                <LinearGradient
                  colors={['rgba(147, 51, 234, 0.15)', 'rgba(79, 70, 229, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promoInputGradient}
                >
                  <View style={styles.promoInputRow}>
                    <View style={styles.promoInputWrapper}>
                      <TextInput
                        style={styles.promoInput}
                        placeholder={t('premium.enterPromoCode')}
                        placeholderTextColor={colors.textMuted}
                        value={promoCode}
                        onChangeText={setPromoCode}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        editable={!applyingPromo}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.applyPromoButton,
                        (!promoCode.trim() || applyingPromo) && styles.applyPromoButtonDisabled,
                      ]}
                      onPress={handleApplyPromo}
                      disabled={!promoCode.trim() || applyingPromo}
                      activeOpacity={0.8}
                    >
                      {applyingPromo ? (
                        <ActivityIndicator size="small" color={colors.background} />
                      ) : (
                        <>
                          <Text style={styles.applyPromoButtonText}>{t('premium.applyPromo')}</Text>
                          <Ionicons name="checkmark-circle" size={20} color={colors.background} />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
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
            <Text style={styles.restoreButtonText}>{t('premium.restorePurchases')}</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          {t('premium.terms')}
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
  promoSection: {
    marginBottom: spacing.lg,
  },
  promoButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  promoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  promoButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#a78bfa',
  },
  promoInputContainer: {
    overflow: 'hidden',
  },
  promoInputBlur: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  promoInputGradient: {
    padding: spacing.md,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  promoInputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  promoInput: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  applyPromoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#a78bfa',
    borderRadius: borderRadius.md,
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  applyPromoButtonDisabled: {
    opacity: 0.5,
  },
  applyPromoButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  celebrationText: {
    fontSize: 80,
    marginTop: spacing.md,
  },
  pricingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  starsPackageCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  starsPrice: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFD700',
    marginBottom: spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
  },
});
