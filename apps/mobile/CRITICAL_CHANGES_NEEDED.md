# Critical Changes Needed for Web Version Parity

## 1. Update Home Screen Header (Customer - Default View)
**Add these imports at top:**
```typescript
import CallOptionsModal from '@/components/sugo/CallOptionsModal';
```

**Add state:**
```typescript
const [showCallOptions, setShowCallOptions] = useState(false);
const [callNumber, setCallNumber] = useState<string>("");
```

**In Header for default customer home, pass:**
```typescript
<Header 
  title="New Request"
  showSearch
  showNotifications
  showSettings
  onSearchPress={() => {/* TODO: show search modal */}}
  onNotificationsPress={() => setShowNotifications(true)}
  onSettingsPress={() => setShowSettings(true)}
  notificationBadge
/>
```

## 2. Fix Customer Order View - Action Buttons
**CURRENT CODE (WRONG):**
```
<View style={{ flexDirection: 'row', gap: 12 }}>
  <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={() => setShowOrderTracking(true)}>
    <Ionicons name="navigate" size={18} color="#fff" />
  </TouchableOpacity>
  <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]}>
    <Ionicons name="call" size={18} color="#fff" />
  </TouchableOpacity>
</View>
```

**SHOULD BE (WEB VERSION):**
```
<View style={{ flexDirection: 'row', gap: 12 }}>
  <TouchableOpacity 
    style={[styles.primaryBtn, { flex: 1, backgroundColor: '#2563eb', flexDirection: 'row', gap: 8 }]} 
    onPress={() => setShowOrderTracking(true)}
  >
    <Ionicons name="navigate" size={16} color="#fff" />
    <Text style={styles.primaryText}>Track Order</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.primaryBtn, { flex: 1, backgroundColor: '#4b5563', flexDirection: 'row', gap: 8 }]}
    onPress={() => {
      setCallNumber(currentOrder?.contact || "+63 000 000 0000");
      setShowCallOptions(true);
    }}
  >
    <Ionicons name="call" size={16} color="#fff" />
    <Text style={styles.primaryText}>Call Rider</Text>
  </TouchableOpacity>
</View>
```

## 3. Fix Header Component
**Update Header.tsx to have consistent icon buttons:**
```typescript
// Add props
showSearch?: boolean;
showNotifications?: boolean;
showSettings?: boolean;
onSearchPress?: () => void;
onNotificationsPress?: () => void;
onSettingsPress?: () => void;
notificationBadge?: boolean;

// Render in right section only when these props are true
```

## 4. Add Call Options Modal
**Already created in CallOptionsModal.tsx**
**Add to main render:**
```typescript
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
```

## 5. Update ServiceSelector
**Already correct but verify:**
- 4 columns: Delivery (red), Services/Tickets (blue), Aircon (disabled gray), Electrician (disabled gray)
- Icons visible and colored correctly
- Selected items have ring-2 outline

## 6. Update Button Styles in StyleSheet
```typescript
const styles = StyleSheet.create({
  // ... existing ...
  
  primaryBtn: { 
    backgroundColor: '#dc2626', 
    borderRadius: 12, 
    paddingVertical: 12, 
    alignItems: 'center',
    flexDirection: 'row',  // IMPORTANT: add this
    justifyContent: 'center',
    gap: 8  // IMPORTANT: add this
  },
  primaryText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  
  // Add track order specific style
  trackOrderBtn: {
    backgroundColor: '#2563eb',
  },
  
  // Add call rider specific style  
  callRiderBtn: {
    backgroundColor: '#4b5563',
  },
});
```

## 7. Gradient Header
**Update Header.tsx background:**
```typescript
container: {
  // Replace flat color with gradient
  backgroundColor: '#dc2626',
  // Add gradient effect (approximation in RN)
  // iOS/Android: use linear gradient from #dc2626 to darker red
}
```

## 8. Colors Reference Chart
```
Use these exact hex values:

Red Primary:      #dc2626  (primary action)
Red Dark:         #b91c1c  (gradient end)
Blue:             #2563eb  (Track Order)
Gray Button:      #4b5563  (Call Rider) -- NOT #6b7280
Green:            #16a34a  (Complete)
Purple:           #8b5cf6  (Viber purple-600)
Viber BG:         #ede9fe  (purple-100)
Phone BG:         #dbeafe  (blue-100)

Text:             #111827  (gray-800)
Subtitle:         #6b7280  (gray-600)
BG:               #f9fafb  (gray-50)
Card BG:          #fff
Border:           #e5e7eb  (gray-200)
```

## Next Steps
1. Apply these changes to sugo-expo/app/(tabs)/index.tsx
2. Update header props and usage
3. Fix button colors and layouts
4. Import and use CallOptionsModal
5. Test each flow end-to-end
6. Compare visually with web version
