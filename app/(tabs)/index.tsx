import { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Text,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useRouter } from 'expo-router';
import { MessageBubble, Message } from '@/components/chat/MessageBubble';
import { QuickActionChips } from '@/components/chat/QuickActionChips';
import { CrisisPanel } from '@/components/chat/CrisisPanel';
import { RockyAvatar } from '@/components/chat/RockyAvatar';
import { detectIntent } from '@/services/rockyIntent';
import { useMapStore } from '@/store/mapStore';
import { useUserStore } from '@/store/userStore';
import { api } from '@/services/api';

const WELCOME: Message = {
  id: 'welcome',
  role: 'rocky',
  text: "Yo! I'm Rocky — your Philly jawn for finding resources around the city. Go Birds! 🦅\n\nI got youse covered on free food, shelters, health clinics, SEPTA stops, and support groups. What do you need?\n\nNote: I'm an organization tool, not a substitute for professional or medical advice.",
  timestamp: new Date(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const mapDispatch = useMapStore((s) => s.dispatch);
  const isStudent = useUserStore((s) => s.isStudent);
  const university = useUserStore((s) => s.university);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: Message = {
      id: `${Date.now()}-u`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    const intent = detectIntent(text, { isStudent, university });
    setInput('');

    // Crisis — local only, never AI
    if (intent.type === 'crisis') {
      const rockyMsg: Message = { id: `${Date.now()}-r`, role: 'rocky', text: intent.message, timestamp: new Date() };
      setMessages((prev) => [...prev.slice(-9), userMsg, rockyMsg]);
      setShowCrisis(true);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // Map filter — instant, navigate
    if (intent.type === 'map_filter') {
      mapDispatch(intent.mapAction);
      setTimeout(() => router.push('/(tabs)/map'), 600);
      const rockyMsg: Message = { id: `${Date.now()}-r`, role: 'rocky', text: intent.response, timestamp: new Date() };
      setMessages((prev) => [...prev.slice(-9), userMsg, rockyMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // Directions — instant, navigate
    if (intent.type === 'directions') {
      mapDispatch({ type: 'CENTER_ON_LOCATION', latitude: 39.9526, longitude: -75.1652 });
      setTimeout(() => router.push('/(tabs)/map'), 600);
      const rockyMsg: Message = { id: `${Date.now()}-r`, role: 'rocky', text: `A-ite, lemme pull up ${intent.resourceName} on the map jawn.`, timestamp: new Date() };
      setMessages((prev) => [...prev.slice(-9), userMsg, rockyMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // Events — fetch from API
    if (intent.type === 'show_events') {
      let rockyText = intent.response;
      let rockyEvents: Message['events'] | undefined;
      try {
        const data = await api.feed.get();
        rockyEvents = data.slice(0, 5);
      } catch {
        rockyText = "I couldn't load events right now. Try again in a moment.";
      }
      const rockyMsg: Message = { id: `${Date.now()}-r`, role: 'rocky', text: rockyText, timestamp: new Date(), ...(rockyEvents ? { events: rockyEvents } : {}) };
      setMessages((prev) => [...prev.slice(-9), userMsg, rockyMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // General — route through GPT-4o
    setMessages((prev) => [...prev.slice(-9), userMsg]);
    setIsThinking(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    let aiText = intent.response;
    try {
      const { reply } = await api.chat.send(text.trim());
      aiText = reply;
    } catch {
      // AI unavailable — fall back to keyword response
    }

    const rockyMsg: Message = { id: `${Date.now()}-r`, role: 'rocky', text: aiText, timestamp: new Date() };
    setMessages((prev) => [...prev, rockyMsg]);
    setIsThinking(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [mapDispatch, router, isStudent, university, isThinking]);

  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript;
    if (text && e.isFinal) {
      send(text);
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  async function toggleVoice() {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } else {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) return;
      ExpoSpeechRecognitionModule.start({ lang: 'en-US' });
      setIsListening(true);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Rocky header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <RockyAvatar size={44} />
        </View>
        <View>
          <Text style={styles.headerName}>Rocky</Text>
          <Text style={styles.headerSub}>Philadelphia Resource Assistant</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {isThinking && (
        <View style={styles.thinkingRow}>
          <View style={styles.thinkingBubble}>
            <Text style={styles.thinkingText}>Rocky is typing...</Text>
          </View>
        </View>
      )}

      {showCrisis && <CrisisPanel />}

      <QuickActionChips onSelect={send} />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Rocky anything..."
          placeholderTextColor="#8E8E93"
          returnKeyType="send"
          onSubmitEditing={() => send(input)}
          multiline
        />
        <TouchableOpacity
          style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
          onPress={toggleVoice}
        >
          <FontAwesome name="microphone" size={18} color={isListening ? '#2C7A3A' : '#8E8E93'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sendBtn, isThinking && styles.sendBtnDisabled]} onPress={() => send(input)} disabled={isThinking}>
          <FontAwesome name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', gap: 12 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  headerName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  headerSub: { fontSize: 12, color: '#8E8E93' },
  messages: { paddingVertical: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#E5E5EA', gap: 8 },
  input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#1C1C1E' },
  voiceBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  voiceBtnActive: { backgroundColor: '#E8F5E9' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C7A3A', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#A5D6A7' },
  thinkingRow: { paddingHorizontal: 16, marginVertical: 4 },
  thinkingBubble: { backgroundColor: '#F2F2F7', borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start' },
  thinkingText: { fontSize: 15, color: '#8E8E93', fontStyle: 'italic' },
});
