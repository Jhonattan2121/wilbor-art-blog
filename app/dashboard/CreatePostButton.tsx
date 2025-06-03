'use client';

import { uploadFileToIPFS } from '@/utils/ipfs';
import { Client, PrivateKey } from '@hiveio/dhive';
import { useEffect, useState } from 'react';

interface CreatePostButtonProps {
    username: string;
    postingKey?: string;
}

export default function CreatePostButton({ username, postingKey }: CreatePostButtonProps) {
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
    // Token de Gateway do Pinata
    const PINATA_GATEWAY_TOKEN = 'Z787oWC-YVuVKNuRKECMTklkNYMENXXPYROAr7NUSDnVREVJKbMbQQEenpu3KTam';

    // Funções de gateway IPFS
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

    // Gateway Pinata (rápido para preview)
    const getIpfsGatewayUrl = (hash: string, fileName?: string): string => {
        return `https://lime-useful-snake-714.mypinata.cloud/ipfs/${hash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
    };

    // Gateway público IPFS (para Hive.blog)
    const getIpfsPublicUrl = (hash: string, fileName?: string): string => {
        // Não precisa de fileName, mas pode ser usado para download em alguns gateways
        return `https://ipfs.io/ipfs/${hash}`;
    };

    // Manipular a seleção de arquivos
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        // Adiciona previews normalmente
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        setUploadProgress(prev => [...prev, ...selectedFiles.map(() => 0)]);

        // Função utilitária para extrair extensão do arquivo
        function getFileExtension(file: File): string {
            const name = file.name;
            if (name && name.includes('.')) {
                return name.split('.').pop() || '';
            }
            if (file.type && file.type.includes('/')) {
                return file.type.split('/')[1];
            }
            return '';
        }

        // Para cada arquivo, faz upload imediato e adiciona o link real no conteúdo
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            try {
                setLoading(true);
                const result = await uploadFileToIPFS(file);
                const ext = getFileExtension(file);
                let fileName = '';
                if (file.name && ext) {
                    fileName = file.name;
                } else if (ext) {
                    fileName = `image-${i + 1}.${ext}`;
                } else {
                    fileName = `image-${i + 1}`;
                }
                const ipfsUrl = getIpfsGatewayUrl(result.IpfsHash, fileName);
                setContent(prev => {
                    let texto = prev.trim();
                    if (texto.length > 0) {
                        texto += `\n\n![image](${ipfsUrl})\n`;
                    } else {
                        texto = `![image](${ipfsUrl})\n`;
                    }
                    return texto;
                });
            } catch (err) {
                setError('Erro ao enviar imagem para o IPFS.');
            } finally {
                setLoading(false);
            }
        }
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

    // Enviar o formulário
    // Enviar o formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title) {
            setError('Por favor, insira um título');
            return;
        }

        if (files.length === 0) {
            setError('Por favor, selecione pelo menos uma imagem');
            return;
        }

        if (!postingKey && !(window as any).hive_keychain) {
            setError(
                'Chave de postagem não fornecida ou Hive Keychain não instalado'
            );
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
            // Upload de cada arquivo para o IPFS
            const ipfsResults = [];
            for (let i = 0; i < files.length; i++) {
                try {
                    const result = await uploadFileToIPFS(files[i]);
                    ipfsResults.push(result);

                    // Atualizar o progresso
                    const newProgress = [...uploadProgress];
                    newProgress[i] = 100;
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

            // Função utilitária para extrair extensão do arquivo
            function getFileExtension(file: File): string {
                const name = file.name;
                if (name && name.includes('.')) {
                    return name.split('.').pop() || '';
                }
                if (file.type && file.type.includes('/')) {
                    return file.type.split('/')[1];
                }
                return '';
            }


            // Montar as URLs das imagens no formato markdown usando gateway público
            let imagesMarkdown = '';
            ipfsResults.forEach((result, index) => {
                const file = files[index];
                const ext = getFileExtension(file);
                let fileName = '';
                if (file.name && ext) {
                    fileName = file.name;
                } else if (ext) {
                    fileName = `image-${index + 1}.${ext}`;
                } else {
                    fileName = `image-${index + 1}`;
                }
                const ipfsUrl = getIpfsPublicUrl(result.IpfsHash, fileName);
                imagesMarkdown += `![image](${ipfsUrl})\n\n`;
            });

            // Substituir todos os links do Pinata no conteúdo por links públicos do IPFS
            let newContent = content.trim();
            // Regex para encontrar links do Pinata
            newContent = newContent.replace(/https:\/\/lime-useful-snake-714\.mypinata\.cloud\/ipfs\/([a-zA-Z0-9]+)[^\)]*/g, (match, hash) => {
                return `https://ipfs.io/ipfs/${hash}`;
            });
            // Adicionar as imagens do upload ao final
            if (imagesMarkdown.trim().length > 0) {
                if (newContent.length > 0) {
                    newContent += '\n\n' + imagesMarkdown;
                } else {
                    newContent = imagesMarkdown;
                }
            }

            // O corpo do post será o conteúdo atualizado
            const postBody = newContent;

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


            // Preparar os metadados usando links públicos
            const jsonMetadata = {
                tags: tagArray,
                image: ipfsResults.map((result, index) => {
                    const file = files[index];
                    const ext = getFileExtension(file);
                    let fileName = '';
                    if (file.name && ext) {
                        fileName = file.name;
                    } else if (ext) {
                        fileName = `image-${index + 1}.${ext}`;
                    } else {
                        fileName = `image-${index + 1}`;
                    }
                    return getIpfsPublicUrl(result.IpfsHash, fileName);
                }),
                app: 'wilbor.art/dashboard',
            };

            // Publicar no Hive
            let postSuccess = false;
            if (postingKey) {
                // Postar com chave privada
                postSuccess = await postToHiveWithKey(
                    username,
                    title,
                    postBody,
                    tagArray,
                    jsonMetadata,
                    postingKey
                );
            } else {
                // Postar com Keychain
                try {
                    postSuccess = await postToHiveWithKeychain(
                        username,
                        title,
                        postBody,
                        tagArray,
                        jsonMetadata
                    );
                } catch (keychainError: any) {
                    // Verificar se é um cancelamento do usuário usando a propriedade específica
                    if (keychainError.isCancelled === true) {
                        console.log('Operação cancelada pelo usuário detectada');
                        setError('Operação cancelada pelo usuário');
                        setLoading(false); // Garantir que o estado de loading seja definido como falso
                        setShowForm(false); // Fechar o modal imediatamente após cancelamento
                        clearTimeout(keychainTimeout);
                        return; // Sair da função sem mostrar sucesso
                    }
                    clearTimeout(keychainTimeout);
                    // Se não for cancelamento, re-lançar o erro para ser tratado pelo catch geral
                    throw keychainError;
                }
            }

            // Se chegou aqui e postSuccess é false, algo deu errado
            if (!postSuccess) {
                clearTimeout(keychainTimeout);
                throw new Error('Falha ao publicar o post');
            }

            clearTimeout(keychainTimeout);
            setSuccess(true);
            setTimeout(() => {
                setShowForm(false);
                // Reset do formulário
                setTitle('');
                setContent('');
                setTags('');
                setFiles([]);
                setPreviews([]);
                setUploadProgress([]);
                setSuccess(false);
            }, 2000);
        } catch (error: any) {
            clearTimeout(keychainTimeout);
            console.error('Erro ao criar post:', error);
            setError(
                'Falha ao criar o post: ' + (error.message || 'Erro desconhecido')
            );
        } finally {
            setLoading(false);
        }
    };

    // Função para postar no Hive com chave privada
    const postToHiveWithKey = async (
        author: string,
        title: string,
        body: string,
        tags: string[],
        jsonMetadata: any,
        privateKey: string,
    ) => {
        const client = new Client(['https://api.hive.blog']);

        try {
            // Criar a chave privada para assinatura
            const key = PrivateKey.fromString(privateKey);

            // Criar um permlink único baseado no título
            const permlink = createPermlink(title);

            // Usar a API de comentário específica do dhive que é tipada corretamente
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
            console.error('Erro ao postar no Hive:', error);
            throw new Error('Falha ao publicar no Hive');
        }
    };

    // Função para postar no Hive com Keychain
    const postToHiveWithKeychain = (
        author: string,
        title: string,
        body: string,
        tags: string[],
        jsonMetadata: any,
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !(window as any).hive_keychain) {
                reject(new Error('Hive Keychain não está instalado'));
                return;
            }

            const permlink = createPermlink(title);

            (window as any).hive_keychain.requestPost(
                author,
                title,
                body,
                tags[0], // Categoria principal
                '',      // Parent Author (vazio para posts principais)
                permlink,
                JSON.stringify(jsonMetadata),
                '',      // Permlink do post pai
                'Posting',
                (response: any) => {
                    // Log completo da resposta para debug
                    console.log('Resposta do Hive Keychain:', response);

                    if (response.success) {
                        resolve(true);
                    } else {
                        // Detecção melhorada de cancelamentos
                        if (
                            response.error === 'user_cancel' ||
                            response.message?.toLowerCase().includes('cancel') ||
                            response.message?.toLowerCase().includes('cancelado') ||
                            response.message?.toLowerCase().includes('rejected') ||
                            response.message?.toLowerCase().includes('rejeitado') ||
                            response.error === 'declined'
                        ) {
                            // Criar um erro com uma flag específica para canceLamento
                            const cancelError = new Error('Operação cancelada pelo usuário');
                            (cancelError as any).isCancelled = true;
                            // Imediatamente rejeitar a promessa com o erro de cancelamento
                            reject(cancelError);
                        } else {
                            reject(new Error(response.message || 'Erro ao postar com Keychain'));
                        }
                    }
                },
            );
        });
    };

    // Função para criar um permlink válido
    const createPermlink = (title: string): string => {
        const date = new Date();
        const dateString = date.toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        // Criar slug a partir do título
        let permlink = title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')  // Remover caracteres especiais
            .replace(/\s+/g, '-')     // Substituir espaços por hífens
            .replace(/-+/g, '-')      // Remover hífens duplicados
            .substring(0, 40);        // Limitar tamanho

        // Adicionar timestamp para garantir unicidade
        permlink = `${permlink}-${dateString}`;

        return permlink;
    };

    return (
        <>
            <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                    />
                </svg>
                Criar post com Pinata IPFS
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

                    {/* Modal do formulário */}
                    <div className="relative z-10 bg-[#18181b] rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Criar Post com IPFS
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
                                Post criado com sucesso! Redirecionando...
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
                                    <label className="block text-sm font-medium mb-1">Conteúdo (opcional)</label>
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

                                {/* Upload de imagens */}
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
                                                    Selecionar imagens para o IPFS
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
                                        className={`px-4 py-2 rounded text-white ${loading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        disabled={loading}
                                    >
                                        {loading ? 'Publicando...' : 'Publicar no Hive'}
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
