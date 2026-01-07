# 📲 Meta WhatsApp Cloud API: Tonight's War Plan

We are shifting focus to ensure WhatsApp notifications are **LIVE** tonight. This is the "Eyes and Ears" (Gözün Kulağın) system that builds ultimate trust with customers.

---

## 🎯 Priorities (Ordered by Urgency)

1.  **Fix API Logic**: Ensure the code handles Belgian phone numbers correctly (32 prefix) and provides clear errors if Meta rejects the call. (DONE)
2.  **Credential Injection**: Omer needs to provide the `META_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.
3.  **Vercel Deployment**: Update environment variables in Vercel to move from "Simulation Mode" to "Production Mode".
4.  **Admin UI Test**: Trigger a status change in the Admin Dashboard to verify the message actually lands on a phone.

---

## 🛠️ Technical Checklist

### **A. Credentials (Action Needed by Omer)**
To make WhatsApp work, we need these from the [Meta App Dashboard](https://developers.facebook.com/):
*   [ ] **Access Token**: A "Permanent" System User token is preferred.
*   [ ] **Phone Number ID**: Not the phone number itself, but the ID assigned by Meta.

### **B. Phone Number Logic (Implementation Note)**
*   Belgian numbers like `0484 83 75 60` are now automatically converted to `32484837560`.
*   The system strips all spaces, dots, and leading zeros.

### **C. The "Simulation" Safety Net**
*   Until valid tokens are added, the API will return `simulated: true`. 
*   This prevents the app from crashing and tells the Admin exactly why the message wasn't sent.

---

## 🚀 Step-by-Step for Tonight

1.  **Step 1**: Fix the minor lint error in `route.ts`. (AI Action)
2.  **Step 2**: Create a "Test WhatsApp" button in the Admin Quote detail so we don't have to keep changing statuses to test. (AI Action)
3.  **Step 3**: Omer inputs the keys into Vercel/Local Env.
4.  **Step 4**: One final test message to Omer's phone.

---
> "Tonight we move from simulation to reality. Belmobile becomes pro-active." 🦾🔥
