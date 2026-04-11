import { StyleSheet, Text, View } from 'react-native';

export interface Message {
  id: string;
  role: 'user' | 'rocky';
  text: string;
  timestamp: Date;
}

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleRocky]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 16 },
  rowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleRocky: { backgroundColor: '#F2F2F7', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: '#2C7A3A', borderBottomRightRadius: 4 },
  text: { fontSize: 15, color: '#1C1C1E', lineHeight: 21 },
  textUser: { color: '#FFFFFF' },
});
