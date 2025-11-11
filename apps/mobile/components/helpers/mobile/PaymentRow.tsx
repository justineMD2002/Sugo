import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export function PaymentRow({ label, details, isDefault, disabled }: { label: string; details?: string; isDefault?: boolean; disabled?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8, opacity: disabled ? 0.4 : 1 }}>
      <Ionicons name="card" size={18} color={isDefault ? '#dc2626' : '#6b7280'} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontWeight: '600', color: '#111827' }}>{label}</Text>
          {isDefault && <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '600' }}>Default</Text></View>}
          {disabled && <Text style={{ fontSize: 12, color: '#6b7280' }}>(Coming Soon)</Text>}
        </View>
        {details && <Text style={{ color: '#6b7280', fontSize: 12 }}>{details}</Text>}
      </View>
    </View>
  );
}