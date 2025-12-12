'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {error.message || 'Ocorreu um erro ao carregar a página.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}

