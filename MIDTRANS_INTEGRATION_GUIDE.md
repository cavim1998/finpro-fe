# Midtrans Snap Integration - Testing & Implementation Guide

## ✅ Backend Status
Tim BE sudah selesai implementasi Midtrans Snap integration. Responsenya sekarang:
- ✅ `snapToken` dari Midtrans
- ✅ `paymentUrl` dari Midtrans Snap sandbox
- ✅ Webhook handling untuk auto-update status
- ✅ Order status auto-update ke READY_TO_DELIVER saat payment sukses

## 📋 Frontend Implementation Checklist

### Halaman Payment (`/payment/[orderId]`)
- ✅ Load order details (order number, outlet, amount)
- ✅ Load existing pending payment jika ada
- ✅ Create new payment dengan pilihan metode (QRIS, GoPay, DANA, OVO, Mastercard, VISA)
- ✅ Buka Midtrans Snap popup dengan `window.snap.pay(snapToken)`
- ✅ Jika popup diblok, fallback ke `paymentUrl` (redirect)
- ✅ Cache snapToken/paymentUrl di localStorage
- ✅ Handle Snap callbacks (onSuccess, onPending, onError, onClose)
- ✅ Redirect ke `/payments/finish?orderId=<id>` setelah payment

### Halaman Finish (`/payments/finish?orderId=<id>`)
- ✅ Auto-poll status setiap 3 detik
- ✅ Tampilkan payment info (ID, status, provider, amount)
- ✅ Tampilkan notifikasi berdasarkan status:
  - PENDING: "ℹ️ Waiting for payment confirmation..."
  - PAID: "✅ Payment received! Your order will be processed soon."
  - FAILED: "❌ Payment failed. Please retry."
- ✅ Disable "Retry Payment" button saat status PAID atau FAILED
- ✅ Button "Back to Check Status" untuk kembali ke daftar order

### Check Status Page (`/check-status`)
- ✅ Update button text dari "Pay via QRIS" ke "Pay with Midtrans"
- ✅ Integrasi dengan payment deadline (24 jam)
- ✅ Redirect ke `/payment/{orderId}` saat user klik pay

---

## 🧪 Testing Instructions

### 1. Setup Environment
Pastikan di `.env.local` ada:
```
NEXT_PUBLIC_BASE_URL_API=http://localhost:8000
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<sandbox_client_key_dari_midtrans>
```

### 2. Test Payment Flow End-to-End

#### Step 1: Buka halaman Check Status
```
http://localhost:3000/check-status
```
- Lihat daftar orders yang status `WAITING_PAYMENT` (atau status lain yang bisa bayar)
- Klik tombol **"Pay with Midtrans"**

#### Step 2: Halaman Payment
```
http://localhost:3000/payment/<orderId>
```
- ✓ Verifikasi order number, outlet, dan total amount terisi
- ✓ Verifikasi payment method dropdown ada (QRIS, GoPay, dll)
- ✓ Verifikasi status & amount di Midtrans Snap section

#### Step 3: Klik "Pay Now"
- **Ideal**: Midtrans Snap popup muncul
  - Pilih metode pembayaran
  - Lanjutkan hingga screen sukses/pending/error
- **Jika popup diblok**: Link "Open payment page in new tab" muncul
  - Klik link → Snap terbuka di tab baru

#### Step 4: Setelah Payment
Redirect otomatis ke:
```
http://localhost:3000/payments/finish?orderId=<id>
```
- Lihat payment status real-time (auto-refresh setiap 3s)
- Jika status PENDING: tunggu atau klik "Retry Payment"
- Jika status PAID: lihat ✅ notifikasi
- Jika status FAILED: klik "Retry Payment"

#### Step 5: Verifikasi Order Status
Kembali ke Check Status → order status harus berubah jadi READY_TO_DELIVER (jika payment sukses)

---

## 📱 Test Scenarios

### Scenario 1: Successful Payment
1. Klik Pay with Midtrans
2. Snap popup → finish payment
3. Status berubah PAID ✅
4. Order status berubah READY_TO_DELIVER

### Scenario 2: Pending Payment (Tunggu Bank)
1. Klik Pay with Midtrans
2. Snap popup → pilih GoPay/OVO
3. Scan/confirm → status jadi PENDING
4. Finish page polling tunggu callback
5. Setelah bank approve → status berubah PAID

### Scenario 3: Payment Failed
1. Klik Pay with Midtrans
2. Snap popup → gagal
3. Status FAILED
4. Klik "Retry Payment" → kembali ke payment page dengan payment baru

### Scenario 4: Popup Diblok
1. Klik Pay with Midtrans
2. Popup tidak muncul → lihat link "Open payment page in new tab"
3. Klik link → Snap terbuka di tab baru
4. Lanjutkan seperti normal

---

## 🛠️ API Endpoints Reference

### POST /payments
Create payment
```json
Request Body:
{
  "orderId": "uuid",
  "provider": "qris|gopay|dana|ovo|mastercard|visa"
}

Response:
{
  "message": "Payment berhasil dibuat",
  "data": {
    "id": 123,
    "orderId": "uuid",
    "provider": "qris",
    "amount": 25000,
    "status": "PENDING",
    "snapToken": "<token_midtrans>",
    "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/<token>",
    "gatewayRef": "ORDER-0001",
    "expiresAt": "2026-02-11T10:00:00.000Z"
  }
}
```

### GET /payments/order/:orderId
Get all payments for order
```json
Response:
{
  "message": "Payments berhasil diambil",
  "data": [
    {
      "id": 1,
      "orderId": "uuid",
      "provider": "qris",
      "amount": 105000,
      "status": "PENDING|PAID|FAILED|EXPIRED|REFUNDED",
      "snapToken": "<token>",
      "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/<token>",
      "gatewayRef": "QRIS-...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

## 🔐 Security Notes
- ✅ FE tidak handle webhook (backend only)
- ✅ snapToken di-cache per orderId di localStorage
- ✅ Payment signature verification di backend
- ✅ Order ownership validation sebelum create payment
- ✅ Payment deadline 24 jam dari creation

---

## 📞 Troubleshooting

### Snap popup tidak muncul
1. Cek browser console (F12 → Console)
2. Cek Network → snap.js harus status 200
3. Cek `window.snap` ada di console
4. Jika popup diblok: gunakan link "Open payment page in new tab"

### snapToken/paymentUrl kosong
1. Cek response GET `/payments/order/:id` via Network
2. Field harusnya ada (bisa di top-level atau di `payloadJson`)
3. Kalau kosong: hubungi tim BE

### Status tidak update
1. Cek di Network → GET `/payments/order/:id` polling setiap 3s
2. Cek webhook backend sudah dapat callback dari Midtrans
3. Cek di Midtrans dashboard → transaction log

### Endless pending
1. Cek di Midtrans Dashboard → status transaksi simulasi
2. FE tidak bisa process webhook (backend only)
3. Tunggu backend process atau manual trigger di Midtrans

---

## 📝 Notes untuk Tim BE
- ✅ snapToken dan paymentUrl dari payloadJson sudah di-extract FE
- ✅ Payment flow kaya: create → show Snap → polling status
- ✅ Redirect URL untuk finish callback: `<FE_URL>/payments/finish?orderId=<id>`
- ⚠️ Pastikan webhook endpoint public dan terupdate di Midtrans dashboard
- ⚠️ MIDTRANS_IS_PRODUCTION harus `false` untuk sandbox testing

---

## 🚀 Deployment Checklist

### Pre-Production
- [ ] Set `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` ke sandbox key
- [ ] Set `NEXT_PUBLIC_BASE_URL_API` ke BE endpoint
- [ ] Test full flow: payment creation → Snap → finish page → order status
- [ ] Test all payment methods (QRIS, GoPay, DANA, OVO, Mastercard, VISA)
- [ ] Test error scenarios (failed payment, timeout, closed popup)
- [ ] Verify webhook endpoint publik & teredgister di Midtrans

### Production
- [ ] Replace `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` dengan production key
- [ ] Update Snap URL dari sandbox ke production
- [ ] Update FE_URL di backend production
- [ ] Test sekali dengan real transaction (minimal ammount)
- [ ] Monitor webhook logs 24/7 first day

---

**Updated:** Feb 10, 2026 — Midtrans Snap Integration v1.0
