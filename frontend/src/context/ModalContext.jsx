import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [showCourseModal, setShowCourseModal] = useState(false);

  return (
    <ModalContext.Provider value={{ showCourseModal, setShowCourseModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}
