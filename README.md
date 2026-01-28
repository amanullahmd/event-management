# EventHub - Modern Event Management & Ticketing Platform

A professional, feature-rich event management and ticketing system built with Next.js, React, and TypeScript. Manage events, sell tickets, and track analytics with ease.

## 🚀 Features

- **Event Discovery**: Browse and search events with advanced filtering
- **Ticket Management**: Create, manage, and sell tickets with multiple pricing tiers
- **QR Code Check-in**: Scan tickets at events for seamless entry
- **Analytics Dashboard**: Real-time insights into event performance and revenue
- **Organizer Portal**: Complete event management tools
- **Admin Panel**: Platform-wide management and monitoring
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 compliant with full keyboard navigation
- **Performance Optimized**: Lazy loading, code splitting, and caching

## 📋 Demo Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: Platform administrator with full system access

### Organizer Account
- **Email**: `organizer1@example.com`
- **Password**: `organizer123`
- **Role**: Event organizer with event management capabilities

### Customer Account
- **Email**: `customer1@example.com`
- **Password**: `customer123`
- **Role**: Regular user who can browse and purchase tickets

## 🌐 Application URLs

### Public Pages
- **Home**: `http://localhost:3000/`
- **Events Listing**: `http://localhost:3000/events`
- **Event Details**: `http://localhost:3000/events/[event-id]`

### Authentication
- **Login**: `http://localhost:3000/auth/login`
- **Register**: `http://localhost:3000/auth/register`

### Customer Dashboard
- **Dashboard Home**: `http://localhost:3000/dashboard`
- **My Orders**: `http://localhost:3000/dashboard/orders`
- **Order Details**: `http://localhost:3000/dashboard/orders/[order-id]`
- **My Tickets**: `http://localhost:3000/dashboard/tickets`
- **Profile**: `http://localhost:3000/dashboard/profile`

### Organizer Portal
- **Organizer Home**: `http://localhost:3000/organizer`
- **My Events**: `http://localhost:3000/organizer/events`
- **Create Event**: `http://localhost:3000/organizer/events/new`
- **Event Details**: `http://localhost:3000/organizer/events/[event-id]`
- **Event Analytics**: `http://localhost:3000/organizer/events/[event-id]/analytics`
- **Manage Tickets**: `http://localhost:3000/organizer/events/[event-id]/tickets`
- **Add Ticket Type**: `http://localhost:3000/organizer/events/[event-id]/tickets/new`
- **QR Check-in**: `http://localhost:3000/organizer/checkin`
- **My Tickets**: `http://localhost:3000/organizer/tickets`
- **Refund Requests**: `http://localhost:3000/organizer/refunds`

### Admin Dashboard
- **Admin Home**: `http://localhost:3000/admin`
- **Analytics**: `http://localhost:3000/admin/analytics`
- **Events Management**: `http://localhost:3000/admin/events`
- **Orders Management**: `http://localhost:3000/admin/orders`
- **Users Management**: `http://localhost:3000/admin/users`
- **Organizers Management**: `http://localhost:3000/admin/organizers`
- **Settings**: `http://localhost:3000/admin/settings`

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: React Context API
- **Testing**: Jest, React Testing Library, fast-check (Property-Based Testing)
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React
- **QR Codes**: qrcode.react
- **PDF Export**: jsPDF, html2canvas

## 📦 Installation

### Prerequisites
- Node.js 18+ or pnpm
- npm or pnpm package manager

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd event-management

# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev

# Open browser
# Navigate to http://localhost:3000
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test -- src/components/admin/__tests__/admin-dashboard.test.ts
```

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes
│   ├── (public)/                 # Public routes
│   ├── admin/                    # Admin dashboard
│   ├── organizer/                # Organizer portal
│   ├── dashboard/                # Customer dashboard
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── common/                   # Shared components
│   ├── customer/                 # Customer components
│   ├── organizer/                # Organizer components
│   ├── public/                   # Public components
│   └── ui/                       # UI components (shadcn/ui)
├── lib/                          # Utilities and helpers
│   ├── context/                  # React Context
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   └── dummy-data.ts             # Mock data
└── styles/                       # Global styles
```

## 🎨 Design Highlights

- **Modern UI**: Clean, professional design with smooth animations
- **Dark Mode Support**: Full dark mode implementation
- **Responsive Layout**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized images, lazy loading, code splitting
- **Consistent Branding**: Unified color scheme and typography

## 📊 Key Features Breakdown

### Event Management
- Create and publish events
- Set multiple ticket types with different pricing
- Manage event details and descriptions
- Track event analytics and performance

### Ticketing System
- Multiple ticket types per event
- Dynamic pricing support
- Inventory management
- Ticket validation and check-in

### Analytics
- Real-time event metrics
- Revenue tracking
- Attendance analytics
- Organizer performance insights

### Admin Controls
- User management and moderation
- Organizer verification
- Platform-wide analytics
- System settings and configuration

## 🔒 Security Features

- Role-based access control (RBAC)
- Protected routes and endpoints
- Input validation and sanitization
- Secure authentication flow
- XSS and CSRF protection

## 📱 Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🚀 Performance Optimizations

- Image optimization with AVIF/WebP formats
- Lazy loading of components
- Code splitting by route
- HTTP caching headers
- CSS optimization
- Memoization of expensive computations

## 📝 Development Guide

### Adding a New Page

1. Create a new file in `src/app/[route]/page.tsx`
2. Use the layout from parent directory
3. Import necessary components
4. Add TypeScript types

### Adding a New Component

1. Create component in `src/components/[category]/`
2. Use React.memo for optimization
3. Add JSDoc comments
4. Create corresponding test file

### Adding Tests

1. Create test file with `.test.ts` or `.test.tsx` suffix
2. Use Jest and React Testing Library
3. Add property-based tests with fast-check
4. Ensure >80% code coverage

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors
```bash
# Clean build
rm -rf .next
npm run build
```

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@eventhub.com or open an issue on GitHub.

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Social media integration
- [ ] Advanced reporting
- [ ] API documentation
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

---

**EventHub** - Making event management simple, powerful, and accessible to everyone.
