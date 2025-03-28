'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiEdit, BiGroup, BiHive } from 'react-icons/bi';
import HiveCommunitiesModal from './HiveCommunitiesModal';
import HiveLoginModal from './HiveLoginModal';
import HivePostModal from './HivePostModal';

export default function HiveAuthButton() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommunitiesModalOpen, setIsCommunitiesModalOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
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

  const handleCreatePost = (communityName?: string) => {
    if (!username) {
      setIsLoginModalOpen(true);
      return;
    }
    
    if (communityName !== undefined) {
      setSelectedCommunity(communityName);
    }
    
    setIsPostModalOpen(true);
  };

  const handleOpenCommunities = () => {
    if (!username) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsCommunitiesModalOpen(true);
  };

  const handleSelectCommunity = (communityName: string) => {
    setSelectedCommunity(communityName);
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
    setSelectedCommunity(null);
  };

  const handleCommunitiesModalClose = () => {
    setIsCommunitiesModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hive_username');
    setUsername(null);
    router.refresh();
  };

  return (
    <>
      {username ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">
            @{username}
          </span>
          <button onClick={handleLogout} className="button text-xs sm:text-sm">
            Logout
          </button>

          <button
            onClick={handleOpenCommunities}
            className="button flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <BiGroup size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Comunidades</span>
            <span className="inline sm:hidden">Comum.</span>
          </button>

          <button
            onClick={() => handleCreatePost()}
            className="button primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <BiEdit size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Criar Post</span>
            <span className="inline sm:hidden">Post</span>
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="button primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <BiHive size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Login com Hive</span>
          <span className="inline sm:hidden">Login</span>
        </button>
      )}

      <HiveLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
      />

      <HivePostModal
        isOpen={isPostModalOpen}
        onClose={handlePostModalClose}
        initialCommunity={selectedCommunity}
      />

      {username && (
        <HiveCommunitiesModal
          isOpen={isCommunitiesModalOpen}
          onClose={handleCommunitiesModalClose}
          username={username}
          onSelectCommunity={handleSelectCommunity}
        />
      )}
    </>
  );
}
