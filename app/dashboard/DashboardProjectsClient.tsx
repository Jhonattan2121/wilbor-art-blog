"use client";

import PhotoGridPage from '@/photo/PhotoGridPage';
import { useState } from 'react';
import CreatePostButton from './CreatePostButton';
import HiveLogin from './HiveLogin';

export default function DashboardProjectsClient({ posts, photosCount, cameras, simulations }: any) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState<string | null>(null);
  const [postingKey, setPostingKey] = useState<string | null>(null);

  function handleLogin(username: string, keyType: 'keychain' | 'private', key?: string) {
    setLoggedIn(true);
    setLoginUser(username);
    if (key && keyType === 'private') {
      setPostingKey(key);
    }
    // Keychain não precisa armazenar chave, pois usa o plugin do navegador
  }

  if (!loggedIn) {
    return <HiveLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center p-4">
        <div>
          {loginUser && (
            <CreatePostButton 
              username={loginUser} 
              postingKey={postingKey || undefined} 
            />
          )}
        </div>
        <span className="text-sm text-gray-400">
          Logado como <b>{loginUser}</b>
        </span>
      </div>
      <div className="flex items-center gap-2 px-4 pb-2">
        <span className="text-green-500 font-semibold text-base">
          Modo edição ativado: você pode editar os projetos!
        </span>
        <span className="text-xs text-gray-400">
          (clique em editar nos cards)
        </span>
      </div>

      <PhotoGridPage
        photos={posts}
        photosCount={photosCount}
        tags={[]}
        cameras={cameras}
        simulations={simulations}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        username={loginUser}
        postingKey={postingKey}
        isEditMode={true}
      />
    </div>
  );
}
