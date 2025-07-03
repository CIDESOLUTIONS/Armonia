// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, _setError] = useState('');
  const _router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Variable response eliminada por lint

      const _data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar el token
      localStorage.setItem('token', data.token);
      
      // Redirigir al dashboard usando window.location para forzar un refresh completo
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error:', err);
      setError('Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div 
          data-testid="error-message" 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {error}
        </div>
      )}

      <div>
        <input
          data-testid="email-input"
          type="email"
          required
          className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <input
          data-testid="password-input"
          type="password"
          required
          className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Contraseña"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button
          data-testid="login-button"
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Iniciar sesión
        </button>
      </div>
    </form>
  );
}