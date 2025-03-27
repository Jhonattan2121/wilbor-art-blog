'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiEdit, BiHive } from 'react-icons/bi';
import HiveLoginModal from './HiveLoginModal';
import HivePostModal from './HivePostModal';

export default function HiveAuthButton() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('hive_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCreatePost = () => {
    if (!username) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    const storedUsername = localStorage.getItem('hive_username');
    if (storedUsername) {
      setUsername(storedUsername);
      router.refresh();
    }
  };

  const handlePostModalClose = () => {
    setIsPostModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hive_username');
    setUsername(null);
    router.refresh();
  };

  return (
    <>
      {username ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            @{username}
          </span>
          <button onClick={handleLogout} className="button">
            Logout
          </button>

          <button
            onClick={handleCreatePost}
            className="button primary flex items-center gap-2"
          >
            <BiEdit size={20} />
            Criar Post
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="button primary flex items-center gap-2">
          <BiHive size={20} />
          Login com Hive
        </button>
      )}

      <HiveLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
      />


      <HivePostModal
        isOpen={isPostModalOpen}
        onClose={handlePostModalClose}
      />
    </>
  );
}
