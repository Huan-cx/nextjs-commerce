"use client";

import {AnimatePresence, motion} from 'framer-motion';
import BottomNavbar from './BottomNavbar';
import MobileCategoryMenu from './MobileCategoryMenu';
import {useState} from 'react';
import {useBodyScrollLock} from '@utils/hooks/useBodyScrollLock';

export default function MobileMenu({ menu }: { menu: any }) {
  const [activeTab, setActiveTab] = useState<
      'home' | 'category' | 'cart' | 'account' | null
  >('home');

  const isOpen = activeTab === 'category';

  useBodyScrollLock(isOpen);

  const handleClose = () => {
    setActiveTab(null);
  };

  return (
    <>
      <BottomNavbar
          onMenuOpen={() => setActiveTab('category')}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-transparent lg:hidden"
              style={{top: '68px', bottom: '64px'}}
            />

            <MobileCategoryMenu categories={menu} onClose={handleClose}/>
          </>
        )}
      </AnimatePresence>
    </>
  );
}