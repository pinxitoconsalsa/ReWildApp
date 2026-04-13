import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const nav = [
  { to: '/app/dashboard',    icon: '🏠', label: 'Inicio' },
  { to: '/app/mapa',         icon: '🗺️', label: 'Mapa' },
  { to: '/app/comunidad',    icon: '🌿', label: 'Comunidad', center: true },
  { to: '/app/calculadora',  icon: '📊', label: 'Impacto' },
  { to: '/app/aprende',      icon: '📚', label: 'Aprender' },
];

export default function Layout() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-cream relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex items-center justify-around z-50">
        {nav.map(({ to, icon, label, center }) =>
          center ? (
            <NavLink key={to} to={to} className="relative -top-4">
              <div className="bg-forest w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl">
                +
              </div>
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 text-xs ${isActive ? 'text-forest font-semibold' : 'text-gray-500'}`
              }
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
}
