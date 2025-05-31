"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const _router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página principal de usuarios
    router.push('/dashboard/users/registry');
  }, [router]);
  
  // Devolvemos null porque la redirección se hará en el useEffect
  return null;
}
