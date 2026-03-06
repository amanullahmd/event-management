import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

/**
 * Profile Validation Tests
 * Tests for frontend profile form validation
 */

describe('Profile Form Validation', () => {
  // Mock validation function
  const validateProfile = (profile: any) => {
    const errors: any = {};

    // First name validation
    if (!profile.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (profile.firstName.trim().length > 100) {
      errors.firstName = 'First name must not exceed 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(profile.firstName.trim())) {
      errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Last name validation
    if (!profile.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (profile.lastName.trim().length > 100) {
      errors.lastName = 'Last name must not exceed 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(profile.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Phone number validation (optional)
    if (profile.phoneNumber?.trim()) {
      const phone = profile.phoneNumber.trim();
      if (phone.length < 7 || phone.length > 20) {
        errors.phoneNumber = 'Phone number must be between 7 and 20 characters';
      } else if (!/^[0-9\-\+\s\(\)]+$/.test(phone)) {
        errors.phoneNumber = 'Phone number can only contain numbers, spaces, hyphens, plus, and parentheses';
      }
    }

    // ZIP code validation (optional)
    if (profile.zipPostalCode?.trim()) {
      const zip = profile.zipPostalCode.trim();
      if (zip.length < 1 || zip.length > 20) {
        errors.zipPostalCode = 'ZIP code must be between 1 and 20 characters';
      } else if (!/^[0-9\-]+$/.test(zip)) {
        errors.zipPostalCode = 'ZIP code can only contain numbers and hyphens';
      }
    }

    // Street address validation (optional)
    if (profile.streetAddress?.trim()?.length > 255) {
      errors.streetAddress = 'Street address must not exceed 255 characters';
    }

    // City validation (optional)
    if (profile.city?.trim()) {
      const city = profile.city.trim();
      if (city.length > 100) {
        errors.city = 'City must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(city)) {
        errors.city = 'City can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    return errors;
  };

  describe('First Name Validation', () => {
    test('should reject empty first name', () => {
      const profile = { firstName: '', lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBe('First name is required');
    });

    test('should reject first name exceeding 100 characters', () => {
      const profile = { firstName: 'a'.repeat(101), lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBe('First name must not exceed 100 characters');
    });

    test('should reject first name with invalid characters', () => {
      const profile = { firstName: 'John@123', lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBe('First name can only contain letters, spaces, hyphens, and apostrophes');
    });

    test('should accept valid first name', () => {
      const profile = { firstName: 'John', lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBeUndefined();
    });

    test('should accept first name with apostrophe', () => {
      const profile = { firstName: "O'Brien", lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBeUndefined();
    });

    test('should accept first name with hyphen', () => {
      const profile = { firstName: 'Mary-Jane', lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBeUndefined();
    });

    test('should trim whitespace from first name', () => {
      const profile = { firstName: '  John  ', lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBeUndefined();
    });
  });

  describe('Last Name Validation', () => {
    test('should reject empty last name', () => {
      const profile = { firstName: 'John', lastName: '' };
      const errors = validateProfile(profile);
      expect(errors.lastName).toBe('Last name is required');
    });

    test('should reject last name exceeding 100 characters', () => {
      const profile = { firstName: 'John', lastName: 'a'.repeat(101) };
      const errors = validateProfile(profile);
      expect(errors.lastName).toBe('Last name must not exceed 100 characters');
    });

    test('should reject last name with invalid characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe@123' };
      const errors = validateProfile(profile);
      expect(errors.lastName).toBe('Last name can only contain letters, spaces, hyphens, and apostrophes');
    });

    test('should accept valid last name', () => {
      const profile = { firstName: 'John', lastName: 'Doe' };
      const errors = validateProfile(profile);
      expect(errors.lastName).toBeUndefined();
    });
  });

  describe('Phone Number Validation', () => {
    test('should accept empty phone number (optional field)', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '' };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBeUndefined();
    });

    test('should reject phone number too short', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '123' };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBe('Phone number must be between 7 and 20 characters');
    });

    test('should reject phone number too long', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '1'.repeat(21) };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBe('Phone number must be between 7 and 20 characters');
    });

    test('should reject phone number with invalid characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '555-CALL' };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBe('Phone number can only contain numbers, spaces, hyphens, plus, and parentheses');
    });

    test('should accept valid phone number with dashes', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '555-123-4567' };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBeUndefined();
    });

    test('should accept valid phone number with parentheses', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '(555) 123-4567' };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBeUndefined();
    });

    test('should accept valid phone number with plus', () => {
      const profile = { firstName: 'John', lastName: 'Doe', phoneNumber: '+1 555-123-4567' };
      const errors = validateProfile(profile);
      expect(errors.phoneNumber).toBeUndefined();
    });
  });

  describe('ZIP Code Validation', () => {
    test('should accept empty ZIP code (optional field)', () => {
      const profile = { firstName: 'John', lastName: 'Doe', zipPostalCode: '' };
      const errors = validateProfile(profile);
      expect(errors.zipPostalCode).toBeUndefined();
    });

    test('should reject ZIP code with invalid characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe', zipPostalCode: 'ABC123' };
      const errors = validateProfile(profile);
      expect(errors.zipPostalCode).toBe('ZIP code can only contain numbers and hyphens');
    });

    test('should accept valid ZIP code', () => {
      const profile = { firstName: 'John', lastName: 'Doe', zipPostalCode: '12345' };
      const errors = validateProfile(profile);
      expect(errors.zipPostalCode).toBeUndefined();
    });

    test('should accept valid ZIP code with hyphen', () => {
      const profile = { firstName: 'John', lastName: 'Doe', zipPostalCode: '12345-6789' };
      const errors = validateProfile(profile);
      expect(errors.zipPostalCode).toBeUndefined();
    });

    test('should reject ZIP code exceeding 20 characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe', zipPostalCode: '1'.repeat(21) };
      const errors = validateProfile(profile);
      expect(errors.zipPostalCode).toBe('ZIP code must be between 1 and 20 characters');
    });
  });

  describe('Street Address Validation', () => {
    test('should accept empty street address (optional field)', () => {
      const profile = { firstName: 'John', lastName: 'Doe', streetAddress: '' };
      const errors = validateProfile(profile);
      expect(errors.streetAddress).toBeUndefined();
    });

    test('should reject street address exceeding 255 characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe', streetAddress: 'a'.repeat(256) };
      const errors = validateProfile(profile);
      expect(errors.streetAddress).toBe('Street address must not exceed 255 characters');
    });

    test('should accept valid street address', () => {
      const profile = { firstName: 'John', lastName: 'Doe', streetAddress: '123 Main Street' };
      const errors = validateProfile(profile);
      expect(errors.streetAddress).toBeUndefined();
    });
  });

  describe('City Validation', () => {
    test('should accept empty city (optional field)', () => {
      const profile = { firstName: 'John', lastName: 'Doe', city: '' };
      const errors = validateProfile(profile);
      expect(errors.city).toBeUndefined();
    });

    test('should reject city exceeding 100 characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe', city: 'a'.repeat(101) };
      const errors = validateProfile(profile);
      expect(errors.city).toBe('City must not exceed 100 characters');
    });

    test('should reject city with invalid characters', () => {
      const profile = { firstName: 'John', lastName: 'Doe', city: 'New York@123' };
      const errors = validateProfile(profile);
      expect(errors.city).toBe('City can only contain letters, spaces, hyphens, and apostrophes');
    });

    test('should accept valid city', () => {
      const profile = { firstName: 'John', lastName: 'Doe', city: 'New York' };
      const errors = validateProfile(profile);
      expect(errors.city).toBeUndefined();
    });
  });

  describe('Multiple Field Validation', () => {
    test('should validate all fields together', () => {
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '555-123-4567',
        zipPostalCode: '12345',
        streetAddress: '123 Main St',
        city: 'Springfield',
      };
      const errors = validateProfile(profile);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('should report multiple validation errors', () => {
      const profile = {
        firstName: '',
        lastName: '',
        phoneNumber: '123',
        zipPostalCode: 'ABC',
      };
      const errors = validateProfile(profile);
      expect(errors.firstName).toBeDefined();
      expect(errors.lastName).toBeDefined();
      expect(errors.phoneNumber).toBeDefined();
      expect(errors.zipPostalCode).toBeDefined();
    });
  });
});

