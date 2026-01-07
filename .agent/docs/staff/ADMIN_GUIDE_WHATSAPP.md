# 🛠️ Belmobile Admin: WhatsApp & Operational Guide

This guide explains how to activate and use the "Eyes & Ears" (Gözün Kulağın) WhatsApp notification system.

---

# # 1. 🔑 Activation (One-Time Setup)

To move from "Simulation Mode" to "Live Production", you must add two keys to your environment:

1.  **Go to Meta Developer Portal**: [developers.facebook.com](https://developers.facebook.com/)
2.  **Select your App**: Belmobile / WhatsApp.
3.  **Get Credentials**:
    *   **Access Token**: Generate a permanent token (System User).
    *   **Phone Number ID**: Found in the WhatsApp "Getting Started" tab.
4.  **Add to Vercel**:
    *   `META_ACCESS_TOKEN` = `your_token_here`
    *   `WHATSAPP_PHONE_NUMBER_ID` = `your_id_here`

---

## 2. 📲 How to use "Gözün Kulağın"

### **A. Automatic Notifications**
Whenever you change a Quote Status (e.g., from `Processing` to `Ready`), the system automatically sends a professional WhatsApp message in the customer's language.

### **B. Manual Testing**
If you want to verify connectivity without changing a status:
1.  Open any **Repair** or **Buyback** detail in the Admin Dashboard.
2.  Look for the green button: **"TEST WHATSAPP NOW"**.
3.  Click it to send an immediate ping to the customer's phone.

---

## 3. 📝 Operational Workflow (Notion Integration)

*Soon, you will be able to manage these cards directly from Notion.*

1.  **Lead Arrival**: Customer submits a form on the site.
2.  **Dashboard**: It appears in your Admin Panel and (soon) your Notion Kanban.
3.  **Technician Action**: Technician repairs the device and updates the status.
4.  **Customer Joy**: Customer receives the WhatsApp notification and visits the shop.

---

## ⚠️ Troubleshooting

*   **Prefix Errors**: Belgian numbers should start with `04...` or `4...`. The system automatically adds `32`.
*   **Simulation Mode**: If you see "Simulated" in the admin alert, it means your Meta keys are missing or invalid.
*   **Meta API Errors**: Check the browser console (F12) for detailed JSON errors from Meta (e.g., "Template not approved" or "Balance low").

---
> "Trust is built in real-time." 🦾🤵‍♂️
