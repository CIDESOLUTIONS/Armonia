"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffPage() {
  const _router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página principal de usuarios
    router.push('/dashboard/users/registry');
  }, [router]);
  
  return null;
}