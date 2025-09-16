# VelocityDash - Vehicle Lifecycle Management Platform

**VelocityDash** is a proprietary, web-based software platform designed to be the central nervous system for Velocity Drive Ltd.'s operations. It provides end-to-end tracking of every vehicle from sourcing to sale, with a core focus on meticulous cost management and profitability analysis.

## 🎯 Executive Summary

VelocityDash serves as a comprehensive vehicle inventory and financial management system that enables real-time tracking, cost analysis, and profitability reporting for automotive dealerships. The platform provides investors with transparent, real-time insights into inventory, capital allocation, and unit economics, demonstrating operational control and scalability readiness.

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with TypeScript
- **Database**: Google Firestore (NoSQL)
- **Authentication**: TBD (not implemented in initial version)
- **Deployment**: Vercel (recommended)
- **Styling**: SCSS with custom dark theme

## 🎨 Design Philosophy

### Core Principles
- **Data-First**: Numbers and key metrics are the heroes
- **Intuitive Workflow**: Clear paths to all actions
- **Professional & Trustworthy**: Premium financial tool aesthetic
- **Mobile-First Responsive**: Seamless operation on any device

### Theme: "Apex Professional"
- **Mood**: Focused, calm, confident, powerful
- **Primary Background**: Dark mode (#1A202C - Midnight Slate)
- **Accent Color**: #38A169 (Velocity Green) for success/profit
- **Typography**: Inter font family for optimal screen readability

## 👥 User Personas & Access Levels

### Admin (Owner/Manager)
- Full, unrestricted access
- View all financial data and reports
- Add/edit/delete all records
- Manage user accounts
- Access to sensitive financial summaries

### Standard User (Staff/Assistant)
- Restricted access
- Add new vehicles and upload documents
- Add cost entries and change vehicle status
- Cannot view company profitability or manage users

## 🚀 Core Features

### Module 1: Dashboard (Mission Control)
- **Live Inventory Count**: Total vehicles in pipeline
- **Capital Deployed**: Sum of costs for all inventory
- **Ready for Sale Value**: Total listing value of vehicles ready for sale
- **Inventory Status Funnel**: Visual pipeline representation
- **Action Required List**: Smart bottleneck identification
- **Recent Activity Feed**: Real-time user action log

### Module 2: Vehicle Lifecycle Management
- **Master Inventory View**: Searchable, filterable vehicle table
- **Vehicle Profile Page**: Comprehensive vehicle record hub
  - Identification details (VIN, Make, Model, Year, etc.)
  - Acquisition details (Source, Purchase Date, Price)
  - Dynamic status tracker with workflow stages
  - Media hub for photos and videos
  - Document vault for all associated files

#### Vehicle Status Workflow
1. **Sourced**: Initial entry
2. **In Transit**: Shipped
3. **In Customs**: Arrived at port
4. **In Workshop**: Undergoing reconditioning
5. **For Sale**: Ready for customers
6. **Sale Pending**: Deposit taken
7. **Sold**: Finalized
8. **Archived**: Hidden from active views

### Module 3: Unit Cost Engine
- **Itemized Cost Entry**: Log every expense with categories
- **Multi-Currency Support**: USD, EUR, GBP with NGN conversion
- **Real-Time Cost Calculation**: Automatic total cost updates
- **Cost Categories**:
  - Purchase Price, Shipping, Customs Duty
  - Terminal Charges, Transportation
  - Mechanical/Body Parts & Labor
  - Detailing, Marketing, Overhead Allocation

### Module 4: Sales & Profitability Analysis
- **Deal Finalization**: Listing price, final sale price, sale date
- **Automated Calculations**:
  - Profit Margin = ((Final Sale Price - Total Landed & Ready Cost) / Final Sale Price) × 100
  - ROI = ((Final Sale Price - Total Landed & Ready Cost) / Total Landed & Ready Cost) × 100

### Module 5: Reporting & Business Intelligence
- **Sales Performance Report**: Date-range sales analysis
- **Inventory Aging Report**: Slow-moving stock identification
- **Expense Breakdown Report**: Cost category analysis
- **Data Export**: CSV/PDF export capabilities

## 🛠️ Technology Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **SCSS**: CSS preprocessor with custom design system
- **Headless UI**: Accessible component primitives
- **React Hook Form**: Form management
- **Zustand**: State management
- **React Query**: Server state management

### Database & Backend
- **Firestore**: NoSQL database for real-time data
- **Firebase SDK**: Client-side database operations
- **Firebase Security Rules**: Data access control

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Static type checking

## 📁 Project Structure

```
velocity-dash/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── vehicles/           # Vehicle management pages
│   │   ├── reports/            # Reporting pages
│   │   ├── globals.scss        # Global styles
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   ├── forms/              # Form components
│   │   ├── charts/             # Data visualization
│   │   └── layout/             # Layout components
│   ├── styles/                 # SCSS stylesheets
│   │   ├── abstracts/          # Variables, mixins, functions
│   │   ├── base/               # Reset, typography, base styles
│   │   ├── components/         # Component-specific styles
│   │   ├── layout/             # Layout-related styles
│   │   └── pages/              # Page-specific styles
│   ├── lib/                    # Utilities and configurations
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── utils.ts            # Helper functions
│   │   └── validations.ts      # Form validation schemas
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript type definitions
│   └── constants/              # App constants
├── public/                     # Static assets
├── docs/                       # Documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd velocity-dash
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your Firebase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette
- **Primary Background**: #1A202C (Midnight Slate)
- **Secondary Background**: #2D3748 (Graphite)
- **Accent Green**: #38A169 (Velocity Green)
- **Accent Blue**: #4299E1 (Signal Blue)
- **Text Primary**: #E2E8F0 (Cloud White)
- **Text Secondary**: #A0AEC0 (Steel Grey)
- **Warning**: #D69E2E (Amber)
- **Error**: #E53E3E (Crimson Red)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Inter Bold (36px for KPIs)
- **Subheadings**: Inter SemiBold (18px)
- **Body Text**: Inter Regular (14px-16px)

## 📊 Data Models

### Vehicle
```typescript
interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  status: VehicleStatus;
  acquisitionDetails: {
    sourceChannel: string;
    purchaseDate: Date;
    purchasePrice: number;
    currency: string;
    auctionLot?: string;
    listingUrl?: string;
  };
  media: {
    photos: string[];
    videos: string[];
  };
  documents: {
    billOfLading?: string;
    customsDeclaration?: string;
    title?: string;
    purchaseInvoice?: string;
    repairReceipts: string[];
  };
  costs: CostEntry[];
  saleDetails?: {
    listingPrice: number;
    finalSalePrice: number;
    saleDate: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Cost Entry
```typescript
interface CostEntry {
  id: string;
  vehicleId: string;
  date: Date;
  category: CostCategory;
  description: string;
  amount: number;
  currency: string;
  ngnAmount: number; // Converted amount
  exchangeRate: number;
  createdAt: Date;
}
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Style
- Follow the existing code style and patterns
- Use TypeScript for all new code
- Write meaningful commit messages
- Update documentation for new features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `out` directory to your hosting provider

## 📝 License

This project is proprietary software owned by Velocity Drive Ltd.

## 🤝 Contributing

This is a private project. Please follow the established coding standards and submit pull requests for review.

## 📞 Support

For technical support or questions, please contact the development team.

---

**VelocityDash** - Driving operational excellence through data-driven vehicle management.
