import { Text, View } from 'react-native';

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#dc2626' }}>{value}</Text>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
    </View>
  );
}