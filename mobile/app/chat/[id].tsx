import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { getSocket, connectSocket } from '../../api/socket';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  text: string;
  createdAt: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    client.get(`/chat/conversations/${id}/messages`)
      .then(({ data }) => setMessages(data));
  }, [id]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    socket.emit('join:conversation', id);

    const handler = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on('message:new', handler);

    return () => {
      socket.off('message:new', handler);
      socket.emit('leave:conversation', id);
    };
  }, [id, token]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const { data } = await client.post(`/chat/conversations/${id}/messages`, { text });
      setMessages((prev) => [...prev, data]);
      setText('');
    } catch {}
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isMine = item.sender._id === userId;
          return (
            <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.messageText, isMine && styles.myMessageText]}>{item.text}</Text>
              <Text style={[styles.time, isMine && styles.myTime]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: colors.white, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, color: colors.text },
  myMessageText: { color: colors.white },
  time: { fontSize: 11, color: colors.gray, marginTop: 4 },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 100, marginRight: 8, color: colors.text },
  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
