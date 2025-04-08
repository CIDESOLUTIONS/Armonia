"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página de registro de usuarios
    router.push('/dashboard/users/registry');
  }, [router]);
  
  return null;
}