// src/components/assemblies/__tests__/RealTimeVoting.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RealTimeVoting from '../RealTimeVoting';
import { act } from 'react-dom/test-utils';
import { toast } from '@/components/ui/use-toast';

// Mock de fetch
global.fetch = jest.fn();

// Mock de toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn()
}));

describe('RealTimeVoting Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra estado de carga inicialmente', () => {
    // Mock de fetch para que no resuelva inmediatamente
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(
      <RealTimeVoting
        assemblyId={1}
        agendaNumeral={1}
        topic="Test Topic"
        language="Español"
        userVote={null}
        onVoteSubmitted={jest.fn()}
      />
    );
    
    expect(screen.getByText('Cargando resultados...')).toBeInTheDocument();
  });

  it('muestra estadísticas de votación correctamente', async () => {
    // Mock de respuesta exitosa
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalVotes: 10,
        yesVotes: 7,
        noVotes: 3,
        yesPercentage: 70,
        noPercentage: 30,
        isOpen: true,
        endTime: null
      })
    });
    
    render(
      <RealTimeVoting
        assemblyId={1}
        agendaNumeral={1}
        topic="Test Topic"
        language="Español"
        userVote={null}
        onVoteSubmitted={jest.fn()}
      />
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Votos totales: 10')).toBeInTheDocument();
    });
    
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('Votación Abierta')).toBeInTheDocument();
  });

  it('permite votar cuando la votación está abierta', async () => {
    // Mock para obtener estadísticas
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalVotes: 10,
        yesVotes: 7,
        noVotes: 3,
        yesPercentage: 70,
        noPercentage: 30,
        isOpen: true,
        endTime: null
      })
    });
    
    // Mock para enviar voto
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    // Mock para actualizar estadísticas después de votar
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalVotes: 11,
        yesVotes: 8,
        noVotes: 3,
        yesPercentage: 73,
        noPercentage: 27,
        isOpen: true,
        endTime: null
      })
    });
    
    const onVoteSubmittedMock = jest.fn();
    
    render(
      <RealTimeVoting
        assemblyId={1}
        agendaNumeral={1}
        topic="Test Topic"
        language="Español"
        userVote={null}
        onVoteSubmitted={onVoteSubmittedMock}
      />
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Votar a favor')).toBeInTheDocument();
    });
    
    // Hacer clic en el botón de votar a favor
    fireEvent.click(screen.getByText('Votar a favor'));
    
    // Verificar que se llamó a fetch para enviar el voto
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/assemblies/1/agenda/1/votes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ value: 'YES' })
        })
      );
    });
    
    // Verificar que se llamó al callback
    expect(onVoteSubmittedMock).toHaveBeenCalled();
    
    // Verificar que se mostró el toast
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Voto registrado'
      })
    );
  });
  
  it('no muestra botones de votación cuando el usuario ya votó', async () => {
    // Mock de respuesta exitosa
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        totalVotes: 10,
        yesVotes: 7,
        noVotes: 3,
        yesPercentage: 70,
        noPercentage: 30,
        isOpen: true,
        endTime: null
      })
    });
    
    render(
      <RealTimeVoting
        assemblyId={1}
        agendaNumeral={1}
        topic="Test Topic"
        language="Español"
        userVote="YES" // Usuario ya votó
        onVoteSubmitted={jest.fn()}
      />
    );
    
    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Votos totales: 10')).toBeInTheDocument();
    });
    
    // Verificar que no se muestran los botones de votación
    expect(screen.queryByText('Votar a favor')).not.toBeInTheDocument();
    expect(screen.queryByText('Votar en contra')).not.toBeInTheDocument();
  });
  
  it('muestra mensaje de error cuando falla la carga', async () => {
    // Mock de respuesta fallida
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error de servidor' })
    });
    
    render(
      <RealTimeVoting
        assemblyId={1}
        agendaNumeral={1}
        topic="Test Topic"
        language="Español"
        userVote={null}
        onVoteSubmitted={jest.fn()}
      />
    );
    
    // Esperar a que se muestre el error
    await waitFor(() => {
      expect(screen.getByText('Error al cargar estadísticas de votación')).toBeInTheDocument();
    });
  });
});
