'use client';

import { HiveKeychainResponse } from '@/types/hive-keychain';
import { useState } from 'react';

interface HiveLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HiveLoginModal({ isOpen, onClose }: HiveLoginModalProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [inputUsername, setInputUsername] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!inputUsername) {
      alert('Please enter your Hive username');
      return;
    }

    if (window.hive_keychain) {
      setLoading(true);
      const hiveKeychain = window.hive_keychain;

      hiveKeychain.requestHandshake(() => {
        const memo = `Login to Wilbor Art Blog - ${new Date().toISOString()}`;

        hiveKeychain.requestSignBuffer(
          inputUsername,
          memo,
          'Posting',
          (response: HiveKeychainResponse) => {
            setLoading(false);
            if (response.success) {
              localStorage.setItem('hive_username', inputUsername);
              setUsername(inputUsername);
              onClose();
            } else {
              setError('Failed to sign with Hive Keychain. Please try again.');
            }
          }
        );
      });
    } else {
      setError('Hive Keychain is not available. Please install the extension.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-96 relative z-50 transform transition-all duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Login with Hive</h2>

        {error && <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your Hive username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Login with Hive'}
          </button>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
