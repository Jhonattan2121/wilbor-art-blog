'use client';

import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDebounce } from 'use-debounce';
import { HiveKeychainResponse } from '../types/hive-keychain';
import {
    Editor,
    EditorTabs,
    HivePostData,
    MarkdownPreviewWrapper,
    ModalFooter,
    ModalHeader,
    TagManager,
    ThumbnailSelector,
    UploadIndicator,
    UploadedImage,
    VideoPlayer,
    createHiveOperations,
    prepareContentForPublish,
    publishToHive,
    syncImagesWithEditor as syncImages,
    uploadFile
} from './HivePostModal/index';

interface HivePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    editPost?: HivePostData;
    initialCommunity?: string | null;
}

export default function HivePostModal({ isOpen, onClose, editPost, initialCommunity }: HivePostModalProps) {
    const [value, setValue] = useState(editPost?.body || '');
    const [title, setTitle] = useState(editPost?.title || '');
    const [tags, setTags] = useState<string[]>(() => {
        if (editPost) {
            try {
                const metadata = JSON.parse(editPost.json_metadata);
                return metadata.tags || [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [currentTag, setCurrentTag] = useState('');
    const [debouncedValue] = useDebounce(value, 300);
    const [isUploading, setIsUploading] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [inputUsername, setInputUsername] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const [isPublishing, setIsPublishing] = useState(false);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(initialCommunity || null);
    const [communityTitle, setCommunityTitle] = useState<string | null>(null);
    const [showCommunitySelector, setShowCommunitySelector] = useState(false);
    const [isLoadingCommunity, setIsLoadingCommunity] = useState(!!editPost);

    useEffect(() => {
        // Check if user is already logged in
        const storedUsername = localStorage.getItem('hive_username');
        if (storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (editPost?.body) {
            // Extract all image URLs from markdown content
            const imageUrls = (editPost.body.match(/!\[.*?\]\((.*?)\)/g) || [])
                .map(img => img.match(/\((.*?)\)/)?.[1])
                .filter((url): url is string => !!url);

            // Initialize uploadedImages with existing images
            const initialImages = imageUrls.map(url => ({
                url: url,
                pinataUrl: url,
                hash: url // Use URL as hash for external images
            }));

            setUploadedImages(initialImages);

            // Set first image as thumbnail if none is set
            if (thumbnailUrl === '' && initialImages.length > 0) {
                setThumbnailUrl(initialImages[0].url);
            }
            
            // When editing a post, we check the metadata to detect the community
            if (editPost.json_metadata) {
                try {
                    console.log('Processing existing post:', editPost);
                    console.log('Permlink:', editPost.permlink);
                    
                    const metadata = JSON.parse(editPost.json_metadata);
                    console.log('Complete post metadata:', metadata);
                    
                    // First check the 'community' field in metadata
                    if (metadata.community) {
                        console.log('Community found in metadata:', metadata.community);
                        setSelectedCommunity(metadata.community);
                        fetchCommunityDetails(metadata.community); // Fetch the friendly name of the community
                    } 
                    // If not found in metadata, check if it was posted in a community by parent_permlink
                    else if (typeof window !== 'undefined' && window.hive_keychain) {
                        console.log('Checking community information via API...');
                        
                        // Make a call to Hive API to get complete post information
                        fetch('https://api.hive.blog', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                jsonrpc: '2.0',
                                method: 'condenser_api.get_content',
                                params: [editPost.author, editPost.permlink],
                                id: 1
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.result) {
                                console.log('Complete post information:', data.result);
                                
                                // Check if the post belongs to a community (parent_permlink starts with 'hive-')
                                if (data.result.parent_permlink && data.result.parent_permlink.startsWith('hive-')) {
                                    console.log('Community found via parent_permlink:', data.result.parent_permlink);
                                    setSelectedCommunity(data.result.parent_permlink);
                                    fetchCommunityDetails(data.result.parent_permlink); // Fetch the friendly name of the community
                                } else {
                                    console.log('Post does not belong to a community (verified via API)');
                                    setSelectedCommunity(null);
                                    setCommunityTitle(null);
                                    setIsLoadingCommunity(false);
                                }
                            }
                            setIsLoadingCommunity(false); // Finished loading, with or without community
                        })
                        .catch(error => {
                            console.error('Error fetching complete post information:', error);
                            setIsLoadingCommunity(false); // Finished loading, even with error
                        });
                    } else {
                        console.log('Keychain not available, could not verify parent_permlink');
                        setSelectedCommunity(null);
                        setIsLoadingCommunity(false); // Finished loading
                    }
                } catch (e) {
                    console.error('Error parsing metadata from post:', e);
                    setSelectedCommunity(null);
                    setIsLoadingCommunity(false); // Finished loading, even with error
                }
            }
        } else if (initialCommunity) {
            // If there's an initial community specified, use it
            setSelectedCommunity(initialCommunity);
            if (initialCommunity.startsWith('hive-')) {
                fetchCommunityDetails(initialCommunity); // Fetch the friendly name of the community
            } else {
                setCommunityTitle(initialCommunity);
                setIsLoadingCommunity(false);
            }
        } else {
            setIsLoadingCommunity(false); // Not editing, no need to load
        }
    }, [editPost, initialCommunity]);

    const { getRootProps, getInputProps } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            for (const file of acceptedFiles) {
                await handleFileUpload(file);
            }
            setIsUploading(false);
        },
        accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
            'video/*': [".mp4"],
        },
        multiple: true
    });

    const handleAddTag = () => {
        if (currentTag && !tags.includes(currentTag) && tags.length < 5) {
            setTags([...tags, currentTag.toLowerCase()]);
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const syncImagesWithEditor = (newValue: string) => {
        syncImages(newValue, uploadedImages, setUploadedImages, thumbnailUrl, setThumbnailUrl);
    };

    const handleFileUpload = async (file: File) => {
        try {
            await uploadFile(
                file,
                setUploadedImages,
                thumbnailUrl,
                setThumbnailUrl,
                setValue
            );
        } catch (error: any) {
            console.error('Error uploading file:', error);
            alert(`Failed to upload file: ${error?.message || 'Unknown error'}. Please try again.`);
        }
    };

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/mp4';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setIsUploading(true);
                await handleFileUpload(file);
                setIsUploading(false);
            }
        };
        input.click();
    };

    const handlePublish = async () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (!value.trim()) {
            alert('Please enter some content');
            return;
        }
        if (tags.length === 0) {
            alert('Please add at least one tag');
            return;
        }

        setIsPublishing(true);

        try {
            const { finalContent, thumbnailPinataUrl } = prepareContentForPublish(
                value,
                uploadedImages,
                thumbnailUrl
            );

            const thumbnailToUse = thumbnailUrl || (uploadedImages.length > 0 ? uploadedImages[0].pinataUrl : null);

            // Create metadata
            const metadata = {
                ...(editPost ? JSON.parse(editPost.json_metadata) : {}),
                tags: tags,
                app: 'wilbor-art-blog',
                image: thumbnailToUse ? [thumbnailToUse] : []
            };
            
            // Add community to metadata if selected
            if (selectedCommunity) {
                metadata.community = selectedCommunity;
            }

            const operations = createHiveOperations(
                title,
                finalContent,
                tags,
                thumbnailToUse,
                username,
                editPost,
                selectedCommunity,
                metadata
            );

            const result = await publishToHive(operations, username, editPost);

            if (result.success) {
                alert(editPost ? 'Post updated successfully!' : 'Post published successfully!');
                onClose();
            } else {
                alert(`Error publishing post: ${result.message || 'Unknown error'}`);
            }
        } catch (error: any) {
            alert(`Error publishing post: ${error?.message || 'Unknown error'}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleHiveLogin = () => {
        if (!inputUsername) {
            alert('Please enter your Hive username');
            return;
        }

        if (typeof window === 'undefined' || !window.hive_keychain) {
            alert('Please install Hive Keychain to login');
            return;
        }

        setIsLoggingIn(true);
        const hiveKeychain = window.hive_keychain;

        // First, check if Hive Keychain is locked
        hiveKeychain.requestHandshake(() => {
            // Now try to sign a message to verify the user
            const memo = `Login to Wilbor Art Blog - ${new Date().toISOString()}`;
            hiveKeychain.requestSignBuffer(
                inputUsername,
                memo,
                'Posting',
                (response: HiveKeychainResponse) => {
                    setIsLoggingIn(false);
                    if (response.success) {
                        setUsername(inputUsername);
                        setIsLoggedIn(true);
                        localStorage.setItem('hive_username', inputUsername);
                        const expirationDate = new Date();
                        expirationDate.setDate(expirationDate.getDate() + 30); // 30 days expiration
                        document.cookie = `hive_username=${inputUsername}; path=/; expires=${expirationDate.toUTCString()}`;
                        window.location.reload();
                    } else {
                        console.error('Hive Keychain login failed:', response);
                        alert('Failed to login with Hive Keychain. Please try again.');
                    }
                }
            );
        });
    };

    const handleThumbnailSelect = (url: string) => {
        setThumbnailUrl(url);
    };

    const closeVideoPlayer = () => {
        setActiveVideo(null);
    };

    const handleSelectCommunity = (communityName: string | null) => {
        setSelectedCommunity(communityName);
        
        if (communityName && communityName.startsWith('hive-')) {
            fetchCommunityDetails(communityName);
        } else if (communityName) {
            setCommunityTitle(communityName);
        } else {
            setCommunityTitle(null);
        }
    };

    // Add useEffect to handle click on video placeholders
    useEffect(() => {
        const handleVideoPlaceholderClick = (e: MouseEvent) => {
            const placeholder = e.currentTarget as HTMLElement;
            const videoUrl = placeholder.getAttribute('data-video-url');
            if (videoUrl) {
                // Set active video to trigger the modal
                setActiveVideo(videoUrl);
            }
        };

        // Attach click handlers to video placeholders
        const attachPlaceholderHandlers = () => {
            const placeholders = document.querySelectorAll('.static-video-placeholder');
            placeholders.forEach(placeholder => {
                placeholder.removeEventListener('click', handleVideoPlaceholderClick as EventListener);
                placeholder.addEventListener('click', handleVideoPlaceholderClick as EventListener);
            });
        };

        // Attach handlers when in preview mode
        if (activeTab === 'preview') {
            setTimeout(attachPlaceholderHandlers, 100);
        }

        // Clean up
        return () => {
            const placeholders = document.querySelectorAll('.static-video-placeholder');
            placeholders.forEach(placeholder => {
                placeholder.removeEventListener('click', handleVideoPlaceholderClick as EventListener);
            });
        };
    }, [activeTab, value]);

    // Function to fetch community details by ID
    const fetchCommunityDetails = (communityId: string) => {
        if (!communityId.startsWith('hive-')) return;
        
        console.log('Fetching community details:', communityId);
        setIsLoadingCommunity(true);
        
        fetch('https://api.hive.blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'bridge.get_community',
                params: { name: communityId, observer: '' },
                id: 1
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.result) {
                console.log('Community details:', data.result);
                const communityData = data.result;
                setCommunityTitle(communityData.title || communityId);
            } else {
                console.log('Could not get community name');
                setCommunityTitle(null);
            }
            setIsLoadingCommunity(false);
        })
        .catch(error => {
            console.error('Error fetching community details:', error);
            setCommunityTitle(null);
            setIsLoadingCommunity(false);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start md:items-center justify-center overflow-y-auto">
            <div className="bg-[#1E2028] w-full max-w-[1000px] rounded-xl overflow-hidden shadow-xl my-2 mx-2">
                <div className="min-h-screen md:min-h-0 md:h-[95vh] flex flex-col w-full">
                    {/* Header */}
                    <ModalHeader
                        editPost={!!editPost}
                        username={username}
                        onClose={onClose}
                    />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="h-full p-3 md:p-4">
                            <div className="h-full flex flex-col gap-3 md:gap-4">
                                {/* Title Input */}
                                <div className="flex-none">
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter your post title"
                                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border text-white border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent"
                                    />
                                </div>

                                {/* Community Info - always shows, regardless of whether there is a community or not */}
                                <div className="flex-none mb-3">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-white mb-2">
                                            Posting in
                                        </label>
                                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-800 text-white border border-gray-700">
                                            {isLoadingCommunity ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin h-4 w-4 border-b-2 border-[#E31337] rounded-full"></div>
                                                    <span className="text-gray-400">Loading information...</span>
                                                </div>
                                            ) : selectedCommunity ? (
                                                <>
                                                    <span className="text-[#E31337] font-medium">
                                                        {communityTitle || selectedCommunity}
                                                    </span>
                                                    <span className="text-gray-400">(Community)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium">Personal Blog</span>
                                                    <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-300">Default</span>
                                                </>
                                            )}
                                            {editPost && (
                                                <span className="ml-auto px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-xs">
                                                    Editing Post
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {isLoadingCommunity ? (
                                                'Verifying publication information...'
                                            ) : selectedCommunity 
                                                ? `Your post will appear in the &quot;${communityTitle || selectedCommunity}&quot; community feed.` 
                                                : 'Your post will be published on your personal blog.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Editor Tabs */}
                                <div className="flex-1 min-h-0 flex flex-col">
                                    <EditorTabs
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                        onUploadClick={handleUploadClick}
                                    />

                                    <div className="flex-1 min-h-0 mt-3 md:mt-4">
                                        <div className="flex flex-col gap-3 md:gap-4">
                                            {/* Editor/Preview Section */}
                                            <div className="h-[45vh] md:h-[50vh] flex flex-col overflow-hidden">
                                                {activeTab === 'write' ? (
                                                    <Editor
                                                        value={value}
                                                        onChange={setValue}
                                                        syncImagesWithEditor={syncImagesWithEditor}
                                                    />
                                                ) : (
                                                    <MarkdownPreviewWrapper value={value} />
                                                )}
                                            </div>

                                            {/* Sidebar with Tags and Thumbnails */}
                                            <div className="flex flex-col gap-3 md:gap-4">
                                                {/* Tags Section */}
                                                <TagManager
                                                    tags={tags}
                                                    currentTag={currentTag}
                                                    setCurrentTag={setCurrentTag}
                                                    handleAddTag={handleAddTag}
                                                    handleRemoveTag={handleRemoveTag}
                                                    handleKeyPress={handleKeyPress}
                                                />

                                                {/* Thumbnail Selection */}
                                                <ThumbnailSelector
                                                    uploadedImages={uploadedImages}
                                                    thumbnailUrl={thumbnailUrl}
                                                    handleThumbnailSelect={handleThumbnailSelect}
                                                />

                                                {/* Custom Thumbnail Upload Button */}
                                                <div className="flex-none">
                                                    <label className="block text-sm font-medium text-white mb-2">
                                                        {uploadedImages.length === 0 ? "Upload Thumbnail" : "Or upload a new thumbnail"}
                                                    </label>
                                                    <button
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = async (e) => {
                                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                                if (file) {
                                                                    setIsUploading(true);
                                                                    try {
                                                                        const formData = new FormData();
                                                                        formData.append('image', file);
                                                                    
                                                                        const fileReader = new FileReader();
                                                                        fileReader.onloadend = () => {
                                                                            try {
                                                                                const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                                                                               
                                                                                const directImageUrl = `https://steemitimages.com/0x0/https://example.com/${uniqueFileName}`;
                                                                                
                                                                                alert("Para usar uma imagem como thumbnail sem fazer upload para IPFS, use a opção 'Ou use uma URL de imagem diretamente' logo abaixo, onde você pode colar a URL de qualquer imagem já hospedada na web.");
                                                                                
                                                                                setIsUploading(false);
                                                                            } catch (error) {
                                                                                console.error('Error processing file', error);
                                                                                setIsUploading(false);
                                                                            }
                                                                        };
                                                                        
                                                                        fileReader.readAsDataURL(file);
                                                                        
                                                                    } catch (error: any) {
                                                                        console.error('Error uploading thumbnail:', error);
                                                                        alert(`Para usar imagens como thumbnail, utilize a opção "Ou use uma URL de imagem diretamente" abaixo. Faça upload da sua imagem em um serviço como Imgur, ImgBB ou similar e cole a URL aqui.`);
                                                                        setIsUploading(false);
                                                                    }
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E31337]/10 hover:bg-[#E31337]/20 text-[#E31337] border border-[#E31337]/30 rounded-lg transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Escolher arquivo (veja nota)
                                                    </button>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        <b>Nota:</b> O upload direto de arquivos está com problemas. Por favor, <u>use a opção abaixo para adicionar URL de imagem</u>.
                                                    </p>
                                                    
                                                    {thumbnailUrl && (
                                                        <div className="mt-3 relative aspect-video rounded-lg overflow-hidden border border-gray-700">
                                                            <img 
                                                                src={thumbnailUrl} 
                                                                alt="Current thumbnail" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2">
                                                                <span className="bg-[#E31337] text-white px-2 py-1 text-xs rounded-full">
                                                                    Current Thumbnail
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-white mb-2">
                                                            Ou use uma URL de imagem diretamente
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text"
                                                                placeholder="https://exemplo.com/imagem.jpg"
                                                                className="flex-1 px-3 py-2 text-sm md:text-base border text-white border-gray-700 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-1 focus:ring-[#E31337]"
                                                                id="external-image-url"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.getElementById('external-image-url') as HTMLInputElement;
                                                                    const imageUrl = input.value.trim();
                                                                    
                                                                    if (!imageUrl) {
                                                                        alert('Por favor, insira uma URL de imagem válida');
                                                                        return;
                                                                    }
                                                                    
                                                                    setUploadedImages(prev => {
                                                                        if (prev.some(img => img.url === imageUrl)) {
                                                                            return prev;
                                                                        }
                                                                        return [...prev, {
                                                                            url: imageUrl,
                                                                            pinataUrl: imageUrl,
                                                                            hash: Date.now().toString() 
                                                                        }];
                                                                    });
                                                                    
                                                                    setThumbnailUrl(imageUrl);
                                                                    
                                                                    input.value = '';
                                                                }}
                                                                className="px-3 py-2 bg-[#E31337] text-white rounded-lg hover:bg-[#E31337]/80 transition-colors"
                                                            >
                                                                Usar
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.getElementById('external-image-url') as HTMLInputElement;
                                                                    const rawUrl = input.value.trim();
                                                                    if (rawUrl) {
                                                                        input.value = `https://steemitimages.com/0x0/${rawUrl}`;
                                                                    }
                                                                }}
                                                                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                                                                title="Usar Steemitimages como proxy"
                                                            >
                                                                Steemitimages
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const input = document.getElementById('external-image-url') as HTMLInputElement;
                                                                    const rawUrl = input.value.trim();
                                                                    if (rawUrl) {
                                                                        input.value = `https://images.hive.blog/0x0/${rawUrl}`;
                                                                    }
                                                                }}
                                                                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                                                                title="Usar Hive Images como proxy"
                                                            >
                                                                Hive Images
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Upload Indicator */}
                                                <UploadIndicator isUploading={isUploading} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Video Player Modal */}
                    <VideoPlayer
                        activeVideo={activeVideo}
                        closeVideoPlayer={closeVideoPlayer}
                    />

                    {/* Action Buttons */}
                    <ModalFooter
                        onClose={onClose}
                        handlePublish={handlePublish}
                        isPublishing={isPublishing}
                    />
                </div>
            </div>
        </div>
    );
} 