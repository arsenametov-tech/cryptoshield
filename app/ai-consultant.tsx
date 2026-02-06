import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTextGeneration } from '@fastshot/ai';
import { HapticsService } from '@/services/haptics';
import { MessageSkeleton } from '@/components/SkeletonLoader';
import { ShimmerBadge } from '@/components/ShimmerBadge';
import { AnimatedIconButton } from '@/components/AnimatedPressable';
import { t } from '@/services/i18n';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramService } from '@/services/telegram';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Вы — эксперт по безопасности криптовалют, AI-ассистент в приложении Cryptoshield для обнаружения мошенничества. Ваша роль — помогать пользователям выявлять и избегать криптомошенничества, rug pull'ов и мошеннических проектов на русскоязычном крипто-рынке.

Ключевые области экспертизы:
- Анализ безопасности смарт-контрактов
- Обнаружение honeypot'ов
- Проверка блокировки ликвидности
- Проверка команды и оценка надежности
- Красные флаги в токеномике
- Тактики социальной инженерии
- Фишинг и мошенничество через подмену личности
- Безопасные практики торговли

Всегда:
- Будьте ясны, прямолинейны и сфокусированы на безопасности
- Предупреждайте пользователей о потенциальных рисках
- Объясняйте технические концепции простым языком
- Рекомендуйте тщательное исследование перед инвестированием
- Никогда не гарантируйте прибыль или инвестиционные советы
- Выделяйте красные флаги в проектах, о которых спрашивают пользователи
- Учитывайте специфику российского и СНГ крипто-рынка
- Предоставляйте контекстную информацию о местных угрозах и мошенниках

Отвечайте профессионально, но доступно. Держите ответы лаконичными (максимум 2-4 параграфа), если не запрашивается детальный анализ. ВАЖНО: Всегда отвечайте на русском языке.`;

const PRO_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

РЕЖИМ PRO - Углубленный анализ:
Поскольку использует Pro подписчик, предоставляйте более детальные и всесторонние ответы с:
- Более глубоким техническим анализом и объяснениями
- Более конкретными рекомендациями по безопасности
- Дополнительным контекстом об угрозах и уязвимостях
- Продвинутыми паттернами безопасности и лучшими практиками
- Приоритетным ответом с дополнительными деталями когда это уместно
- Специфическими рекомендациями для русскоязычного крипто-сообщества`;

export default function AIConsultant() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('aiConsultant.welcomeMessage'),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [scansRemaining, setScansRemaining] = useState(7);
  const [shouldShowScanHint, setShouldShowScanHint] = useState(false);

  const { generateText, isLoading } = useTextGeneration();

  // Telegram integration
  const isInTelegram = Platform.OS === 'web' && TelegramService.isInTelegram();
  const telegram = useTelegram();

  // Check Pro status on mount
  useEffect(() => {
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    const { SubscriptionService } = await import('@/services/subscription');
    const proStatus = await SubscriptionService.isPro();
    const { scansRemaining: remaining } = await SubscriptionService.canScan();
    setIsPro(proStatus);
    setScansRemaining(remaining);

    // Show scan hint if user is not Pro and has 2 or fewer scans remaining
    if (!proStatus && remaining <= 2 && remaining >= 0) {
      setShouldShowScanHint(true);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Setup Telegram Back Button and Main Button
  useEffect(() => {
    if (!isInTelegram || !telegram) return;

    // Show back button
    telegram.showBackButton(() => {
      router.back();
    });

    // Setup main button for sending messages
    if (inputText.trim() && !isLoading) {
      telegram.showMainButton(t('common.send'), handleSend);
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
  }, [inputText, isLoading, isInTelegram]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Light haptic feedback for sending message
    HapticsService.light();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      // Build conversation context
      const conversationHistory = messages
        .slice(-6) // Last 6 messages for context
        .map((msg) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n\n');

      // Add context about scans if user is low on scans and not Pro
      let additionalContext = '';
      if (!isPro && scansRemaining <= 2 && scansRemaining >= 0) {
        additionalContext = `\n\nКонтекстная информация: У пользователя осталось только ${scansRemaining} проверок на сегодня. Если это уместно в контексте беседы, тактично упомяните о преимуществах Pro подписки (безлимитные проверки) или возможности использовать промокоды для дополнительных проверок. Не будьте навязчивы - упоминайте это только если это естественно вписывается в контекст разговора.`;
      }

      const fullPrompt = `${isPro ? PRO_SYSTEM_PROMPT : SYSTEM_PROMPT}${additionalContext}

Conversation history:
${conversationHistory}

User: ${userMessage.text}

Please provide a helpful security-focused response.`;

      const response = await generateText(fullPrompt);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || t('aiConsultant.errorMessage'),
        isUser: false,
        timestamp: new Date(),
      };

      // Success haptic feedback
      HapticsService.success();
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Error haptic feedback
      HapticsService.error();

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('aiConsultant.errorMessage'),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        {!isInTelegram && (
          <AnimatedIconButton
            style={styles.backButton}
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </AnimatedIconButton>
        )}

        <View style={styles.headerCenter}>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.headerTitle}>{t('aiConsultant.title')}</Text>
          </View>
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.headerSubtitle}>
              {isPro ? t('aiConsultant.proMode') : t('aiConsultant.powered') + ' '}
            </Text>
            <Text style={styles.headerSubtitleAccent}>Newell AI</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isPro && <ShimmerBadge text="Pro" icon="star" compact />}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            {!message.isUser && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
              </View>
            )}

            <View
              style={[
                styles.messageContent,
                message.isUser ? styles.userMessageContent : styles.aiMessageContent,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.aiMessageText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && <MessageSkeleton />}

        {/* Low scans hint banner */}
        {shouldShowScanHint && !isPro && scansRemaining <= 2 && (
          <View style={styles.hintBanner}>
            <BlurView intensity={30} tint="dark" style={styles.hintBlur}>
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.1)', 'rgba(79, 70, 229, 0.1)']}
                style={styles.hintGradient}
              >
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.hintText}>
                  {t('aiConsultant.lowScansHint')}
                </Text>
              </LinearGradient>
            </BlurView>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('aiConsultant.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />

          <AnimatedIconButton
            style={
              (!inputText.trim() || isLoading)
                ? [styles.sendButton, styles.sendButtonDisabled]
                : styles.sendButton
            }
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            scaleOnPress={0.9}
            hapticType="medium"
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || isLoading ? colors.textMuted : colors.background}
            />
          </AnimatedIconButton>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  headerSubtitleAccent: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  userMessageContent: {
    backgroundColor: colors.primary,
  },
  aiMessageContent: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.background,
  },
  aiMessageText: {
    color: colors.text,
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surface,
  },
  hintBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  hintBlur: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  hintGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
  },
  hintText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
