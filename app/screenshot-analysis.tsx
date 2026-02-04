import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useImageAnalysis } from '@fastshot/ai';

export default function ScreenshotAnalysis() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { analyzeImage, data, isLoading, error } = useImageAnalysis({
    onError: (err) => {
      Alert.alert('Analysis Error', err.message);
    },
  });

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
        await analyzeImage({
          imageUrl: imageUri,
          prompt: `Analyze this image for cryptocurrency scam indicators. Look for:
          - Promises of guaranteed high returns or "instant profits"
          - Phrases like "double your money", "risk-free", "limited time only"
          - Fake celebrity endorsements or impersonations
          - Requests to send crypto with promises of returns
          - Suspicious URLs or phishing attempts
          - Pressure tactics or urgency language
          - Fake wallet addresses or QR codes
          - Claims of insider information
          - Unprofessional design or poor grammar

          Provide a security analysis highlighting any red flags found.`,
        });
      }
    } catch (err) {
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
        await analyzeImage({
          imageUrl: imageUri,
          prompt: `Analyze this image for cryptocurrency scam indicators. Look for:
          - Promises of guaranteed high returns or "instant profits"
          - Phrases like "double your money", "risk-free", "limited time only"
          - Fake celebrity endorsements or impersonations
          - Requests to send crypto with promises of returns
          - Suspicious URLs or phishing attempts
          - Pressure tactics or urgency language
          - Fake wallet addresses or QR codes
          - Claims of insider information
          - Unprofessional design or poor grammar

          Provide a security analysis highlighting any red flags found.`,
        });
      }
    } catch (err) {
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
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

        {/* Image Selection Buttons */}
        {!selectedImage && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickImage}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="image" size={32} color={colors.background} />
                <Text style={styles.actionButtonText}>Choose from Library</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={takePhoto}
              disabled={isLoading}
            >
              <View style={styles.actionButtonOutline}>
                <Ionicons name="camera" size={32} color={colors.primary} />
                <Text style={styles.actionButtonTextOutline}>Take Photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Selected Image */}
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={() => {
                setSelectedImage(null);
              }}
            >
              <Ionicons name="close-circle" size={24} color={colors.text} />
            </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.analyzeAnotherButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.analyzeAnotherText}>Analyze Another</Text>
              </TouchableOpacity>

              {riskLevel === 'danger' && (
                <TouchableOpacity style={styles.reportButton}>
                  <LinearGradient
                    colors={[colors.danger, colors.dangerDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.reportButtonGradient}
                  >
                    <Ionicons name="flag" size={20} color={colors.text} />
                    <Text style={styles.reportButtonText}>Report Scam</Text>
                  </LinearGradient>
                </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => selectedImage && pickImage()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
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
});
