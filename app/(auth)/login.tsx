import { useAuth } from '@/src/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (phoneNumber.trim()) {
      await login(phoneNumber);
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 items-center bg-white px-6 pt-20">
      <View className="h-[120px] w-[120px] items-center justify-center mb-6">
        <Image
          source={require('../../public/images/logo.svg')}
          style={{ width: 120, height: 120, borderRadius: 60 }}
          contentFit="contain"
        />
      </View>

      <Text className="text-3xl font-semibold text-center text-gray-900" accessibilityRole="header">
        Log in with Phone
      </Text>
      <Text className="text-base text-center text-gray-900 mt-2">Number</Text>

      <View className="flex-row items-center mt-6 bg-gray-50 rounded-xl p-3 w-full border border-gray-200">
        <Phone color="#c7c7cc" size={20} style={{ marginRight: 12 }} />
        <TextInput
          placeholder="+63 915 123 6121"
          placeholderTextColor="#c7c7cc"
          className="flex-1 h-10 text-base text-gray-900"
          keyboardType="phone-pad"
          accessibilityLabel="Phone number input"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <Pressable className="flex-row items-center mt-3 self-start" onPress={() => setRememberMe(!rememberMe)}>
        <View
          className={`w-5 h-5 rounded border ${rememberMe ? 'bg-[#d92020] border-[#d92020]' : 'bg-white border-gray-300'}`}
          accessibilityRole="checkbox"
        />
        <Text className="ml-2 text-gray-800">Remember me</Text>
      </Pressable>

      <Pressable
        className="mt-6 bg-[#d92020] py-3.5 w-full rounded-xl items-center active:opacity-80"
        accessibilityRole="button"
        onPress={handleLogin}
      >
        <Text className="text-white text-base font-semibold">Log in</Text>
      </Pressable>

      <Pressable onPress={() => router.push('./register')}>
        <Text className="mt-10 text-gray-400">
          Don&apos;t have an account? <Text className="text-blue-600 underline">Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
