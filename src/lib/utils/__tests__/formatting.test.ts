/**
 * Unit tests for formatting utilities
 */

describe('Formatting Utilities', () => {
  describe('Currency Formatting', () => {
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    };

    test('formats positive numbers correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    test('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('formats negative numbers correctly', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });

    test('formats large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('Date Formatting', () => {
    const formatDate = (date: Date): string => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const formatDateTime = (date: Date): string => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    test('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toMatch(/Jan 15, 2024/);
    });

    test('formats date with time correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
      expect(formatted).toMatch(/2:30/);
    });
  });

  describe('Percentage Formatting', () => {
    const formatPercentage = (value: number, decimals: number = 0): string => {
      return `${value.toFixed(decimals)}%`;
    };

    test('formats whole percentages', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(100)).toBe('100%');
      expect(formatPercentage(0)).toBe('0%');
    });

    test('formats decimal percentages', () => {
      expect(formatPercentage(50.5, 1)).toBe('50.5%');
      expect(formatPercentage(33.333, 2)).toBe('33.33%');
    });
  });

  describe('Number Formatting', () => {
    const formatNumber = (value: number): string => {
      return new Intl.NumberFormat('en-US').format(value);
    };

    test('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    test('formats small numbers without commas', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });
  });

  describe('String Utilities', () => {
    const truncate = (str: string, maxLength: number): string => {
      if (str.length <= maxLength) return str;
      return str.slice(0, maxLength - 3) + '...';
    };

    const capitalize = (str: string): string => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    test('truncates long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    test('capitalizes strings', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });
  });
});

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('validates correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    test('rejects invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    const isValidPhone = (phone: string): boolean => {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      return phoneRegex.test(phone);
    };

    test('validates correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 (234) 567-8900')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
    });

    test('rejects invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    const isRequired = (value: string | null | undefined): boolean => {
      return value !== null && value !== undefined && value.trim().length > 0;
    };

    test('validates non-empty strings', () => {
      expect(isRequired('hello')).toBe(true);
      expect(isRequired('  hello  ')).toBe(true);
    });

    test('rejects empty values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });
});

describe('Calculation Utilities', () => {
  describe('Cart Calculations', () => {
    const calculateSubtotal = (items: { price: number; quantity: number }[]): number => {
      return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const calculateFees = (subtotal: number, feeRate: number = 0.1): number => {
      return subtotal * feeRate;
    };

    const calculateTotal = (subtotal: number, fees: number): number => {
      return subtotal + fees;
    };

    test('calculates subtotal correctly', () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 25, quantity: 1 },
      ];
      expect(calculateSubtotal(items)).toBe(45);
    });

    test('calculates fees correctly', () => {
      expect(calculateFees(100)).toBe(10);
      expect(calculateFees(100, 0.15)).toBe(15);
    });

    test('calculates total correctly', () => {
      expect(calculateTotal(100, 10)).toBe(110);
    });

    test('handles empty cart', () => {
      expect(calculateSubtotal([])).toBe(0);
    });
  });

  describe('Percentage Calculations', () => {
    const calculatePercentage = (part: number, total: number): number => {
      if (total === 0) return 0;
      return (part / total) * 100;
    };

    test('calculates percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 4)).toBe(25);
    });

    test('handles zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });
  });
});
