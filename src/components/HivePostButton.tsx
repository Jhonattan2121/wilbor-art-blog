'use client';

import { useState } from 'react';
import { BiHive } from 'react-icons/bi';
import HivePostModal from './HivePostModal';

export default function HivePostButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="button primary"
      >
        <BiHive size={20} />
        Create Hive Post
      </button>
      <HivePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 