# Authentication Module (Frontend)

## Purpose

Provides authentication UI components, hooks, and services for user login, signup, profile management, and session handling.

## Responsibilities

- Login and signup forms
- Password reset workflow
- Email verification UI
- User profile management
- Authentication state management
- Protected route handling
- Session persistence

## Key Components

### Components
- `LoginForm` - User login form
- `SignupForm` - User registration form
- `ForgotPasswordForm` - Password reset request
- `ResetPasswordForm` - Password reset with token
- `ChangePasswordModal` - Password change dialog
- `DeleteAccountModal` - Account deletion confirmation

### Hooks
- `useAuth` - Authentication state and actions
- `usePermissions` - Permission checking
- `useSession` - Session management

### Services
- `authService` - API client for authentication
- `tokenService` - JWT token management
- `sessionService` - Session persistence

### Context
- `AuthContext` - Global authentication state

### Types
- `User` - User data interface
- `AuthState` - Authentication state
- `LoginCredentials` - Login form data
- `SignupData` - Registration form data

## Module Boundaries

### Dependencies
- **Shared-Common**: Common utilities and types

### Public API (index.ts)
```typescript
export { LoginForm, SignupForm, ChangePasswordModal } from './components';
export { useAuth, usePermissions, useSession } from './hooks';
export { authService } from './services';
export type { User, AuthState, LoginCredentials } from './types';
```

## Usage Example

```typescript
import { useAuth, LoginForm } from '@/modules/authentication';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  
  return <LoginForm onSubmit={login} />;
}
```

## Testing Strategy

- Component tests for forms and UI
- Hook tests for authentication logic
- Integration tests for auth flows
- E2E tests for complete workflows

## Notes

- Authentication state is persisted in localStorage
- JWT tokens are automatically refreshed
- Protected routes redirect to login
- Session expires after 24 hours of inactivity
