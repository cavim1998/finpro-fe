# 🚀 User Address Management - Quick Reference Card

## 📍 Quick Access

```
Profile Page: /profile
Address Section: Scroll to "My Addresses" (Section 2)
```

---

## ⚡ Quick Commands

### **Install Dependencies**
```bash
npm install leaflet react-leaflet
# (Already done ✓)
```

### **Start Dev Server**
```bash
npm run dev
# Open: http://localhost:3000/profile
```

---

## 🎯 Quick Features

| Feature | How | Result |
|---------|-----|--------|
| **View All** | Page load auto-fetch | Addresses in list |
| **Add New** | Click "+ Tambah Alamat" | Form opens with map |
| **Pick Location** | Click on map | Coords auto-update |
| **Save** | Fill form → Click Save | Address created |
| **Edit** | Click "Edit" button | Form re-opens |
| **Set Primary** | Click "Jadikan Utama" | Becomes primary |
| **Delete** | Click "Hapus" → Confirm | Address removed |

---

## 📦 Component Map

```
Profile Page (/profile)
  └── AddressManagement (wrapper)
      ├── AddressList (display & actions)
      │   └── Address Card (each address)
      └── AddressForm (modal)
          ├── MapPicker (leaflet map)
          ├── Form Fields
          └── Submit/Cancel Buttons
```

---

## 🔌 API Quick Reference

```
GET     /users/addresses           Get all
POST    /users/addresses           Create
PUT     /users/addresses/{id}      Update
DELETE  /users/addresses/{id}      Delete
PATCH   /users/addresses/{id}/set-primary
```

**Auth:** `Authorization: Bearer {token}`

---

## 📊 Address Object

```typescript
{
  id: number,
  label?: string,
  addressText: string,
  latitude: number,      // -90 to 90
  longitude: number,     // -180 to 180
  receiverName?: string,
  receiverPhone?: string,
  isPrimary: boolean,
  createdAt: string,
  updatedAt: string
}
```

---

## 🗺️ Map Picker Quick Tips

```
Default: Jakarta (-6.2088, 106.8456)
Click: Set new location
Scroll: Zoom in/out
Marker: Shows selected point
Popup: Shows coordinates
```

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| `addressText` | Required, min 10 chars |
| `latitude` | -90 to 90 |
| `longitude` | -180 to 180 |
| `label` | Max 50 chars |
| `receiverName` | Optional |
| `receiverPhone` | Optional |

---

## 🧪 Quick Test Checklist

- [ ] Page loads without errors
- [ ] Address list displays
- [ ] "+ Add" button works
- [ ] Map shows in form
- [ ] Can click map
- [ ] Coordinates update
- [ ] Form validates
- [ ] Address saves
- [ ] List updates
- [ ] Edit works
- [ ] Delete works
- [ ] Set primary works

---

## 🐛 Common Quick Fixes

| Issue | Fix |
|-------|-----|
| Map not showing | Hard refresh (Ctrl+Shift+R) |
| No addresses | Login needed / Check token |
| Error on submit | Check validation (10+ chars) |
| Coordinates invalid | Must be within -90/90, -180/180 |
| Token expired | Logout & login again |
| Form not closing | Check console for errors |

---

## 📁 Quick File Reference

| Need to... | File |
|-----------|------|
| Change default location | `MapPicker.tsx` line 9-10 |
| Change map provider | `MapPicker.tsx` line 41-44 |
| Update colors | Components (Tailwind classes) |
| Add validation rule | `AddressForm.tsx` validateForm() |
| Change API base | `.env.local` → NEXT_PUBLIC_BASE_URL_API |

---

## 🎨 Quick Styling

```tsx
// Success (Green) - Primary badge
className="bg-green-100 text-green-800"

// Info (Blue) - Edit button
className="bg-blue-50 text-blue-600"

// Warning (Amber) - Primary action
className="bg-amber-50 text-amber-600"

// Danger (Red) - Delete button
className="bg-red-50 text-red-600"
```

---

## 📱 Responsive Quick Note

```
Mobile:   Bottom sheet, full-width
Tablet:   2-column layout
Desktop:  3-column + sidebar
```

---

## 🔐 Security Quick Check

```
✓ JWT token auto managed
✓ Backend ownership validation
✓ Input validation client + server
✓ Error messages safe
✓ HTTPS ready
```

---

## 🚀 Deploy Checklist

- [ ] Update BASE_URL for production
- [ ] Test all flows
- [ ] Verify CORS
- [ ] Setup HTTPS
- [ ] Monitor errors
- [ ] Test on mobile
- [ ] Check performance

---

## 💾 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run lint         # Check linting
npm run build        # Build for production

# Testing
npm run test         # Run tests
npm audit           # Check vulnerabilities
```

---

## 📞 Quick Support

```
Issue → Check → Solution
Map blank → Console (F12) → Network error?
API fail → Network tab → Check response
Token invalid → Cookies → Login again
Form error → Console validation → Min 10 chars
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `IMPLEMENTATION_SUMMARY.txt` | Full overview |
| `ADDRESS_MANAGEMENT_IMPLEMENTATION.md` | Technical docs |
| `SETUP_ADDRESS_MANAGEMENT.md` | User guide |
| This file | Quick reference |

---

## 🎯 Use Cases

### **Add Home Address**
1. Click "+ Tambah Alamat"
2. Click home location on map
3. Label: "Rumah"
4. Fill receiver info
5. Save

### **Add Office Address**
1. Click "+ Tambah Alamat"  
2. Click office location on map
3. Label: "Kantor"
4. Different receiver? Add
5. Save

### **Change Primary**
1. Click "Jadikan Utama" on preferred address
2. Done! Auto-switches

### **Remove Old Address**
1. Click "Hapus"
2. Confirm
3. Done!

---

## ⏱️ Estimated Time

```
Load profile:       ~1-2s
Load addresses:     ~1s
Add address:        ~2-3s (with map interaction)
Edit address:       ~2s
Delete address:     ~1s
Set primary:        ~1s
```

---

## 🎓 Learning Path

1. **Understand Structure** - Read IMPLEMENTATION_SUMMARY
2. **Setup Environment** - npm run dev
3. **Try Basic Flow** - Add, edit, delete
4. **Explore Map** - Click different locations
5. **Check Code** - Read components
6. **Customize** - Modify as needed

---

## 🌟 Pro Tips

✨ **Tip 1:** Use memorable labels (Rumah, Kantor, Kos, etc)  
✨ **Tip 2:** Set primary to default delivery address  
✨ **Tip 3:** Add receiver name for clarity  
✨ **Tip 4:** Use correct coordinates (not just random)  
✨ **Tip 5:** Add phone for delivery contact  

---

## 🚀 Next Steps

1. ✅ Implementation complete
2. ✅ Components ready
3. ✅ Integration done
4. 👉 **Test in browser**
5. 👉 **Customize styling** (if needed)
6. 👉 **Deploy to production**

---

**Happy Coding! 🎉**

*Last Updated: 3 Februari 2026*
