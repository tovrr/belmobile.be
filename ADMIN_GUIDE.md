# Belmobile Admin Guide - Shop Manager Manual

This guide covers the day-to-day operations for shop managers using the Belmobile platform.

## 📦 Managing Inventory (Power Tools)
Inside the **Product Management** tab, you have access to "Power Tools" for batch operations:
1. **Batch Select**: Use the checkboxes in the product table to select multiple items.
2. **Action Menu**: Click the floating "Action" button to:
    - **Change Price**: Adjust prices for all selected items by a fixed amount or percentage.
    - **Update Stock**: Set stock levels for a specific shop across all selected products.
    - **Quick Delete**: Cleanup multiple products at once.

## 📝 Handling Leads & Quotes
The platform alerts you to new customer inquiries via real-time badges in the sidebar:
- **Orders & Quotes**: New buyback requests or repair inquiries needing attention.
- **Reservations**: Customers waiting to pick up a specific device in your shop.

### Automated Notifications
When a customer submits a request:
1. They receive an automated email with a **PDF Confirmation**.
2. A new record appears in your dashboard.
3. You can update the status (Processing, Responded, Closed) to track the lead.

## 📧 Setting Up Email Notifications
The platform uses a direct integration with **Brevo** to send confirmation emails with PDF attachments.

### 🚀 Configuration Steps
1.  **Brevo Account**: Create a free account at [Brevo.com](https://www.brevo.com/).
2.  **API Key**: Go to **SMTP & API** > **API Keys** and generate a new key.
3.  **Environment Variable**: Add the key to your `.env.local` file:
    ```env
    BREVO_API_KEY=your_xkeysib_api_key_here
    ```
4.  **Verified Sender**: Go to **Senders & IP** in Brevo and ensure `info@belmobile.be` is a verified sender.

### 📧 Email Troubleshooting Guide
If customers are not receiving emails:
1.  **Check API Key**: Ensure `BREVO_API_KEY` is correctly set in `.env.local`.
2.  **Check Brevo Logs**: Go to **Transactional** > **Real-time** in Brevo to see if the API calls are reaching their server.
3.  **Check Browser Console**: If there is a front-end error, it will appear in the developer console (F12).

---
Need support? Contact the IT development team.
