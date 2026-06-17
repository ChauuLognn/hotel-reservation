# Quick Debug Tips - Save Room & Find Available Issues

## Before Testing
1. **Hard refresh browser**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Ctrl+Shift+Delete in DevTools
3. **Open DevTools**: Press F12
4. **Keep console open** while testing

---

## Quick Test: Save Room

### Steps:
1. Click "Add Room" button
2. Enter Room Number: **999**
3. Select any Room Type
4. Select Status: **Available**
5. Click "Save Room" button

### Watch for:
- ✅ Modal stays open = validation error (check notification)
- ✅ Modal closes = save successful
- ✅ New room appears = success
- ✅ Green notification at top = success

### If it fails:
Look in **Console tab (F12)**:
- Red error? → See what it says
- Look for text: "Saving room:" → Shows what was sent
- Look for text: "Failed to save room:" → Shows error message

---

## Quick Test: Find Available Rooms

### Steps:
1. Click "Find Available" tab
2. **Leave Room Type empty** (select "--All Room Types--")
3. Enter Check-in: **2024-12-25**
4. Enter Check-out: **2024-12-30**
5. Click "Search" button

### Watch for:
- ✅ Blue notification: "Searching available rooms..."
- ✅ Results appear or empty message
- ✅ Green notification: "Found X room(s)"

### If it fails:
Look in **Console tab (F12)**:
- Search params should show checkIn and checkOut
- "Available rooms response:" should show data
- Red error? → See what it says

---

## Key Console Logs to Look For

When testing Save Room:
```
✓ "Saving room: {id: 999, ...}"
✓ "Room created successfully" (notification)
✓ Then rooms table refreshes
```

When testing Find Available:
```
✓ "Search params - roomType: null checkIn: 2024-12-25 checkOut: 2024-12-30"
✓ "Finding available rooms with endpoint: /available?checkIn=..."
✓ "Available rooms response: [...]" (should be an array)
✓ "Found X available room(s)" (notification)
```

---

## Network Tab Checks

Open F12 → **Network tab** → Do an action:

**For Save Room:**
- Look for POST request to `/api/rooms`
- Status should be **200** or **201** (green)
- Click it → look at **Response** tab → should show room data

**For Find Available:**
- Look for GET request to `/api/rooms/available?...`
- Status should be **200** (green)
- Click it → look at **Response** tab → should show room array

---

## Common Problems

### Problem: Modal doesn't close after clicking Save
**Check:**
- Console for red errors
- Is notification showing an error?
- Did you fill ALL fields?

**Fix:**
- Check Room Type dropdown is selected
- Check Status is selected
- Look at console error message

### Problem: Find Available returns no results
**Check:**
- Are dates valid format? (YYYY-MM-DD)
- Is check-out AFTER check-in?
- Do available rooms exist in backend?

**Test in Postman:**
```
GET http://localhost:8080/hotel_reservation_premium/api/rooms/available?checkIn=2024-12-25&checkOut=2024-12-30
```
Should return array of rooms.

### Problem: Red error in console
**Copy the exact error message** and check:
1. Is backend running?
2. Is API URL correct?
3. Are parameters being sent correctly?

---

## 30-Second Test

If everything is working:

1. Add Room: **✓ Takes 5 seconds, room appears**
2. Edit Room: **✓ Takes 3 seconds, data updates**
3. Find Available: **✓ Takes 2 seconds, results show**

If any takes much longer or fails → Check console!

---

## What Success Looks Like

**Save Room:**
```
Notification: "Room created successfully" (green)
Table updates: New room #999 appears
Stats update: Total +1
```

**Find Available:**
```
Notification: "Found X available room(s)" (green)
Table shows: Rooms with Room No, Type, Capacity, Price, Status
Each row: Has data filled in (not blank)
```

---

## Still Broken?

1. **Screenshot the error** (console + notification)
2. **Check Network tab** → Is POST/GET request being made?
3. **Open backend logs** → What does backend say?
4. **Test with Postman** → Does API work directly?

---

**Version:** 1.2 Fixed
**Status:** Ready to test
