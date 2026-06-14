import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: string;
  lastMessageAt?: string;
}

export default function ConversationsScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await client.get('/chat/conversations');
      setConversations(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const getOther = (conv: Conversation) => {
    const userId = require('../../store/auth').useAuthStore.getState().user?.id;
    return conv.participants.find((p) => p._id !== userId) || conv.participants[0] || { _id: '', name: 'Unknown' };
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchConversations} />}
        renderItem={({ item }) => {
          const other = getOther(item);
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/chat/${item._id}`)}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color={colors.white} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>{other.name}</Text>
                {item.lastMessage ? (
                  <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
                ) : null}
              </View>
              {item.lastMessageAt ? (
                <Text style={styles.time}>
                  {new Date(item.lastMessageAt).toLocaleDateString()}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  preview: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  time: { fontSize: 12, color: colors.gray, marginLeft: 8 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
});
