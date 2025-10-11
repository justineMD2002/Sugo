import { useAuth } from '@/src/context/AuthContext';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace({ pathname: '/(auth)/login' } as any);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-2xl font-bold text-gray-900">
          Profile
        </Text>
        <Text className="text-gray-600 mt-2">
          Manage your account
        </Text>
      </View>

      <View className="px-6">
        <View className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-4">
          <Text className="text-sm text-gray-600 mb-1">Name</Text>
          <Text className="text-base text-gray-900 font-medium">
            {user?.name || 'Not set'}
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-4">
          <Text className="text-sm text-gray-600 mb-1">Phone Number</Text>
          <Text className="text-base text-gray-900 font-medium">
            {user?.phoneNumber || 'Not set'}
          </Text>
        </View>

        <Pressable 
          className="mt-6 bg-red-600 py-3.5 w-full rounded-xl items-center active:opacity-80" 
          onPress={handleLogout}
        >
          <Text className="text-white text-base font-semibold">
            Log Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
