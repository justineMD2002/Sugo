/**
 * Example Customer Home Screen
 * This is a reference implementation showing how to use the new architecture
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-orders';
import { useDeliveries } from '@/hooks/use-deliveries';
import { useMessages } from '@/hooks/use-messages';
import { useToast } from '@/hooks/use-toast';
import { useOrderRealtime, useDeliveryRealtime, useMessageRealtime } from '@/hooks/use-realtime';
import { ValidationUtils, FormatUtils } from '@/utils';
import { SERVICE_TYPE, ORDER_STATUS, USER_TYPE } from '@/constants/enums';
import { APP_CONSTANTS, COLORS, SPACING } from '@/constants/app.constants';
import { CreateOrderInput } from '@/types';
import Header from '@/components/sugo/Header';
import ServiceSelector from '@/components/sugo/ServiceSelector';
import Toast from '@/components/sugo/Toast';
import LoadingOverlay from '@/components/sugo/LoadingOverlay';
import Chat from '@/components/sugo/Chat';

export default function CustomerHomeScreen() {
  const { user, userProfile } = useAuth();
  const { currentOrder, createOrder, loading: orderLoading, setCurrentOrder } = useOrders();
  const { currentDelivery } = useDeliveries();
  const { messages, sendMessage, sending, setMessages } = useMessages();
  const { toast, showToast } = useToast();

  // Form state
  const [selectedService, setSelectedService] = useState<SERVICE_TYPE>(SERVICE_TYPE.DELIVERY);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Modals
  const [showOrderTracking, setShowOrderTracking] = useState(false);

  // Real-time subscriptions
  useOrderRealtime(currentOrder?.id || '', (updatedOrder) => {
    console.log('Order updated in real-time:', updatedOrder);
    setCurrentOrder(updatedOrder);
  });

  useDeliveryRealtime(currentOrder?.id || '', (delivery) => {
    console.log('Delivery updated in real-time:', delivery);
    showToast('Rider has been assigned!', 'success');
  });

  useMessageRealtime(currentOrder?.id || '', (message) => {
    if (message.sender_id !== user?.id) {
      const chatMessage = {
        id: message.id,
        sender: 'rider',
        text: message.message_text,
        time: FormatUtils.formatTime(message.created_at),
      };
      setMessages((prev) => [...prev, chatMessage]);
    }
  });

  // Validation
  const isPhoneValid = ValidationUtils.isValidPhilippineNumber(receiverPhone);
  const isFormValid =
    pickupAddress.trim() &&
    deliveryAddress.trim() &&
    itemDescription.trim() &&
    receiverName.trim() &&
    isPhoneValid;

  // Calculate total
  const totalAmount = APP_CONSTANTS.SERVICE_FEE + APP_CONSTANTS.BASE_AMOUNT;

  const handleBookDelivery = async () => {
    if (!user || !isFormValid) {
      showToast('Please fill all fields correctly', 'error');
      return;
    }

    const input: CreateOrderInput = {
      customer_id: user.id,
      service_type: selectedService,
      pickup_address: pickupAddress,
      delivery_address: deliveryAddress,
      item_description: itemDescription,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      service_fee: APP_CONSTANTS.SERVICE_FEE,
      total_amount: totalAmount,
    };

    const result = await createOrder(input);

    if (result.success) {
      showToast('Order created successfully! Finding rider...', 'success');

      // Reset form
      setPickupAddress('');
      setDeliveryAddress('');
      setItemDescription('');
      setReceiverName('');
      setReceiverPhone('');
    } else {
      showToast(result.error || 'Failed to create order', 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentOrder || !user) return;

    const result = await sendMessage(
      {
        order_id: currentOrder.id,
        sender_id: user.id,
        receiver_id: currentDelivery?.rider_id || '',
        message_text: newMessage.trim(),
      },
      user.id,
      USER_TYPE.CUSTOMER
    );

    if (result.success) {
      setNewMessage('');
    } else {
      showToast('Failed to send message', 'error');
    }
  };

  // If there's a current order, show tracking view
  if (currentOrder) {
    return (
      <View style={styles.container}>
        <Header title="Order Tracking" />

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.orderNumber}>
              Order #{currentOrder.order_number}
            </Text>
            <Text style={styles.status}>
              Status: {FormatUtils.capitalize(currentOrder.status)}
            </Text>

            <View style={styles.addressSection}>
              <Text style={styles.label}>Pickup:</Text>
              <Text style={styles.address}>{currentOrder.pickup_address}</Text>

              <Text style={styles.label}>Delivery:</Text>
              <Text style={styles.address}>{currentOrder.delivery_address}</Text>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                {FormatUtils.formatCurrency(currentOrder.total_amount)}
              </Text>
            </View>
          </View>

          {currentDelivery && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rider Assigned</Text>
              <Text>Status: {currentDelivery.status}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, styles.blueButton]}>
                  <Text style={styles.buttonText}>Track Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.grayButton]}>
                  <Text style={styles.buttonText}>Call Rider</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentDelivery && (
            <View style={styles.chatSection}>
              <Text style={styles.cardTitle}>Chat with Rider</Text>
              <Chat
                messages={messages}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSend={handleSendMessage}
                isSending={sending}
              />
            </View>
          )}
        </ScrollView>

        <Toast {...toast} />
        {orderLoading && <LoadingOverlay message="Processing..." />}
      </View>
    );
  }

  // Booking form view
  return (
    <View style={styles.container}>
      <Header title="Sugo" />

      <ScrollView style={styles.content}>
        <ServiceSelector
          selected={selectedService}
          onSelect={(service) => setSelectedService(service as SERVICE_TYPE)}
        />

        <View style={styles.form}>
          <Text style={styles.label}>Pickup Address*</Text>
          <TextInput
            style={styles.input}
            value={pickupAddress}
            onChangeText={setPickupAddress}
            placeholder="Enter pickup address"
            placeholderTextColor={COLORS.SUBTITLE}
          />

          <Text style={styles.label}>Delivery Address*</Text>
          <TextInput
            style={styles.input}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Enter delivery address"
            placeholderTextColor={COLORS.SUBTITLE}
          />

          <Text style={styles.label}>Item Description*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={itemDescription}
            onChangeText={setItemDescription}
            placeholder="Describe the item to deliver"
            placeholderTextColor={COLORS.SUBTITLE}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Receiver Name*</Text>
          <TextInput
            style={styles.input}
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="Name of receiver"
            placeholderTextColor={COLORS.SUBTITLE}
          />

          <Text style={styles.label}>Receiver Phone*</Text>
          <TextInput
            style={[styles.input, !isPhoneValid && receiverPhone ? styles.inputError : null]}
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            placeholder="+639XXXXXXXXX or 09XXXXXXXXX"
            placeholderTextColor={COLORS.SUBTITLE}
            keyboardType="phone-pad"
          />
          {!isPhoneValid && receiverPhone ? (
            <Text style={styles.errorText}>Invalid Philippine phone number</Text>
          ) : null}

          {pickupAddress && deliveryAddress && (
            <View style={styles.totalSection}>
              <Text style={styles.label}>Service Fee:</Text>
              <Text>{FormatUtils.formatCurrency(APP_CONSTANTS.SERVICE_FEE)}</Text>

              <Text style={styles.label}>Base Amount:</Text>
              <Text>{FormatUtils.formatCurrency(APP_CONSTANTS.BASE_AMOUNT)}</Text>

              <View style={styles.divider} />

              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                {FormatUtils.formatCurrency(totalAmount)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.bookButton, (!isFormValid || orderLoading) && styles.buttonDisabled]}
            onPress={handleBookDelivery}
            disabled={!isFormValid || orderLoading}
          >
            <Text style={styles.bookButtonText}>
              {orderLoading ? 'Booking...' : 'Book Delivery'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast {...toast} />
      {orderLoading && <LoadingOverlay message="Creating order..." />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: SPACING.XXL,
  },
  form: {
    marginTop: SPACING.LG,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.SM,
    marginTop: SPACING.MD,
  },
  input: {
    backgroundColor: COLORS.CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: SPACING.MD,
    fontSize: 16,
    color: COLORS.TEXT,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: SPACING.XS,
  },
  totalSection: {
    backgroundColor: COLORS.CARD_BG,
    padding: SPACING.LG,
    borderRadius: 8,
    marginTop: SPACING.LG,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginTop: SPACING.SM,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginTop: SPACING.XS,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.MD,
  },
  bookButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.LG,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.XL,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  card: {
    backgroundColor: COLORS.CARD_BG,
    padding: SPACING.LG,
    borderRadius: 8,
    marginBottom: SPACING.LG,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SM,
  },
  status: {
    fontSize: 14,
    color: COLORS.SUBTITLE,
  },
  addressSection: {
    marginTop: SPACING.LG,
  },
  address: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: SPACING.MD,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.MD,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.MD,
    marginTop: SPACING.LG,
  },
  button: {
    flex: 1,
    padding: SPACING.MD,
    borderRadius: 8,
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: COLORS.BLUE,
  },
  grayButton: {
    backgroundColor: COLORS.GRAY_BUTTON,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatSection: {
    backgroundColor: COLORS.CARD_BG,
    padding: SPACING.LG,
    borderRadius: 8,
    minHeight: 400,
  },
});
