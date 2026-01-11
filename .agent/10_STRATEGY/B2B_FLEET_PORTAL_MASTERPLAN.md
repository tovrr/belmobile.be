# B2B Fleet Portal: Master Implementation Plan

## 1. Executive Summary
The **Belmobile B2B Fleet Portal** is a secure, dedicated dashboard for corporate clients to manage their mobile device fleets. It allows companies to:
- Trace their entire device inventory (Fleet Management).
- Request repairs in bulk or individually.
- Sell old devices (Buyback) with guaranteed B2B pricing.
- Access centralized invoicing and reporting.
- Manage employee access permissions.

## 2. Technical Architecture

### 2.1 Routing Structure
All B2B portal routes will be protected and localized:
```
src/app/[lang]/business/portal/
├── layout.tsx              # Auth Check + Dashboard Shell (Sidebar/TopBar)
├── login/                  # B2B Login Page
├── dashboard/              # Main Overview (KPIs, Active Repairs)
├── fleet/                  # Inventory Table (Add/Remove Devices)
├── repairs/                # Repair History & New Request Wizard
├── buyback/                # Buyback Offers & Trade-in Flow
├── invoices/               # Billing History & PDF Download
└── settings/               # Company Profile & User Management
```

### 2.2 Authentication & Security
- **Provider**: Firebase Authentication (Email/Password).
- **Custom Claims**: User tokens will carry `companyId` and `role` (`admin` or `viewer`).
- **Middleware**: `middleware.ts` will protect `/business/portal` routes, redirecting unauthenticated users to `/business/portal/login`.
- **Rogue Access Prevention**: Users must have a matching document in the `b2b_users` Firestore collection to gain access, ensuring only approved B2B clients can log in.

## 3. Data Schema (Firestore)

We will introduce 3 new collections to support this architecture.

### 3.1 `b2b_companies` (Collection)
Represents a corporate entity.
```typescript
interface B2BCompany {
    id: string;             // Auto-ID
    name: string;           // "Acme Corp"
    vatNumber: string;      // "BE0123456789"
    billingAddress: Address;
    deliveryAddresses: Address[]; // Multiple site support
    contactEmail: string;   // Main billing contact
    contractTier: 'standard' | 'premium' | 'enterprise'; // Determines pricing/SLA
    priceMultiplier: number; // e.g. 0.9 for 10% discount
    createdAt: Timestamp;
}
```

### 3.2 `b2b_users` (Collection)
Employees who can access the portal.
```typescript
interface B2BUser {
    uid: string;            // Firebase Auth UID
    companyId: string;      // Link to b2b_companies
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'viewer';
    isActive: boolean;
}
```

### 3.3 `b2b_inventory` (Collection)
The actual fleet devices managed by the company.
```typescript
interface FleetDevice {
    id: string;
    companyId: string;
    brand: string;          // "Apple"
    model: string;          // "iPhone 13"
    imei?: string;          // Optional
    serialNumber?: string;
    assignedTo?: string;    // "John Doe" (Employee Name)
    status: 'active' | 'in_repair' | 'sold' | 'retired';
    purchaseDate?: string;
    warrantyExpiration?: string;
    currentCondition?: 'good' | 'damaged';
}
```

## 4. Feature Roadmap

### Phase 1: Foundation & Auth (Week 3, Days 1-2)
- [ ] defined Firestore Security Rules for B2B collections.
- [ ] Create `b2b_companies` and `b2b_users` schema/types.
- [ ] Implement Login Page (`/business/portal/login`).
- [ ] Create `PortalLayout` with Sidebar and Auth Protection.
- [ ] Build "Company Settings" page to view/edit profile.

### Phase 2: Fleet Management (COMPLETE)
- [x] Create "My Fleet" Dashboard (`/fleet`).
- [x] Implement "Add Device" modal (Single Entry).
- [x] Implement "Bulk Upload" (CSV/Excel) for fleet import.
- [x] Device Detail View (Warranty status, repair history).

### Phase 3: Service Workflows (COMPLETE)
- [x] **Repair Request**: Select device from fleet -> Wizard -> Create Order.
- [x] **Buyback Request**: Select devices -> Get Estimate -> Generate Trade-in Offer.
- [x] **Order Tracking**: Specialized view for B2B orders with SLA timers.

### Phase 4: Financials (PARTIAL)
- [x] Invoices list with download.
- [ ] Monthly reporting (Total Spend, Savings from Repair vs Replace).

## 5. Implementation Details

### UI Components (Shadcn/Tailwind)
We will create a specific `PortalTable` component optimized for density and data:
- `sortable` headers.
- Multi-row selection.
- Status badges.
- Filtering/Search.

### Navigation Hierarchy
- **Dashboard**: High-level stats (Total Devices, Active Repairs).
- **Fleet**: The master list.
- **Service**: Active requests.
- **Account**: Settings & Team.

## 6. Immediate Next Steps
1.  Initialize the folder structure.
2.  Set up the first `b2b_company` document manually in Firestore for testing.
3.  Build the Login screen.
