'use client';

import { uploadFileToIPFS } from '@/utils/ipfs';
import { Client, PrivateKey } from '@hiveio/dhive';
import { useEffect, useState } from 'react';

interface EditPostButtonProps {
    username: string;
    postingKey?: string;
    permlink: string;
    author: string;
    initialTitle: string;
    initialContent: string;
    initialTags: string[];
    initialImages: string[];
}

export default function EditPostButton({
    username,
    postingKey,
    permlink,
    author,
    initialTitle,
    initialContent,
    initialTags,
    initialImages
}: EditPostButtonProps) {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);
    const [loadingPost, setLoadingPost] = useState(false);
    
    // Token de Gateway do Pinata
    const PINATA_GATEWAY_TOKEN = 'Z787oWC-YVuVKNuRKECMTklkNYMENXXPYROAr7NUSDnVREVJKbMbQQEenpu3KTam';

    // Carregar dados iniciais
    useEffect(() => {
        // Preencher o formulário com os dados iniciais
        if (initialTitle) setTitle(initialTitle);
        if (initialContent) setContent(initialContent);
        if (initialTags?.length) setTags(initialTags.join(', '));
        if (initialImages?.length) {
            const newPreviews = initialImages.map(url => url);
            setPreviews(newPreviews);
            setUploadProgress(Array(newPreviews.length).fill(100));
        }
    }, [initialTitle, initialContent, initialTags, initialImages]);

    // Efeito para monitorar o estado de loading e redefinir o formulário quando necessário
    useEffect(() => {
        if (!loading && error && error.includes('cancelada')) {
            // Definir um temporizador para limpar a mensagem de erro após 3 segundos
            const timer = setTimeout(() => {
                setError('');
            }, 3000);

            // Limpar o temporizador ao desmontar o componente ou ao mudar o estado
            return () => clearTimeout(timer);
        }
    }, [loading, error]);

    // Função para buscar post do Hive por autor e permlink
    const fetchPostFromHive = async (author: string, permlink: string): Promise<any> => {
        setLoadingPost(true);
        try {
            const response = await fetch('https://api.hive.blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_content',
                    params: [author, permlink],
                    id: 1
                })
            });
            const data = await response.json();
            if (data && data.result) {
                return data.result;
            }
            return null;
        } catch (error) {
            console.error("Erro ao buscar dados do post:", error);
            return null;
        } finally {
            setLoadingPost(false);
        }
    };

    const getIpfsGatewayUrl = (hash: string, fileName?: string): string => {
        // URL do Pinata com o token de gateway incluído
        return `https://lime-useful-snake-714.mypinata.cloud/ipfs/${hash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
    };

    // Manipular a seleção de arquivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

        // Criar URLs de visualização para as imagens selecionadas
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
        setUploadProgress(prev => [...prev, ...selectedFiles.map(() => 0)]);
    };

    // Remover uma imagem da lista
    const removeFile = (index: number) => {
        const newFiles = [...files];
        const newPreviews = [...previews];
        const newProgress = [...uploadProgress];

        // Revogar URL de objeto para evitar vazamento de memória
        URL.revokeObjectURL(newPreviews[index]);

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        newProgress.splice(index, 1);

        setFiles(newFiles);
        setPreviews(newPreviews);
        setUploadProgress(newProgress);
    };

    // Processar o envio do formulário de edição
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title) {
            setError('Por favor, insira um título');
            return;
        }

        if (previews.length === 0) {
            setError('Por favor, selecione pelo menos uma imagem');
            return;
        }

        if (!postingKey && !(window as any).hive_keychain) {
            setError(
                'Chave de postagem não fornecida ou Hive Keychain não instalado'
            );
            return;
        }
        
        // Verificar se o usuário é o autor
        if (username.toLowerCase() !== author.toLowerCase()) {
            setError('Você não tem permissão para editar este post');
            return;
        }

        setLoading(true);
        setError('');

        // Timeout de segurança para resetar loading caso o Keychain não responda
        const keychainTimeout = setTimeout(() => {
            setLoading(false);
            setError(
                'Operação expirada ou não confirmada no Keychain. Tente novamente.'
            );
            setShowForm(false);
        }, 15000);

        try {
            // Upload de cada arquivo novo para o IPFS (arquivos selecionados, não URLs)
            const ipfsResults = [];
            const existingImagesCount = initialImages?.length || 0;
            const newFiles = files.slice(0); // Copiar o array de arquivos para não modificar o original
            
            for (let i = 0; i < newFiles.length; i++) {
                try {
                    const result = await uploadFileToIPFS(newFiles[i]);
                    ipfsResults.push(result);

                    // Atualizar o progresso
                    const newProgress = [...uploadProgress];
                    newProgress[existingImagesCount + i] = 100;
                    setUploadProgress(newProgress);
                } catch (error) {
                    console.error(
                        `Erro ao fazer upload do arquivo ${i}:`,
                        error
                    );
                    setError(
                        `Falha ao fazer upload da imagem ${i + 1}`
                    );
                    setLoading(false);
                    clearTimeout(keychainTimeout);
                    return;
                }
            }

            // Construir o conteúdo do post com as imagens IPFS e o conteúdo existente
            let postBody = content + '\n\n';
            
            // Adicionar imagens existentes
            initialImages.forEach((url, index) => {
                const isInPreviews = previews.includes(url);
                if (isInPreviews) {
                    postBody += `![image](${url})\n\n`;
                }
            });

            // Adicionar novas imagens do IPFS
            ipfsResults.forEach((result, index) => {
                // Sempre usar o nome original do arquivo para preservar a extensão e contexto
                let fileName = newFiles[index]?.name || '';

                // Se não tivermos nome de arquivo (caso improvável), extrair a extensão do tipo MIME
                if (!fileName && newFiles[index]?.type) {
                    const fileType = newFiles[index]?.type?.split('/')[1] || 'jpg';
                    fileName = `image-${index + 1}.${fileType}`;
                }

                const ipfsUrl = getIpfsGatewayUrl(result.IpfsHash, fileName);
                postBody += `![image](${ipfsUrl})\n\n`;
            });

            // Preparar as tags
            const tagArray = tags
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag !== '');

            // Incluir tags padrão se necessário
            if (!tagArray.includes('wilbor')) {
                tagArray.push('wilbor');
            }
            if (!tagArray.includes('art')) {
                tagArray.push('art');
            }

            // Preparar os metadados
            const jsonMetadata = {
                tags: tagArray,
                image: [...initialImages.filter(url => previews.includes(url)), 
                       ...ipfsResults.map((result, index) => {
                           const fileName = newFiles[index]?.name || '';
                           return getIpfsGatewayUrl(result.IpfsHash, fileName);
                       })],
                app: 'wilbor.art/dashboard',
            };

            // Atualizar o post no Hive
            let updateSuccess = false;
            if (postingKey) {
                // Postar com chave privada
                updateSuccess = await updateHivePostWithKey(
                    username,
                    title,
                    postBody,
                    permlink,
                    tagArray,
                    jsonMetadata,
                    postingKey
                );
            } else {
                // Postar com Keychain
                try {
                    updateSuccess = await updateHivePostWithKeychain(
                        username,
                        title,
                        postBody,
                        permlink,
                        tagArray,
                        jsonMetadata
                    );
                } catch (keychainError: any) {
                    // Verificar se é um cancelamento do usuário
                    if (keychainError.isCancelled === true) {
                        console.log('Operação cancelada pelo usuário detectada');
                        setError('Operação cancelada pelo usuário');
                        setLoading(false);
                        setShowForm(false);
                        clearTimeout(keychainTimeout);
                        return;
                    }
                    clearTimeout(keychainTimeout);
                    throw keychainError;
                }
            }

            // Se chegou aqui e updateSuccess é false, algo deu errado
            if (!updateSuccess) {
                clearTimeout(keychainTimeout);
                throw new Error('Falha ao atualizar o post');
            }

            clearTimeout(keychainTimeout);
            setSuccess(true);
            setTimeout(() => {
                setShowForm(false);
                // Depois de atualizar com sucesso, recarregar a página
                window.location.reload();
            }, 2000);
        } catch (error: any) {
            clearTimeout(keychainTimeout);
            console.error('Erro ao atualizar post:', error);
            setError(
                'Falha ao atualizar o post: ' + (error.message || 'Erro desconhecido')
            );
        } finally {
            setLoading(false);
        }
    };

    // Função para atualizar post no Hive com chave privada
    const updateHivePostWithKey = async (
        author: string,
        title: string,
        body: string,
        permlink: string,
        tags: string[],
        jsonMetadata: any,
        privateKey: string,
    ) => {
        const client = new Client(['https://api.hive.blog']);

        try {
            // Criar a chave privada para assinatura
            const key = PrivateKey.fromString(privateKey);

            // Usar a API de comentário específica do dhive
            await client.broadcast.comment({
                parent_author: '',
                parent_permlink: tags[0],
                author,
                permlink,
                title,
                body,
                json_metadata: JSON.stringify(jsonMetadata),
            }, key);

            return true;
        } catch (error) {
            console.error('Erro ao atualizar post no Hive:', error);
            throw new Error('Falha ao atualizar no Hive');
        }
    };

    // Função para atualizar post no Hive com Keychain
    const updateHivePostWithKeychain = (
        author: string,
        title: string,
        body: string,
        permlink: string,
        tags: string[],
        jsonMetadata: any,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !(window as any).hive_keychain) {
                reject(new Error('Hive Keychain não está instalado'));
                return;
            }

            (window as any).hive_keychain.requestPost(
                author,
                title,
                body,
                tags[0], // Categoria principal
                '',      // Parent Author (vazio para posts principais)
                permlink, // Manter o mesmo permlink para editar
                JSON.stringify(jsonMetadata),
                '',      // Permlink do post pai
                'Posting',
                (response: any) => {
                    // Log completo da resposta para debug
                    console.log('Resposta do Hive Keychain (edição):', response);

                    if (response.success) {
                        resolve(true);
                    } else {
                        // Detecção de cancelamentos
                        if (
                            response.error === 'user_cancel' ||
                            response.message?.toLowerCase().includes('cancel') ||
                            response.message?.toLowerCase().includes('cancelado') ||
                            response.message?.toLowerCase().includes('rejected') ||
                            response.message?.toLowerCase().includes('rejeitado') ||
                            response.error === 'declined'
                        ) {
                            const cancelError = new Error('Operação cancelada pelo usuário');
                            (cancelError as any).isCancelled = true;
                            reject(cancelError);
                        } else {
                            reject(new Error(response.message || 'Erro ao atualizar com Keychain'));
                        }
                    }
                },
            );
        });
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar
            </button>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Fundo escuro/transparente */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
                        onClick={() => {
                            if (!loading) {
                                setShowForm(false);
                            } else if (confirm('Deseja cancelar a operação em andamento?')) {
                                setLoading(false);
                                setError('');
                                setShowForm(false);
                            }
                        }}
                    />

                    {/* Modal do formulário de edição */}
                    <div className="relative z-10 bg-[#18181b] rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Editar Post
                            </h2>
                            <button
                                className="text-gray-400 hover:text-white"
                                onClick={() => {
                                    // Se não estiver carregando, fecha o formulário normalmente
                                    if (!loading) {
                                        setShowForm(false);
                                        return;
                                    }
                                    // Se estiver carregando, pergunta se deseja cancelar
                                    if (confirm("Deseja cancelar a operação em andamento?")) {
                                        setLoading(false);
                                        setError('');
                                        setShowForm(false);
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {success ? (
                            <div className="bg-green-800 bg-opacity-30 border border-green-600 text-green-400 p-4 rounded mb-4">
                                Post atualizado com sucesso! Recarregando a página...
                            </div>
                        ) : loadingPost ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="ml-3 text-gray-400">Carregando post...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título do Post</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                        placeholder="Digite o título do seu post"
                                    />
                                </div>

                                {/* Conteúdo */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Conteúdo</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white min-h-[100px]"
                                        placeholder="Digite algum conteúdo para o seu post (suporta markdown)"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                                        placeholder="arte, fotografia, wilbor, etc."
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        As tags de marca serão adicionadas automaticamente
                                    </p>
                                </div>

                                {/* Informação sobre Gateway IPFS */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gateway IPFS</label>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Usando lime-useful-snake-714.mypinata.cloud com token de acesso
                                    </p>
                                </div>

                                {/* Imagens existentes e upload de novas */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Imagens</label>
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="image-upload-btn"
                                        />
                                        <label htmlFor="image-upload-btn" className="cursor-pointer">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <p className="text-sm text-gray-400">
                                                    Adicionar mais imagens
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Preview das imagens */}
                                {previews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <div className="h-2 w-3/4 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500"
                                                                style={{ width: `${uploadProgress[index]}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Mensagem de erro */}
                                {error && (
                                    <div className="bg-red-800 bg-opacity-30 border border-red-600 text-red-400 p-4 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLoading(false);
                                            setError('');
                                            setShowForm(false);
                                        }}
                                        className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 mr-2"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 rounded text-white ${loading ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'}`}
                                        disabled={loading}
                                    >
                                        {loading ? 'Atualizando...' : 'Atualizar Post'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
