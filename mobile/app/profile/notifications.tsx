import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={48} color={colors.gray} />
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
});
