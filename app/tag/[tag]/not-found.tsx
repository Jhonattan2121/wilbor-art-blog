export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Tag não encontrada</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        A tag que você está procurando não existe.
      </p>
      <a
        href="/projects"
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Voltar para Projetos
      </a>
    </div>
  );
}

