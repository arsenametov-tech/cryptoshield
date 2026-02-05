import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useImageAnalysis } from '@fastshot/ai';
import { AnimatedIconButton, AnimatedButton, AnimatedPressable } from '@/components/AnimatedPressable';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramService } from '@/services/telegram';

export default function ScreenshotAnalysis() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useDeepAnalysis, setUseDeepAnalysis] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const { analyzeImage, data, isLoading, error } = useImageAnalysis({
    onError: (err) => {
      Alert.alert('Analysis Error', err.message);
    },
  });

  // Telegram integration
  const isInTelegram = Platform.OS === 'web' && TelegramService.isInTelegram();
  const telegram = useTelegram();

  // Check Pro status on mount
  React.useEffect(() => {
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    const { SubscriptionService } = await import('@/services/subscription');
    const proStatus = await SubscriptionService.isPro();
    setIsPro(proStatus);
  };

  // Setup Telegram Back Button
  useEffect(() => {
    if (!isInTelegram || !telegram) return;

    // Show back button
    telegram.showBackButton(() => {
      router.back();
    });

    return () => {
      if (telegram) {
        telegram.hideBackButton();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInTelegram]);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to analyze screenshots.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);

        // Analyze with Newell AI Vision
        const basePrompt = `Analyze this image for cryptocurrency scam indicators. Look for:
          - Promises of guaranteed high returns or "instant profits"
          - Phrases like "double your money", "risk-free", "limited time only"
          - Fake celebrity endorsements or impersonations
          - Requests to send crypto with promises of returns
          - Suspicious URLs or phishing attempts
          - Pressure tactics or urgency language
          - Fake wallet addresses or QR codes
          - Claims of insider information
          - Unprofessional design or poor grammar

          Provide a security analysis highlighting any red flags found.`;

        const deepPrompt = `${basePrompt}

          DEEP ANALYSIS MODE (Pro Feature):
          Additionally perform comprehensive threat analysis:
          - Extract and analyze any URLs or wallet addresses
          - Identify social engineering tactics and psychological manipulation
          - Detect subtle linguistic patterns used in scams
          - Analyze visual design elements for legitimacy
          - Cross-reference common scam templates and patterns
          - Provide detailed mitigation steps and recommendations
          - Rate the threat level on a scale of 1-10 with detailed reasoning`;

        await analyzeImage({
          imageUrl: imageUri,
          prompt: useDeepAnalysis ? deepPrompt : basePrompt,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera access to take photos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);

        // Analyze with Newell AI Vision
        const basePrompt = `Analyze this image for cryptocurrency scam indicators. Look for:
          - Promises of guaranteed high returns or "instant profits"
          - Phrases like "double your money", "risk-free", "limited time only"
          - Fake celebrity endorsements or impersonations
          - Requests to send crypto with promises of returns
          - Suspicious URLs or phishing attempts
          - Pressure tactics or urgency language
          - Fake wallet addresses or QR codes
          - Claims of insider information
          - Unprofessional design or poor grammar

          Provide a security analysis highlighting any red flags found.`;

        const deepPrompt = `${basePrompt}

          DEEP ANALYSIS MODE (Pro Feature):
          Additionally perform comprehensive threat analysis:
          - Extract and analyze any URLs or wallet addresses
          - Identify social engineering tactics and psychological manipulation
          - Detect subtle linguistic patterns used in scams
          - Analyze visual design elements for legitimacy
          - Cross-reference common scam templates and patterns
          - Provide detailed mitigation steps and recommendations
          - Rate the threat level on a scale of 1-10 with detailed reasoning`;

        await analyzeImage({
          imageUrl: imageUri,
          prompt: useDeepAnalysis ? deepPrompt : basePrompt,
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const getRiskLevel = (analysis: string): 'safe' | 'warning' | 'danger' => {
    const lowerAnalysis = analysis.toLowerCase();
    const dangerKeywords = [
      'scam',
      'fraud',
      'phishing',
      'suspicious',
      'red flag',
      'warning',
      'caution',
      'fake',
      'impersonation',
    ];
    const safeKeywords = ['safe', 'legitimate', 'authentic', 'no red flags'];

    const dangerCount = dangerKeywords.filter((keyword) =>
      lowerAnalysis.includes(keyword)
    ).length;
    const safeCount = safeKeywords.filter((keyword) =>
      lowerAnalysis.includes(keyword)
    ).length;

    if (dangerCount >= 3) return 'danger';
    if (dangerCount >= 1 || safeCount === 0) return 'warning';
    return 'safe';
  };

  const riskLevel = data ? getRiskLevel(data) : null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'safe':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'danger':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'safe':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'danger':
        return '⚠️ HIGH RISK DETECTED';
      case 'warning':
        return '⚠️ POTENTIAL RISKS FOUND';
      case 'safe':
        return '✓ NO OBVIOUS THREATS';
      default:
        return 'ANALYZING...';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <AnimatedIconButton style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedIconButton>
        <Text style={styles.headerTitle}>Screenshot Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Upload chats, ads, or whitepapers. Newell Vision detects red flags.
        </Text>

        {/* Deep Analysis Toggle */}
        {!selectedImage && (
          <View style={styles.deepAnalysisContainer}>
            <LinearGradient
              colors={
                isPro
                  ? [`${colors.primary}22`, 'transparent']
                  : [`${colors.textMuted}11`, 'transparent']
              }
              style={styles.deepAnalysisCard}
            >
              <View style={styles.deepAnalysisContent}>
                <View style={styles.deepAnalysisLeft}>
                  <View style={styles.deepAnalysisHeader}>
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={isPro ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.deepAnalysisTitle,
                        !isPro && styles.deepAnalysisDisabled,
                      ]}
                    >
                      Deep Screenshot Analysis
                    </Text>
                    {!isPro && (
                      <View style={styles.proBadgeSmall}>
                        <Ionicons name="star" size={12} color={colors.primary} />
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.deepAnalysisDescription,
                      !isPro && styles.deepAnalysisDisabled,
                    ]}
                  >
                    {isPro
                      ? 'Advanced threat detection with detailed analysis'
                      : 'Unlock comprehensive threat analysis'}
                  </Text>
                </View>

                {isPro ? (
                  <AnimatedPressable
                    style={
                      useDeepAnalysis
                        ? [styles.deepAnalysisToggle, styles.deepAnalysisToggleActive]
                        : styles.deepAnalysisToggle
                    }
                    onPress={() => setUseDeepAnalysis(!useDeepAnalysis)}
                    scaleOnPress={0.94}
                    hapticType="selection"
                  >
                    <View
                      style={[
                        styles.deepAnalysisToggleThumb,
                        useDeepAnalysis && styles.deepAnalysisToggleThumbActive,
                      ]}
                    />
                  </AnimatedPressable>
                ) : (
                  <AnimatedPressable
                    style={styles.upgradeButtonSmall}
                    onPress={() => router.push('/premium')}
                    scaleOnPress={0.94}
                    hapticType="medium"
                  >
                    <Text style={styles.upgradeButtonSmallText}>Upgrade</Text>
                  </AnimatedPressable>
                )}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Image Selection Buttons */}
        {!selectedImage && (
          <View style={styles.actionsContainer}>
            <AnimatedButton
              onPress={pickImage}
              disabled={isLoading}
              scaleOnPress={0.97}
              hapticType="medium"
            >
              <View style={styles.actionButton}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="image" size={32} color={colors.background} />
                  <Text style={styles.actionButtonText}>Choose from Library</Text>
                </LinearGradient>
              </View>
            </AnimatedButton>

            <AnimatedButton
              onPress={takePhoto}
              disabled={isLoading}
              scaleOnPress={0.97}
              hapticType="medium"
            >
              <View style={styles.actionButton}>
                <View style={styles.actionButtonOutline}>
                  <Ionicons name="camera" size={32} color={colors.primary} />
                  <Text style={styles.actionButtonTextOutline}>Take Photo</Text>
                </View>
              </View>
            </AnimatedButton>
          </View>
        )}

        {/* Selected Image */}
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <AnimatedIconButton
              style={styles.changeImageButton}
              onPress={() => {
                setSelectedImage(null);
              }}
              scaleOnPress={0.9}
            >
              <Ionicons name="close-circle" size={24} color={colors.text} />
            </AnimatedIconButton>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Analyzing image with Newell AI Vision...
            </Text>
            <Text style={styles.loadingSubtext}>This may take 2-10 seconds</Text>
          </View>
        )}

        {/* Analysis Results */}
        {data && !isLoading && riskLevel && (
          <View style={styles.resultsContainer}>
            {/* Risk Badge */}
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(riskLevel) + '20' },
              ]}
            >
              <Ionicons
                name={getRiskIcon(riskLevel)}
                size={32}
                color={getRiskColor(riskLevel)}
              />
              <Text style={[styles.riskLabel, { color: getRiskColor(riskLevel) }]}>
                {getRiskLabel(riskLevel)}
              </Text>
            </View>

            {/* AI Analysis */}
            <View style={styles.analysisSection}>
              <View style={styles.analysisHeader}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={styles.analysisTitle}>Newell AI Analysis</Text>
              </View>

              <View style={styles.analysisCard}>
                <Text style={styles.analysisText}>{data}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <AnimatedButton
                onPress={() => setSelectedImage(null)}
                scaleOnPress={0.97}
              >
                <View style={styles.analyzeAnotherButton}>
                  <Text style={styles.analyzeAnotherText}>Analyze Another</Text>
                </View>
              </AnimatedButton>

              {riskLevel === 'danger' && (
                <AnimatedButton
                  onPress={() => {}}
                  scaleOnPress={0.97}
                  hapticType="warning"
                >
                  <View style={styles.reportButton}>
                    <LinearGradient
                      colors={[colors.danger, colors.dangerDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.reportButtonGradient}
                    >
                      <Ionicons name="flag" size={20} color={colors.text} />
                      <Text style={styles.reportButtonText}>Report Scam</Text>
                    </LinearGradient>
                  </View>
                </AnimatedButton>
              )}
            </View>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.danger} />
            <Text style={styles.errorText}>Analysis Failed</Text>
            <Text style={styles.errorSubtext}>{error.message}</Text>
            <AnimatedButton
              onPress={() => selectedImage && pickImage()}
              scaleOnPress={0.97}
            >
              <View style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </View>
            </AnimatedButton>
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Powered by Newell AI Vision{'\n'}Advanced scam detection technology
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  actionButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  actionButtonTextOutline: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  changeImageButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultsContainer: {
    gap: spacing.xl,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  riskLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  analysisSection: {
    gap: spacing.md,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  analysisTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  analysisCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  analysisText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actionButtonsContainer: {
    gap: spacing.md,
  },
  analyzeAnotherButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  analyzeAnotherText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  reportButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  reportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  reportButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.danger,
  },
  errorSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  infoBanner: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoBannerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deepAnalysisContainer: {
    marginBottom: spacing.lg,
  },
  deepAnalysisCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  deepAnalysisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  deepAnalysisLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  deepAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  deepAnalysisTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  deepAnalysisDisabled: {
    color: colors.textMuted,
  },
  deepAnalysisDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  proBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: `${colors.primary}22`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  proBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  deepAnalysisToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  deepAnalysisToggleActive: {
    backgroundColor: colors.primary,
  },
  deepAnalysisToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
  },
  deepAnalysisToggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  upgradeButtonSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  upgradeButtonSmallText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.background,
  },
});
