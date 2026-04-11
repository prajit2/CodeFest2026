import { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Text,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { useRouter } from 'expo-router';
import { MessageBubble, Message } from '@/components/chat/MessageBubble';
import { QuickActionChips } from '@/components/chat/QuickActionChips';
import { CrisisPanel } from '@/components/chat/CrisisPanel';
import { RockyAvatar } from '@/components/chat/RockyAvatar';
import { detectIntent } from '@/services/rockyIntent';
import { useMapStore } from '@/store/mapStore';
import { api } from '@/services/api';

const WELCOME: Message = {
  id: 'welcome',
  role: 'rocky',
  text: "Hey, I'm Rocky! I can help you find free food, shelters, health clinics, transit, and support in Philadelphia. What do you need today?\n\nNote: I'm an organization tool, not a substitute for professional or medical advice.",
  timestamp: new Date(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const mapDispatch = useMapStore((s) => s.dispatch);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    const intent = detectIntent(text);
    let rockyText = '';
    let crisis = false;
    let rockyEvents: Message['events'] | undefined;

    switch (intent.type) {
      case 'crisis':
        rockyText = intent.message;
        crisis = true;
        break;
      case 'map_filter':
        rockyText = intent.response ?? "Opening the map for you.";
        mapDispatch(intent.mapAction);
        setTimeout(() => router.push('/(tabs)/map'), 600);
        break;
      case 'directions':
        rockyText = `Let me find directions to ${intent.resourceName}. Opening the map.`;
        mapDispatch({ type: 'CENTER_ON_LOCATION', latitude: 39.9526, longitude: -75.1652 });
        setTimeout(() => router.push('/(tabs)/map'), 600);
        break;
      case 'show_events':
        rockyText = intent.response;
        try {
          const data = await api.feed.get();
          rockyEvents = data.slice(0, 5);
        } catch {
          rockyText = "I couldn't load events right now. Try again in a moment.";
        }
        break;
      default:
        rockyText = intent.response ?? "I can help you find resources in Philadelphia. Try asking about food, shelter, clinics, or transit.";
    }

    const rockyMsg: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'rocky',
      text: rockyText,
      timestamp: new Date(),
      ...(rockyEvents !== undefined ? { events: rockyEvents } : {}),
    };

    setMessages((prev) => [...prev.slice(-9), userMsg, rockyMsg]); // keep last 10
    setShowCrisis(crisis);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [mapDispatch, router]);

  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0];
      if (text) send(text);
      setIsListening(false);
    };
    Voice.onSpeechError = (_: SpeechErrorEvent) => {
      setIsListening(false);
    };
    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, [send]);

  async function toggleVoice() {
    if (isListening) {
      await Voice.stop();
      setIsListening(false);
    } else {
      try {
        await Voice.start('en-US');
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
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
        <TouchableOpacity style={styles.sendBtn} onPress={() => send(input)}>
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
});
