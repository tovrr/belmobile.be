# Robust & Inclusive SEO Footer Strategy for Belmobile.be

## 1. Objective
Create a "Fat Footer" that serves as a powerful navigation hub, enhancing SEO through internal linking and keyword relevance while ensuring a seamless user experience across all devices (Mobile, Tablet, Desktop).

## 2. Core Principles
*   **Mobile-First:** Accordion-style collapse for link lists on mobile to save space while keeping content accessible.
*   **Semantic HTML:** Use `<nav>`, `<ul>`, `<li>`, and `<h2>` tags properly for screen readers and crawlers.
*   **Keyword Rich:** Anchor texts should match high-volume search terms (e.g., "Réparation iPhone Bruxelles", not just "iPhone").
*   **Trust & Speed:** Prominently display trust badges, payment methods, and contact info.

## 3. Structural Layout (4-Column Grid)

### Column 1: Brand & Trust (Identity)
*   **Logo & Slogan:** "Belmobile - Buyback & Repair"
*   **Trust Signals:** "Google Verified", "1 Year Warranty", "Eco-Friendly".
*   **Contact Snippet:** Phone, Email, WhatsApp.
*   **Payment Methods:** Icons for Visa, Bancontact, Cash, EcoCheques.

### Column 2: Expert Repairs (High-Value Keywords)
*   **Header:** "Réparation Smartphone" (Instead of generic "Services")
*   **Links:**
    *   Réparation iPhone (Deep link to /repair/apple/iphone)
    *   Réparation Samsung (Deep link to /repair/samsung)
    *   Réparation Écran (Generic intent)
    *   Remplacement Batterie (Generic intent)
    *   Microsoudure & Carte Mère (Niche expertise)
    *   Récupération de Données (High value)

### Column 3: Buyback & Refurbished (Commercial Intent)
*   **Header:** "Vendre & Acheter"
*   **Links:**
    *   Vendre mon iPhone
    *   Vendre mon Samsung
    *   Acheter iPhone Reconditionné
    *   Acheter Samsung Reconditionné
    *   Offres Étudiants (-10%)
    *   Solutions Business (B2B)

### Column 4: Local Presence & Support (Local SEO)
*   **Header:** "Nos Ateliers à Bruxelles"
*   **Links:**
    *   Schaerbeek (Rue Gallait)
    *   Anderlecht (Rue Lambert Crickx)
    *   Coursier Express (Pick-up Service)
*   **Support Links:**
    *   Suivre ma commande
    *   FAQ & Aide
    *   Contact & Devis
    *   Recrutement (Carrieres)

## 4. "Mega-Footer" SEO Enhancements (Bottom Section)
*   **Service Areas:** A small text block listing key communes (Ixelles, Uccle, Saint-Gilles...) for local relevance.
*   **Popular Models:** A dynamic list of top 5 repairs (e.g., "Remplacer écran iPhone 15", "Batterie Samsung S24").
*   **Structured Data:** JSON-LD for `LocalBusiness` and `Organization` embedded in the footer.
*   **Legal:** Plain links to Terms, Privacy, Warranty, Cookie Policy.

## 5. Technical Implementation Steps
1.  **Refactor `FooterColumns.tsx`:** Update the `NAV_LINKS` structure to reflect the deeper, keyword-rich hierarchy.
2.  **Add Accordion Logic:** Ensure columns collapse into expandable headers on mobile (< 768px).
3.  **Update Translations:** Add new specific keys for headers like "Réparation Smartphone" in `fr.json`, `nl.json`, etc.
4.  **Inject SVG Icons:** Add monochromatic icons for payment methods and trust signals.

## 6. Review & Validation
*   Check mobile responsiveness.
*   Verify all internal links are crawlable (href present).
*   Ensure text constraint colors (AA compliance).
