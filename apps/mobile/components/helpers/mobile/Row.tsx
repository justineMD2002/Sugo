import { Text, View } from 'react-native';

export function Row({ label, value, valueTint }: { label: string; value?: string; valueTint?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 8 }}>
      <Text style={{ color: '#6b7280', flexShrink: 0 }}>{label}:</Text>
      <Text style={{ color: valueTint ?? '#111827', fontWeight: '600', flex: 1, textAlign: 'right', flexWrap: 'wrap' }}>{value}</Text>
    </View>
  );
}