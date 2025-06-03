"use client";
import { useState } from 'react';

export default function HiveLogin({ onLogin }: { onLogin: (username: string, keyType: 'keychain' | 'private', key?: string) => void }) {
  const [username, setUsername] = useState('wilbor.art');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login via Hive Keychain
  const handleKeychainLogin = async () => {
    setError('');
    setLoading(true);
    if (typeof window !== 'undefined' && (window as any).hive_keychain) {
      (window as any).hive_keychain.requestSignBuffer(
        username,
        'login-wilbor-art',
        'Posting',
        (res: any) => {
          setLoading(false);
          if (res.success) {
            onLogin(username, 'keychain');
          } else {
            setError('Falha ao autenticar com Hive Keychain.');
          }
        }
      );
    } else {
      setLoading(false);
      setError('Hive Keychain não está instalado.');
    }
  };

  // Login via chave privada
  const handlePrivateKeyLogin = () => {
    setError('');
    if (!privateKey) {
      setError('Informe a chave privada.');
      return;
    }
    // Aqui você pode validar a chave se quiser
    onLogin(username, 'private', privateKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo escuro/transparente */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
      {/* Modal de login */}
      <div className="relative z-10 bg-[#18181b] rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6 items-center border border-gray-700">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm">Usuário Hive</label>
          <input
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60 w-full"
          onClick={handleKeychainLogin}
          disabled={loading}
        >
          Login com Hive Keychain
        </button>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm">Ou entre com sua chave privada (posting)</label>
          <input
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
            type="password"
            value={privateKey}
            onChange={e => setPrivateKey(e.target.value)}
            disabled={loading}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60 w-full"
            onClick={handlePrivateKeyLogin}
            disabled={loading}
          >
            Login com chave privada
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2 w-full text-center">{error}</div>}
      </div>
    </div>
  );
}
