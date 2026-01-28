# Design Document: Event Management & Ticketing System Frontend

## Overview

The Event Management & Ticketing System Frontend is a Next.js 16.1.6 application with TypeScript that provides three distinct role-based dashboards (Admin, Organizer, Customer) along with public event discovery and checkout flows. The system uses shadcn/ui components with Tailwind CSS for a modern, professional, and colorful interface. All data is managed through dummy data sources for frontend development, with state management handled through React hooks and context.

The design prioritizes:
- **Role-Based Access Control**: Separate dashboards and features for Admin, Organizer, and Customer roles
- **Modern UI/UX**: Professional design with colorful accents, smooth animations, and responsive layouts
- **Component Reusability**: Leveraging shadcn/ui for consistent, accessible components
- **Scalability**: Modular architecture supporting future backend integration
- **Accessibility**: WCAG-compliant components with proper ARIA labels and keyboard navigation

## Architecture

### High-Level Structure

```
event-management-ticketing/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home/landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── events/page.tsx        # Event discovery
│   │   ├── events/[id]/page.tsx   # Event details
│   │   └── checkout/page.tsx
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout with sidebar
│   │   ├── page.tsx               # Dashboard
│   │   ├── users/page.tsx
│   │   ├── organizers/page.tsx
│   │   ├── events/page.tsx
│   │   ├── orders/page.tsx
│   │   └── settings/page.tsx
│   ├── organizer/
│   │   ├── layout.tsx             # Organizer layout with sidebar
│   │   ├── page.tsx               # Dashboard
│   │   ├── events/page.tsx
│   │   ├── events/new/page.tsx
│   │   ├── events/[id]/page.tsx
│   │   ├── events/[id]/tickets/page.tsx
│   │   ├── events/[id]/analytics/page.tsx
│   │   └── checkin/page.tsx
│   └── dashboard/
│       ├── layout.tsx             # Customer layout with sidebar
│       ├── page.tsx               # Dashboard
│       ├── orders/page.tsx
│       ├── orders/[id]/page.tsx
│       ├── tickets/page.tsx
│       └── profile/page.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── admin/
│   │   ├── UserManagement.tsx
│   │   ├── OrganizerVerification.tsx
│   │   ├── EventManagement.tsx
│   │   ├── OrderManagement.tsx
│   │   └── AnalyticsDashboard.tsx
│   ├── organizer/
│   │   ├── EventForm.tsx
│   │   ├── TicketTypeForm.tsx
│   │   ├── SalesAnalytics.tsx
│   │   ├── QRCodeScanner.tsx
│   │   └── CheckinStats.tsx
│   ├── customer/
│   │   ├── TicketCard.tsx
│   │   ├── OrderCard.tsx
│   │   ├── ProfileForm.tsx
│   │   └── TicketDownload.tsx
│   ├── public/
│   │   ├── EventCard.tsx
│   │   ├── EventFilter.tsx
│   │   ├── EventDetails.tsx
│   │   ├── TicketSelector.tsx
│   │   └── CheckoutForm.tsx
│   └── ui/
│       └── [shadcn/ui components]
├── lib/
│   ├── auth.ts                    # Authentication logic
│   ├── dummy-data.ts              # Mock data sources
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useEvents.ts
│   │   ├── useOrders.ts
│   │   └── useTickets.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── UserContext.tsx
│   │   └── CartContext.tsx
│   ├── types/
│   │   ├── user.ts
│   │   ├── event.ts
│   │   ├── ticket.ts
│   │   ├── order.ts
│   │   └── index.ts
│   └── utils/
│       ├── formatting.ts
│       ├── validation.ts
│       └── helpers.ts
├── styles/
│   └── globals.css                # Tailwind + custom styles
├── public/
│   ├── images/
│   └── icons/
└── package.json
```

### Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (useAuth, useEvents, etc.)
    ↓
Context Update / State Update
    ↓
Component Re-render
    ↓
UI Update
```

### Authentication & Authorization Flow

```
Login/Register
    ↓
AuthContext stores user + role
    ↓
Protected Routes check role
    ↓
Redirect to role-based dashboard
    ↓
Role-specific components render
```

## Components and Interfaces

### Core Type Definitions

```typescript
// User Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'customer';
  status: 'active' | 'blocked';
  createdAt: Date;
  profileImage?: string;
}

interface OrganizerProfile extends User {
  businessName: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: Document[];
  commissionRate: number;
}

// Event Types
interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  date: Date;
  location: string;
  category: string;
  image: string;
  status: 'active' | 'inactive' | 'cancelled';
  ticketTypes: TicketType[];
  totalAttendees: number;
  createdAt: Date;
}

interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  type: 'vip' | 'regular' | 'early-bird';
}

// Order Types
interface Order {
  id: string;
  customerId: string;
  eventId: string;
  tickets: OrderTicket[];
  totalAmount: number;
  status: 'completed' | 'pending' | 'refunded';
  paymentMethod: string;
  createdAt: Date;
}

interface OrderTicket {
  id: string;
  ticketTypeId: string;
  quantity: number;
  qrCode: string;
  checkedIn: boolean;
}

// Ticket Types
interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: Date;
}
```

### Context Providers

**AuthContext**
- Manages current user authentication state
- Provides login/logout/register functions
- Stores user role for RBAC
- Persists session in localStorage

**UserContext**
- Manages user profile data
- Provides user update functions
- Caches user information

**CartContext**
- Manages shopping cart state
- Provides add/remove/update cart functions
- Calculates totals and fees

### Custom Hooks

**useAuth()**
- Returns current user, isLoading, isAuthenticated
- Provides login, logout, register functions
- Handles role-based redirects

**useEvents()**
- Returns events list, loading state
- Provides search, filter, sort functions
- Handles event CRUD operations

**useOrders()**
- Returns user's orders
- Provides order details retrieval
- Handles refund requests

**useTickets()**
- Returns user's tickets
- Provides ticket download/print functions
- Handles QR code generation

### Component Hierarchy

**Layout Components**
- `RootLayout`: Wraps entire app with providers
- `AdminLayout`: Admin dashboard layout with sidebar
- `OrganizerLayout`: Organizer dashboard layout with sidebar
- `CustomerLayout`: Customer dashboard layout with sidebar
- `PublicLayout`: Public pages layout

**Page Components**
- Admin: Dashboard, Users, Organizers, Events, Orders, Settings
- Organizer: Dashboard, Events, Event Details, Tickets, Analytics, Check-in
- Customer: Dashboard, Orders, Tickets, Profile
- Public: Home, Events, Event Details, Checkout, Auth

**Feature Components**
- Admin: UserManagement, OrganizerVerification, EventManagement, OrderManagement, AnalyticsDashboard
- Organizer: EventForm, TicketTypeForm, SalesAnalytics, QRCodeScanner, CheckinStats
- Customer: TicketCard, OrderCard, ProfileForm, TicketDownload
- Public: EventCard, EventFilter, EventDetails, TicketSelector, CheckoutForm

**UI Components (shadcn/ui)**
- Button, Input, Select, Checkbox, Radio
- Card, Dialog, Dropdown Menu, Tabs
- Table, Pagination, Badge, Alert
- Form, Label, Textarea, DatePicker
- Toast, Tooltip, Popover, Sidebar

## Data Models

### User Model
- Stores user information with role-based attributes
- Supports three roles: admin, organizer, customer
- Tracks user status (active/blocked)
- Includes profile image and metadata

### Event Model
- Represents events with full details
- Links to organizer via organizerId
- Contains multiple ticket types
- Tracks event status and attendance

### Ticket Type Model
- Defines pricing tiers (VIP, Regular, Early Bird)
- Tracks quantity and sales
- Supports dynamic pricing

### Order Model
- Represents customer purchases
- Contains multiple tickets
- Tracks payment and refund status
- Links customer to event

### Ticket Model
- Individual ticket instance
- Contains QR code for validation
- Tracks check-in status
- Links to order and event

### Analytics Model
- Aggregates sales data
- Tracks revenue by ticket type
- Provides time-series data for charts
- Supports filtering by date range

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Acceptance Criteria Testing Prework

**1.1 Dashboard displays key metrics**
  Thoughts: This is testing that when the dashboard loads, specific metrics are displayed. We can generate random dummy data, load the dashboard, and verify that all expected metrics are rendered.
  Testable: yes - property

**1.2 Recent activity feed shows latest activities**
  Thoughts: This is testing that the activity feed displays the most recent activities in correct order. We can generate activities with timestamps, render the feed, and verify they're sorted correctly.
  Testable: yes - property

**2.1 User list displays all users**
  Thoughts: This is testing that the user list renders all users from dummy data. We can generate a set of users, render the list, and verify all users are displayed.
  Testable: yes - property

**2.2 User blocking updates status**
  Thoughts: This is testing that blocking a user updates their status immediately. We can block a user and verify the status changes in the UI.
  Testable: yes - property

**3.1 Organizer list shows verification status**
  Thoughts: This is testing that organizers are displayed with their verification status. We can generate organizers with different statuses and verify they're displayed correctly.
  Testable: yes - property

**4.1 Event list displays all events**
  Thoughts: This is testing that all events are rendered in the list. We can generate events and verify they all appear.
  Testable: yes - property

**7.1 Event creation form validates required fields**
  Thoughts: This is testing that the form rejects submissions with missing required fields. We can submit forms with missing fields and verify validation errors appear.
  Testable: yes - property

**8.1 Ticket type creation validates inputs**
  Thoughts: This is testing that ticket type form validates price and quantity. We can submit invalid data and verify errors appear.
  Testable: yes - property

**9.1 Analytics displays correct sales data**
  Thoughts: This is testing that analytics calculations are correct. We can generate sales data, render analytics, and verify calculations match expected values.
  Testable: yes - property

**10.1 QR code scanner validates tickets**
  Thoughts: This is testing that scanning a valid QR code marks the ticket as checked in. We can generate a QR code, scan it, and verify the ticket status updates.
  Testable: yes - property

**13.1 Ticket download generates PDF**
  Thoughts: This is testing that clicking download generates a PDF file. We can verify that a download is triggered with correct content.
  Testable: yes - property

**16.1 Event search filters by keyword**
  Thoughts: This is testing that searching for events returns only matching results. We can search for keywords and verify only relevant events appear.
  Testable: yes - property

**17.1 Ticket selection updates cart**
  Thoughts: This is testing that selecting tickets adds them to the cart. We can select tickets and verify the cart updates.
  Testable: yes - property

**18.1 Checkout calculates totals correctly**
  Thoughts: This is testing that checkout totals are calculated correctly. We can add items to cart and verify the total matches expected calculation.
  Testable: yes - property

**19.1 Login authenticates user**
  Thoughts: This is testing that valid credentials authenticate the user. We can submit valid credentials and verify the user is logged in.
  Testable: yes - property

**19.2 Protected routes redirect unauthorized users**
  Thoughts: This is testing that accessing protected routes without authentication redirects to login. We can attempt to access protected routes and verify redirects.
  Testable: yes - property

**20.1 Responsive design adapts to screen sizes**
  Thoughts: This is testing that the layout adapts to different viewport sizes. We can render at different sizes and verify layout changes appropriately.
  Testable: yes - property

**21.1 UI components have accessible labels**
  Thoughts: This is testing that interactive elements have proper ARIA labels. We can verify that all buttons, inputs, and interactive elements have labels.
  Testable: yes - property

**22.1 Dummy data persists across actions**
  Thoughts: This is testing that when users perform actions, dummy data updates are reflected. We can perform an action and verify the data changes.
  Testable: yes - property

### Property Reflection

After reviewing all testable criteria, I've identified the following properties that provide comprehensive coverage without redundancy:

1. **Dashboard metrics display** - Covers requirement 1.1
2. **Activity feed ordering** - Covers requirement 1.2
3. **User list completeness** - Covers requirement 2.1
4. **User status updates** - Covers requirement 2.2
5. **Organizer verification display** - Covers requirement 3.1
6. **Event list completeness** - Covers requirement 4.1
7. **Form validation** - Covers requirements 7.1, 8.1
8. **Analytics calculations** - Covers requirement 9.1
9. **QR code validation** - Covers requirement 10.1
10. **Ticket download** - Covers requirement 13.1
11. **Event search filtering** - Covers requirement 16.1
12. **Cart updates** - Covers requirement 17.1
13. **Checkout calculations** - Covers requirement 18.1
14. **Authentication** - Covers requirement 19.1
15. **Route protection** - Covers requirement 19.2
16. **Responsive layouts** - Covers requirement 20.1
17. **Accessibility labels** - Covers requirement 21.1
18. **Data persistence** - Covers requirement 22.1

### Correctness Properties

**Property 1: Dashboard metrics are displayed**
*For any* admin user viewing the dashboard, all key metrics (total users, total organizers, total events, total revenue) should be rendered on the page.
**Validates: Requirements 1.1**

**Property 2: Activity feed is sorted by recency**
*For any* set of activities with timestamps, the activity feed should display them in descending order by timestamp (most recent first).
**Validates: Requirements 1.2**

**Property 3: User list contains all users**
*For any* set of users in dummy data, the user management page should display all users in the list.
**Validates: Requirements 2.1**

**Property 4: User status updates are reflected immediately**
*For any* user, when their status is changed (blocked/unblocked), the UI should immediately reflect the new status without requiring a page refresh.
**Validates: Requirements 2.2**

**Property 5: Organizer verification status is displayed**
*For any* organizer, their verification status (pending/verified/rejected) should be visible in the organizer list.
**Validates: Requirements 3.1**

**Property 6: Event list displays all events**
*For any* set of events in dummy data, the event management page should display all events in the list.
**Validates: Requirements 4.1**

**Property 7: Form validation prevents invalid submissions**
*For any* form (event creation, ticket type creation), submitting with missing required fields should display validation errors and prevent submission.
**Validates: Requirements 7.1, 8.1**

**Property 8: Analytics calculations are accurate**
*For any* set of sales data, the analytics dashboard should display correct totals, revenue, and distributions that match the underlying data.
**Validates: Requirements 9.1**

**Property 9: QR code scanning marks tickets as checked in**
*For any* valid QR code, scanning it should mark the associated ticket as checked in and display attendee information.
**Validates: Requirements 10.1**

**Property 10: Ticket download generates valid PDF**
*For any* ticket, clicking download should generate a PDF file containing ticket details and QR code.
**Validates: Requirements 13.1**

**Property 11: Event search returns only matching results**
*For any* search query, the event discovery page should return only events whose name, description, or category matches the search term.
**Validates: Requirements 16.1**

**Property 12: Cart updates reflect selected tickets**
*For any* ticket selection, adding tickets to the cart should update the cart count and display selected items.
**Validates: Requirements 17.1**

**Property 13: Checkout totals are calculated correctly**
*For any* set of items in the cart, the checkout page should display a total that equals the sum of item prices plus applicable fees.
**Validates: Requirements 18.1**

**Property 14: Valid credentials authenticate user**
*For any* valid user credentials, submitting the login form should authenticate the user and redirect to their role-based dashboard.
**Validates: Requirements 19.1**

**Property 15: Protected routes redirect unauthorized users**
*For any* protected route accessed by an unauthenticated user, the system should redirect to the login page.
**Validates: Requirements 19.2**

**Property 16: Layout adapts to viewport size**
*For any* viewport size (mobile, tablet, desktop), the layout should adapt appropriately with no horizontal scrolling or content overflow.
**Validates: Requirements 20.1**

**Property 17: Interactive elements have accessibility labels**
*For any* interactive element (button, input, link), it should have proper ARIA labels or semantic HTML that screen readers can interpret.
**Validates: Requirements 21.1**

**Property 18: Data updates persist across user actions**
*For any* action that modifies data (creating event, blocking user, adding ticket), the change should be reflected in the UI and persist until the page is refreshed.
**Validates: Requirements 22.1**

## Error Handling

### Authentication Errors
- Invalid credentials: Display "Invalid email or password" message
- Account blocked: Display "Your account has been blocked" message
- Session expired: Redirect to login with "Session expired" message

### Form Validation Errors
- Required field missing: Display "This field is required" inline
- Invalid email format: Display "Please enter a valid email" inline
- Invalid price/quantity: Display "Please enter a valid number" inline
- Duplicate event name: Display "An event with this name already exists" inline

### Data Loading Errors
- Failed to load users: Display "Failed to load users. Please try again." with retry button
- Failed to load events: Display "Failed to load events. Please try again." with retry button
- Failed to load orders: Display "Failed to load orders. Please try again." with retry button

### Action Errors
- Failed to create event: Display toast "Failed to create event. Please try again."
- Failed to update user: Display toast "Failed to update user. Please try again."
- Failed to process refund: Display toast "Failed to process refund. Please try again."

### Network Errors
- Network timeout: Display "Network timeout. Please check your connection."
- Server error: Display "Server error. Please try again later."

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions:

1. **Component Rendering Tests**
   - Verify components render with correct props
   - Test conditional rendering based on state
   - Verify event handlers are called correctly

2. **Hook Tests**
   - Test useAuth hook with valid/invalid credentials
   - Test useEvents hook with filtering and sorting
   - Test useOrders hook with order retrieval
   - Test useTickets hook with ticket operations

3. **Utility Function Tests**
   - Test formatting functions (date, currency, phone)
   - Test validation functions (email, password, phone)
   - Test calculation functions (totals, fees, discounts)

4. **Integration Tests**
   - Test login flow end-to-end
   - Test event creation flow
   - Test checkout flow
   - Test ticket download flow

### Property-Based Testing Approach

Property-based tests verify universal properties across all inputs using a testing library like `fast-check` for TypeScript:

**Testing Library**: fast-check (https://github.com/dubzzz/fast-check)

**Configuration**:
- Minimum 100 iterations per property test
- Custom generators for domain objects (User, Event, Order, Ticket)
- Shrinking enabled for failure analysis

**Property Test Structure**:
```typescript
import fc from 'fast-check';

// Feature: event-management-ticketing, Property 1: Dashboard metrics are displayed
test('Property 1: Dashboard metrics are displayed', () => {
  fc.assert(
    fc.property(
      fc.array(userArbitrary()),
      fc.array(eventArbitrary()),
      fc.array(orderArbitrary()),
      (users, events, orders) => {
        // Render dashboard with dummy data
        // Verify all metrics are displayed
        // Assert metrics match data
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Tests to Implement**:

1. **Property 1: Dashboard metrics are displayed**
   - Feature: event-management-ticketing, Property 1: Dashboard metrics are displayed
   - Generate random users, events, orders
   - Render dashboard
   - Verify all metrics are rendered

2. **Property 2: Activity feed is sorted by recency**
   - Feature: event-management-ticketing, Property 2: Activity feed is sorted by recency
   - Generate activities with random timestamps
   - Render activity feed
   - Verify activities are sorted descending by timestamp

3. **Property 3: User list contains all users**
   - Feature: event-management-ticketing, Property 3: User list contains all users
   - Generate random users
   - Render user list
   - Verify all users are displayed

4. **Property 4: User status updates are reflected immediately**
   - Feature: event-management-ticketing, Property 4: User status updates are reflected immediately
   - Generate random user
   - Block/unblock user
   - Verify status updates in UI

5. **Property 5: Organizer verification status is displayed**
   - Feature: event-management-ticketing, Property 5: Organizer verification status is displayed
   - Generate organizers with random verification statuses
   - Render organizer list
   - Verify all statuses are displayed

6. **Property 6: Event list displays all events**
   - Feature: event-management-ticketing, Property 6: Event list displays all events
   - Generate random events
   - Render event list
   - Verify all events are displayed

7. **Property 7: Form validation prevents invalid submissions**
   - Feature: event-management-ticketing, Property 7: Form validation prevents invalid submissions
   - Generate forms with missing required fields
   - Attempt submission
   - Verify validation errors appear

8. **Property 8: Analytics calculations are accurate**
   - Feature: event-management-ticketing, Property 8: Analytics calculations are accurate
   - Generate random sales data
   - Render analytics
   - Verify calculations match expected values

9. **Property 9: QR code scanning marks tickets as checked in**
   - Feature: event-management-ticketing, Property 9: QR code scanning marks tickets as checked in
   - Generate random QR code
   - Scan QR code
   - Verify ticket is marked as checked in

10. **Property 10: Ticket download generates valid PDF**
    - Feature: event-management-ticketing, Property 10: Ticket download generates valid PDF
    - Generate random ticket
    - Download ticket
    - Verify PDF is generated with correct content

11. **Property 11: Event search returns only matching results**
    - Feature: event-management-ticketing, Property 11: Event search returns only matching results
    - Generate random events and search queries
    - Search for events
    - Verify only matching events are returned

12. **Property 12: Cart updates reflect selected tickets**
    - Feature: event-management-ticketing, Property 12: Cart updates reflect selected tickets
    - Generate random tickets
    - Add tickets to cart
    - Verify cart updates correctly

13. **Property 13: Checkout totals are calculated correctly**
    - Feature: event-management-ticketing, Property 13: Checkout totals are calculated correctly
    - Generate random cart items
    - Calculate checkout total
    - Verify total equals sum of items plus fees

14. **Property 14: Valid credentials authenticate user**
    - Feature: event-management-ticketing, Property 14: Valid credentials authenticate user
    - Generate random valid credentials
    - Submit login form
    - Verify user is authenticated

15. **Property 15: Protected routes redirect unauthorized users**
    - Feature: event-management-ticketing, Property 15: Protected routes redirect unauthorized users
    - Attempt to access protected route without authentication
    - Verify redirect to login page

16. **Property 16: Layout adapts to viewport size**
    - Feature: event-management-ticketing, Property 16: Layout adapts to viewport size
    - Render at different viewport sizes
    - Verify layout adapts appropriately

17. **Property 17: Interactive elements have accessibility labels**
    - Feature: event-management-ticketing, Property 17: Interactive elements have accessibility labels
    - Render all interactive elements
    - Verify all have proper ARIA labels

18. **Property 18: Data updates persist across user actions**
    - Feature: event-management-ticketing, Property 18: Data updates persist across user actions
    - Perform random data-modifying actions
    - Verify changes are reflected in UI

### Test Coverage Goals

- **Unit Tests**: 80% code coverage for components and hooks
- **Property Tests**: 100% coverage of correctness properties
- **Integration Tests**: All major user flows (login, event creation, checkout, ticket download)
- **Accessibility Tests**: All interactive elements have proper labels and keyboard navigation

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **Property-Based Testing**: fast-check
- **E2E Testing**: Playwright (optional, for critical flows)
- **Accessibility Testing**: axe-core + jest-axe

