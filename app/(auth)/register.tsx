import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/src/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

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

      <Text className="text-3xl font-semibold text-center text-foreground" accessibilityRole="header">
        Create Account
      </Text>
      <Text className="text-base text-muted-foreground mt-2 mb-6 text-center">
        Sign up to get started
      </Text>

      <View className="w-full gap-4 mt-4">
        <Input
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          className="h-14"
        />

        <Input
          placeholder="+63 915 123 6121"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="h-14"
        />
      </View>

      <Button 
        className="mt-6 h-14 w-full bg-[#d92020]" 
        onPress={handleRegister}
        size="lg"
      >
        <Text className="text-white text-base font-semibold">
          Sign Up
        </Text>
      </Button>

      <Pressable onPress={() => router.back()}>
        <Text className="mt-10 text-muted-foreground">
          Already have an account? <Text className="text-blue-600">Log in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
