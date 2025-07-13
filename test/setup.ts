// Global test setup
import { jest } from '@jest/globals';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
process.exit = jest.fn() as (code?: number) => never;

// Restore process.exit after tests
afterAll(() => {
  process.exit = originalExit;
});

// Mock chalk to avoid color codes in test output
jest.mock('chalk', () => ({
  blue: jest.fn((text: string) => text),
  green: jest.fn((text: string) => text),
  red: jest.fn((text: string) => text),
  yellow: jest.fn((text: string) => text),
  gray: jest.fn((text: string) => text),
}));
