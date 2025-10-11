import { useAuth } from '@/src/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { login } = useAuth();

  const handleRegister = async () => {
    if (phoneNumber.trim() && name.trim()) {
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
        Create Account
      </Text>
      <Text className="text-base text-gray-600 mt-2 mb-6 text-center">
        Sign up to get started
      </Text>

      <View className="flex-row items-center mt-4 bg-gray-50 rounded-xl p-3 w-full border border-gray-200">
        <User color="#c7c7cc" size={20} style={{ marginRight: 12 }} />
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#c7c7cc"
          className="flex-1 h-10 text-base text-gray-900"
          accessibilityLabel="Name input"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="flex-row items-center mt-4 bg-gray-50 rounded-xl p-3 w-full border border-gray-200">
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

      <Pressable 
        className="mt-6 bg-[#d92020] py-3.5 w-full rounded-xl items-center active:opacity-80" 
        accessibilityRole="button"
        onPress={handleRegister}
      >
        <Text className="text-white text-base font-semibold">
          Sign Up
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text className="mt-10 text-gray-400">
          Already have an account? <Text className="text-blue-600 underline">Log in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
