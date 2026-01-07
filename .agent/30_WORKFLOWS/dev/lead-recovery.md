---
description: How to recover abandoned leads via Magic Links
---

## Overview
Abandoned leads are captured when a user enters their email in the wizard but doesn't complete the order. We recover them by sending an email with a unique tracking ID (Lead ID).

## Steps

1. **Locate Lead**
   - Access the Firestore `leads` collection or the Admin "Lead Management" view.
   - Copy the Lead ID (usually the underscored email).

2. **Generate Magic Link**
   - The link structure is: `https://belmobile.be/[lang]/[service]?leadId=[LEAD_ID]`
   - Example: `https://belmobile.be/fr/repair?leadId=user_example_com`

3. **Trigger Recovery Email**
   - Go to the Admin Dashboard > Lead Management.
   - Click "Recover" next to the lead.
   - This calls the `api/mail/recover-lead` endpoint.

4. **Verify Restoration**
   - When the user clicks the link, the `BuybackRepair` component detects `leadId`.
   - It fetches the lead data and hydrates the `WizardContext`.
   - The user is placed back at Step 4 (User Info) with all previous selections (Brand, Model, Issues) intact.

## ⚠️ Notes
- Leads expire after 30 days (GDPR).
- Magic links are one-time use or expire if the lead is converted.
