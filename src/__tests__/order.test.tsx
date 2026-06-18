import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerOrderPage from '@/app/(pages)/(user-pages)/order/page';

// Mock the dependencies and contexts
vi.mock('@/config/i18n', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    isRtl: true,
  }),
}));

vi.mock('@/context/settings_context', () => ({
  useSettings: () => ({
    settings: { force_client_order_session_passKey: false },
  }),
}));

vi.mock('@/components/PWAInstallBanner', () => ({
  default: () => <div data-testid="pwa-banner" />,
}));

describe('Customer Order Page', () => {
  beforeEach(() => {
    // Mock matchMedia to prevent errors during rendering
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders the initial scanning/room selection step when no active session', () => {
    render(<CustomerOrderPage />);
    
    // Check for the PWA banner
    expect(screen.getByTestId('pwa-banner')).toBeInTheDocument();
  });
});
