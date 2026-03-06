# Payment Processing Module (Frontend)

## Purpose

Provides UI for shopping cart, checkout, payment processing, and order confirmation.

## Responsibilities

- Shopping cart display and management
- Checkout workflow
- Payment form integration
- Promo code application
- Order confirmation display

## Key Components

### Components
- `CartDisplayComponent` - Shopping cart UI
- `CheckoutUIComponent` - Checkout flow
- `OrderConfirmationComponent` - Order summary
- `PromoCodeInput` - Promo code entry
- `DiscountBreakdown` - Discount display

### Hooks
- `useCart` - Cart operations
- `useCheckout` - Checkout workflow
- `usePayment` - Payment processing

### Services
- `cartService` - Cart API client
- `checkoutService` - Checkout API
- `paymentService` - Payment processing

### Types
- `Cart` - Cart data interface
- `Order` - Order data interface
- `Payment` - Payment data interface

## Public API
```typescript
export { CartDisplayComponent, CheckoutUIComponent } from './components';
export { useCart, useCheckout } from './hooks';
export { cartService, checkoutService } from './services';
export type { Cart, Order, Payment } from './types';
```

## Notes

- Cart items reserved for 15 minutes
- Payment processing is PCI-DSS compliant
- Supports Stripe and PayPal
- Promo codes validated in real-time
