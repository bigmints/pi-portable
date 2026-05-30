'use client';

import { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { NotificationPanel } from './NotificationPanel';

export function NotificationProvider() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <NotificationBell onClick={handleOpen} />
      <NotificationPanel open={isOpen} onClose={handleClose} />
    </>
  );
}
