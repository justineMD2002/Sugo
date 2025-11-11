import { Text } from 'react-native';

export function HelloWave() {
  // Temporarily simplified for APK build without New Architecture
  return (
    <Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
      }}>
      👋
    </Text>
  );
}
