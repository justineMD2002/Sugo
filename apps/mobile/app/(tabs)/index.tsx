import AddressAutocomplete from '@/components/sugo/AddressAutocomplete';
import BottomBar from '@/components/sugo/BottomBar';
import CallOptionsModal from '@/components/sugo/CallOptionsModal';
import Chat, { ChatMessage } from '@/components/sugo/Chat';
import FilterModal from '@/components/sugo/FilterModal';
import Header from '@/components/sugo/Header';
import HelpModal from '@/components/sugo/HelpModal';
import LoadingOverlay from '@/components/sugo/LoadingOverlay';
import Modal from '@/components/sugo/Modal';
import NotificationsModal from '@/components/sugo/NotificationsModal';
import ProfilePictureModal from '@/components/sugo/ProfilePictureModal';

import SectionCard from '@/components/sugo/SectionCard';
import ServiceSelector from '@/components/sugo/ServiceSelector';
import SettingsModal from '@/components/sugo/SettingsModal';
import ShareModal from '@/components/sugo/ShareModal';
import SplashScreen from '@/components/sugo/SplashScreen';
import Toast from '@/components/sugo/Toast';
import { getCurrentUser, signInUserWithPhone, signOutUser, SignUpData, signUpUser, getUserProfile, UserProfile, getUserAddresses, Address, createAddress, updateAddress, deleteAddress, setDefaultAddress, CreateAddressData, UpdateAddressData, updateUserProfile, UpdateProfileData, changeUserPassword } from '@/lib/auth';
import { uploadProfilePicture } from '@/lib/profilePictureService';
import { supabase } from '@/lib/supabase';
import { useOrderRealtime } from '@/hooks/use-order-realtime';
import { notifyRiderAccepted, notifyNewMessage, notifyOrderStatusChanged, getUserNotifications, getUnreadNotificationCount, markAllNotificationsAsRead } from '@/lib/notificationService';
import { RatingService } from '@/services/rating.service';
import { EarningsService, EarningsSummary, DailyEarnings, RiderStats } from '@/services/earnings.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, ScrollView, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking, Platform, ActivityIndicator, Image, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Screen = 'splash' | 'login' | 'signup' | 'password' | 'otp' | 'home' | 'orders' | 'profile' | 'deliveries' | 'earnings';
type UserType = 'customer' | 'rider';
type Service = 'delivery' | 'plumbing' | 'aircon' | 'electrician' | 'tickets';

type ServiceTicket = {
  id: string;
  serviceType: 'plumbing' | 'electrician' | 'cleaning' | 'aircon' | 'painting' | 'carpentry' | 'other';
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignedToName?: string;
  location: string;
  unreadCount: number;
};

export default function SugoScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [pastDeliveries, setPastDeliveries] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Pagination state
  const [ordersPage, setOrdersPage] = useState(0);
  const [deliveriesPage, setDeliveriesPage] = useState(0);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [hasMoreDeliveries, setHasMoreDeliveries] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const ITEMS_PER_PAGE = 3;

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    dateRange: 'all',
    status: 'all',
  });
  const [userType, setUserType] = useState<UserType>('customer');
  const [selectedService, setSelectedService] = useState<Service>('delivery');
  const [workerService, setWorkerService] = useState<Service>('delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showServiceTicketDetails, setShowServiceTicketDetails] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showFindingRider, setShowFindingRider] = useState(false);
  const [isBookingDelivery, setIsBookingDelivery] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

  // Earnings state
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarnings[]>([]);
  const [isEarningsLoading, setIsEarningsLoading] = useState(false);
  const [riderStats, setRiderStats] = useState<RiderStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Address CRUD state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Address form state
  const [addressName, setAddressName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Profile form state
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileEmail, setEditProfileEmail] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP and Auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(300);

  // Login form states
  const [loginPhoneNumber, setLoginPhoneNumber] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form states
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhoneNumber, setSignupPhoneNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Vehicle information for riders
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  // Rating and Payment states
  const [currentRating, setCurrentRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [completedOrderRider, setCompletedOrderRider] = useState<any>(null);

  // Service tickets
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([
    {
      id: 'TKT-001',
      serviceType: 'plumbing',
      title: 'Leaking kitchen sink',
      description: 'Kitchen sink has been leaking for 2 days.',
      status: 'open',
      priority: 'high',
      createdAt: '2024-10-18 09:30',
      location: 'Cebu City, Banilad',
      unreadCount: 0,
    },
    {
      id: 'TKT-002',
      serviceType: 'electrician',
      title: 'Power outlet not working',
      description: 'Living room power outlet suddenly stopped working.',
      status: 'assigned',
      priority: 'medium',
      createdAt: '2024-10-18 10:15',
      assignedToName: 'Roberto Electrician',
      location: 'Mandaue City, Centro',
      unreadCount: 2,
    },
  ]);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

  // Delivery form state
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [activeAutocomplete, setActiveAutocomplete] = useState<'pickup' | 'delivery' | null>(null);

  // Add callOptions state
  const [callNumber, setCallNumber] = useState<string>("");

  // Order details collapse state
  const [isOrderDetailsExpanded, setIsOrderDetailsExpanded] = useState(false);

  // Constants for pricing
  const SERVICE_FEE = 15;
  const BASE_AMOUNT = 50;

  // Phone number validation for Philippines
  const isValidPhilippineNumber = (phone: string) => {
    // Remove all spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Pattern 1: +639XXXXXXXXX (13 characters) - International format
    // Pattern 2: 09XXXXXXXXX (11 characters) - Local format
    const pattern1 = /^\+639\d{9}$/;
    const pattern2 = /^09\d{9}$/;

    return pattern1.test(cleaned) || pattern2.test(cleaned);
  };

  // Computed values for delivery booking
  const totalAmount = useMemo(() => SERVICE_FEE + BASE_AMOUNT, []);
  const showTotalAmount = useMemo(() => pickupAddress.trim() !== '' && deliveryAddress.trim() !== '', [pickupAddress, deliveryAddress]);
  const isValidReceiverPhone = useMemo(() => isValidPhilippineNumber(receiverPhone), [receiverPhone]);
  const isBookingEnabled = useMemo(() => {
    return pickupAddress.trim() !== '' &&
           deliveryAddress.trim() !== '' &&
           itemDescription.trim() !== '' &&
           receiverName.trim() !== '' &&
           receiverPhone.trim() !== '' &&
           isValidReceiverPhone;
  }, [pickupAddress, deliveryAddress, itemDescription, receiverName, receiverPhone, isValidReceiverPhone]);

  // AsyncStorage persistence helpers
  const saveCurrentOrderToStorage = async (order: any) => {
    try {
      await AsyncStorage.setItem('currentOrder', JSON.stringify(order));
      console.log('💾 Order saved to storage:', order.id);
    } catch (error) {
      console.error('Error saving order to storage:', error);
    }
  };

  const saveCurrentDeliveryToStorage = async (delivery: any) => {
    try {
      await AsyncStorage.setItem('currentDelivery', JSON.stringify(delivery));
      console.log('💾 Delivery saved to storage:', delivery.id);
    } catch (error) {
      console.error('Error saving delivery to storage:', error);
    }
  };

  const loadOrderFromStorage = async () => {
    try {
      const orderJson = await AsyncStorage.getItem('currentOrder');
      if (orderJson) {
        const order = JSON.parse(orderJson);
        console.log('📂 Order loaded from storage:', order.id);
        return order;
      }
    } catch (error) {
      console.error('Error loading order from storage:', error);
    }
    return null;
  };

  const loadDeliveryFromStorage = async () => {
    try {
      const deliveryJson = await AsyncStorage.getItem('currentDelivery');
      if (deliveryJson) {
        const delivery = JSON.parse(deliveryJson);
        console.log('📂 Delivery loaded from storage:', delivery.id);
        return delivery;
      }
    } catch (error) {
      console.error('Error loading delivery from storage:', error);
    }
    return null;
  };

  const clearOrderFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('currentOrder');
      console.log('🗑️ Order cleared from storage');
    } catch (error) {
      console.error('Error clearing order from storage:', error);
    }
  };

  const clearDeliveryFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('currentDelivery');
      console.log('🗑️ Delivery cleared from storage');
    } catch (error) {
      console.error('Error clearing delivery from storage:', error);
    }
  };

  // Callback when rider accepts the order (for customers)
  const handleRiderAccepted = useCallback((riderDetails: any) => {
    console.log('🎉🎉🎉 handleRiderAccepted CALLED! 🎉🎉🎉');
    console.log('Rider Details:', JSON.stringify(riderDetails, null, 2));

    // Update current order with rider information
    console.log('Updating currentOrder with rider info...');
    setCurrentOrder((prevOrder: any) => {
      const updatedOrder = {
        ...prevOrder,
        rider_id: riderDetails.id,
        rider_name: riderDetails.full_name,
        rider_phone: riderDetails.phone_number,
        rider_avatar: riderDetails.avatar_url,
        rider_rating: riderDetails.rating,
        rider_vehicle: riderDetails.vehicle_info,
        status: 'confirmed',
      };
      console.log('Updated order:', updatedOrder);

      // Save to AsyncStorage for persistence
      saveCurrentOrderToStorage(updatedOrder);

      return updatedOrder;
    });

    // Close finding rider modal immediately
    console.log('Closing finding rider modal...');
    setShowFindingRider(false);

    // Navigate to home screen immediately (current order view will render automatically)
    console.log('Navigating to home screen...');
    setCurrentScreen('home');

    // Show success toast message (non-blocking)
    console.log('Showing toast message...');
    showToastMessage(`Rider found! ${riderDetails.full_name} is on the way.`, 'success');

    // Create notification for rider acceptance
    if (currentUser?.id && currentOrder?.id) {
      notifyRiderAccepted(
        currentUser.id,
        riderDetails.full_name,
        currentOrder.id
      );
    }

    console.log('✅✅✅ Customer redirected to current order page ✅✅✅');
  }, [currentUser, currentOrder]);

  // Callback when delivery is updated
  const handleDeliveryUpdate = useCallback((delivery: any) => {
    console.log('📦 Delivery updated:', delivery);
    setDeliveryStatus(delivery);
  }, []);

  // Callback when order is updated
  const handleOrderUpdate = useCallback((order: any) => {
    console.log('🔄 Order updated:', order);

    setCurrentOrder((prevOrder: any) => {
      // Check if status changed
      if (prevOrder && prevOrder.status !== order.status && currentUser?.id) {
        console.log(`📢 Order status changed: ${prevOrder.status} → ${order.status}`);

        // Notify customer about status change
        if (order.customer_id) {
          notifyOrderStatusChanged(
            order.customer_id,
            order.id,
            prevOrder.status,
            order.status
          );
        }
      }

      return {
        ...prevOrder,
        ...order,
      };
    });
  }, [currentUser]);

  // Callback when order is completed (real-time)
  const handleOrderCompleted = useCallback((order: any) => {
    console.log('✅✅✅ handleOrderCompleted CALLED! ✅✅✅');
    console.log('Completed Order:', JSON.stringify(order, null, 2));

    // Store the completed order info
    setCompletedOrder(order);

    // Store the rider info from current order
    if (currentOrder?.rider_id) {
      setCompletedOrderRider({
        id: currentOrder.rider_id,
        name: currentOrder.rider_name,
        phone: currentOrder.rider_phone,
        avatar: currentOrder.rider_avatar,
        rating: currentOrder.rider_rating,
        vehicle_info: currentOrder.rider_vehicle_info,
      });
    }

    // Show rating modal for customers
    if (userType === 'customer') {
      console.log('🌟 Showing rating modal for customer...');
      setShowRatingModal(true);
    }
  }, [currentOrder, userType]);

  // Log hook parameters for debugging
  console.log('🔍 Polling Hook Parameters:', {
    orderId: currentOrder?.id,
    userId: currentUser?.id,
    userType: userType,
    enabled: !!currentOrder?.id && !!currentUser?.id,
  });

  // Use REALTIME subscriptions for instant delivery updates
  // Replaces polling for better performance and instant notifications
  useOrderRealtime({
    orderId: currentOrder?.id || null,
    userId: currentUser?.id || null,
    userType: userType,
    onRiderAccepted: handleRiderAccepted,
    onDeliveryUpdate: handleDeliveryUpdate,
    onOrderUpdate: handleOrderUpdate,
    onOrderCompleted: handleOrderCompleted,
    enabled: !!currentOrder?.id && !!currentUser?.id,
  });

  // Submit rider rating
  const submitRating = async () => {
    if (!currentRating || !completedOrder || !completedOrderRider || !currentUser) {
      Alert.alert('Error', 'Please select a rating before submitting.');
      return;
    }

    try {
      setIsLoading(true);

      const result = await RatingService.createRating({
        order_id: completedOrder.id,
        rater_id: currentUser.id,
        rated_user_id: completedOrderRider.id,
        rating: currentRating,
        comment: ratingComment.trim() || undefined,
      });

      if (result.success) {
        console.log('✅ Rating submitted successfully!');
        setShowToast(true);
        setToastMessage('Thank you for your feedback!');
        setToastType('success');

        // Close modal and return to home
        await closeRatingModal();
      } else {
        console.error('❌ Failed to submit rating:', result.error);
        Alert.alert('Error', result.error || 'Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing rating modal and returning to home
  const closeRatingModal = async () => {
    setShowRatingModal(false);
    setCurrentRating(0);
    setRatingComment('');
    setCompletedOrder(null);
    setCompletedOrderRider(null);

    // Clear current order and navigate to home
    setCurrentOrder(null);
    await clearOrderFromStorage();
    setCurrentScreen('home');
  };

  const sendMessage = async () => {
    // Get the active order (either currentOrder for customers or currentDelivery.order for riders)
    const activeOrder = currentOrder || currentDelivery?.order;

    if (!newMessage.trim() || !activeOrder || isSendingMessage) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistically add message to UI
    const optimisticMessage: ChatMessage = {
      id: tempId,
      sender: userType,
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsSendingMessage(true);

    try {
      // Determine receiver based on user type
      let receiverId = null;
      if (userType === 'customer') {
        // Customer sending to rider
        receiverId = activeOrder.rider_id || currentDelivery?.rider_id || null;
      } else {
        // Rider sending to customer
        receiverId = activeOrder.customer_id || currentDelivery?.order?.customer_id || null;
      }

      const messageData = {
        order_id: activeOrder.id,
        sender_id: currentUser.id,
        receiver_id: receiverId,
        message_text: messageText,
        message_type: 'text',
        is_read: false,
      };

      const sendTime = Date.now();
      console.log('📤 Sending message at:', new Date(sendTime).toLocaleTimeString());
      console.log('📤 Message:', messageText);

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);

        // Remove optimistic message and show error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        showToastMessage('Failed to send message. Please try again.', 'error');

        // Restore the message in input so user can retry
        setNewMessage(messageText);
        setIsSendingMessage(false);
        return;
      }

      const insertTime = Date.now();
      console.log('✅ Message inserted to DB at:', new Date(insertTime).toLocaleTimeString());
      console.log('✅ Insert took:', (insertTime - sendTime), 'ms');
      console.log('✅ Message ID:', data.id, '| Order ID:', data.order_id);

      // Send notification to receiver (only if receiver is a customer)
      if (receiverId && userProfile?.full_name && userType === 'rider') {
        // Only riders send notifications to customers
        notifyNewMessage(
          receiverId,
          userProfile.full_name,
          messageText,
          activeOrder.id
        );
      }

      // Replace temp message with real one from database
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                id: data.id,
                sender: userType,
                text: data.message_text,
                time: new Date(data.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              }
            : msg
        )
      );

      setIsSendingMessage(false);
    } catch (error) {
      console.error('Unexpected error sending message:', error);

      // Remove optimistic message and show error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      showToastMessage('Failed to send message. Please try again.', 'error');

      // Restore the message in input so user can retry
      setNewMessage(messageText);
      setIsSendingMessage(false);
    }
  };

  // Load messages for current order
  const loadMessages = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      // Transform Supabase messages to ChatMessage format
      const transformedMessages: ChatMessage[] = data.map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === currentUser?.id ? userType : (userType === 'customer' ? 'rider' : 'customer'),
        text: msg.message_text,
        time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Unexpected error loading messages:', error);
    }
  };

  // Load delivery status for current order
  const loadDeliveryStatus = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        // No delivery assigned yet
        if (error.code === 'PGRST116') {
          setDeliveryStatus(null);
          return;
        }
        console.error('Error loading delivery status:', error);
        return;
      }

      setDeliveryStatus(data);
    } catch (error) {
      console.error('Unexpected error loading delivery status:', error);
    }
  };

  // Fetch pending orders for riders
  const fetchPendingOrders = async (searchQueryParam?: string) => {
    // Clear existing orders first
    setPendingOrders([]);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .eq('service_type', workerService);

      // Apply server-side search if provided
      if (searchQueryParam && searchQueryParam.trim()) {
        const searchTerm = searchQueryParam.trim();
        query = query.or(
          `order_number.ilike.%${searchTerm}%,pickup_address.ilike.%${searchTerm}%,delivery_address.ilike.%${searchTerm}%,item_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending orders:', error);
        return;
      }

      setPendingOrders(data || []);
    } catch (error) {
      console.error('Unexpected error fetching pending orders:', error);
    }
  };

  // Load past orders for customers
  const loadPastOrders = async (searchQueryParam?: string, filters?: typeof activeFilters, page: number = 0, append: boolean = false) => {
    if (!currentUser?.id) return;
    
    if (page === 0) {
      setIsHistoryLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      // Build base query with relational select
      let query = supabase
        .from('orders')
        .select(`
          *,
          deliveries:deliveries(
            *,
            rider:users(*)
          )
        `)
        .eq('customer_id', currentUser.id)
        .in('status', ['delivered', 'completed', 'cancelled']);

      // Apply server-side search if provided
      if (searchQueryParam && searchQueryParam.trim()) {
        const searchTerm = searchQueryParam.trim();
        query = query.or(
          `order_number.ilike.%${searchTerm}%,pickup_address.ilike.%${searchTerm}%,delivery_address.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`
        );
      }

      // Apply status filter
      if (filters && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'this_week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'this_month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
        }
      }

      // Apply pagination
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading past orders with join:', error);
        if (!append) {
          setPastOrders([]);
        }
        return;
      }

      const normalized = (data || []).map((o: any) => {
        const delivery = Array.isArray(o.deliveries) ? o.deliveries[0] : o.deliveries;
        const rider = delivery?.rider;
        return {
          ...o,
          rider_name: o.rider_name || rider?.full_name || null,
          rider_phone: o.rider_phone || rider?.phone_number || null,
          rider_rating: o.rider_rating || rider?.rating || null,
        };
      });

      if (append) {
        setPastOrders(prev => [...prev, ...normalized]);
      } else {
        setPastOrders(normalized);
      }

      // Check if there are more items
      setHasMoreOrders(normalized.length === ITEMS_PER_PAGE);
    } catch (e) {
      console.error('Unexpected error loading past orders:', e);
      if (!append) {
        setPastOrders([]);
      }
    } finally {
      setIsHistoryLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load past deliveries for riders
  const loadPastDeliveries = async (searchQueryParam?: string, filters?: typeof activeFilters, page: number = 0, append: boolean = false) => {
    if (!currentUser?.id) return;
    
    if (page === 0) {
      setIsHistoryLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      // Build base query with relational select
      let query = supabase
        .from('deliveries')
        .select(`*, order:orders(*)`)
        .eq('rider_id', currentUser.id)
        .or('is_completed.eq.true,status.eq.completed');

      // Apply server-side search if provided
      // Search through order fields since deliveries are linked to orders
      if (searchQueryParam && searchQueryParam.trim()) {
        const searchTerm = searchQueryParam.trim();
        // Note: Since we're searching order fields through a join, we need to filter after fetching
        // For now, we'll search what we can at the delivery level and filter client-side for order fields
        query = query.or(
          `status.ilike.%${searchTerm}%`
        );
      }

      // Apply status filter
      if (filters && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'this_week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'this_month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
        }
      }

      // Apply pagination (fetch more to account for client-side filtering)
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading past deliveries:', error);
        if (!append) {
          setPastDeliveries([]);
        }
        return;
      }

      // If we have a search query, filter by order fields client-side
      // (since Supabase doesn't easily support searching nested relations)
      let filteredData = data || [];
      if (searchQueryParam && searchQueryParam.trim()) {
        const searchTerm = searchQueryParam.toLowerCase().trim();
        filteredData = filteredData.filter((delivery: any) => {
          const order = delivery.order;
          if (!order) return false;
          return (
            (order.order_number && order.order_number.toLowerCase().includes(searchTerm)) ||
            (order.pickup_address && order.pickup_address.toLowerCase().includes(searchTerm)) ||
            (order.delivery_address && order.delivery_address.toLowerCase().includes(searchTerm)) ||
            (order.item_description && order.item_description.toLowerCase().includes(searchTerm)) ||
            (order.receiver_name && order.receiver_name.toLowerCase().includes(searchTerm)) ||
            (order.receiver_phone && order.receiver_phone.toLowerCase().includes(searchTerm))
          );
        });
      }

      if (append) {
        setPastDeliveries(prev => [...prev, ...filteredData]);
      } else {
        setPastDeliveries(filteredData);
      }

      // Check if there are more items (if we got a full page, assume there might be more)
      setHasMoreDeliveries((data || []).length === ITEMS_PER_PAGE);
    } catch (e) {
      console.error('Unexpected error loading past deliveries:', e);
      if (!append) {
        setPastDeliveries([]);
      }
    } finally {
      setIsHistoryLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Trigger history loads on screen change, search query, or filters change with debouncing
  useEffect(() => {
    if (currentScreen === 'orders' && userType === 'customer') {
      // Reset pagination when search or filters change
      setOrdersPage(0);
      setHasMoreOrders(true);
      
      // Debounce search query to avoid too many requests
      const timeoutId = setTimeout(() => {
        loadPastOrders(searchQuery, activeFilters, 0, false);
      }, searchQuery ? 300 : 0); // 300ms delay only when searching

      return () => clearTimeout(timeoutId);
    }
    if (currentScreen === 'deliveries' && userType === 'rider') {
      // Reset pagination when search or filters change
      setDeliveriesPage(0);
      setHasMoreDeliveries(true);
      
      // Debounce search query to avoid too many requests
      const timeoutId = setTimeout(() => {
        loadPastDeliveries(searchQuery, activeFilters, 0, false);
      }, searchQuery ? 300 : 0); // 300ms delay only when searching

      return () => clearTimeout(timeoutId);
    }
    if (currentScreen === 'earnings' && userType === 'rider') {
      loadEarnings();
    }
    if (currentScreen === 'profile' && userType === 'rider') {
      loadRiderStats();
    }
  }, [currentScreen, userType, currentUser?.id, searchQuery, activeFilters]);

  // Load more orders
  const loadMoreOrders = useCallback(() => {
    if (!isLoadingMore && hasMoreOrders && !isHistoryLoading) {
      const nextPage = ordersPage + 1;
      setOrdersPage(nextPage);
      loadPastOrders(searchQuery, activeFilters, nextPage, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersPage, hasMoreOrders, isLoadingMore, isHistoryLoading, searchQuery, activeFilters]);

  // Load more deliveries
  const loadMoreDeliveries = useCallback(() => {
    if (!isLoadingMore && hasMoreDeliveries && !isHistoryLoading) {
      const nextPage = deliveriesPage + 1;
      setDeliveriesPage(nextPage);
      loadPastDeliveries(searchQuery, activeFilters, nextPage, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveriesPage, hasMoreDeliveries, isLoadingMore, isHistoryLoading, searchQuery, activeFilters]);

  // Filtered orders - now handled server-side, so this is just a passthrough
  const filteredPastOrders = useMemo(() => {
    return pastOrders; // Server-side filtering is handled in loadPastOrders
  }, [pastOrders]);



  // Handle filter application
  const handleFilterApply = (filters: any) => {
    setActiveFilters(filters);
    // Server-side filtering will be triggered by useEffect dependency
  };

  // Reset search and filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilters({
      dateRange: 'all',
      status: 'all',
    });
  };


  // Load earnings data for riders
  const loadEarnings = async () => {
    if (!currentUser?.id) return;
    setIsEarningsLoading(true);
    try {
      // Fetch earnings summary
      const summaryResult = await EarningsService.getEarningsSummary(currentUser.id);
      if (summaryResult.success && summaryResult.data) {
        setEarningsSummary(summaryResult.data);
      } else {
        console.error('Error loading earnings summary:', summaryResult.error);
        setEarningsSummary(null);
      }

      // Fetch daily earnings for the past 7 days
      const dailyResult = await EarningsService.getDailyEarnings(currentUser.id, 7);
      if (dailyResult.success && dailyResult.data) {
        setDailyEarnings(dailyResult.data);
      } else {
        console.error('Error loading daily earnings:', dailyResult.error);
        setDailyEarnings([]);
      }
    } catch (e) {
      console.error('Unexpected error loading earnings:', e);
      setEarningsSummary(null);
      setDailyEarnings([]);
    } finally {
      setIsEarningsLoading(false);
    }
  };

  // Load rider stats for profile
  const loadRiderStats = async () => {
    if (!currentUser?.id) return;
    setIsStatsLoading(true);
    try {
      const statsResult = await EarningsService.getRiderStats(currentUser.id);
      if (statsResult.success && statsResult.data) {
        setRiderStats(statsResult.data);
      } else {
        console.error('Error loading rider stats:', statsResult.error);
        setRiderStats(null);
      }
    } catch (e) {
      console.error('Unexpected error loading rider stats:', e);
      setRiderStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Accept order as a rider
  const acceptOrder = async (order: any) => {
    if (!currentUser) {
      showToastMessage('Please log in to accept orders', 'error');
      return;
    }

    console.log('🏍️ RIDER ACCEPTING ORDER:', order.id);

    setIsLoading(true);

    try {
      // Update order status to 'confirmed' (valid status per database schema)
      console.log('📝 Updating order status to confirmed...');
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', order.id);

      if (orderError) {
        console.error('❌ Error updating order status:', orderError);
        showToastMessage('Failed to accept order. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      console.log('✅ Order status updated to confirmed');

      // Create delivery record
      const deliveryData = {
        order_id: order.id,
        rider_id: currentUser.id,
        status: 'accepted',  // Valid status per database schema
        is_assigned: true,
        is_accepted: true,
        is_picked_up: false,
        is_completed: false,
        earnings: order.service_fee || 0,
      };

      console.log('📦 Creating delivery record with data:', deliveryData);

      const { data: deliveryRecord, error: deliveryError } = await supabase
        .from('deliveries')
        .insert([deliveryData])
        .select()
        .single();

      if (deliveryError) {
        console.error('❌ Error creating delivery record:', deliveryError);

        // Rollback order status if delivery creation failed
        await supabase
          .from('orders')
          .update({ status: 'pending' })
          .eq('id', order.id);

        showToastMessage('Failed to create delivery record. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      console.log('✅ ✅ ✅ DELIVERY RECORD CREATED:', deliveryRecord);
      console.log('Delivery ID:', deliveryRecord.id);
      console.log('Order ID:', deliveryRecord.order_id);
      console.log('Rider ID:', deliveryRecord.rider_id);
      console.log('Is Accepted:', deliveryRecord.is_accepted);
      console.log('🚀 Real-time event should now fire to customer!');
      console.log('🎯 Customer should see event in their console NOW!');

      // Force a small delay to ensure Supabase processes the insert
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update pending orders list (remove accepted order)
      setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));

      // Set as current delivery
      const currentDeliveryData = {
        ...deliveryRecord,
        order: order,
      };
      setCurrentDelivery(currentDeliveryData);

      // Save to AsyncStorage for persistence
      await saveCurrentDeliveryToStorage(currentDeliveryData);

      showToastMessage('Order accepted successfully!', 'success');
      setCurrentScreen('home');
    } catch (error) {
      console.error('❌ Unexpected error in acceptOrder:', error);
      showToastMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrder = async () => {
    setIsLoading(true);

    try {
      // Handle customer completing order
      if (currentOrder) {
        // Update order status to completed
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentOrder.id);

        if (orderError) {
          console.error('Error completing order:', orderError);
          showToastMessage('Failed to complete order. Please try again.', 'error');
          setIsLoading(false);
          return;
        }

        // Update delivery status if there's an associated delivery
        if (currentOrder.delivery_id) {
          const { error: deliveryError } = await supabase
            .from('deliveries')
            .update({
              status: 'completed',
              is_completed: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentOrder.delivery_id);

          if (deliveryError) {
            console.error('Error updating delivery:', deliveryError);
          }
        }

        // Clear from state and storage
        setCurrentOrder(null);
        await clearOrderFromStorage();

        setCurrentScreen('orders');
        showToastMessage('Order completed successfully!', 'success');
        if (userType === 'customer') setShowRatingModal(true);
      }

      // Handle rider completing delivery
      if (currentDelivery) {
        // Update delivery status
        const { error: deliveryError } = await supabase
          .from('deliveries')
          .update({
            status: 'completed',
            is_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentDelivery.id);

        if (deliveryError) {
          console.error('Error completing delivery:', deliveryError);
          showToastMessage('Failed to complete delivery. Please try again.', 'error');
          setIsLoading(false);
          return;
        }

        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentDelivery.order_id);

        if (orderError) {
          console.error('Error updating order:', orderError);
        }

        // Clear from state and storage
        setCurrentDelivery(null);
        await clearDeliveryFromStorage();

        setCurrentScreen('deliveries');
        showToastMessage('Delivery completed successfully!', 'success');
      }

      setShowCompleteConfirmation(false);
    } catch (error) {
      console.error('Unexpected error completing order/delivery:', error);
      showToastMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!currentOrder) return;

    setIsLoading(true);

    try {
      // Delete the order from database
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', currentOrder.id);

      if (error) {
        console.error('Error canceling order:', error);
        showToastMessage('Failed to cancel order. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Close finding rider modal
      setShowFindingRider(false);

      // Clear current order from state and storage
      setCurrentOrder(null);
      await clearOrderFromStorage();

      // Reset booking state
      setIsBookingDelivery(false);

      // Show success message
      showToastMessage('Order cancelled successfully', 'success');

      // Stay on home screen (booking form will show since currentOrder is null)
      setCurrentScreen('home');
    } catch (error) {
      console.error('Unexpected error canceling order:', error);
      showToastMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelivery = async () => {
    if (!currentDelivery) return;

    setIsLoading(true);

    try {
      // Delete the delivery record from database
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .delete()
        .eq('id', currentDelivery.id);

      if (deliveryError) {
        console.error('Error canceling delivery:', deliveryError);
        showToastMessage('Failed to cancel delivery. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Update order status back to pending so other riders can accept it
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'pending' })
        .eq('id', currentDelivery.order_id);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        // Continue even if this fails, delivery is already cancelled
      }

      // Clear current delivery from state and storage
      setCurrentDelivery(null);
      await clearDeliveryFromStorage();

      // Show success message
      showToastMessage('Delivery cancelled successfully', 'success');

      // Navigate to home screen (pending orders will show)
      setCurrentScreen('home');
    } catch (error) {
      console.error('Unexpected error canceling delivery:', error);
      showToastMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const bookDelivery = async () => {
    if (!currentUser) {
      showToastMessage('Please log in to book a delivery', 'error');
      return;
    }

    // Validate phone number before submitting
    if (!isValidReceiverPhone) {
      showToastMessage('Please enter a valid Philippine phone number', 'error');
      return;
    }

    setIsBookingDelivery(true);
    setIsLoading(true);

    try {
      // Generate order number with user ID to prevent collisions
      // Format: ORD-{userId}-{timestamp}
      // Example: ORD-abc123-45678901
      const userIdShort = currentUser.id.toString().slice(-6); // Last 6 chars of user ID
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const orderNumber = `ORD-${userIdShort}-${timestamp}`;

      // Prepare order data
      const orderData = {
        order_number: orderNumber,
        customer_id: currentUser.id,
        service_type: selectedService, // Dynamic based on selected service
        status: 'pending',
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
        item_description: itemDescription,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        service_fee: SERVICE_FEE,
        total_amount: totalAmount,
      };

      // Insert order into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        showToastMessage('Failed to book delivery. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      console.log('✅ ORDER CREATED:', data);

      // Set current order for tracking
      setCurrentOrder(data);

      // Save to AsyncStorage for persistence
      await saveCurrentOrderToStorage(data);

      console.log('📝 Current order state updated with:', data.id);

      // Clear form inputs
      setPickupAddress('');
      setDeliveryAddress('');
      setItemDescription('');
      setReceiverName('');
      setReceiverPhone('');

      // Stop loading overlay BEFORE showing finding rider modal
      setIsLoading(false);
      setIsBookingDelivery(false);

      console.log('🔍 SHOWING FINDING RIDER MODAL for order:', data.id);

      // Show finding rider modal (no loading spinner, just the modal)
      setShowFindingRider(true);

      console.log('⏳ Waiting for rider to accept order...');

    } catch (error) {
      console.error('Unexpected error:', error);
      showToastMessage('An unexpected error occurred. Please try again.', 'error');
      setIsLoading(false);
      setIsBookingDelivery(false);
    }
  };

  // Check for existing session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          // Fetch user profile to get user_type BEFORE setting state
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('user_type, full_name')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile during session restore:', profileError);
            // Even if profile fetch fails, log user in with default type
            setCurrentUser(user);
          } else if (userProfile) {
            console.log('Session restored - User type:', userProfile.user_type);
            // Set user and user type together
            setCurrentUser(user);
            setUserType(userProfile.user_type as UserType);
          } else {
            console.error('User profile not found during session restore');
            setCurrentUser(user);
          }

          // Auto-navigate to home after splash screen delay
          setTimeout(() => {
            setCurrentScreen('home');
          }, 2000); // 2 second splash screen
        } else {
          // No active session, show login screen
          setTimeout(() => {
            setCurrentScreen('login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // On error, redirect to login
        setTimeout(() => {
          setCurrentScreen('login');
        }, 2000);
      }
    };

    checkSession();
  }, []);

  // Load saved order/delivery from AsyncStorage on app start
  useEffect(() => {
    const loadSavedData = async () => {
      if (!currentUser) return;

      console.log('📂 Loading saved order/delivery from storage...');

      // Load saved order for customers
      if (userType === 'customer') {
        const savedOrder = await loadOrderFromStorage();
        if (savedOrder) {
          console.log('✅ Restored saved order:', savedOrder.id);
          setCurrentOrder(savedOrder);
        }
      }

      // Load saved delivery for riders
      if (userType === 'rider') {
        const savedDelivery = await loadDeliveryFromStorage();
        if (savedDelivery) {
          console.log('✅ Restored saved delivery:', savedDelivery.id);
          setCurrentDelivery(savedDelivery);
        }
      }
    };

    loadSavedData();
  }, [currentUser, userType]);

  // Real-time subscription for messages only
  // (Delivery and order updates are handled by useOrderRealtime hook)
  useEffect(() => {
    console.log('🔄 Message subscription useEffect triggered');
    console.log('🔍 currentOrder:', currentOrder?.id);
    console.log('🔍 currentDelivery?.order:', currentDelivery?.order?.id);
    console.log('🔍 currentUser:', currentUser?.id);
    console.log('🔍 userType:', userType);

    // Get the active order (either currentOrder for customers or currentDelivery.order for riders)
    const activeOrder = currentOrder || currentDelivery?.order;

    if (!activeOrder?.id) {
      console.log('⚠️ No active order, skipping message subscription');
      console.log('⚠️ currentOrder:', currentOrder);
      console.log('⚠️ currentDelivery:', currentDelivery);
      return;
    }

    console.log('💬 Setting up real-time subscription for order:', activeOrder.id);

    // Load initial messages
    loadMessages(activeOrder.id);

    // Set up real-time subscription for messages with aggressive settings
    const messagesChannel = supabase
      .channel(`messages-${activeOrder.id}`, {
        config: {
          broadcast: { ack: false },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${activeOrder.id}`,
        },
        (payload) => {
          const receiveTime = Date.now();
          console.log('💬 New message received:', payload.new.message_text);
          console.log('⏱️ Received at:', new Date(receiveTime).toLocaleTimeString());

          // Add new message to the list
          const newMsg = payload.new as any;
          const transformedMsg: ChatMessage = {
            id: newMsg.id,
            sender: newMsg.sender_id === currentUser?.id ? userType : (userType === 'customer' ? 'rider' : 'customer'),
            text: newMsg.message_text,
            time: new Date(newMsg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          };

          // Only add if message doesn't already exist (prevent duplicates from optimistic updates)
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === transformedMsg.id);
            return exists ? prev : [...prev, transformedMsg];
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to messages for order:', activeOrder.id);
          console.log('✅ Connection ready - messages should arrive instantly');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to messages channel:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔌 Channel closed');
        } else {
          console.log('📡 Channel status:', status);
        }
      });

    console.log('✅ Message subscription initiated for order:', activeOrder.id);

    // Cleanup subscription on unmount or when order changes
    return () => {
      console.log('🔌 Cleaning up message subscription for order:', activeOrder.id);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentOrder?.id, currentDelivery?.order?.id, currentUser?.id, userType]);

  // Real-time subscription for notifications (only for customers)
  useEffect(() => {
    if (!currentUser?.id) {
      console.log('⚠️ No current user, skipping notification subscription');
      return;
    }

    // Only customers get notifications
    if (userType !== 'customer') {
      console.log('🏍️ Rider user, skipping notification subscription');
      return;
    }

    console.log('🔔 Setting up real-time notification subscription for customer:', currentUser.id);

    // Load initial notifications
    const loadNotifications = async () => {
      const userNotifications = await getUserNotifications(currentUser.id);
      setNotifications(userNotifications);

      const unreadCount = await getUnreadNotificationCount(currentUser.id);
      setUnreadNotificationCount(unreadCount);
    };

    loadNotifications();

    // Set up real-time subscription for new notifications
    const notificationChannel = supabase
      .channel(`notifications-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('🔔 New notification received:', payload.new);

          const newNotification = payload.new as any;

          // Add new notification to the list
          setNotifications((prev) => [newNotification, ...prev]);

          // Increment unread count
          setUnreadNotificationCount((prev) => prev + 1);

          // Show toast for new notification
          showToastMessage(newNotification.title, 'info');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('🔔 Notification updated:', payload.new);

          const updatedNotification = payload.new as any;

          // Update notification in the list
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );

          // Recalculate unread count
          getUnreadNotificationCount(currentUser.id).then(setUnreadNotificationCount);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to notifications for user:', currentUser.id);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to notifications');
        }
      });

    console.log('✅ Notification subscription initiated');

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up notification subscription');
      supabase.removeChannel(notificationChannel);
    };
  }, [currentUser?.id, userType]);

  // Fetch pending orders when rider is on home screen
  useEffect(() => {
    if (userType === 'rider' && currentScreen === 'home' && currentUser && !currentDelivery) {
      // Debounce search query to avoid too many requests
      const timeoutId = setTimeout(() => {
        fetchPendingOrders(searchQuery);
      }, searchQuery ? 300 : 0); // 300ms delay only when searching

      // Set up real-time subscription for new pending orders
      const ordersChannel = supabase
        .channel('pending-orders')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `status=eq.pending`,
          },
          (payload) => {
            console.log('New pending order:', payload);
            const newOrder = payload.new as any;

            // Only add if it matches the rider's service type and search query
            if (newOrder.service_type === workerService) {
              // Only add to list if it matches search (or no search)
              if (!searchQuery.trim() || 
                  (newOrder.order_number && newOrder.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (newOrder.pickup_address && newOrder.pickup_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (newOrder.delivery_address && newOrder.delivery_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (newOrder.item_description && newOrder.item_description.toLowerCase().includes(searchQuery.toLowerCase()))) {
                setPendingOrders((prev) => [newOrder, ...prev]);
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            const updatedOrder = payload.new as any;

            // Remove from pending list if status changed
            if (updatedOrder.status !== 'pending') {
              setPendingOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
            }
          }
        )
        .subscribe();

      return () => {
        clearTimeout(timeoutId);
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [userType, currentScreen, currentUser, workerService, currentDelivery, searchQuery]);

  // Fetch profile data when user navigates to profile screen
  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentScreen === 'profile' && currentUser && (!userProfile || userAddresses.length === 0)) {
        setIsProfileLoading(true);
        try {
          // Fetch both profile and addresses in parallel
          const [profileResult, addressesResult] = await Promise.all([
            getUserProfile(currentUser.id),
            getUserAddresses(currentUser.id)
          ]);

          // Handle profile data
          if (profileResult.success && profileResult.profile) {
            setUserProfile(profileResult.profile);
            console.log('Profile data loaded:', profileResult.profile);
          } else {
            console.error('Failed to load profile:', profileResult.error);
            showToastMessage(profileResult.error || 'Failed to load profile', 'error');
          }

          // Handle addresses data
          if (addressesResult.success && addressesResult.addresses) {
            setUserAddresses(addressesResult.addresses);
            console.log('Addresses loaded:', addressesResult.addresses);
          } else {
            console.error('Failed to load addresses:', addressesResult.error);
            // Don't show toast for addresses error since it's not critical
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
          showToastMessage('An error occurred while loading profile', 'error');
        } finally {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [currentScreen, currentUser, userProfile, userAddresses]);

  const handleSignup = () => {
    // Validate form fields
    if (!signupFullName.trim()) {
      showToastMessage('Please enter your full name', 'error');
      return;
    }

    if (!signupEmail.trim()) {
      showToastMessage('Please enter your email address', 'error');
      return;
    }

    if (!signupPhoneNumber.trim()) {
      showToastMessage('Please enter your phone number', 'error');
      return;
    }

    // Validate phone number format (Philippine numbers)
    const phoneValidation = isValidPhilippineNumber(signupPhoneNumber);
    if (!phoneValidation) {
      showToastMessage('Please enter a valid Philippine phone number (+639XXXXXXXXX or 09XXXXXXXXX)', 'error');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      showToastMessage('Please enter a valid email address', 'error');
      return;
    }

    // Validate vehicle information for riders
    if (userType === 'rider') {
      if (!vehicleBrand.trim()) {
        showToastMessage('Please select your vehicle brand', 'error');
        return;
      }
      if (!vehicleModel.trim()) {
        showToastMessage('Please enter your vehicle model', 'error');
        return;
      }
      if (!vehicleColor.trim()) {
        showToastMessage('Please enter your vehicle color', 'error');
        return;
      }
      if (!plateNumber.trim()) {
        showToastMessage('Please enter your plate number', 'error');
        return;
      }
    }

    // Navigate to password screen
    setCurrentScreen('password');
  };

  const handlePasswordSignup = async () => {
    // Validate password fields
    if (!signupPassword.trim()) {
      showToastMessage('Please enter a password', 'error');
      return;
    }

    if (signupPassword.length < 6) {
      showToastMessage('Password must be at least 6 characters', 'error');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      showToastMessage('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const signupData: SignUpData = {
        fullName: signupFullName.trim(),
        email: signupEmail.trim(),
        phoneNumber: signupPhoneNumber.trim(),
        password: signupPassword,
        userType: userType,
      };

      const result = await signUpUser(signupData);

      if (result.success && result.user) {
        // If rider, create rider profile with vehicle information
        if (userType === 'rider') {
          try {
            const riderProfileData = {
              user_id: result.user.id,
              service_type: 'delivery', // Default to delivery
              vehicle_brand: vehicleBrand,
              vehicle_model: vehicleModel,
              vehicle_color: vehicleColor,
              plate_number: plateNumber.toUpperCase(),
              is_available: true,
              is_verified: true, // TODO: Change to false when admin approval workflow is implemented
              is_online: false,
            };

            const { error: profileError } = await supabase
              .from('rider_profiles')
              .insert([riderProfileData]);

            if (profileError) {
              console.error('Error creating rider profile:', profileError);
              showToastMessage('Account created but failed to save vehicle info. Please update in profile.', 'info');
            }
          } catch (error) {
            console.error('Error creating rider profile:', error);
          }
        }

        // Clear form fields
        setSignupFullName('');
        setSignupEmail('');
        setSignupPhoneNumber('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setVehicleBrand('');
        setVehicleModel('');
        setVehicleColor('');
        setPlateNumber('');

        showToastMessage('Account created successfully! Please check your email.', 'success');
        // Navigate to login screen immediately
        setCurrentScreen('login');
      } else {
        showToastMessage(result.error || 'Failed to create account', 'error');
      }
    } catch (error) {
      showToastMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Clear any previous login errors
    setLoginError('');

    // Validate form fields
    if (!loginPhoneNumber.trim()) {
      showToastMessage('Please enter your phone number', 'error');
      return;
    }

    if (!loginPassword.trim()) {
      showToastMessage('Please enter your password', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInUserWithPhone(loginPhoneNumber.trim(), loginPassword);

      if (result.success && result.user) {
        // Fetch user profile to get user_type BEFORE setting any state
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('user_type, full_name')
          .eq('id', result.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          showToastMessage('Login successful but failed to load profile. Please try again.', 'error');
          return;
        }

        if (!userProfile) {
          console.error('User profile not found');
          showToastMessage('User profile not found. Please contact support.', 'error');
          return;
        }

        console.log('Fetched user profile:', userProfile);
        console.log('User type from database:', userProfile.user_type);
        console.log('Selected user type:', userType);

        // Validate that the selected user type matches the database user type
        if (userProfile.user_type !== userType) {
          console.error('User type mismatch:', { selected: userType, actual: userProfile.user_type });

          const userTypeText = userType === 'customer' ? 'Customer' : 'Worker';
          const actualUserTypeText = userProfile.user_type === 'customer' ? 'Customer' : 'Worker';

          setLoginError(`No ${userTypeText} account found. This account is registered as a ${actualUserTypeText}.`);
          return;
        }

        console.log('User type validation passed! Navigating to home...');

        // Now set all state together - React will batch these updates
        setCurrentUser(result.user);
        // Note: We don't need to setUserType since it's already correctly set from the selected tab

        // Clear form fields
        setLoginPhoneNumber('');
        setLoginPassword('');
        setEmailNotConfirmed(false);

        showToastMessage('Login successful!', 'success');

        // Navigate to home screen after a brief delay to ensure state updates
        setTimeout(() => {
          setCurrentScreen('home');
        }, 100);
      } else {
        // Check if the error is specifically about email confirmation
        if (result.error?.includes('Email not confirmed')) {
          setEmailNotConfirmed(true);
        } else {
          setEmailNotConfirmed(false);
          showToastMessage(result.error || 'Failed to login', 'error');
        }
      }
    } catch (error) {
      showToastMessage('An unexpected error occurred', 'error');
      setEmailNotConfirmed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const result = await signOutUser();

      if (result.success) {
        // Close all modals
        setShowLogoutConfirm(false);
        setShowFindingRider(false);
        setShowPaymentModal(false);
        setShowRatingModal(false);
        setShowOrderTracking(false);
        setShowSettings(false);
        setShowNotifications(false);
        setShowCallOptions(false);
        setShowCompleteConfirmation(false);
        setShowEditProfile(false);
        setShowChangePassword(false);
        setShowAddPaymentMethod(false);
        setShowServiceTicketDetails(false);
        setShowCreateTicket(false);

        setShowFilter(false);
        setShowHelp(false);
        setShowShare(false);

        // Clear all user-related state
        setCurrentUser(null);
        setUserProfile(null);
        setUserAddresses([]);
        setCurrentOrder(null);
        setCurrentDelivery(null);
        setDeliveryStatus(null);
        setPendingOrders([]);
        setMessages([]);

        // Reset booking state
        setIsBookingDelivery(false);

        // Clear form inputs
        setPickupAddress('');
        setDeliveryAddress('');
        setItemDescription('');
        setReceiverName('');
        setReceiverPhone('');
        setLoginPhoneNumber('');
        setLoginPassword('');
        setEmailNotConfirmed(false);

        // Reset ratings
        setCurrentRating(0);
        setRatingComment('');

        // Show success message
        showToastMessage('Logged out successfully', 'success');

        // Navigate to login screen after a brief delay
        setTimeout(() => {
          setCurrentScreen('login');
        }, 1000);
      } else {
        showToastMessage(result.error || 'Failed to logout', 'error');
      }
    } catch (error) {
      showToastMessage('An unexpected error occurred during logout', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicturePress = () => {
    if (userProfile?.avatar_url) {
      setShowProfilePictureModal(true);
    } else {
      handleProfilePictureUpload();
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!currentUser) {
      showToastMessage('You must be logged in to update your profile picture', 'error');
      return;
    }

    setIsUploadingProfilePicture(true);
    setShowProfilePictureModal(false);

    try {
      // Step 1: Select image
      const { selectProfilePicture } = await import('@/lib/profilePictureService');
      const imageUri = await selectProfilePicture();

      if (!imageUri) {
        showToastMessage('No image selected', 'info');
        return;
      }

      showToastMessage('Image selected, uploading...', 'info');

      // Step 2: Delete old profile picture if it exists
      if (userProfile?.avatar_url) {
        try {
          const { supabase } = await import('@/lib/supabase');

          // Extract file path from the Supabase URL
          // URL format: https://project_id.supabase.co/storage/v1/object/public/avatars/user_id/avatar.jpg
          const urlParts = userProfile.avatar_url.split('/');
          const fileName = urlParts[urlParts.length - 1]; // avatar.jpg
          const userId = urlParts[urlParts.length - 2];   // user_id
          const filePath = `${userId}/${fileName}`;

          // Delete old avatar from storage
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

          if (deleteError) {
            console.error('Failed to delete old profile picture:', deleteError);
            showToastMessage('Warning: Could not delete old profile picture', 'info');
          }
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError);
          showToastMessage('Warning: Error deleting old profile picture', 'info');
        }
      }

      // Step 3: Upload new image using Supabase client
      const { supabase } = await import('@/lib/supabase');

      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from('avatars')
        .upload(`${currentUser.id}/avatar.jpg`, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${currentUser.id}/avatar.jpg`);

      // Update user profile
      const { updateUserAvatar } = await import('@/lib/userService');
      const updateResult = await updateUserAvatar(currentUser.id, publicUrl);

      if (updateResult.success) {
        setUserProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
        showToastMessage('Profile picture updated successfully', 'success');
      } else {
        throw new Error(updateResult.error || 'Failed to update profile');
      }

    } catch (error) {
      showToastMessage('Upload error: ' + (error as Error).message, 'error');
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  // Address CRUD functions
  const handleAddAddress = async () => {
    if (!currentUser || !addressName.trim() || !fullAddress.trim()) {
      showToastMessage('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const addressData: CreateAddressData = {
        user_id: currentUser.id,
        address_name: addressName.trim(),
        full_address: fullAddress.trim(),
        is_default: false // Set to false initially, will handle default separately
      };

      const result = await createAddress(addressData);
      if (result.success) {
        let createdAddress = result.address;

        // If user wants to set this as default, handle that separately
        if (isDefaultAddress && createdAddress) {
          const defaultResult = await setDefaultAddress(currentUser.id, createdAddress.id);
          if (!defaultResult.success) {
            showToastMessage(defaultResult.error || 'Failed to set default address', 'error');
            setIsLoading(false);
            return;
          }
        }

        // Refresh addresses to get the latest state
        const addressesResult = await getUserAddresses(currentUser.id);
        if (addressesResult.success && addressesResult.addresses) {
          setUserAddresses(addressesResult.addresses);
        }

        // Clear form and close modal
        setAddressName('');
        setFullAddress('');
        setIsDefaultAddress(false);
        setShowAddAddress(false);
        showToastMessage('Address added successfully', 'success');
      } else {
        showToastMessage(result.error || 'Failed to add address', 'error');
      }
    } catch (error) {
      showToastMessage('An error occurred while adding address', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!selectedAddress || !addressName.trim() || !fullAddress.trim()) {
      showToastMessage('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // First update the address details
      const updateData: UpdateAddressData = {
        address_name: addressName.trim(),
        full_address: fullAddress.trim(),
        is_default: false // Set to false initially, will handle default separately
      };

      const result = await updateAddress(selectedAddress.id, updateData);
      if (result.success) {
        // If user wants to set this as default, handle that separately
        if (isDefaultAddress && !selectedAddress.is_default) {
          const defaultResult = await setDefaultAddress(currentUser.id, selectedAddress.id);
          if (!defaultResult.success) {
            showToastMessage(defaultResult.error || 'Failed to set default address', 'error');
            setIsLoading(false);
            return;
          }
        }

        // Refresh addresses
        const addressesResult = await getUserAddresses(currentUser.id);
        if (addressesResult.success && addressesResult.addresses) {
          setUserAddresses(addressesResult.addresses);
        }

        // Clear form and close modal
        setSelectedAddress(null);
        setAddressName('');
        setFullAddress('');
        setIsDefaultAddress(false);
        setShowEditAddress(false);
        showToastMessage('Address updated successfully', 'success');
      } else {
        showToastMessage(result.error || 'Failed to update address', 'error');
      }
    } catch (error) {
      showToastMessage('An error occurred while updating address', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return;

    // Show confirmation using React Native Alert
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${selectedAddress.address_name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await deleteAddress(selectedAddress.id);
              if (result.success) {
                // Refresh addresses
                const addressesResult = await getUserAddresses(currentUser.id);
                if (addressesResult.success && addressesResult.addresses) {
                  setUserAddresses(addressesResult.addresses);
                }

                // Clear selection and close modal
                setSelectedAddress(null);
                setShowEditAddress(false);
                showToastMessage('Address deleted successfully', 'success');
              } else {
                showToastMessage(result.error || 'Failed to delete address', 'error');
              }
            } catch (error) {
              showToastMessage('An error occurred while deleting address', 'error');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };


  const openEditAddressModal = (address: Address) => {
    setSelectedAddress(address);
    setAddressName(address.address_name);
    setFullAddress(address.full_address);
    setIsDefaultAddress(address.is_default);
    setShowEditAddress(true);
  };

  // Profile update functions
  const handleUpdateProfile = async () => {
    if (!currentUser || !editProfileName.trim() || !editProfileEmail.trim()) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editProfileEmail.trim())) {
      showToastMessage('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {
        full_name: editProfileName.trim(),
        email: editProfileEmail.trim()
      };

      const result = await updateUserProfile(currentUser.id, updateData);
      if (result.success) {
        // Refresh profile data
        const profileResult = await getUserProfile(currentUser.id);
        if (profileResult.success && profileResult.profile) {
          setUserProfile(profileResult.profile);
        }

        // Clear form and close modal
        setEditProfileName('');
        setEditProfileEmail('');
        setShowEditProfile(false);
        showToastMessage('Profile updated successfully', 'success');
      } else {
        showToastMessage(result.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToastMessage('An error occurred while updating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      showToastMessage('Please fill in all fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToastMessage('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToastMessage('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changeUserPassword(newPassword);
      if (result.success) {
        // Clear form and close modal
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowChangePassword(false);
        showToastMessage('Password changed successfully', 'success');
      } else {
        showToastMessage(result.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      showToastMessage('An error occurred while changing password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to pre-fill edit profile modal
  const openEditProfileModal = () => {
    if (userProfile) {
      setEditProfileName(userProfile.full_name);
      setEditProfileEmail(userProfile.email);
    }
    setShowEditProfile(true);
  };


  const bottomItems = useMemo(() => {
    if (userType === 'rider') {
      return [
        { key: 'home', label: 'Home', icon: 'home' as const },
        { key: 'deliveries', label: workerService === 'delivery' ? 'Deliveries' : 'Jobs', icon: 'cube' as const },
        { key: 'earnings', label: 'Earnings', icon: 'card' as const },
        { key: 'profile', label: 'Profile', icon: 'person' as const },
      ];
    }
    return [
      { key: 'home', label: 'Home', icon: 'home' as const },
      { key: 'orders', label: 'Orders', icon: 'cube' as const },
      { key: 'profile', label: 'Profile', icon: 'person' as const },
    ];
  }, [userType, workerService]);

  // Splash Screen
  if (currentScreen === 'splash') {
    return <SplashScreen onFinish={() => setCurrentScreen('login')} />;
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '90%', maxWidth: 700, minWidth: 320, gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#dc2626' }}>SUGO</Text>
              <Text style={{ color: '#6b7280' }}>Log in with Phone Number</Text>
            </View>
            <View style={{ gap: 12 }}>
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={loginPhoneNumber}
                onChangeText={(text) => {
                  setLoginPhoneNumber(text);
                  setLoginError('');
                }}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
                value={loginPassword}
                onChangeText={(text) => {
                  setLoginPassword(text);
                  setLoginError('');
                }}
                editable={!isLoading}
              />
              {emailNotConfirmed && (
                <Text style={styles.errorText}>Email not confirmed. Please check email.</Text>
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.primaryText}>{isLoading ? 'Logging in...' : 'Log in'}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setCurrentScreen('signup')} disabled={isLoading}>
                <Text style={{ color: '#dc2626', fontWeight: '600', opacity: isLoading ? 0.4 : 1 }}>Don&apos;t have an account? Sign up</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, opacity: isLoading ? 0.4 : 1 }}>
              <TouchableOpacity
                style={[styles.segment, userType === 'customer' ? styles.segmentActive : undefined]}
                onPress={() => {
                  setUserType('customer');
                  setLoginError('');
                }}
                disabled={isLoading}
              >
                <Text style={[styles.segmentText, userType === 'customer' ? styles.segmentTextActive : undefined]}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, userType === 'rider' ? styles.segmentActive : undefined]}
                onPress={() => {
                  setUserType('rider');
                  setLoginError('');
                }}
                disabled={isLoading}
              >
                <Text style={[styles.segmentText, userType === 'rider' ? styles.segmentTextActive : undefined]}>Worker</Text>
              </TouchableOpacity>
            </View>
            {loginError ? (
              <Text style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: '500' }}>
                {loginError}
              </Text>
            ) : null}
            {userType === 'rider' && (
              <View style={{ gap: 8, opacity: isLoading ? 0.4 : 1 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>Select your service</Text>
                <ServiceSelector value={workerService as any} onChange={(s) => setWorkerService(s)} disabled={isLoading} />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Signup Screen
  if (currentScreen === 'signup') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '90%', maxWidth: 700, minWidth: 320, gap: 12 }}>
            <View style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' }}>Create Account</Text>
            </View>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={signupFullName}
              onChangeText={setSignupFullName}
              editable={!isLoading}
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={signupPhoneNumber}
              onChangeText={setSignupPhoneNumber}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={signupEmail}
              onChangeText={setSignupEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {userType === 'rider' && (
              <View style={{ gap: 8, opacity: isLoading ? 0.4 : 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 8 }}>Vehicle Information</Text>
                <TextInput
                  placeholder="Vehicle Brand (e.g., Honda, Yamaha, Suzuki)"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={vehicleBrand}
                  onChangeText={setVehicleBrand}
                  editable={!isLoading}
                />
                <TextInput
                  placeholder="Vehicle Model (e.g., Wave 110, Click 150)"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                  editable={!isLoading}
                />
                <TextInput
                  placeholder="Vehicle Color"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={vehicleColor}
                  onChangeText={setVehicleColor}
                  editable={!isLoading}
                />
                <TextInput
                  placeholder="Plate Number (e.g., ABC-1234)"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />
              </View>
            )}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.primaryText}>{isLoading ? 'Creating Account...' : 'Proceed'}</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setCurrentScreen('login')} disabled={isLoading}>
                <Text style={{ color: '#dc2626', fontWeight: '600', opacity: isLoading ? 0.4 : 1 }}>Already have an account? Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Password Screen
  if (currentScreen === 'password') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '90%', maxWidth: 700, minWidth: 320, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 }}>Set Password</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              Create a password for your account
            </Text>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={signupPassword}
              onChangeText={setSignupPassword}
              secureTextEntry
              editable={!isLoading}
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={signupConfirmPassword}
              onChangeText={setSignupConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && { opacity: 0.6 }]}
              onPress={handlePasswordSignup}
              disabled={isLoading}
            >
              <Text style={styles.primaryText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setCurrentScreen('signup')} disabled={isLoading}>
                <Text style={{ color: '#6b7280', fontWeight: '600', opacity: isLoading ? 0.4 : 1 }}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // OTP Screen
  if (currentScreen === 'otp') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '90%', maxWidth: 700, minWidth: 320, gap: 12 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Ionicons name="cube" size={36} color="#dc2626" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' }}>Verify Phone Number</Text>
              <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 4 }}>Enter the 6-digit code sent to{'\n'}{phoneNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 16 }}>
              {otpCode.map((_, i) => (
                <TextInput key={i} maxLength={1} keyboardType="numeric" style={[styles.otpInput, { width: '15%' }]} value={otpCode[i]} onChangeText={(v) => {
                  const newOtp = [...otpCode];
                  newOtp[i] = v;
                  setOtpCode(newOtp);
                }} />
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('home')}>
              <Text style={styles.primaryText}>Verify OTP</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setOtpTimer(300)}>
                <Text style={{ color: otpTimer > 0 ? '#6b7280' : '#dc2626', fontWeight: '600' }}>
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main Container
  // Debug: Log current state before render
  console.log('[RENDER] Current userType:', userType, '| Current screen:', currentScreen, '| User:', currentUser?.email);
  console.log(JSON.stringify(currentDelivery), "jere");

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {userType === 'rider' ? (
        <>
          {currentDelivery && currentScreen === 'home' ? (
            <>
              <Header title="Current Delivery" subtitle={`Order #${currentDelivery.order?.order_number || currentDelivery.order?.id || currentDelivery.id} - ${currentDelivery.order?.status || 'In Progress'}`} />
              <View style={{ flex: 1, padding: 16, gap: 12, paddingBottom: 100 }}>
                <TouchableOpacity
                  onPress={() => setIsOrderDetailsExpanded(!isOrderDetailsExpanded)}
                  activeOpacity={0.7}
                >
                    <SectionCard title="Order Details">
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOrderDetailsExpanded ? 12 : 0 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', marginTop: 2 }}>
                            ₱{(currentDelivery.order.total_amount || 0).toFixed(2)}
                          </Text>
                        </View>
                        <Ionicons
                          name={isOrderDetailsExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                      {isOrderDetailsExpanded && (
                        <View>
                          <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 12 }} />
                          <Row label="Pickup Address" value={currentDelivery.order.pickup_address || 'N/A'} />
                          <Row label="Delivery Address" value={currentDelivery.order.delivery_address || 'N/A'} />
                          <Row label="Item Description" value={currentDelivery.order.item_description || currentDelivery.order.item || 'N/A'} />
                          <Row label="Receiver" value={currentDelivery.order.receiver_name || currentDelivery.order.receiver || 'N/A'} />
                          <Row label="Contact" value={currentDelivery.order.receiver_phone || currentDelivery.order.contact || 'N/A'} />
                        </View>
                      )}
                    </SectionCard>
                  </TouchableOpacity>
                <View style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Chat with Customer</Text>
                  </View>
                  <Chat messages={messages} input={newMessage} onChangeInput={setNewMessage} onSend={sendMessage} alignRightFor="rider" disabled={isSendingMessage} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1, backgroundColor: '#16a34a' }]}
                    onPress={() => setShowCompleteConfirmation(true)}
                    disabled={isLoading}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.primaryText}>Mark as Completed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.callRiderBtn, { flex: 1 }]}
                    onPress={() => {
                      setCallNumber(currentDelivery?.order?.receiver_phone || currentDelivery?.order?.contact || "+63 000 000 0000");
                      setShowCallOptions(true);
                    }}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.primaryText}>Call Customer</Text>
                  </TouchableOpacity>
                </View>
                {/* <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]}
                  onPress={cancelDelivery}
                  disabled={isLoading}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.primaryText}>{isLoading ? 'Cancelling...' : 'Cancel Order'}</Text>
                </TouchableOpacity> */}
              </View>
            </>
          ) : currentScreen === 'deliveries' ? (
            <>
              <Header title={`Past Deliveries`} subtitle={`Your delivery history`} />
              <FlatList
                data={pastDeliveries}
                keyExtractor={(item) => `delivery-${item.id}`}
                ListHeaderComponent={
                  <>
                    {/* Search and Filter Bar */}
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8, paddingHorizontal: 16, paddingTop: 16 }}>
                      <View 
                        style={[
                          { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
                          Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, outlineStyle: 'none' } as any
                        ]}
                      >
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                          style={[
                            { flex: 1, paddingVertical: 12, color: '#111827', fontSize: 16, borderWidth: 0 },
                            Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, outlineStyle: 'none', WebkitAppearance: 'none' } as any
                          ]}
                          placeholder="Search deliveries by ID, address, receiver..."
                          placeholderTextColor="#9ca3af"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                        {searchQuery ? (
                          <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#6b7280" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? '#dc2626' : '#f3f4f6',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? 0 : 1,
                          borderColor: '#e5e7eb',
                        }}
                        onPress={() => setShowFilter(true)}
                      >
                        <Ionicons name="filter" size={20} color={activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? '#fff' : '#6b7280'} />
                      </TouchableOpacity>
                    </View>
                  </>
                }
                ListEmptyComponent={
                  isHistoryLoading ? (
                    <View style={{ padding: 16 }}>
                      <SectionCard>
                        <Text style={{ color: '#6b7280' }}>Loading history...</Text>
                      </SectionCard>
                    </View>
                  ) : (
                    <View style={{ padding: 16 }}>
                      <SectionCard>
                        <Text style={{ color: '#6b7280' }}>
                          {searchQuery || activeFilters.dateRange !== 'all' || activeFilters.status !== 'all'
                            ? 'No deliveries match your search or filters'
                            : 'No past deliveries yet'}
                        </Text>
                      </SectionCard>
                    </View>
                  )
                }
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#dc2626" />
                    </View>
                  ) : null
                }
                renderItem={({ item: d }) => (
                  <View style={{ paddingHorizontal: 16 }}>
                    <SectionCard>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                          <Text style={styles.metaLabel}>Order ID</Text>
                          <Text style={styles.orderIdText}>{d.order?.order_number || d.order_id}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>{(d.status || 'completed').toString().replace('_', ' ')}</Text>
                        </View>
                      </View>

                      {d.order?.receiver_name ? (
                        <View style={styles.riderCard}>
                          <View style={styles.avatar}>
                            <Ionicons name="person" size={22} color="#dc2626" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700', color: '#111827' }}>{d.order?.receiver_name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
                              {!!d.order?.receiver_phone && (
                                <Text style={{ color: '#6b7280', fontSize: 12 }}>{d.order?.receiver_phone}</Text>
                              )}
                            </View>
                          </View>
                        </View>
                      ) : null}

                      <View style={styles.rowInline}>
                        <View style={styles.dotRed} />
                        <Text style={{ color: '#6b7280' }}>Pickup: <Text style={{ color: '#111827', fontWeight: '600' }}>{d.order?.pickup_address || 'N/A'}</Text></Text>
                      </View>
                      <View style={styles.rowInline}>
                        <View style={styles.dotGreen} />
                        <Text style={{ color: '#6b7280' }}>Drop-off: <Text style={{ color: '#111827', fontWeight: '600' }}>{d.order?.delivery_address || 'N/A'}</Text></Text>
                      </View>
                      <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={styles.metaLabel}>Earnings</Text>
                          <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: 16 }}>₱{(typeof d.earnings === 'number' ? d.earnings : 0).toFixed(2)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.metaLabel}>Rating</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="star" size={16} color="#fbbf24" />
                            <Text style={{ color: '#6b7280', fontWeight: '600' }}>{d.order?.rider_rating?.toFixed?.(1) || '4.8'}</Text>
                          </View>
                        </View>
                      </View>
                    </SectionCard>
                  </View>
                )}
                contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
                onEndReached={loadMoreDeliveries}
                onEndReachedThreshold={0.2}
                removeClippedSubviews={false}
              />
            </>
          ) : currentScreen === 'earnings' ? (
            <>
              <Header title="Earnings" />
              <ScrollView 
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isEarningsLoading}
                    onRefresh={loadEarnings}
                    colors={['#dc2626']}
                    tintColor="#dc2626"
                  />
                }
              >
                {isEarningsLoading && dailyEarnings.length === 0 ? (
                  <SectionCard>
                    <Text style={{ color: '#6b7280', textAlign: 'center' }}>Loading earnings...</Text>
                  </SectionCard>
                ) : (
                  <>
                    <SectionCard>
                      <Text style={{ color: '#6b7280', marginBottom: 4 }}>Total Earnings Today</Text>
                      <Text style={{ fontSize: 32, fontWeight: '800' }}>₱{(earningsSummary?.totalEarningsToday || 0).toFixed(2)}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                        {earningsSummary?.totalDeliveriesToday || 0} deliveries
                      </Text>
                    </SectionCard>
                    
                    {dailyEarnings.map((d, idx) => (
                      <SectionCard key={idx}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View>
                            <Text style={{ fontWeight: '600' }}>{d.displayDate}</Text>
                            <Text style={{ color: '#6b7280', fontSize: 12 }}>{d.deliveries} deliveries</Text>
                          </View>
                          <Text style={{ fontWeight: '800', color: '#dc2626' }}>₱{d.amount.toFixed(2)}</Text>
                        </View>
                      </SectionCard>
                    ))}

                    {dailyEarnings.length === 0 && (
                      <SectionCard>
                        <Text style={{ color: '#6b7280', textAlign: 'center' }}>No earnings data available</Text>
                      </SectionCard>
                    )}
                  </>
                )}
              </ScrollView>
            </>
          ) : currentScreen === 'profile' ? (
            <>
              <Header title={currentUser?.user_metadata?.full_name || "Rider Profile"} subtitle={currentUser?.phone || currentUser?.email || ""} />
              <ScrollView 
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isStatsLoading}
                    onRefresh={loadRiderStats}
                    colors={['#dc2626']}
                    tintColor="#dc2626"
                  />
                }
              >
                <SectionCard title="Rider Stats">
                  {isStatsLoading && !riderStats ? (
                    <Text style={{ color: '#6b7280', textAlign: 'center' }}>Loading stats...</Text>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <Stat 
                        value={riderStats?.totalDeliveries?.toString() || "0"} 
                        label="Total Deliveries" 
                      />
                      <Stat 
                        value={`${riderStats?.successRate?.toFixed(0) || "0"}%`} 
                        label="Success Rate" 
                      />
                    </View>
                  )}
                </SectionCard>
                <SectionCard title="Personal Information">
                  <Row label="Name" value={currentUser?.user_metadata?.full_name || "N/A"} />
                  <Row label="Phone" value={currentUser?.phone || currentUser?.user_metadata?.phone_number || "N/A"} />
                  <Row label="Email" value={currentUser?.email || "N/A"} />
                  <Row label="Vehicle" value={vehicleBrand && plateNumber ? `${vehicleBrand} - ${plateNumber}` : "Not set"} />
                </SectionCard>
                <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#dc2626' }]} onPress={openEditProfileModal}>
                  <Text style={{ color: '#dc2626', fontWeight: '600' }}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#dc2626', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                  onPress={() => setShowLogoutConfirm(true)}
                  disabled={isLoading}
                >
                  <Ionicons name="log-out-outline" size={20} color="#fff" />
                  <Text style={styles.primaryText}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          ) : (
            <>
              <Header
                title={`Good Day, ${userProfile?.full_name?.split(' ')[0] || 'Rider'}!`}
                subtitle={`Ready for ${workerService === 'delivery' ? 'deliveries' : 'jobs'}?`}
              />
              <View style={{ padding: 12, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 }}
                  onPress={() => fetchPendingOrders(searchQuery)}
                >
                  <Ionicons name="refresh" size={20} color="#dc2626" />
                  <Text style={{ color: '#dc2626', fontWeight: '600' }}>Refresh Orders</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
              {/* Search and Filter Bar */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                <View 
                  style={[
                    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
                    Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, outlineStyle: 'none' } as any
                  ]}
                >
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                      style={[
                        { flex: 1, paddingVertical: 12, color: '#111827', fontSize: 16, borderWidth: 0 },
                        Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, outlineStyle: 'none', WebkitAppearance: 'none' } as any
                      ]}
                      placeholder="Search orders by ID, address, rider..."
                      placeholderTextColor="#9ca3af"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#6b7280" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? '#dc2626' : '#f3f4f6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? 0 : 1,
                      borderColor: '#e5e7eb',
                    }}
                      onPress={() => setShowFilter(true)}
                    >
                      <Ionicons name="filter" size={20} color={activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? '#fff' : '#6b7280'} />
                    </TouchableOpacity>
                  </View>
                {/* Display pending orders - filtering is now server-side */}
                {pendingOrders.length === 0 && searchQuery ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                    <Ionicons name="search" size={64} color="#d1d5db" />
                    <Text style={{ color: '#6b7280', fontSize: 16, marginTop: 12 }}>No pending {workerService === 'delivery' ? 'deliveries' : 'jobs'} match your search</Text>
                  </View>
                ) : pendingOrders.length === 0 && !searchQuery ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                    <Ionicons name="cube-outline" size={64} color="#d1d5db" />
                    <Text style={{ color: '#6b7280', fontSize: 16, marginTop: 12 }}>No pending {workerService === 'delivery' ? 'deliveries' : 'jobs'} available</Text>
                  </View>
                ) : (
                  pendingOrders.map((order) => (
                    <SectionCard key={order.id}>
                      <Row label="Order ID" value={order.order_number} />
                      <Row label="Pickup" value={order.pickup_address} />
                      <Row label="Drop-off" value={order.delivery_address} />
                      <Row label="Item" value={order.item_description} />
                      <Row label="Service Fee" value={`₱${order.service_fee.toFixed(2)}`} valueTint="#16a34a" />
                      <Row label="Total Amount" value={`₱${order.total_amount.toFixed(2)}`} valueTint="#dc2626" />
                      <TouchableOpacity
                        style={[styles.primaryBtn, isLoading && { opacity: 0.5 }]}
                        onPress={() => acceptOrder(order)}
                        disabled={isLoading}
                      >
                        <Text style={styles.primaryText}>Accept Order</Text>
                      </TouchableOpacity>
                    </SectionCard>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </>
      ) : (
        <>
          {currentOrder && currentScreen === 'home' && currentOrder.rider_name ? (
            <>
              <Header title="Current Order" subtitle={`Order #${currentOrder.order_number || currentOrder.id} - ${currentOrder.status || 'In Progress'}`} />
              <View style={{ flex: 1, padding: 16, gap: 12, paddingBottom: 100 }}>
                {currentOrder.rider_name && (
                  <SectionCard title="Rider Information">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <View style={{ width: 50, height: 50, borderRadius: 999, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
                        {currentOrder.rider_avatar ? (
                          <Text style={{ fontSize: 20, fontWeight: '700', color: '#dc2626' }}>
                            {currentOrder.rider_name.charAt(0).toUpperCase()}
                          </Text>
                        ) : (
                          <Ionicons name="person" size={24} color="#dc2626" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                          {currentOrder.rider_name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Ionicons name="star" size={14} color="#fbbf24" />
                          <Text style={{ fontSize: 13, color: '#6b7280' }}>
                            {currentOrder.rider_rating?.toFixed(1) || '5.0'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Row label="Phone" value={currentOrder.rider_phone || 'N/A'} />
                    {currentOrder.rider_vehicle && currentOrder.rider_vehicle !== 'N/A' && (
                      <Row label="Vehicle" value={currentOrder.rider_vehicle} />
                    )}
                  </SectionCard>
                )}
                <TouchableOpacity
                  onPress={() => setIsOrderDetailsExpanded(!isOrderDetailsExpanded)}
                  activeOpacity={0.7}
                >
                  <SectionCard title="Order Details">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOrderDetailsExpanded ? 12 : 0 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', marginTop: 2 }}>
                          ₱{(currentOrder.total_amount || currentOrder.total || 0).toFixed(2)}
                        </Text>
                      </View>
                      <Ionicons
                        name={isOrderDetailsExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#6b7280"
                      />
                    </View>
                    {isOrderDetailsExpanded && (
                      <View>
                        <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 12 }} />
                        <Row label="Pickup Address" value={currentOrder.pickup_address || 'N/A'} />
                        <Row label="Delivery Address" value={currentOrder.delivery_address || 'N/A'} />
                        <Row label="Item Description" value={currentOrder.item_description || currentOrder.item || 'N/A'} />
                        <Row label="Receiver" value={currentOrder.receiver_name || currentOrder.receiver || 'N/A'} />
                        <Row label="Contact" value={currentOrder.receiver_phone || currentOrder.contact || 'N/A'} />
                      </View>
                    )}
                  </SectionCard>
                </TouchableOpacity>
                <View style={{
                  flex: 1,
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Chat with Rider</Text>
                  </View>
                  <Chat messages={messages} input={newMessage} onChangeInput={setNewMessage} onSend={sendMessage} alignRightFor="customer" disabled={isSendingMessage} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.trackOrderBtn, { flex: 1 }]}
                    onPress={() => {
                      if (currentOrder?.id) {
                        loadDeliveryStatus(currentOrder.id);
                      }
                      setShowOrderTracking(true);
                    }}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.primaryText}>Track Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.callRiderBtn, { flex: 1 }]}
                    onPress={() => {
                      setCallNumber(currentOrder?.rider_phone || currentOrder?.contact || currentOrder?.receiver_phone || "+63 000 000 0000");
                      setShowCallOptions(true);
                    }}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.primaryText}>Call Rider</Text>
                  </TouchableOpacity>
                </View>
                {/* <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]}
                  onPress={cancelOrder}
                  disabled={isLoading}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.primaryText}>{isLoading ? 'Cancelling...' : 'Cancel Order'}</Text>
                </TouchableOpacity> */}
              </View>
            </>
          ) : currentScreen === 'orders' ? (
            <>
              <Header
                title="Past Orders"
                subtitle="Your delivery history"
              />
              <FlatList
                data={filteredPastOrders}
                keyExtractor={(item) => `order-${item.id}`}
                ListHeaderComponent={
                  <>
                    {/* Search and Filter Bar */}
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8, paddingHorizontal: 16, paddingTop: 16 }}>
                      <View 
                        style={[
                          { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
                          Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, outlineStyle: 'none' } as any
                        ]}
                      >
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                          style={[
                            { flex: 1, paddingVertical: 12, color: '#111827', fontSize: 16, borderWidth: 0 },
                            Platform.OS === 'web' && { outline: 'none', outlineWidth: 0, outlineStyle: 'none', WebkitAppearance: 'none' } as any
                          ]}
                          placeholder="Search orders by ID, address, rider..."
                          placeholderTextColor="#9ca3af"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                        {searchQuery ? (
                          <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#6b7280" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? '#dc2626' : '#f3f4f6',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? 0 : 1,
                          borderColor: '#e5e7eb',
                        }}
                        onPress={() => setShowFilter(true)}
                      >
                        <Ionicons name="filter" size={20} color={activeFilters.dateRange !== 'all' || activeFilters.status !== 'all' ? '#fff' : '#6b7280'} />
                      </TouchableOpacity>
                    </View>
                  </>
                }
                ListEmptyComponent={
                  isHistoryLoading ? (
                    <View style={{ padding: 16 }}>
                      <SectionCard>
                        <Text style={{ color: '#6b7280' }}>Loading history...</Text>
                      </SectionCard>
                    </View>
                  ) : (
                    <View style={{ padding: 16 }}>
                      <SectionCard>
                        <Text style={{ color: '#6b7280' }}>
                          {searchQuery || activeFilters.dateRange !== 'all' || activeFilters.status !== 'all'
                            ? 'No orders match your search or filters'
                            : 'No past orders yet'}
                        </Text>
                      </SectionCard>
                    </View>
                  )
                }
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#dc2626" />
                    </View>
                  ) : null
                }
                renderItem={({ item: o }) => (
                  <View style={{ paddingHorizontal: 16 }}>
                    <SectionCard>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                          <Text style={styles.metaLabel}>Order ID</Text>
                          <Text style={styles.orderIdText}>{o.order_number || o.id}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>{(o.status || 'completed').toString().replace('_', ' ')}</Text>
                        </View>
                      </View>

                      {o.rider_name ? (
                        <View style={styles.riderCard}>
                          <View style={styles.avatar}>
                            <Ionicons name="person" size={22} color="#dc2626" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700', color: '#111827' }}>{o.rider_name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
                              {!!o.rider_phone && (
                                <Text style={{ color: '#6b7280', fontSize: 12 }}>{o.rider_phone}</Text>
                              )}
                            </View>
                          </View>
                        </View>
                      ) : null}

                      <View style={styles.rowInline}>
                        <View style={styles.dotRed} />
                        <Text style={{ color: '#6b7280' }}>From: <Text style={{ color: '#111827', fontWeight: '600' }}>{o.pickup_address || 'N/A'}</Text></Text>
                      </View>
                      <View style={styles.rowInline}>
                        <View style={styles.dotGreen} />
                        <Text style={{ color: '#6b7280' }}>To: <Text style={{ color: '#111827', fontWeight: '600' }}>{o.delivery_address || 'N/A'}</Text></Text>
                      </View>
                      <View style={styles.rowInline}>
                        <Ionicons name="time-outline" size={14} color="#9ca3af" />
                        <Text style={{ color: '#6b7280' }}>{(o.status || 'delivered').toString().replace('_', ' ')}</Text>
                      </View>
                    </SectionCard>
                  </View>
                )}
                contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
                onEndReached={loadMoreOrders}
                onEndReachedThreshold={0.2}
                removeClippedSubviews={false}
              />
            </>
          ) : currentScreen === 'profile' ? (
            <>
              <Header
                title={userProfile?.full_name || 'Loading...'}
                subtitle={userProfile?.phone_number || '+63 912 345 6789'}
                showProfilePicture
                userProfile={userProfile}
                onProfilePicturePress={handleProfilePicturePress}
              />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                <SectionCard title="Personal Information">
                  <Row label="Name" value={userProfile?.full_name || 'Loading...'} />
                  <Row label="Phone" value={userProfile?.phone_number || '+63 912 345 6789'} />
                  <Row label="Email" value={userProfile?.email || 'Loading...'} />
                </SectionCard>
                <SectionCard title="Saved Addresses">
                  <View style={{ gap: 12 }}>
                    {userAddresses.length > 0 ? (
                      userAddresses.map((address) => (
                        <TouchableOpacity
                          key={address.id}
                          onPress={() => openEditAddressModal(address)}
                          style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 12 }}
                        >
                          <AddressRow
                            label={address.address_name}
                            address={address.full_address}
                            isDefault={address.is_default}
                          />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Ionicons name="location" size={32} color="#d1d5db" />
                        <Text style={{ color: '#6b7280', marginTop: 8 }}>No saved addresses yet</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => setShowAddAddress(true)}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                      <Text style={styles.primaryText}>Add Address</Text>
                    </TouchableOpacity>
                  </View>
                </SectionCard>
                <SectionCard title="Payment Methods">
                  <View style={{ gap: 8 }}>
                    <PaymentRow label="Cash on Delivery" isDefault />
                    <PaymentRow label="GCash" details="**** 1234" disabled />
                    <PaymentRow label="QRPH" details="**** 5678" disabled />
                  </View>
                </SectionCard>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={openEditProfileModal}>
                    <Ionicons name="pencil" size={18} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setShowChangePassword(true)}>
                    <Ionicons name="lock-closed" size={18} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontWeight: '600' }}>Password</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setShowLogoutConfirm(true)}>
                    <Ionicons name="log-out" size={18} color="#dc2626" />
                    <Text style={{ color: '#dc2626', fontWeight: '600' }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <Header
                title="New Request"
                subtitle="Choose one"
                showNotifications
                onNotificationsPress={() => setShowNotifications(true)}
                notificationBadge={unreadNotificationCount > 0}
              >
                <ServiceSelector value={selectedService as any} onChange={(s) => setSelectedService(s)} />
              </Header>
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                {selectedService === 'delivery' && (
                  <SectionCard title="Locations" zIndex={3000}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, zIndex: 2000 }}>
                      <Ionicons name="location" size={20} color="#dc2626" style={{ marginTop: 18 }} />
                      <View style={{ flex: 1, zIndex: 2000 }}>
                        <AddressAutocomplete
                          placeholder="Pickup Location"
                          onAddressSelect={(address) => setPickupAddress(address)}
                          value={pickupAddress}
                          zIndex={2000}
                          isOpen={activeAutocomplete === 'pickup'}
                          onFocus={() => setActiveAutocomplete('pickup')}
                          onBlur={() => setActiveAutocomplete(null)}
                        />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 12, zIndex: 1000 }}>
                      <Ionicons name="location" size={20} color="#16a34a" style={{ marginTop: 18 }} />
                      <View style={{ flex: 1, zIndex: 1000 }}>
                        <AddressAutocomplete
                          placeholder="Delivery Location"
                          onAddressSelect={(address) => setDeliveryAddress(address)}
                          value={deliveryAddress}
                          zIndex={1000}
                          isOpen={activeAutocomplete === 'delivery'}
                          onFocus={() => setActiveAutocomplete('delivery')}
                          onBlur={() => setActiveAutocomplete(null)}
                        />
                      </View>
                    </View>
                  </SectionCard>
                )}
                {selectedService === 'tickets' ? (
                  <SectionCard title="Service Tickets">
                    {serviceTickets.length === 0 ? (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Ionicons name="ticket" size={32} color="#d1d5db" />
                        <Text style={{ color: '#6b7280', marginTop: 8 }}>No service tickets yet</Text>
                      </View>
                    ) : (
                      <View style={{ gap: 8 }}>
                        {serviceTickets.map((t) => (
                          <TouchableOpacity key={t.id} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }} onPress={() => { setSelectedTicket(t); setShowServiceTicketDetails(true); }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text style={{ fontWeight: '600', color: '#111827' }}>{t.title}</Text>
                              <View style={[{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }, t.priority === 'high' ? { backgroundColor: '#fed7aa' } : { backgroundColor: '#dbeafe' }]}>
                                <Text style={{ fontSize: 10, color: t.priority === 'high' ? '#b45309' : '#1e40af' }}>{t.priority.toUpperCase()}</Text>
                              </View>
                            </View>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>{t.description}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowCreateTicket(true)}>
                      <Ionicons name="add" size={18} color="#fff" />
                      <Text style={styles.primaryText}>New Ticket</Text>
                    </TouchableOpacity>
                  </SectionCard>
                ) : (
                  <SectionCard title={selectedService === 'delivery' ? 'Order Details' : 'Service Request'} zIndex={1}>
                    {selectedService === 'delivery' ? (
                      <>
                        <TextInput
                          placeholder="Item Description"
                          style={[styles.input, { height: 100 }]}
                          multiline
                          placeholderTextColor="#9ca3af"
                          value={itemDescription}
                          onChangeText={setItemDescription}
                        />
                        <TextInput
                          placeholder="Receiver Name"
                          style={styles.input}
                          placeholderTextColor="#9ca3af"
                          value={receiverName}
                          onChangeText={setReceiverName}
                        />
                        <View>
                          <TextInput
                            placeholder="Receiver Contact (+639XXXXXXXXX or 09XXXXXXXXX)"
                            style={[
                              styles.input,
                              receiverPhone.trim() !== '' && !isValidReceiverPhone && { borderColor: '#dc2626', borderWidth: 1 }
                            ]}
                            placeholderTextColor="#9ca3af"
                            value={receiverPhone}
                            onChangeText={setReceiverPhone}
                            keyboardType="phone-pad"
                          />
                          {receiverPhone.trim() !== '' && !isValidReceiverPhone && (
                            <Text style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                              Please enter a valid Philippine number (+639XXXXXXXXX or 09XXXXXXXXX)
                            </Text>
                          )}
                        </View>
                      </>
                    ) : (
                      <>
                        <TextInput placeholder="Describe the problem" style={[styles.input, { height: 120 }]} multiline placeholderTextColor="#9ca3af" />
                        <TextInput placeholder="Service Address" style={styles.input} placeholderTextColor="#9ca3af" />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <TextInput placeholder="Preferred Date" style={[styles.input, { flex: 1 }]} placeholderTextColor="#9ca3af" />
                          <TextInput placeholder="Preferred Time" style={[styles.input, { flex: 1 }]} placeholderTextColor="#9ca3af" />
                        </View>
                      </>
                    )}
                  </SectionCard>
                )}
                {selectedService === 'delivery' && (
                  <SectionCard title="Payment Method">
                    {['Cash', 'GCash', 'QRPH'].map((m) => {
                      const isDisabled = m === 'GCash' || m === 'QRPH';
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[styles.paymentRow, isDisabled && { opacity: 0.4 }]}
                          onPress={() => !isDisabled && setSelectedPaymentMethod(m.toLowerCase())}
                          disabled={isDisabled}
                        >
                          <View style={[styles.radio, selectedPaymentMethod === m.toLowerCase() ? { backgroundColor: '#dc2626' } : {}]} />
                          <Text style={{ fontWeight: '600', flex: 1 }}>{m}</Text>
                          {isDisabled && <Text style={{ fontSize: 12, color: '#6b7280' }}>(Coming Soon)</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </SectionCard>
                )}
                {selectedService === 'delivery' && (
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: '#dc2626' },
                      !isBookingEnabled && { opacity: 0.5 }
                    ]}
                    onPress={bookDelivery}
                    disabled={!isBookingEnabled}
                  >
                    <Text style={styles.primaryText}>
                      Book Delivery{showTotalAmount ? ` - ₱${totalAmount.toFixed(2)}` : ' - ₱0.00'}
                    </Text>
                  </TouchableOpacity>
                )}
                {selectedService === 'tickets' && (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowCreateTicket(true)}>
                    <Text style={styles.primaryText}>Create Ticket</Text>
                  </TouchableOpacity>
                )}
                {selectedService !== 'delivery' && selectedService !== 'tickets' && (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        setCurrentOrder({ id: 'SRV-001', item: selectedService === 'plumbing' ? 'Plumbing' : selectedService === 'aircon' ? 'Aircon Repair' : 'Electrician', receiver: 'Home Service', contact: '+1 234 567 8900', rider: 'Assigned Pro', total: 85 });
                        setCurrentScreen('home');
                      }, 1500);
                    }}
                  >
                    <Text style={styles.primaryText}>Book Service</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </>
          )}
        </>
      )}

      {/* Modals */}
      <Modal visible={showCompleteConfirmation} onClose={() => setShowCompleteConfirmation(false)} title={`Complete ${currentOrder ? 'Order' : 'Delivery'}?`}>
        <Text style={{ color: '#6b7280', marginBottom: 16 }}>Are you sure you want to {currentOrder ? 'mark this order as delivered' : 'complete this delivery'}?</Text>
        <View style={{ gap: 8 }}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#16a34a' }]} onPress={completeOrder}>
            <Text style={styles.primaryText}>Yes, Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCompleteConfirmation(false)}>
            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showRatingModal} onClose={closeRatingModal} title="Order Completed!">
        <View style={{ gap: 12, marginBottom: 16 }}>
          {/* Order Completion Message */}
          <View style={{ backgroundColor: '#dcfce7', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              <Text style={{ color: '#16a34a', fontWeight: '600', flex: 1 }}>
                Your order has been completed!
              </Text>
            </View>
          </View>

          {/* Rider Info */}
          {completedOrderRider && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Delivered by</Text>
              <Text style={{ fontWeight: '600', fontSize: 16 }}>{completedOrderRider.name}</Text>
              {completedOrderRider.vehicle_info && (
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{completedOrderRider.vehicle_info}</Text>
              )}
            </View>
          )}

          {/* Rating Section */}
          <Text style={{ color: '#6b7280', fontWeight: '500' }}>Rate your delivery experience</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setCurrentRating(star)}>
                <Ionicons name={star <= currentRating ? 'star' : 'star-outline'} size={36} color="#fbbf24" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment Input */}
          <TextInput
            placeholder="Share your experience (optional)"
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            placeholderTextColor="#9ca3af"
            value={ratingComment}
            onChangeText={setRatingComment}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#dc2626' }]}
            onPress={submitRating}
            disabled={!currentRating}
          >
            <Text style={styles.primaryText}>Submit Rating</Text>
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={closeRatingModal}
          >
            <Text style={{ color: '#6b7280', fontWeight: '600', textAlign: 'center' }}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Payment Method">
        <View style={{ gap: 12, marginBottom: 16 }}>
          {['Cash', 'GCash', 'QRPH'].map((m) => {
            const isDisabled = m === 'GCash' || m === 'QRPH';
            return (
              <TouchableOpacity
                key={m}
                style={[styles.paymentRow, { paddingVertical: 12, opacity: isDisabled ? 0.4 : 1 }]}
                onPress={() => !isDisabled && setSelectedPaymentMethod(m.toLowerCase())}
                disabled={isDisabled}
              >
                <View style={[styles.radio, selectedPaymentMethod === m.toLowerCase() ? { backgroundColor: '#dc2626' } : {}]} />
                <Text style={{ fontWeight: '600', flex: 1 }}>{m}</Text>
                {isDisabled && <Text style={{ fontSize: 12, color: '#6b7280' }}>(Coming Soon)</Text>}
              </TouchableOpacity>
            );
          })}
          <SectionCard>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Payment Summary</Text>
            <Row label="Base Amount" value={`₱${BASE_AMOUNT.toFixed(2)}`} />
            <Row label="Service Fee" value={`₱${SERVICE_FEE.toFixed(2)}`} />
            <Row label="Total Amount" value={`₱${totalAmount.toFixed(2)}`} valueTint="#dc2626" />
          </SectionCard>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: '#dc2626' },
              !isBookingEnabled && { opacity: 0.5 }
            ]}
            onPress={() => {
              setShowPaymentModal(false);
              bookDelivery();
            }}
            disabled={!isBookingEnabled}
          >
            <Text style={styles.primaryText}>
              Book Delivery{showTotalAmount ? ` - ₱${totalAmount.toFixed(2)}` : ' - ₱0.00'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showOrderTracking} onClose={() => setShowOrderTracking(false)} title="Track Your Order">
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: '#fee2e2', borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#111827' }}>Order #{currentOrder?.order_number || currentOrder?.id || 'ORD-001'}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Status: {currentOrder?.status || 'Pending'}</Text>
            {currentOrder?.rider_name && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="person" size={14} color="#dc2626" />
                <Text style={{ color: '#6b7280', fontSize: 12 }}>
                  Rider: {currentOrder.rider_name}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="navigate" size={14} color="#dc2626" />
              <Text style={{ color: '#6b7280', fontSize: 12 }}>
                {currentOrder?.rider_name ? 'Rider is on the way' : 'Looking for available rider...'}
              </Text>
            </View>
          </View>
          {[
            { title: 'Order Confirmed', completed: currentOrder?.status !== 'pending', icon: 'checkmark-circle' },
            { title: 'Rider Assigned', completed: deliveryStatus?.is_assigned || false, icon: 'person' },
            { title: 'Rider Accepted', completed: deliveryStatus?.is_accepted || false, icon: 'thumbs-up' },
            { title: 'Order Picked Up', completed: deliveryStatus?.is_picked_up || false, icon: 'cube' },
            { title: 'Delivered', completed: deliveryStatus?.is_completed || false, icon: 'checkmark-done-circle' },
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: step.completed ? '#16a34a' : '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
                {step.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ fontWeight: step.completed ? '600' : '400', color: step.completed ? '#111827' : '#6b7280' }}>{step.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </Modal>

      <Modal visible={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TextInput
            placeholder="Full Name"
            value={editProfileName}
            onChangeText={setEditProfileName}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Email"
            value={editProfileEmail}
            onChangeText={setEditProfileEmail}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateProfile}>
            <Text style={styles.primaryText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TextInput
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleChangePassword}>
            <Text style={styles.primaryText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Logout">
        <Text style={{ color: '#6b7280', marginBottom: 16 }}>Are you sure you want to logout?</Text>
        <View style={{ gap: 8 }}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
            <Text style={styles.primaryText}>Yes, Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowLogoutConfirm(false)}>
            <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showServiceTicketDetails} onClose={() => setShowServiceTicketDetails(false)} title={selectedTicket?.title}>
        {selectedTicket && (
          <View style={{ gap: 8 }}>
            <Row label="Status" value={selectedTicket.status.toUpperCase()} />
            <Row label="Priority" value={selectedTicket.priority.toUpperCase()} />
            <Row label="Description" value={selectedTicket.description} />
            <Row label="Location" value={selectedTicket.location} />
            {selectedTicket.assignedToName && <Row label="Assigned To" value={selectedTicket.assignedToName} />}
          </View>
        )}
      </Modal>

      <Modal visible={showCreateTicket} onClose={() => setShowCreateTicket(false)} title="Create Service Ticket">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TextInput placeholder="Title" style={styles.input} placeholderTextColor="#9ca3af" />
          <TextInput placeholder="Description" style={[styles.input, { height: 100 }]} multiline placeholderTextColor="#9ca3af" />
          <TextInput placeholder="Priority" style={styles.input} placeholderTextColor="#9ca3af" />
          <TextInput placeholder="Location" style={styles.input} placeholderTextColor="#9ca3af" />
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Create Ticket</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add Notifications Modal */}
      <Modal visible={showNotifications} onClose={() => setShowNotifications(false)}>
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllAsRead={async () => {
            if (currentUser?.id) {
              const success = await markAllNotificationsAsRead(currentUser.id);
              if (success) {
                // Update all notifications to mark as read in local state
                setNotifications((prev) =>
                  prev.map((notif) => ({ ...notif, is_read: true }))
                );
                // Update unread count to 0
                setUnreadNotificationCount(0);
                showToastMessage('All notifications marked as read', 'success');
              } else {
                showToastMessage('Failed to mark notifications as read', 'error');
              }
            }
          }}
        />
      </Modal>

      {/* Add Call Options Modal */}
      <Modal visible={showCallOptions} onClose={() => setShowCallOptions(false)}>
        <CallOptionsModal
          onClose={() => setShowCallOptions(false)}
          onViberPress={async () => {
            setShowCallOptions(false);

            // Clean phone number (remove spaces, dashes, etc.)
            const cleanNumber = callNumber.replace(/[\s\-\(\)]/g, '');

            // Viber deep link format: viber://contact?number={phone_number}
            const viberUrl = `viber://contact?number=${cleanNumber}`;

            try {
              const canOpen = await Linking.canOpenURL(viberUrl);
              if (canOpen) {
                await Linking.openURL(viberUrl);
                showToastMessage(`Opening Viber to call ${callNumber}`, 'info');
              } else {
                // Fallback: Open Viber app or show error
                const viberAppUrl = Platform.OS === 'ios'
                  ? 'viber://'
                  : 'viber://forward?text=';

                const canOpenApp = await Linking.canOpenURL(viberAppUrl);
                if (canOpenApp) {
                  await Linking.openURL(viberAppUrl);
                  showToastMessage('Viber opened. Please search for the contact manually.', 'info');
                } else {
                  showToastMessage('Viber is not installed on this device', 'error');
                }
              }
            } catch (error) {
              console.error('Error opening Viber:', error);
              showToastMessage('Failed to open Viber', 'error');
            }
          }}
          onPhonePress={async () => {
            setShowCallOptions(false);

            // Clean phone number
            const cleanNumber = callNumber.replace(/[\s\-\(\)]/g, '');

            // Phone dialer URL
            const phoneUrl = `tel:${cleanNumber}`;

            try {
              const canOpen = await Linking.canOpenURL(phoneUrl);
              if (canOpen) {
                await Linking.openURL(phoneUrl);
                showToastMessage(`Calling ${callNumber}...`, 'info');
              } else {
                showToastMessage('Unable to make phone calls on this device', 'error');
              }
            } catch (error) {
              console.error('Error making phone call:', error);
              showToastMessage('Failed to initiate call', 'error');
            }
          }}
        />
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilter} onClose={() => setShowFilter(false)}>
        <FilterModal
          onClose={() => setShowFilter(false)}
          onApply={handleFilterApply}
          onReset={handleResetFilters}
          currentFilters={activeFilters}
        />
      </Modal>

      {/* Help Modal */}
      <Modal visible={showHelp} onClose={() => setShowHelp(false)}>
        <HelpModal onClose={() => setShowHelp(false)} />
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} onClose={() => setShowSettings(false)}>
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onEditProfile={() => {
            setShowSettings(false);
            openEditProfileModal();
          }}
          onChangePassword={() => {
            setShowSettings(false);
            setShowChangePassword(true);
          }}
          onHelp={() => {
            setShowSettings(false);
            setShowHelp(true);
          }}
          onLogout={() => {
            setShowSettings(false);
            setShowLogoutConfirm(true);
          }}
        />
      </Modal>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        visible={showProfilePictureModal}
        onClose={() => setShowProfilePictureModal(false)}
        imageUrl={userProfile?.avatar_url}
        onReplace={handleProfilePictureUpload}
        isLoading={isUploadingProfilePicture}
      />

      {/* Share Modal */}
      <Modal visible={showShare} onClose={() => setShowShare(false)}>
        <ShareModal onClose={() => setShowShare(false)} orderNumber={currentOrder?.order_number || currentOrder?.id} />
      </Modal>

      {/* Finding Rider Modal - Only for customers */}
      {userType === 'customer' && (
        <Modal visible={showFindingRider} onClose={() => {}} title="Finding Rider">
          <View style={{ alignItems: 'center', gap: 16, paddingVertical: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="search" size={36} color="#dc2626" />
            </View>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' }}>
                Looking for available riders...
              </Text>
              <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                Please wait while we find the best rider for your delivery
              </Text>
            </View>
            <View style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 16, gap: 8 }}>
              <Row label="Order Number" value={currentOrder?.order_number || 'N/A'} />
              <Row label="Pickup" value={currentOrder?.pickup_address || 'N/A'} />
              <Row label="Delivery" value={currentOrder?.delivery_address || 'N/A'} />
              <Row label="Total Amount" value={`₱${(currentOrder?.total_amount || 0).toFixed(2)}`} valueTint="#dc2626" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#dc2626' }} />
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#fca5a5' }} />
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#fee2e2' }} />
            </View>

            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                📡 Waiting for rider to accept (real-time)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.secondaryBtn, { width: '100%', borderColor: '#dc2626' }]}
              onPress={cancelOrder}
              disabled={isLoading}
            >
              <Ionicons name="close-circle" size={18} color="#dc2626" />
              <Text style={{ color: '#dc2626', fontWeight: '600' }}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Add Address Modal */}
      <Modal visible={showAddAddress} onClose={() => setShowAddAddress(false)} title="Add New Address">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TextInput
            placeholder="Address Name (e.g., Home, Office)"
            style={styles.input}
            value={addressName}
            onChangeText={setAddressName}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Full Address"
            style={[styles.input, { height: 100 }]}
            value={fullAddress}
            onChangeText={setFullAddress}
            multiline
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}
            onPress={() => setIsDefaultAddress(!isDefaultAddress)}
          >
            <View style={[styles.checkbox, isDefaultAddress && { backgroundColor: '#dc2626' }]} />
            <Text style={{ color: '#111827', fontSize: 14 }}>Set as default address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddAddress}>
            <Text style={styles.primaryText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal visible={showEditAddress} onClose={() => setShowEditAddress(false)} title="Edit Address">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TextInput
            placeholder="Address Name (e.g., Home, Office)"
            style={styles.input}
            value={addressName}
            onChangeText={setAddressName}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Full Address"
            style={[styles.input, { height: 100 }]}
            value={fullAddress}
            onChangeText={setFullAddress}
            multiline
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}
            onPress={() => setIsDefaultAddress(!isDefaultAddress)}
          >
            <View style={[styles.checkbox, isDefaultAddress && { backgroundColor: '#dc2626' }]} />
            <Text style={{ color: '#111827', fontSize: 14 }}>Set as default address</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: '#dc2626' }]} onPress={handleUpdateAddress}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.primaryText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, backgroundColor: '#ef4444' }]}
              onPress={handleDeleteAddress}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.primaryText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Toast - positioned at top */}
      <Toast message={toastMessage} type={toastType} visible={showToast} onHide={() => setShowToast(false)} />

      {/* Overlays */}
      <BottomBar items={bottomItems} current={currentScreen} onChange={(k) => setCurrentScreen(k as Screen)} />
      {isLoading && !isBookingDelivery && <LoadingOverlay type="finding-rider" />}
      {isUploadingProfilePicture && <LoadingOverlay type="uploading-picture" />}
    </View>
  );
}

// Helper Components
function Row({ label, value, valueTint }: { label: string; value?: string; valueTint?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: '#6b7280' }}>{label}:</Text>
      <Text style={{ color: valueTint ?? '#111827', fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#dc2626' }}>{value}</Text>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function AddressRow({ label, address, isDefault }: { label: string; address: string; isDefault?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
      <Ionicons name="location" size={18} color={isDefault ? '#dc2626' : '#6b7280'} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontWeight: '600', color: '#111827' }}>{label}</Text>
          {isDefault && <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ fontSize: 10, color: '#dc2626', fontWeight: '600' }}>Default</Text></View>}
        </View>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>{address}</Text>
      </View>
    </View>
  );
}

function PaymentRow({ label, details, isDefault, disabled }: { label: string; details?: string; isDefault?: boolean; disabled?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8, opacity: disabled ? 0.4 : 1 }}>
      <Ionicons name="card" size={18} color={isDefault ? '#dc2626' : '#6b7280'} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontWeight: '600', color: '#111827' }}>{label}</Text>
          {isDefault && <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '600' }}>Default</Text></View>}
          {disabled && <Text style={{ fontSize: 12, color: '#6b7280' }}>(Coming Soon)</Text>}
        </View>
        {details && <Text style={{ color: '#6b7280', fontSize: 12 }}>{details}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#111827', fontSize: 14 },
  underlinedInput: { borderBottomWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, color: '#111827', fontSize: 14 },
  primaryBtn: { backgroundColor: '#dc2626', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  secondaryText: { color: '#6b7280', fontWeight: '600' },
  segment: { flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  segmentActive: { backgroundColor: '#fee2e2' },
  segmentText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
  segmentTextActive: { color: '#dc2626' },
  sectionTitle: { fontWeight: '600', color: '#111827', marginBottom: 8, fontSize: 14 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12 },
  radio: { width: 16, height: 16, borderRadius: 999, borderWidth: 2, borderColor: '#e5e7eb' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#e5e7eb' },
  otpInput: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 12, textAlign: 'center', fontWeight: '600', color: '#111827', fontSize: 18 },
  trackOrderBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  callRiderBtn: { backgroundColor: '#4b5563', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 4, textAlign: 'center' },
  // History card styles
  metaLabel: { color: '#6b7280', fontSize: 12 },
  orderIdText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { color: '#065f46', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  riderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fbe9ea', borderRadius: 12, padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 999, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  rowInline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotRed: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#ef4444' },
  dotGreen: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#10b981' },
  dotGray: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#9ca3af' },
});
