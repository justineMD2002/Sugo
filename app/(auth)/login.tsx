import { useAuth } from '@/src/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronDown, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phoneNumber.trim()) return;
    await login(phoneNumber.trim());
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white px-8 pt-24">
      {/* Logo + Heading */}
      <View className="items-center">
        <View className="h-[150px] w-[150px] items-center justify-center mb-8">
          <Image
            source={require('../../public/images/logo.svg')}
            style={{ width: 150, height: 150, borderRadius: 70 }}
            contentFit="contain"
          />
        </View>
        <Text
          className="text-[22px] leading-7 font-semibold text-center text-gray-900"
          accessibilityRole="header"
        >
          Log in with Phone{"\n"}Number
        </Text>
      </View>

      {/* Phone Input Group */}
      <View className="mt-10">
        <View className="flex-row items-center h-14 w-full border border-gray-200 rounded-lg px-3 bg-white">
          <Text className="text-lg mr-1">🇵🇭</Text>
          <ChevronDown size={16} color="#C5322E" />
          <View className="h-6 w-px bg-gray-300 mx-3" />
          <Phone color="#c7c7cc" size={20} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="+63 915 123 6121"
            placeholderTextColor="#c7c7cc"
            className="flex-1 h-full text-base text-gray-900"
            keyboardType="phone-pad"
            accessibilityLabel="Phone number input"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Remember me */}
      <Pressable
        className="flex-row items-center mt-4"
        onPress={() => setRememberMe(!rememberMe)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rememberMe }}
      >
        <View
          className={`w-5 h-5 border ${rememberMe ? 'bg-[#C5322E] border-[#C5322E]' : 'bg-white border-gray-300'} rounded-sm`}
        />
        <Text className="ml-2 text-gray-800">Remember me</Text>
      </Pressable>

      {/* Login button */}
      <Pressable
        className="mt-8 bg-[#C5322E] h-14 w-full rounded-lg items-center justify-center active:opacity-90"
        accessibilityRole="button"
        onPress={handleLogin}
      >
        <Text className="text-white text-base font-semibold">Log in</Text>
      </Pressable>

      <View className="flex-1" />

      {/* Sign up link */}
      <Pressable className="items-center mb-6" onPress={() => router.push('./register')}>
        <Text className="text-gray-400">
          Don&apos;t have an account? <Text className="text-[#C5322E]">Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
