import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReservationsAdmin from '@/app/(pages)/admin/reservation/page';

// Mock contexts
vi.mock('@/config/i18n', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    isRtl: true,
  }),
}));

vi.mock('@/context/settings_context', () => ({
  useSettings: () => ({
    settings: { per_page: 10 },
  }),
}));

vi.mock('@/context/reservation_context', () => ({
  useReservation: () => ({
    reservations: [],
    total: 0,
    totalPages: 1,
    isReservationsLoading: false,
    fetchAllReservations: vi.fn(),
    addReservation: vi.fn(),
    updateReservation: vi.fn(),
    acceptReservation: vi.fn(),
    activateReservation: vi.fn(),
    undoReservationAction: vi.fn(),
    deleteReservation: vi.fn(),
  }),
}));

vi.mock('@/context/room_context', () => ({
  useRoom: () => ({
    rooms: [],
    fetchAllRooms: vi.fn(),
    isRoomsLoading: false,
  }),
}));

vi.mock('@/context/order_context', () => ({
  useOrder: () => ({
    orders: [],
    fetchAllOrders: vi.fn(),
    updateOrder: vi.fn(),
    deleteOrder: vi.fn(),
  }),
}));

vi.mock('@/context/report_context', () => ({
  useReport: () => ({
    reportsList: [],
    fetchAllReports: vi.fn(),
    updateReport: vi.fn(),
  }),
}));

// Mock sub-components to keep the test focused on the page logic
import React from 'react';

vi.mock('@/components/headers/admin_header', () => ({
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="admin-header">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@/components/partials/modals/admin/CombinedReservationModal', () => ({
  default: () => <div data-testid="reservation-modal" />,
}));

describe('Admin Reservation Page', () => {
  it('renders the admin reservation header correctly', () => {
    render(<ReservationsAdmin />);
    
    // Should display the header
    const header = screen.getByTestId('admin-header');
    expect(header).toBeInTheDocument();
    
    // In our mock, t(key) returns the key string
    expect(screen.getByText('reservations.title')).toBeInTheDocument();
  });
});
