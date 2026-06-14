import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { colors } from '../constants/colors';

interface Props {
  visible: boolean;
  value: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DatePickerModal({ visible, value, onSelect, onClose }: Props) {
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());
  const [day, setDay] = useState(value.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleSelect = () => {
    onSelect(new Date(year, month, Math.min(day, daysInMonth)));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Date</Text>

          <View style={styles.pickers}>
            <View style={styles.col}>
              <TouchableOpacity onPress={() => setMonth((month + 11) % 12)}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{MONTHS[month]}</Text>
              <TouchableOpacity onPress={() => setMonth((month + 1) % 12)}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <TouchableOpacity onPress={() => setDay(Math.min(day + 1, daysInMonth))}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{String(day).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={() => setDay(Math.max(day - 1, 1))}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <TouchableOpacity onPress={() => setYear(year + 1)}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.value}>{year}</Text>
              <TouchableOpacity onPress={() => setYear(year - 1)}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSelect}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  content: {
    backgroundColor: colors.white, borderRadius: 20,
    padding: 24, width: 300, alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 20 },
  pickers: { flexDirection: 'row', gap: 24 },
  col: { alignItems: 'center', gap: 8 },
  arrow: { fontSize: 16, color: colors.primary, padding: 8 },
  value: { fontSize: 22, fontWeight: '600', color: colors.text, minWidth: 60, textAlign: 'center' },
  actions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: colors.background },
  cancelText: { fontSize: 15, color: colors.gray, fontWeight: '600' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: colors.primary },
  confirmText: { fontSize: 15, color: colors.white, fontWeight: '600' },
});
