"use client";

import React from "react";
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { Calendar, Users, Vote, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssembliesLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: "Programación",
    href: "/dashboard/assemblies/scheduling",
    icon: Calendar,
  },
  {
    title: "Control de Asistencia",
    href: "/dashboard/assemblies/attendance",
    icon: Users,
  },
  {
    title: "Control de Votación",
    href: "/dashboard/assemblies/voting",
    icon: Vote,
  },
  {
    title: "Actas y Documentos",
    href: "/dashboard/assemblies/documents",
    icon: FileText,
  }
];

const AssembliesLayout: React.FC<AssembliesLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Cuando estemos en /dashboard/assemblies, mostramos el sidebar y el contenido principal
  // Cuando estemos en una subpágina como scheduling, attendance, etc., solo mostramos el contenido
  const isMainAssembliesPage = pathname === "/dashboard/assemblies";

  // Si estamos en la página principal, mostramos tanto el sidebar como el contenido
  // Si estamos en una subpágina, solo mostramos el contenido (que ya tiene su propio layout interno)
  if (!isMainAssembliesPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row">
      <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 md:mb-0 md:mr-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Gestión de Asambleas
        </h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {children}
      </main>
    </div>
  );
};

export default AssembliesLayout;