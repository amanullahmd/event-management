# Trust and Safety Module (Frontend)

## Purpose

Provides UI for organizer trust profiles, reviews, verification, and fraud detection displays.

## Responsibilities

- Organizer profile display
- Review submission and display
- Verification application
- Fraud detection summaries

## Key Components

### Components
- `OrganizerProfilePage` - Trust profile display
- `ReviewSubmissionComponent` - Submit reviews
- `ReviewsDisplayComponent` - Display reviews
- `VerificationApplicationComponent` - Apply for verification
- `FraudDetectionSummary` - Fraud metrics

### Hooks
- `useOrganizerProfile` - Profile operations
- `useReviews` - Review operations

### Services
- `trustService` - Trust and safety API

### Types
- `OrganizerProfile` - Profile interface
- `Review` - Review interface

## Public API
```typescript
export { OrganizerProfilePage, ReviewSubmissionComponent } from './components';
export { useOrganizerProfile, useReviews } from './hooks';
export { trustService } from './services';
export type { OrganizerProfile, Review } from './types';
```
