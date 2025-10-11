import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/src/context/AuthContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

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
        <View className="flex-row items-center">
          <View className="flex-row items-center border border-input rounded-lg px-3 h-14 mr-2 bg-background">
            <Text className="text-lg mr-1">🇵🇭</Text>
            <ChevronDown size={16} color="#C5322E" />
          </View>
          <View className="flex-1">
            <Input
              placeholder="+63 915 123 6121"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              returnKeyType="done"
              className="h-14"
            />
          </View>
        </View>
      </View>

      {/* Remember me */}
      <View className="flex-row items-center mt-4">
        <Checkbox
          checked={rememberMe}
          onCheckedChange={setRememberMe}
          accessibilityLabel="Remember me"
        />
        <Text className="ml-2 text-foreground">Remember me</Text>
      </View>

      {/* Login button */}
      <Button
        className="mt-8 h-14 w-full bg-[#C5322E]"
        onPress={handleLogin}
        size="lg"
      >
        <Text className="text-white text-base font-semibold">Log in</Text>
      </Button>

      <View className="flex-1" />

      {/* Sign up link */}
      <Pressable className="items-center mb-6" onPress={() => router.push('./register')}>
        <Text className="text-muted-foreground">
          Don&apos;t have an account? <Text className="text-[#C5322E]">Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
