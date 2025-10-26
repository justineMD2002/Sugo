import BottomBar from '@/components/sugo/BottomBar';
import CallOptionsModal from '@/components/sugo/CallOptionsModal';
import Chat, { ChatMessage } from '@/components/sugo/Chat';
import FilterModal from '@/components/sugo/FilterModal';
import Header from '@/components/sugo/Header';
import HelpModal from '@/components/sugo/HelpModal';
import LoadingOverlay from '@/components/sugo/LoadingOverlay';
import Modal from '@/components/sugo/Modal';
import NotificationsModal from '@/components/sugo/NotificationsModal';
import SearchModal from '@/components/sugo/SearchModal';
import SectionCard from '@/components/sugo/SectionCard';
import ServiceSelector from '@/components/sugo/ServiceSelector';
import SettingsModal from '@/components/sugo/SettingsModal';
import ShareModal from '@/components/sugo/ShareModal';
import SplashScreen from '@/components/sugo/SplashScreen';
import Toast from '@/components/sugo/Toast';
import { getCurrentUser, signInUserWithPhone, signOutUser, SignUpData, signUpUser, getUserProfile, UserProfile, getUserAddresses, Address } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useOrderPolling } from '@/hooks/use-order-polling';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [userType, setUserType] = useState<UserType>('customer');
  const [selectedService, setSelectedService] = useState<Service>('delivery');
  const [workerService, setWorkerService] = useState<Service>('delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showFindingRider, setShowFindingRider] = useState(false);
  const [isBookingDelivery, setIsBookingDelivery] = useState(false);

  // OTP and Auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(300);

  // Login form states
  const [loginPhoneNumber, setLoginPhoneNumber] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

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

    console.log('✅✅✅ Customer redirected to current order page ✅✅✅');
  }, []);

  // Callback when delivery is updated
  const handleDeliveryUpdate = useCallback((delivery: any) => {
    console.log('📦 Delivery updated:', delivery);
    setDeliveryStatus(delivery);
  }, []);

  // Callback when order is updated
  const handleOrderUpdate = useCallback((order: any) => {
    console.log('🔄 Order updated:', order);
    setCurrentOrder((prevOrder: any) => ({
      ...prevOrder,
      ...order,
    }));
  }, []);

  // Log hook parameters for debugging
  console.log('🔍 Polling Hook Parameters:', {
    orderId: currentOrder?.id,
    userId: currentUser?.id,
    userType: userType,
    enabled: !!currentOrder?.id && !!currentUser?.id,
  });

  // Use POLLING instead of real-time (since Supabase real-time is not available)
  // Checks database every 3 seconds for delivery updates
  const { triggerCheck, isPolling } = useOrderPolling({
    orderId: currentOrder?.id || null,
    userId: currentUser?.id || null,
    userType: userType,
    onRiderAccepted: handleRiderAccepted,
    onDeliveryUpdate: handleDeliveryUpdate,
    enabled: !!currentOrder?.id && !!currentUser?.id,
    pollInterval: 3000, // Check every 3 seconds
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentOrder || isSendingMessage) return;

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
      const messageData = {
        order_id: currentOrder.id,
        sender_id: currentUser.id,
        receiver_id: currentOrder.rider_id || null, // Will be null if rider not assigned yet
        message_text: messageText,
        message_type: 'text',
        is_read: false,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);

        // Remove optimistic message and show error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        showToastMessage('Failed to send message. Please try again.', 'error');

        // Restore the message in input so user can retry
        setNewMessage(messageText);
        setIsSendingMessage(false);
        return;
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
  const fetchPendingOrders = async () => {
    // Clear existing orders first
    setPendingOrders([]);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .eq('service_type', workerService)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending orders:', error);
        return;
      }

      setPendingOrders(data || []);
    } catch (error) {
      console.error('Unexpected error fetching pending orders:', error);
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
      setCurrentDelivery({
        ...deliveryRecord,
        order: order,
      });

      showToastMessage('Order accepted successfully!', 'success');
      setCurrentScreen('home');
    } catch (error) {
      console.error('❌ Unexpected error in acceptOrder:', error);
      showToastMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrder = () => {
    if (currentOrder) {
      setCurrentOrder(null);
      setCurrentScreen(userType === 'rider' ? 'deliveries' : 'orders');
      if (userType === 'customer') setShowRatingModal(true);
    }
    if (currentDelivery) {
      setCurrentDelivery(null);
      setCurrentScreen(userType === 'rider' ? 'deliveries' : 'orders');
    }
    setShowCompleteConfirmation(false);
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

      // Clear current order
      setCurrentOrder(null);

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

  // Real-time subscription for messages only
  // (Delivery and order updates are handled by useOrderRealtime hook)
  useEffect(() => {
    if (!currentOrder?.id) {
      console.log('⚠️ No current order, skipping message subscription');
      return;
    }

    console.log('💬 Setting up real-time message subscription for order:', currentOrder.id);

    // Load initial messages
    loadMessages(currentOrder.id);

    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel(`messages-${currentOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${currentOrder.id}`,
        },
        (payload) => {
          console.log('💬 New message received:', payload);

          // Add new message to the list
          const newMsg = payload.new as any;
          const transformedMsg: ChatMessage = {
            id: newMsg.id,
            sender: newMsg.sender_id === currentUser?.id ? userType : (userType === 'customer' ? 'rider' : 'customer'),
            text: newMsg.message_text,
            time: new Date(newMsg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, transformedMsg]);
        }
      )
      .subscribe((status) => {
        console.log('💬 Messages channel status:', status);
      });

    console.log('✅ Message subscription initiated for order:', currentOrder.id);

    // Cleanup subscription on unmount or when order changes
    return () => {
      console.log('🔌 Cleaning up message subscription for order:', currentOrder.id);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentOrder?.id, currentUser?.id, userType]);

  // Fetch pending orders when rider is on home screen
  useEffect(() => {
    if (userType === 'rider' && currentScreen === 'home' && currentUser && !currentDelivery) {
      fetchPendingOrders();

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

            // Only add if it matches the rider's service type
            if (newOrder.service_type === workerService) {
              setPendingOrders((prev) => [newOrder, ...prev]);
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
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [userType, currentScreen, currentUser, workerService, currentDelivery]);

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
        console.log('Setting userType to:', userProfile.user_type);

        // Now set all state together - React will batch these updates
        setCurrentUser(result.user);
        setUserType(userProfile.user_type as UserType);

        console.log('User type set! Navigating to home...');

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
        setShowSearch(false);
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
              <View style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cube" size={36} color="#dc2626" />
              </View>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#dc2626' }}>SUGO</Text>
              <Text style={{ color: '#6b7280' }}>Log in with Phone Number</Text>
            </View>
            <View style={{ gap: 12 }}>
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={loginPhoneNumber}
                onChangeText={setLoginPhoneNumber}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
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
                <Text style={{ color: '#dc2626', fontWeight: '600', opacity: isLoading ? 0.4 : 1 }}>Don't have an account? Sign up</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, opacity: isLoading ? 0.4 : 1 }}>
              <TouchableOpacity
                style={[styles.segment, userType === 'customer' ? styles.segmentActive : undefined]}
                onPress={() => setUserType('customer')}
                disabled={isLoading}
              >
                <Text style={[styles.segmentText, userType === 'customer' ? styles.segmentTextActive : undefined]}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, userType === 'rider' ? styles.segmentActive : undefined]}
                onPress={() => setUserType('rider')}
                disabled={isLoading}
              >
                <Text style={[styles.segmentText, userType === 'rider' ? styles.segmentTextActive : undefined]}>Worker</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 }}>Create Account</Text>
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
              <Header title="Current Delivery" subtitle={`Order #${currentDelivery.id} - In Progress`} />
              <View style={{ flex: 1, padding: 16, gap: 12 }}>
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
                  <Text style={styles.sectionTitle}>Chat with Customer</Text>
                  <Chat messages={messages} input={newMessage} onChangeInput={setNewMessage} onSend={sendMessage} alignRightFor="rider" disabled={isSendingMessage} />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: '#16a34a' }]}>
                    <Ionicons name="call" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: '#16a34a' }]} onPress={() => setShowCompleteConfirmation(true)}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : currentScreen === 'deliveries' ? (
            <>
              <Header title={`Past ${workerService === 'delivery' ? 'Deliveries' : 'Jobs'}`} subtitle={`Your ${workerService === 'delivery' ? 'delivery' : 'service'} history`} />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                {[1, 2, 3].map((i) => (
                  <SectionCard key={i}>
                    <Row label="Order ID" value={`DLV-28${40 + i}`} />
                    <Row label="Status" value="Completed" valueTint="#16a34a" />
                    <Row label="Customer" value="John Doe" />
                    {workerService === 'delivery' && (
                      <>
                        <Row label="Pickup" value="Ayala Center" />
                        <Row label="Drop-off" value="IT Park" />
                      </>
                    )}
                    <Row label="Earnings" value="₱95" valueTint="#dc2626" />
                  </SectionCard>
                ))}
              </ScrollView>
            </>
          ) : currentScreen === 'earnings' ? (
            <>
              <Header title="Earnings" />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                <SectionCard>
                  <Text style={{ color: '#6b7280', marginBottom: 4 }}>Total Earnings Today</Text>
                  <Text style={{ fontSize: 32, fontWeight: '800' }}>₱1,240.00</Text>
                </SectionCard>
                {[{ date: 'Today', deliveries: 12, amount: '₱1,240' }, { date: 'Yesterday', deliveries: 15, amount: '₱1,680' }].map((d, idx) => (
                  <SectionCard key={idx}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={{ fontWeight: '600' }}>{d.date}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 12 }}>{d.deliveries} deliveries</Text>
                      </View>
                      <Text style={{ fontWeight: '800', color: '#dc2626' }}>{d.amount}</Text>
                    </View>
                  </SectionCard>
                ))}
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryText}>Cash Out Earnings</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          ) : currentScreen === 'profile' ? (
            <>
              <Header title={currentUser?.user_metadata?.full_name || "Rider Profile"} subtitle={currentUser?.phone || currentUser?.email || ""} />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                <SectionCard title="Rider Stats">
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Stat value="487" label="Total Deliveries" />
                    <Stat value="98%" label="Success Rate" />
                  </View>
                </SectionCard>
                <SectionCard title="Personal Information">
                  <Row label="Name" value={currentUser?.user_metadata?.full_name || "N/A"} />
                  <Row label="Phone" value={currentUser?.phone || currentUser?.user_metadata?.phone_number || "N/A"} />
                  <Row label="Email" value={currentUser?.email || "N/A"} />
                  <Row label="Vehicle" value={vehicleBrand && plateNumber ? `${vehicleBrand} - ${plateNumber}` : "Not set"} />
                </SectionCard>
                <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#dc2626' }]} onPress={() => setShowEditProfile(true)}>
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
                  onPress={fetchPendingOrders}
                >
                  <Ionicons name="refresh" size={20} color="#dc2626" />
                  <Text style={{ color: '#dc2626', fontWeight: '600' }}>Refresh Orders</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                {pendingOrders.length === 0 ? (
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
              <View style={{ flex: 1, padding: 16, gap: 12 }}>
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
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#16a34a' }]} onPress={() => setShowCompleteConfirmation(true)}>
                  <Text style={styles.primaryText}>Mark as Delivered</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : currentScreen === 'orders' ? (
            <>
              <Header
                title="Past Orders"
                subtitle="Your delivery history"
                showSearch
                showSettings
                onSearchPress={() => setShowSearch(true)}
                onSettingsPress={() => setShowFilter(true)}
              />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                {[{ id: 'DLV-2846', rider: 'John Driver', rating: '4.9', phone: '0923 456 7890', from: 'Ayala Center', to: 'Banilad', status: 'Completed' }].map((o) => (
                  <SectionCard key={o.id}>
                    <Row label="Order ID" value={o.id} />
                    <Row label="Status" value={o.status} valueTint="#16a34a" />
                    <Row label="Rider" value={`${o.rider} • ${o.phone}`} />
                    <Row label="From" value={o.from} />
                    <Row label="To" value={o.to} />
                    <TouchableOpacity style={styles.secondaryBtn}>
                      <Ionicons name="chatbubble" size={18} color="#16a34a" />
                      <Text style={styles.secondaryText}>Chat</Text>
                    </TouchableOpacity>
                  </SectionCard>
                ))}
              </ScrollView>
            </>
          ) : currentScreen === 'profile' ? (
            <>
              <Header
                title={userProfile?.full_name || 'Loading...'}
                subtitle={userProfile?.phone_number || '+63 912 345 6789'}
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
                        <AddressRow
                          key={address.id}
                          label={address.address_name}
                          address={address.full_address}
                          isDefault={address.is_default}
                        />
                      ))
                    ) : (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Ionicons name="location" size={32} color="#d1d5db" />
                        <Text style={{ color: '#6b7280', marginTop: 8 }}>No saved addresses yet</Text>
                      </View>
                    )}
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
                  <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => setShowEditProfile(true)}>
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
                notificationBadge
              >
                <ServiceSelector value={selectedService as any} onChange={(s) => setSelectedService(s)} />
              </Header>
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
                {selectedService === 'delivery' && (
                  <SectionCard title="Locations">
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Ionicons name="location" size={20} color="#dc2626" />
                      <TextInput
                        placeholder="Pickup Location"
                        style={[styles.underlinedInput, { flex: 1 }]}
                        placeholderTextColor="#9ca3af"
                        value={pickupAddress}
                        onChangeText={setPickupAddress}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Ionicons name="location" size={20} color="#16a34a" />
                      <TextInput
                        placeholder="Delivery Location"
                        style={[styles.underlinedInput, { flex: 1 }]}
                        placeholderTextColor="#9ca3af"
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                      />
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
                  <SectionCard title={selectedService === 'delivery' ? 'Order Details' : 'Service Request'}>
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

      <Modal visible={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Your Experience">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <Text style={{ color: '#6b7280' }}>How was your {currentOrder ? 'delivery' : 'service'} experience?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setCurrentRating(star)}>
                <Ionicons name={star <= currentRating ? 'star' : 'star-outline'} size={32} color="#fbbf24" />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Comments (optional)" style={[styles.input, { height: 80 }]} multiline placeholderTextColor="#9ca3af" value={ratingComment} onChangeText={setRatingComment} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => { setShowRatingModal(false); setCurrentRating(0); setRatingComment(''); }}>
            <Text style={styles.primaryText}>Submit Rating</Text>
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
            defaultValue={userProfile?.full_name || ''}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Phone"
            defaultValue={userProfile?.phone_number || ''}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            placeholder="Email"
            defaultValue={userProfile?.email || ''}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TextInput placeholder="Current Password" secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
          <TextInput placeholder="New Password" secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
          <TextInput placeholder="Confirm New Password" secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
          <TouchableOpacity style={styles.primaryBtn}>
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
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      </Modal>

      {/* Add Call Options Modal */}
      <Modal visible={showCallOptions} onClose={() => setShowCallOptions(false)}>
        <CallOptionsModal 
          onClose={() => setShowCallOptions(false)}
          onViberPress={() => { 
            setShowCallOptions(false); 
            showToastMessage(`Calling ${callNumber} via Viber...`, 'info');
          }}
          onPhonePress={() => { 
            setShowCallOptions(false); 
            showToastMessage(`Calling ${callNumber}...`, 'info');
          }}
        />
      </Modal>

      {/* Search Modal */}
      <Modal visible={showSearch} onClose={() => setShowSearch(false)}>
        <SearchModal onClose={() => setShowSearch(false)} />
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilter} onClose={() => setShowFilter(false)}>
        <FilterModal onClose={() => setShowFilter(false)} />
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
            setShowEditProfile(true);
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
                {isPolling ? '🔄 Auto-checking every 3 seconds...' : '⏸️ Polling paused'}
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

      {/* Toast - positioned at top */}
      <Toast message={toastMessage} type={toastType} visible={showToast} onHide={() => setShowToast(false)} />

      {/* Overlays */}
      <BottomBar items={bottomItems} current={currentScreen} onChange={(k) => setCurrentScreen(k as Screen)} />
      {isLoading && !isBookingDelivery && <LoadingOverlay />}
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
  otpInput: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 12, textAlign: 'center', fontWeight: '600', color: '#111827', fontSize: 18 },
  trackOrderBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  callRiderBtn: { backgroundColor: '#4b5563', borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 4, textAlign: 'center' },
});
