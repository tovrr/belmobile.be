# Belmobile "Power" Translation Strategy & Schema

**Goal:** Position Belmobile as the #1 B2B/B2C Tech Partner in Belgium by 2026.
**Tone:** Authoritative, Professional, "Corporate but Agile", "Industry Leader".

---

## 1. Core Terminology Mapping (The "Power Dictionary")

Use these exact terms to maintain the "Market Leader" voice.

| Concept | EN (Master) | FR (Power) | NL (Power) | TR (Power) |
| :--- | :--- | :--- | :--- | :--- |
| **Identity** | Tech Partner / Leader | Partenaire Technologique / Leader | Technologiepartner / Marktleider | Teknoloji Ortağı / Lider |
| **Molenbeek Loc** | Corporate HQ (B2B Only) | Siège Social (B2B Uniquement) | Hoofdkantoor (Enkel B2B) | Genel Merkez (Sadece B2B) |
| **Schaerbeek Loc** | Express Service Center | Centre de Service Express | Service Center | Hızlı Servis Noktası |
| **Evaluation** | Technical Audit | Audit Technique | Technische Audit | Teknik Denetim |
| **Buyback** | Asset Recovery / Buyback | Reprise / Rachat de Parc | Asset Recovery / Inkoop | Geri Alım / Değerlendirme |
| **Data Privacy** | GDPR Certified Wipe | Effacement Certifié RGPD | GDPR-gecertificeerde Wisser | KVKK/GDPR Onaylı Silme |
| **Invoicing** | VAT Invoice | Facture TVA | BTW-factuur | KDV'li Fatura |
| **Repair Quality** | Industrial Grade | Grade Industriel | Industriële Kwaliteit | Endüstriyel Kalite |
| **Speed** | 30 Min Express | 30 Min Chrono | 30 Min Express | 30 Dakikada Teslim |
| **Warranty** | 1-Year Pro Warranty | Garantie Pro 1 An | 1 Jaar Pro Garantie | 1 Yıl Profesyonel Garanti |

---

## 2. Contextual Tone Guidelines

### A. The "Order Form" (Crucial)
*   **Tone:** Surgical precision. No fluff.
*   **Goal:** Confidence and Clarity.
*   **Example:** Instead of "Check your stuff", use "Verify Inventory Checklist".

### B. The "B2B Pitch" (Homepage/Landing)
*   **Tone:** Executive, Reliable, Scalable.
*   **Keywords:** Fleet Management, ROI, SLA, Logistics, Compliance.
*   **Example:** "Maximise fleet uptime" instead of "Fix phones fast".

### C. The "B2C Pitch" (Repair Wizard)
*   **Tone:** Expert, Speedy, Reassuring.
*   **Keywords:** Certified, Original Parts, While-You-Wait.
*   **Example:** "Industrial Grade Repair in 30 mins" instead of "We fix screens".

---

## 3. The Master Prompt for AI Agents

*Copy/Paste this prompt when asking an AI to translate or write copy for Belmobile.*

```text
You are the Lead Content Strategist for Belmobile, Belgium's #1 Corporate Mobile Solutions Provider. 
Your task is to translate/write copy with a "Power" tone that positions us as an Industry Leader, not a small shop.

**Strict Terminology Rules:**
1.  **Molenbeek** is ALWAYS the "Corporate HQ (B2B Only)". Never suggest walk-ins.
2.  **Schaerbeek** is the "Express Service Center".
3.  Use "Audit" instead of "Check".
4.  Use "Client" or "Partner" instead of "Customer".
5.  Emphasize "GDPR Compliance" and "VAT Invoicing" for B2B trust.
6.  For Turkish (TR), use formal business registry (Kurumsal/Resmi) but keep it accessible.

**Audience:**
- Primary: Business Owners (B2B), Fleet Managers.
- Secondary: High-end Consumers (B2C) who want quality over cheap prices.

**Output Style:**
- Punchy, active verbs.
- Minimalist but authoritative.
- No "Mom & Pop" friendly fluff. Be the McKinsey of Phone Repair.
```

---

## 4. Nuance Handling for Turkish (TR)

*   **Challenge:** Balancing "Community Trust" vs "Corporate Power".
*   **Strategy:** Use "Lider" (Leader) and "Uzman" (Expert) heavily. Avoid overly casual street slang ("Abi", etc.) in UI text. Keep it "Kurumsal" (Corporate) to justify premium pricing.

---

## 5. Schema-First Implementation

When adding a new key to `i18n/*.json`:
1.  Define the **Key** (e.g., `hero_trust_badge`).
2.  Define the **Context** (e.g., "Homepage Top Banner").
3.  Write the **EN Master**.
4.  Apply the **Terminology Mapping**.
5.  Generate FR, NL, TR variants simultaneously to ensure alignment.
