# Sugo Expo - Web Version Alignment Guide

## Key Differences to Fix

### 1. Customer Home Screen - Current Order View
**Current Button Layout (WRONG):**
```
| Track Order (both blue with icons) | 
| Call (both blue with icons)        |
```

**Should Be (WEB VERSION):**
```
| Track Order (blue) | Call Rider (gray) |
| with icons + text  | with icons + text |
```

**Fix:**
- Track Order button: `bg-blue-600` (Navigation icon + text)
- Call Rider button: `bg-gray-600` (Phone icon + text)
- Both in 2-column grid with gap-3
- NOT centered, NOT stacked

### 2. Customer Home Screen - Default (New Request)
**Header Should Have 3 Icon Buttons on Right:**
```
┌─────────────────────────────────────┐
│ New Request    [Search] [Notif] [Settings] │
└─────────────────────────────────────┘
```
- Search button (white/20 bg)
- Notifications button (white/20 bg with yellow badge dot)
- Settings button (white/20 bg)
- All in header, NOT in body

### 3. Service Selector - 4 Column Layout
**Current: Works but should match exactly**
- 4 columns: Delivery, Services/Tickets, Aircon (disabled), Electrician (disabled)
- Selected = ring-2 with color
- Disabled = opacity-50 cursor-not-allowed
- Icons: Package (red), Ticket (blue), Wind (gray), PlugZap (gray)

### 4. Action Buttons in Customer Dashboard
**When currentOrder exists:**
```
Grid 2 columns:
| Track Order (blue, Navigation icon, text) |
| Call Rider (gray, Phone icon, text)       |
```

NOT:
- Two blue buttons
- Icon only (no text)
- Stacked vertically

### 5. Payment Modal
**Modal Content Layout:**
```
Methods List:
- Cash
- GCash  
- QRPH
---
Payment Summary Card:
  Base Amount: ₱80.00
  Service Fee: ₱5.00
  ---
  Total Amount: ₱85.00 (red, bold)
---
Place Order / Pay Now Button
```

### 6. Call Options Modal
**Should Have 2 Buttons:**
- Call via Viber (purple/50 bg, text purple-700)
- Call via Phone (blue/50 bg, text blue-700)
- Icons + text, not centered

### 7. Track Order Modal
**Show Progress Steps:**
```
Order #ORD-001
Estimated: 15 mins
Rider on way

☑ Order Confirmed
☑ Preparing Order
☑ Order Picked Up
○ Out for Delivery
○ Delivered
```
- Completed = green circle with checkmark
- Pending = gray circle

### 8. Rating Modal
**Layout:**
```
How was your [delivery/service] experience?

★ ★ ★ ★ ★ (clickable stars)

[Comments text area]

[Submit Rating Button]
```

### 9. Colors - Must Match Exactly
```
Primary:  #dc2626 (red-600)
Blue:     #2563eb (blue-600)  → for Track Order
Gray:     #4b5563 (gray-600)  → for Call Rider
Green:    #16a34a (green-600) → for Complete, Chat
Text:     #111827 (gray-800)
SubText:  #6b7280 (gray-600)
BG:       #f9fafb (gray-50)
```

### 10. Bottom Navigation
```
Customer:  [Home] [Orders] [Profile]
Rider:     [Home] [Deliveries] [Earnings] [Profile]
```
- Icons with labels
- Active = red-600 text
- Inactive = gray-400 text

### 11. Header Styles
**Gradient Header:**
```
background: linear-gradient(to right, #dc2626, #b91c1c)
```
- NOT flat color

### 12. Spacing Standard
```
Container:  padding-6  (24px)
Card:       padding-5  (20px)
Gap Small:  gap-2 (8px)
Gap Med:    gap-3 (12px)
Gap Large:  gap-4 (16px)
```

## Files to Update

1. **sugo-expo/app/(tabs)/index.tsx**
   - Add header icon buttons
   - Fix button layouts and colors
   - Add Call Options modal
   - Fix all action button styles

2. **sugo-expo/components/sugo/Header.tsx**
   - Make it match web Header exactly
   - Icon button positioning

3. **sugo-expo/components/sugo/ServiceSelector.tsx**
   - Already correct, verify 4-column layout

4. **sugo-expo/components/sugo/BottomBar.tsx**
   - Verify icon + label layout

## Testing Checklist

- [ ] Header has search/notifications/settings buttons
- [ ] Track Order = blue, Call Rider = gray (2 columns)
- [ ] Service selector shows all 4 services
- [ ] Payment modal has summary card
- [ ] Call Options modal shows Viber + Phone
- [ ] All modals close properly
- [ ] Colors exactly match web
- [ ] Spacing exactly matches web
- [ ] All flows work: login → order → chat → payment → rating
