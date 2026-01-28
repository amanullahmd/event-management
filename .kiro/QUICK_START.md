# EventHub - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install & Run
```bash
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

### 2. Login with Demo Credentials

**Option A: Admin**
- Email: `admin@example.com`
- Password: `admin123`
- Go to: http://localhost:3000/admin

**Option B: Organizer**
- Email: `organizer1@example.com`
- Password: `organizer123`
- Go to: http://localhost:3000/organizer

**Option C: Customer**
- Email: `customer1@example.com`
- Password: `customer123`
- Go to: http://localhost:3000/dashboard

### 3. Explore Features

#### As a Customer
1. Visit http://localhost:3000/events
2. Browse events by category
3. Search for specific events
4. Click on an event to view details
5. Purchase tickets
6. View your orders at http://localhost:3000/dashboard/orders

#### As an Organizer
1. Go to http://localhost:3000/organizer/events
2. Create a new event
3. Add ticket types with pricing
4. View analytics at http://localhost:3000/organizer/events/[id]/analytics
5. Use QR check-in at http://localhost:3000/organizer/checkin

#### As an Admin
1. Go to http://localhost:3000/admin
2. View platform analytics
3. Manage users at http://localhost:3000/admin/users
4. Manage events at http://localhost:3000/admin/events
5. View organizers at http://localhost:3000/admin/organizers

## 📋 Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | / | Landing page with featured events |
| Events | /events | Browse all events |
| Event Details | /events/[id] | View event details |
| Login | /auth/login | User login |
| Register | /auth/register | New user registration |
| Admin Dashboard | /admin | Platform overview |
| Organizer Dashboard | /organizer | Event management |
| Customer Dashboard | /dashboard | My orders & tickets |

## 🧪 Testing Features

### Test Event Discovery
1. Go to http://localhost:3000/events
2. Use filters: Category, Location, Date Range
3. Search for keywords
4. View featured events on homepage

### Test Ticketing
1. Browse events
2. Click on an event
3. Select ticket type and quantity
4. Complete checkout
5. View tickets in dashboard

### Test Analytics
1. Login as organizer
2. Go to organizer events
3. Click on an event
4. View analytics dashboard
5. See revenue and attendance data

### Test Admin Features
1. Login as admin
2. Go to admin dashboard
3. Manage users, events, organizers
4. View platform analytics
5. Configure settings

## 🎨 Design Features

- **Modern UI**: Clean, professional design
- **Dark Mode**: Full dark mode support
- **Responsive**: Works on all devices
- **Animations**: Smooth transitions and effects
- **Accessibility**: WCAG 2.1 AA compliant

## 🧪 Run Tests

```bash
# Run all tests
npm test -- --run

# Run specific test
npm test -- --testPathPattern="admin-dashboard"

# Watch mode
npm test
```

## 📊 Performance

- **Image Optimization**: AVIF/WebP formats
- **Lazy Loading**: Components load on demand
- **Code Splitting**: Route-based splitting
- **Caching**: HTTP headers configured
- **CSS Optimization**: ~30% reduction

## 🔐 Security

- Role-based access control
- Protected routes
- Input validation
- Secure authentication
- XSS/CSRF protection

## 📱 Responsive Design

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
npm install
```

### Build Errors
```bash
# Clean build
rm -rf .next
npm run build
```

## 📚 Documentation

- **README.md** - Full documentation
- **DEMO_CREDENTIALS.md** - All test accounts
- **PERFORMANCE_OPTIMIZATIONS.md** - Performance details
- **IMPLEMENTATION_SUMMARY.md** - Project overview

## 🎯 Next Steps

1. ✅ Explore the landing page
2. ✅ Browse events as a customer
3. ✅ Create an event as an organizer
4. ✅ Manage platform as an admin
5. ✅ Run tests to verify functionality

## 💡 Tips

- Use browser DevTools to inspect responsive design
- Check dark mode by toggling system preference
- Test keyboard navigation for accessibility
- View console for any warnings/errors
- Check Network tab for performance metrics

## 🚀 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📞 Support

For detailed information, see:
- README.md - Complete documentation
- .kiro/DEMO_CREDENTIALS.md - All credentials
- .kiro/PERFORMANCE_OPTIMIZATIONS.md - Performance guide

---

**Happy Testing! 🎉**

Start with the landing page and explore all features. All demo accounts are ready to use!
