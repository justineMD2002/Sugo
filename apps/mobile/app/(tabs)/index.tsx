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
import { getCurrentUser, signInUserWithPhone, signOutUser, SignUpData, signUpUser } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'rider', text: 'Hello! I have picked up your order.', time: '2:30 PM' },
    { id: 2, sender: 'rider', text: 'On my way to delivery location.', time: '2:31 PM' },
    { id: 3, sender: 'customer', text: 'Thank you! How long will it take?', time: '2:32 PM' },
    { id: 4, sender: 'rider', text: 'Around 10-15 minutes. Traffic is light.', time: '2:33 PM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

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

  // Add callOptions state
  const [callNumber, setCallNumber] = useState<string>("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: userType === 'customer' ? 'customer' : 'rider',
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
    setNewMessage('');
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

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Check for existing session on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          // User is already logged in
          setCurrentUser(user);

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

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      showToastMessage('Please enter a valid email address', 'error');
      return;
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
      
      if (result.success) {
        // Clear form fields
        setSignupFullName('');
        setSignupEmail('');
        setSignupPhoneNumber('');
        setSignupPassword('');
        setSignupConfirmPassword('');

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

      if (result.success) {
        // Store the authenticated user
        setCurrentUser(result.user);

        // Clear form fields
        setLoginPhoneNumber('');
        setLoginPassword('');
        setEmailNotConfirmed(false);

        showToastMessage('Login successful!', 'success');
        // Navigate to home screen immediately
        setCurrentScreen('home');
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
        // Close the logout confirmation modal
        setShowLogoutConfirm(false);

        // Clear any user-related state
        setCurrentUser(null);
        setCurrentOrder(null);
        setCurrentDelivery(null);
        setMessages([]);

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
                <TextInput
                  placeholder="Vehicle Brand and Model"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  editable={!isLoading}
                />
                <TextInput
                  placeholder="Vehicle Color"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  editable={!isLoading}
                />
                <TextInput
                  placeholder="Plate Number"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
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
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {userType === 'rider' ? (
        <>
          {currentDelivery ? (
            <>
              <Header title="Current Delivery" subtitle={`Order #${currentDelivery.id} - In Progress`} />
              <View style={{ flex: 1, padding: 16, gap: 12 }}>
                <SectionCard title="Delivery Details">
                  <Row label="Customer" value={currentDelivery.customer} />
                  <Row label="Phone" value={currentDelivery.phone} />
                  <Row label="Pickup" value={currentDelivery.pickup} />
                  <Row label="Drop-off" value={currentDelivery.dropoff} />
                  <Row label="Fee" value={currentDelivery.fee} valueTint="#dc2626" />
                </SectionCard>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Chat with Customer</Text>
                  <Chat messages={messages} input={newMessage} onChangeInput={setNewMessage} onSend={sendMessage} alignRightFor="rider" />
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
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
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
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
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
              <Header title="Mark Rider" subtitle="+63 912 345 6789" />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <SectionCard title="Rider Stats">
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Stat value="487" label="Total Deliveries" />
                    <Stat value="98%" label="Success Rate" />
                  </View>
                </SectionCard>
                <SectionCard title="Personal Information">
                  <Row label="Name" value="Mark Rider" />
                  <Row label="Phone" value="+63 912 345 6789" />
                  <Row label="Email" value="mark.rider@email.com" />
                  <Row label="Vehicle" value="Motorcycle - ABC 1234" />
                </SectionCard>
                <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#dc2626' }]} onPress={() => setShowEditProfile(true)}>
                  <Text style={{ color: '#dc2626', fontWeight: '600' }}>Edit Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          ) : (
            <>
              <Header 
                title="Good Day, Mark!" 
                subtitle={`Ready for ${workerService === 'delivery' ? 'deliveries' : 'jobs'}?`}
                showSearch
                showNotifications
                showSettings
                onSearchPress={() => setShowSearch(true)}
                onNotificationsPress={() => setShowNotifications(true)}
                onSettingsPress={() => setShowSettings(true)}
                notificationBadge
              />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                {[{ id: 'DLV-2848', pickup: 'SM City Cebu', dropoff: 'IT Park', fee: '₱95' }, { id: 'DLV-2849', pickup: 'Ayala Center', dropoff: 'Capitol Site', fee: '₱75' }].map((order) => (
                  <SectionCard key={order.id}>
                    <Row label="Order ID" value={order.id} />
                    {workerService === 'delivery' ? (
                      <>
                        <Row label="Pickup" value={order.pickup} />
                        <Row label="Drop-off" value={order.dropoff} />
                      </>
                    ) : (
                      <Row label="Job" value={workerService === 'plumbing' ? 'Plumbing' : workerService === 'aircon' ? 'Aircon Repair' : 'Electrician'} />
                    )}
                    <Row label="Fee" value={order.fee} valueTint="#dc2626" />
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                      if (workerService === 'delivery') {
                        setCurrentDelivery({ id: order.id, customer: 'John Doe', phone: '+1 234 567 8900', pickup: order.pickup, dropoff: order.dropoff, fee: order.fee });
                      } else {
                        setCurrentDelivery({ id: order.id.replace('DLV', 'SRV'), customer: 'Homeowner', phone: '+1 234 567 8900', dropoff: 'Cebu City', fee: order.fee });
                      }
                      setCurrentScreen('home');
                    }}>
                      <Text style={styles.primaryText}>{workerService === 'delivery' ? 'Accept Order' : 'Accept Job'}</Text>
                    </TouchableOpacity>
                  </SectionCard>
                ))}
              </ScrollView>
            </>
          )}
        </>
      ) : (
        <>
          {currentOrder ? (
            <>
              <Header title="Current Order" subtitle={`Order #${currentOrder.id} - In Progress`} />
              <View style={{ flex: 1, padding: 16, gap: 12 }}>
                <SectionCard title="Order Details">
                  <Row label="Item" value={currentOrder.item} />
                  <Row label="Receiver" value={currentOrder.receiver} />
                  <Row label="Contact" value={currentOrder.contact} />
                  <Row label="Rider" value={currentOrder.rider} />
                  <Row label="Total" value={`₱${currentOrder.total || 85}.00`} valueTint="#dc2626" />
                </SectionCard>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Chat with Rider</Text>
                  <Chat messages={messages} input={newMessage} onChangeInput={setNewMessage} onSend={sendMessage} alignRightFor="customer" />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity 
                    style={[styles.trackOrderBtn, { flex: 1 }]} 
                    onPress={() => setShowOrderTracking(true)}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.primaryText}>Track Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.callRiderBtn, { flex: 1 }]}
                    onPress={() => {
                      setCallNumber(currentOrder?.contact || "+63 000 000 0000");
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
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
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
              <Header title="Juan Dela Cruz" subtitle="+63 912 345 6789" />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <SectionCard title="Personal Information">
                  <Row label="Name" value="Juan Dela Cruz" />
                  <Row label="Phone" value="+63 912 345 6789" />
                  <Row label="Email" value="juan@email.com" />
                </SectionCard>
                <SectionCard title="Saved Addresses">
                  <View style={{ gap: 12 }}>
                    <AddressRow label="Home" address="123 Main Street, Barangay Lahug" isDefault />
                    <AddressRow label="Office" address="456 IT Park, Cebu Business Park" />
                  </View>
                </SectionCard>
                <SectionCard title="Payment Methods">
                  <View style={{ gap: 8 }}>
                    <PaymentRow label="Cash on Delivery" isDefault />
                    <PaymentRow label="GCash" details="**** 1234" />
                    <PaymentRow label="QRPH" details="**** 5678" />
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
                showSearch
                showNotifications
                showSettings
                onSearchPress={() => setShowSearch(true)}
                onNotificationsPress={() => setShowNotifications(true)}
                onSettingsPress={() => setShowSettings(true)}
                notificationBadge
              />
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <SectionCard title="Services">
                  <ServiceSelector value={selectedService as any} onChange={(s) => setSelectedService(s)} />
                </SectionCard>
                {selectedService === 'delivery' && (
                  <SectionCard title="Locations">
                    <TextInput placeholder="Pickup Location" style={styles.underlinedInput} placeholderTextColor="#9ca3af" />
                    <TextInput placeholder="Delivery Location" style={styles.underlinedInput} placeholderTextColor="#9ca3af" />
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
                        <TextInput placeholder="Item Description" style={[styles.input, { height: 100 }]} multiline placeholderTextColor="#9ca3af" />
                        <TextInput placeholder="Receiver Name" style={styles.input} placeholderTextColor="#9ca3af" />
                        <TextInput placeholder="Receiver Contact" style={styles.input} placeholderTextColor="#9ca3af" />
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
                    {['Cash', 'GCash', 'QRPH'].map((m) => (
                      <TouchableOpacity key={m} style={styles.paymentRow} onPress={() => setSelectedPaymentMethod(m.toLowerCase())}>
                        <View style={[styles.radio, selectedPaymentMethod === m.toLowerCase() ? { backgroundColor: '#dc2626' } : {}]} />
                        <Text style={{ fontWeight: '600' }}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </SectionCard>
                )}
                <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    if (selectedService === 'delivery') {
                      setCurrentOrder({ id: 'ORD-001', item: 'Delivery', receiver: 'John Doe', contact: '+1 234 567 8900', rider: 'Mike Johnson', total: 85 });
                    } else if (selectedService === 'tickets') {
                      setShowCreateTicket(true);
                    } else {
                      setCurrentOrder({ id: 'SRV-001', item: selectedService === 'plumbing' ? 'Plumbing' : selectedService === 'aircon' ? 'Aircon Repair' : 'Electrician', receiver: 'Home Service', contact: '+1 234 567 8900', rider: 'Assigned Pro', total: 85 });
                    }
                    setCurrentScreen('home');
                  }, 1500);
                }}>
                  <Text style={styles.primaryText}>{selectedService === 'delivery' ? 'Book Delivery - ₱85.00' : selectedService === 'tickets' ? 'Create Ticket' : 'Book Service'}</Text>
                </TouchableOpacity>
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
          {['Cash', 'GCash', 'QRPH'].map((m) => (
            <TouchableOpacity key={m} style={[styles.paymentRow, { paddingVertical: 12 }]} onPress={() => setSelectedPaymentMethod(m.toLowerCase())}>
              <View style={[styles.radio, selectedPaymentMethod === m.toLowerCase() ? { backgroundColor: '#dc2626' } : {}]} />
              <Text style={{ fontWeight: '600', flex: 1 }}>{m}</Text>
            </TouchableOpacity>
          ))}
          <SectionCard>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Payment Summary</Text>
            <Row label="Base Amount" value="₱80.00" />
            <Row label="Service Fee" value="₱5.00" />
            <Row label="Total Amount" value="₱85.00" valueTint="#dc2626" />
          </SectionCard>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowPaymentModal(false)}>
            <Text style={styles.primaryText}>{selectedPaymentMethod === 'cash' ? 'Place Order' : 'Pay Now'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showOrderTracking} onClose={() => setShowOrderTracking(false)} title="Track Your Order">
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: '#fee2e2', borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: '600', color: '#111827' }}>Order #{currentOrder?.id || 'ORD-001'}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Estimated arrival: 15 mins</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="navigate" size={14} color="#dc2626" />
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Rider is on the way</Text>
            </View>
          </View>
          {[
            { title: 'Order Confirmed', completed: true },
            { title: 'Preparing Order', completed: true },
            { title: 'Order Picked Up', completed: true },
            { title: 'Out for Delivery', completed: false },
            { title: 'Delivered', completed: false },
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
          <TextInput placeholder="Full Name" defaultValue={userType === 'rider' ? 'Mark Rider' : 'Juan Dela Cruz'} style={styles.input} placeholderTextColor="#9ca3af" />
          <TextInput placeholder="Phone" defaultValue="+63 912 345 6789" style={styles.input} placeholderTextColor="#9ca3af" />
          <TextInput placeholder="Email" defaultValue={userType === 'rider' ? 'mark@email.com' : 'juan@email.com'} style={styles.input} placeholderTextColor="#9ca3af" />
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
        <ShareModal onClose={() => setShowShare(false)} orderNumber={currentOrder?.id} />
      </Modal>

      {/* Toast - positioned at top */}
      <Toast message={toastMessage} type={toastType} visible={showToast} onHide={() => setShowToast(false)} />

      {/* Overlays */}
      <BottomBar items={bottomItems} current={currentScreen} onChange={(k) => setCurrentScreen(k as Screen)} />
      {isLoading && <LoadingOverlay />}
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

function PaymentRow({ label, details, isDefault }: { label: string; details?: string; isDefault?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
      <Ionicons name="card" size={18} color={isDefault ? '#dc2626' : '#6b7280'} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontWeight: '600', color: '#111827' }}>{label}</Text>
          {isDefault && <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '600' }}>Default</Text></View>}
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
