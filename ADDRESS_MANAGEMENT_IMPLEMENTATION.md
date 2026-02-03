# 📍 User Address Management - Implementation Summary

**Status:** ✅ Siap digunakan  
**Last Updated:** 3 Februari 2026

---

## 📁 File Structure

```
src/
├── types/
│   └── address.ts                    # Address interfaces & types
├── services/
│   └── addressService.ts             # Address API service
├── components/
│   └── profile/
│       ├── AddressManagement.tsx     # Main wrapper component
│       ├── AddressList.tsx           # List & display addresses
│       ├── AddressForm.tsx           # Form dengan map picker
│       └── MapPicker.tsx             # Leaflet map component
└── app/
    └── profile/
        └── page.tsx                   # Profile page (sudah integrated)
```

---

## 🎯 Features

✅ **Get All Addresses** - Tampilkan semua alamat user  
✅ **Create Address** - Tambah alamat baru dengan map picker  
✅ **Edit Address** - Update alamat yang sudah ada  
✅ **Delete Address** - Hapus alamat  
✅ **Set Primary** - Ubah alamat utama  
✅ **Auto Primary Management** - Otomatis handle primary saat create/delete  
✅ **Map Integration** - Leaflet map untuk pick lokasi  

---

## 🚀 Quick Start

### 1. **Akses Profile Page**
```
Masuk ke: /profile
Lihat tab "My Addresses"
```

### 2. **Tambah Alamat Baru**
```
1. Klik tombol "+ Tambah Alamat"
2. Form akan membuka dengan map picker
3. Klik di map untuk set lokasi
4. Isi form lengkap
5. Klik "Simpan Alamat"
```

### 3. **Edit Alamat**
```
1. Klik tombol "Edit" di address card
2. Update informasi
3. Klik "Update Alamat"
```

### 4. **Hapus Alamat**
```
1. Klik tombol "Hapus"
2. Confirm dialog
3. Alamat dihapus
```

### 5. **Set Alamat Utama**
```
1. Klik tombol "Jadikan Utama"
2. Alamat akan menjadi primary
3. Alamat lama otomatis tidak primary
```

---

## 🗺️ Map Picker Usage

### **Fitur**
- 🖱️ Klik map untuk memilih lokasi
- 📍 Marker real-time sesuai klik
- 🔍 Zoom in/out
- 📌 Koordinat auto update

### **Default Location**
- Latitude: -6.2088 (Jakarta)
- Longitude: 106.8456 (Jakarta)

### **Customization**
Edit di `MapPicker.tsx`:
```typescript
const DEFAULT_LAT = -6.2088;  // Change latitude
const DEFAULT_LNG = 106.8456;  // Change longitude
```

---

## 📝 API Integration

### **Endpoints**
- `GET /users/addresses` - Get all addresses
- `POST /users/addresses` - Create address
- `PUT /users/addresses/{id}` - Update address
- `DELETE /users/addresses/{id}` - Delete address
- `PATCH /users/addresses/{id}/set-primary` - Set as primary

### **Service Methods**
```typescript
import { addressService } from '@/services/addressService';

// Get all
const addresses = await addressService.getAll();

// Create
const newAddr = await addressService.create({
  label: 'Rumah',
  addressText: 'Jl. Merdeka No. 123',
  latitude: -6.2088,
  longitude: 106.8456
});

// Update
const updated = await addressService.update(id, {
  label: 'Kantor'
});

// Delete
await addressService.delete(id);

// Set primary
const primary = await addressService.setPrimary(id);
```

---

## 🎨 Components

### **AddressManagement** (Wrapper)
Main component yang handle semua logic address management.
```tsx
<AddressManagement />
```

### **AddressList**
Menampilkan list addresses dengan actions.
```tsx
<AddressList 
  addresses={addresses}
  onAddressDeleted={(id) => {}}
  onAddressPrimary={(id) => {}}
  onEditAddress={(address) => {}}
/>
```

### **AddressForm**
Form untuk tambah/edit address dengan map.
```tsx
<AddressForm 
  address={selectedAddress}
  isOpen={true}
  onClose={() => {}}
  onAddressSaved={(address) => {}}
/>
```

### **MapPicker**
Leaflet map untuk pick lokasi.
```tsx
<MapPicker
  latitude={-6.2088}
  longitude={106.8456}
  onLocationChange={(lat, lng) => {}}
  height="400px"
  zoom={13}
  readonly={false}
/>
```

---

## ⚙️ Configuration

### **Environment Variables** (optional)
```
NEXT_PUBLIC_BASE_URL_API=http://localhost:8000
```

### **Leaflet Tiles**
Default: OpenStreetMap

Custom tiles di `MapPicker.tsx`:
```typescript
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);
```

---

## 🧪 Testing

### **Test Cases**
- [ ] Load addresses di profile
- [ ] Create address baru (jadi primary)
- [ ] Create address kedua (tidak primary)
- [ ] Edit address
- [ ] Set address sebagai primary
- [ ] Delete address
- [ ] Delete primary → auto set other as primary
- [ ] Map picker works
- [ ] Koordinat valid (-90 to 90, -180 to 180)
- [ ] Error handling works

### **Test Addresses**
```
1. Rumah (Jakarta)
   Lat: -6.2088, Lng: 106.8456

2. Kantor (Sudirman)
   Lat: -6.2270, Lng: 106.8005

3. Kos (Manggarai)
   Lat: -6.2146, Lng: 106.8456
```

---

## 🐛 Troubleshooting

### **Map tidak muncul**
- Check browser console untuk errors
- Verify Leaflet CSS import di component
- Check `leaflet/dist/leaflet.css` di `MapPicker.tsx`

### **Marker tidak muncul**
- Custom icon di `MapPicker.tsx` fix CDN link
- Check internet connection untuk CDN

### **Koordinat tidak update**
- Check `onLocationChange` callback
- Verify map is initialized

### **API Error 401**
- Token expired → login ulang
- Check `axiosInstance` interceptors
- Check `auth_token` di cookies

### **Address tidak load**
- Check network tab untuk API response
- Verify user ID di backend
- Check error message di console

---

## 📱 Responsive Design

✅ Mobile: Full-width, bottom sheet form  
✅ Tablet: 2-column layout  
✅ Desktop: Full 3-column layout  

---

## 🔒 Security

✅ JWT token auto inject  
✅ Ownership validation di backend  
✅ Input validation client & server  
✅ Error handling & messaging  

---

## 📚 Related Files

- [Address Types](../types/address.ts)
- [Address Service](../services/addressService.ts)
- [Profile Page](../app/profile/page.tsx)
- [Globals CSS](../app/globals.css)

---

## ❓ FAQ

**Q: Berapa maksimal alamat per user?**  
A: Tidak ada limit, bisa unlimited.

**Q: Bisa punya multiple primary addresses?**  
A: Tidak, hanya 1 primary per user. Backend auto manage.

**Q: Alamat dihapus otomatis jadi primary address apa?**  
A: Alamat tertua (paling dulu dibuat) otomatis jadi primary.

**Q: Koordinat valid range?**  
A: Latitude: -90 hingga 90, Longitude: -180 hingga 180

**Q: Bisa custom map tiles?**  
A: Ya, edit di `MapPicker.tsx` L.tileLayer config.

**Q: Offline mode supported?**  
A: Tidak, butuh internet untuk fetch tile & data.

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console error
2. Verify API endpoint
3. Check token di cookies
4. Check network tab

---

**Selamat menggunakan! 🎉**
