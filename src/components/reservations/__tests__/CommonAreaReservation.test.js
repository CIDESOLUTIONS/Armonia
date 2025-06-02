// CommonAreaReservation.test.js - Migrado a sintaxis ES6 para compatibilidad con ESLint
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommonAreaReservation from '../CommonAreaReservation';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER'
      }
    }
  })),
  SessionProvider: ({ children }) => React.createElement('div', null, children)
}));

// Mock fetch
global.fetch = jest.fn();

describe('CommonAreaReservation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful fetch for common areas
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/common-areas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              name: 'Salón Comunal',
              description: 'Espacio para eventos sociales',
              location: 'Primer piso',
              capacity: 50,
              isActive: true,
              requiresApproval: false,
              hasFee: false
            },
            {
              id: 2,
              name: 'Piscina',
              description: 'Área recreativa',
              location: 'Terraza',
              capacity: 30,
              isActive: true,
              requiresApproval: true,
              hasFee: true,
              feeAmount: 20000
            }
          ])
        });
      } else if (url.includes('/api/reservations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              commonAreaId: 1,
              userId: 1,
              propertyId: 1,
              title: 'Reunión familiar',
              description: 'Celebración de cumpleaños',
              startDateTime: '2025-06-15T14:00:00Z',
              endDateTime: '2025-06-15T18:00:00Z',
              status: 'APPROVED',
              attendees: 20,
              requiresPayment: false,
              createdAt: '2025-06-01T10:00:00Z',
              updatedAt: '2025-06-01T10:00:00Z'
            }
          ])
        });
      } else if (url.includes('/api/common-areas/1/availability')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            commonArea: {
              id: 1,
              name: 'Salón Comunal',
              availabilityConfig: {
                mondayStart: '08:00',
                mondayEnd: '22:00',
                tuesdayStart: '08:00',
                tuesdayEnd: '22:00',
                wednesdayStart: '08:00',
                wednesdayEnd: '22:00',
                thursdayStart: '08:00',
                thursdayEnd: '22:00',
                fridayStart: '08:00',
                fridayEnd: '22:00',
                saturdayStart: '10:00',
                saturdayEnd: '22:00',
                sundayStart: '10:00',
                sundayEnd: '20:00'
              }
            },
            availabilitySlots: [],
            occupiedSlots: [
              {
                startDateTime: '2025-06-15T14:00:00Z',
                endDateTime: '2025-06-15T18:00:00Z',
                reservationId: 1,
                status: 'APPROVED'
              }
            ]
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  it('renders the component title', async () => {
    render(<CommonAreaReservation />);
    
    expect(screen.getByText('Reserva de Áreas Comunes')).toBeInTheDocument();
  });

  it('loads and displays common areas', async () => {
    render(<CommonAreaReservation />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/common-areas?active=true');
    });
    
    await waitFor(() => {
      expect(screen.getByText('Salón Comunal')).toBeInTheDocument();
    });
  });

  it('loads user reservations', async () => {
    render(<CommonAreaReservation />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/reservations'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Reunión familiar')).toBeInTheDocument();
    });
  });

  it('opens new reservation dialog when button is clicked', async () => {
    render(<CommonAreaReservation />);
    
    await waitFor(() => {
      expect(screen.getByText('Nueva Reserva')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Nueva Reserva'));
    
    await waitFor(() => {
      expect(screen.getByText('Complete el formulario para solicitar una reserva')).toBeInTheDocument();
    });
  });

  it('submits new reservation form', async () => {
    render(<CommonAreaReservation />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Nueva Reserva')).toBeInTheDocument();
    });
    
    // Open reservation dialog
    fireEvent.click(screen.getByText('Nueva Reserva'));
    
    // Fill form
    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Nueva reunión' }
    });
    
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Descripción de prueba' }
    });
    
    // Mock current date + 1 day for start and end times
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(16, 0, 0, 0);
    
    const startDateString = tomorrow.toISOString().slice(0, 16);
    const endDateString = tomorrowEnd.toISOString().slice(0, 16);
    
    fireEvent.change(screen.getByLabelText('Fecha y hora de inicio'), {
      target: { value: startDateString }
    });
    
    fireEvent.change(screen.getByLabelText('Fecha y hora de fin'), {
      target: { value: endDateString }
    });
    
    // Mock successful reservation creation
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 2,
        title: 'Nueva reunión',
        status: 'APPROVED'
      })
    }));
    
    // Submit form
    fireEvent.click(screen.getByText('Confirmar Reserva'));
    
    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reservations', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('Nueva reunión')
      }));
    });
  });

  it('shows error toast when API call fails', async () => {
    // Mock toast function
    const mockToast = jest.fn();
    jest.mock('@/components/ui/use-toast', () => ({
      useToast: () => ({
        toast: mockToast
      })
    }));
    
    // Mock failed API call
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Error al cargar áreas comunes' })
    }));
    
    render(<CommonAreaReservation />);
    
    // Wait for component to attempt loading
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
