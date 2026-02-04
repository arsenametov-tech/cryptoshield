import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTextGeneration } from '@fastshot/ai';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are a cryptocurrency security expert AI assistant built into Cryptoshield, a scam detection app. Your role is to help users identify and avoid crypto scams, rug pulls, and fraudulent projects.

Key areas of expertise:
- Smart contract security analysis
- Honeypot detection
- Liquidity lock verification
- Team doxxing and credibility assessment
- Red flags in tokenomics
- Social engineering tactics
- Phishing and impersonation scams
- Safe trading practices

Always:
- Be clear, direct, and security-focused
- Warn users about potential risks
- Explain technical concepts in simple terms
- Recommend thorough research before investing
- Never guarantee profits or investment advice
- Highlight red flags in projects users ask about

Respond in a professional but approachable tone. Keep responses concise (2-4 paragraphs max) unless detailed analysis is requested.`;

export default function AIConsultant() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your Crypto Security AI Consultant powered by Newell AI. I can help you identify scams, analyze projects, and answer security questions. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const { generateText, isLoading } = useTextGeneration();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

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

      const fullPrompt = `${SYSTEM_PROMPT}

Conversation history:
${conversationHistory}

User: ${userMessage.text}

Please provide a helpful security-focused response.`;

      const response = await generateText(fullPrompt);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "I'm sorry, I couldn't process that request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again or rephrase your question.",
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.headerTitle}>AI Security Expert</Text>
          </View>
          <Text style={styles.headerSubtitle}>Powered by Newell AI</Text>
        </View>

        <View style={styles.headerRight} />
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

        {isLoading && (
          <View style={[styles.messageBubble, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <View style={[styles.messageContent, styles.aiMessageContent]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.messageText, styles.aiMessageText, { marginLeft: 8 }]}>
                Analyzing...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about crypto security..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || isLoading ? colors.textMuted : colors.background}
            />
          </TouchableOpacity>
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
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
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
});
