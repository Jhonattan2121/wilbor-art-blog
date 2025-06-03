'use client';

import { uploadFileToIPFS } from '@/utils/ipfs';
import { useState } from 'react';

interface ImageUploadProps {
  onUploadComplete: (ipfsHash: string, url: string) => void;
  onClose: () => void;
}

export default function ImageUpload({ onUploadComplete, onClose }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Criar URL de visualização para a imagem
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione uma imagem');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Upload para o IPFS
      const result = await uploadFileToIPFS(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Construir a URL específica
      const ipfsUrl = `https://lime-useful-snake-714.mypinata.cloud/ipfs/${result.IpfsHash}`;
      
      // Notificar o componente pai
      onUploadComplete(result.IpfsHash, ipfsUrl);
      
      // Fechar após um curto atraso
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error uploading to IPFS:', error);
      setError(error.message || 'Falha ao fazer upload da imagem');
    } finally {
      setLoading(false);
    }
  };

  // Limpar a URL de objeto quando o componente for desmontado
  useState(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo escuro/transparente */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal do upload */}
      <div className="relative z-10 bg-[#18181b] rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload de Imagem</h2>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Upload de imagem */}
          <div>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="single-image-upload"
              />
              <label htmlFor="single-image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm text-gray-400">Clique para selecionar uma imagem</p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Preview da imagem */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          {/* Barra de progresso */}
          {loading && (
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-800 bg-opacity-30 border border-red-600 text-red-400 p-4 rounded">
              {error}
            </div>
          )}
          
          {/* Botões */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 mr-2"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className={`px-4 py-2 rounded text-white ${
                loading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading || !file}
            >
              {loading ? 'Enviando...' : 'Enviar para IPFS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
