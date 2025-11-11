import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export function AddressRow({ label, address, isDefault }: { label: string; address: string; isDefault?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
      <Ionicons name="location" size={18} color={isDefault ? '#dc2626' : '#6b7280'} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontWeight: '600', color: '#111827' }}>{label}</Text>
          {isDefault && <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ fontSize: 10, color: '#dc2626', fontWeight: '600' }}>Default</Text></View>}
        </View>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>{address}</Text>
      </View>
    </View>
  );
}
