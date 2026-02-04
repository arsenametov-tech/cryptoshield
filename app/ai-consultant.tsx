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

    // Build conversation context
    const conversationHistory = messages
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n\n');

    const fullPrompt = `${SYSTEM_PROMPT}

Conversation history:
${conversationHistory}

User: ${userMessage.text}