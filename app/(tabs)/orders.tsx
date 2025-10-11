import { ScrollView, Text, View } from 'react-native';

export default function OrdersScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-6">
        <Text className="text-2xl font-bold text-gray-900">
          My Orders
        </Text>
        <Text className="text-gray-600 mt-2">
          Track your orders here
        </Text>
      </View>

      <View className="px-6">
        <View className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <Text className="text-gray-600">
            No orders yet
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
