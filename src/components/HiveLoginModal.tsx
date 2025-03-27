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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative z-50">
        <h2 className="text-xl font-bold mb-4">Login with Hive</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Enter your Hive username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login with Hive'}
          </button>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
