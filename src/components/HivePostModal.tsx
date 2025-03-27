'use client';

import { uploadFileToIPFS } from '@/utils/ipfs';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BiImage, BiX } from 'react-icons/bi';
import { useDebounce } from 'use-debounce';
import { HiveKeychainResponse } from '../types/hive-keychain';

interface Media {
    src: string;
    type: string;
    title?: string;
}

interface HivePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    editPost?: {
        author: string;
        permlink: string;
        title: string;
        body: string;
        json_metadata: string;
    };
}

export default function HivePostModal({ isOpen, onClose, editPost }: HivePostModalProps) {
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
    const [uploadedImages, setUploadedImages] = useState<{ url: string, pinataUrl: string, hash: string }[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [inputUsername, setInputUsername] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const [isPublishing, setIsPublishing] = useState(false);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

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
        }
    }, [editPost]);

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
        // Extract all image URLs from markdown content
        const imageUrls = (newValue.match(/!\[.*?\]\((.*?)\)/g) || [])
            .map(img => img.match(/\((.*?)\)/)?.[1])
            .filter((url): url is string => !!url);

        // Filter uploadedImages to only keep those that are still in the editor
        const updatedImages = uploadedImages.filter(img =>
            imageUrls.some(url => url === img.url)
        );

        // Add any new external images that aren't in IPFS
        imageUrls.forEach(url => {
            if (!updatedImages.some(img => img.url === url)) {
                updatedImages.push({
                    url: url,
                    pinataUrl: url,
                    hash: url // Use URL as hash for external images
                });
            }
        });

        setUploadedImages(updatedImages);

        // If thumbnail is not in the updated images, clear it
        if (!updatedImages.some(img => img.url === thumbnailUrl)) {
            setThumbnailUrl('');
        }
    };

    const handleFileUpload = async (file: File) => {
        if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/gif" && file.type !== "video/mp4") {
            alert("Invalid file type. Only images and videos are allowed. To use .mov files upload in Feed");
            return;
        }

        try {
            const ipfsData = await uploadFileToIPFS(file);
            if (!ipfsData || !ipfsData.IpfsHash) {
                throw new Error('Failed to upload file to IPFS');
            }

            // Use Pinata URL for storage (what gets saved to Hive)
            const pinataUrl = `https://lime-useful-snake-714.mypinata.cloud/ipfs/${ipfsData.IpfsHash}`;
            // Use public IPFS gateway for preview and display
            const publicUrl = `https://ipfs.io/ipfs/${ipfsData.IpfsHash}`;

            // Try to pre-load the image to verify it's accessible
            if (!file.type.startsWith("video/")) {
                const img = new Image();
                const imageLoadPromise = new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = () => reject(new Error('Failed to load image from IPFS'));
                });
                img.src = publicUrl;
                await imageLoadPromise;
            }

            // Replace the publicUrl with pinataUrl in the final markdown that gets saved
            const markdownLink = file.type.startsWith("video/")
                ? `<div class="static-video-placeholder" data-video-url="${publicUrl}" data-pinata-url="${pinataUrl}">[Vídeo - Clique para reproduzir]</div>`
                : `<img src="${publicUrl}" data-pinata-url="${pinataUrl}" alt="Image" style="max-width:100%; display:block; background:none; margin:10px 0;" />`;

            // Store the markdown with public URL for preview but replace with Pinata URL on publish
            setValue(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);

            // Add to uploadedImages only if it's an image and not already present
            if (!file.type.startsWith("video/")) {
                setUploadedImages(prev => {
                    // Check if image already exists
                    if (prev.some(img => img.hash === ipfsData.IpfsHash)) {
                        return prev;
                    }
                    return [...prev, {
                        url: publicUrl, // Use public URL for thumbnails
                        pinataUrl: pinataUrl, // Store Pinata URL for publishing
                        hash: ipfsData.IpfsHash
                    }];
                });

                // Set as thumbnail if none is set
                if (thumbnailUrl === '') {
                    setThumbnailUrl(publicUrl);
                }
            }
        } catch (error: any) {
            console.error('Error uploading file:', error);
            alert(`Failed to upload file: ${error?.message || 'Unknown error'}. Please try again.`);
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
                        // Store username in both localStorage and cookie with a long expiration
                        localStorage.setItem('hive_username', inputUsername);
                        const expirationDate = new Date();
                        expirationDate.setDate(expirationDate.getDate() + 30); // 30 days expiration
                        document.cookie = `hive_username=${inputUsername}; path=/; expires=${expirationDate.toUTCString()}`;
                        // Refresh the page to update the grid
                        window.location.reload();
                    } else {
                        console.error('Hive Keychain login failed:', response);
                        alert('Failed to login with Hive Keychain. Please try again.');
                    }
                }
            );
        });
    };

    const handlePost = () => {
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

        const operations = [];
        const metadata = {
            ...(editPost ? JSON.parse(editPost.json_metadata) : {}),
            tags: tags,
            app: 'wilbor-art-blog',
            image: thumbnailUrl ? [thumbnailUrl] : []
        };

        if (editPost) {
            // Edit existing post
            operations.push(["comment", {
                "parent_author": "",
                "parent_permlink": tags[0],
                "author": editPost.author,
                "permlink": editPost.permlink,
                "title": title,
                "body": value,
                "json_metadata": JSON.stringify(metadata)
            }]);
        } else {
            // Create new post
            const permlink = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            operations.push(["comment", {
                "parent_author": "",
                "parent_permlink": tags[0],
                "author": username,
                "permlink": permlink,
                "title": title,
                "body": value,
                "json_metadata": JSON.stringify(metadata)
            }]);
        }

        const keychain = window.hive_keychain;
        if (keychain) {
            (keychain as any).requestBroadcast(
                editPost?.author || username,
                operations,
                'posting',
                (response: any) => {
                    if (response.success) {
                        alert(editPost ? 'Post updated successfully!' : 'Post published successfully!');
                        onClose();
                    } else {
                        alert('Error publishing post: ' + response.message);
                    }
                }
            );
        } else {
            alert('Hive Keychain is not installed!');
        }
    };

    const handleThumbnailSelect = (url: string) => {
        setThumbnailUrl(url);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        if (newImages.length > 0) {
            setThumbnailUrl(newImages[0].url);
        } else {
            setThumbnailUrl('');
        }
    };

    const handleSaveDraft = () => {
        // Implementation of handleSaveDraft
    };

    const handlePublish = () => {
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

        // Convert all public URLs to Pinata URLs in the final content
        let finalContent = value;

        // Replace all image and video URLs with Pinata URLs
        const imgRegex = /<img src="(https:\/\/ipfs\.io\/ipfs\/[^"]+)" data-pinata-url="([^"]+)"/g;
        finalContent = finalContent.replace(imgRegex, '<img src="$2"');

        const videoRegex = /data-video-url="(https:\/\/ipfs\.io\/ipfs\/[^"]+)" data-pinata-url="([^"]+)"/g;
        finalContent = finalContent.replace(videoRegex, 'data-video-url="$2"');

        // Get Pinata URL for the thumbnail if it exists
        const thumbnailPinataUrl = uploadedImages.find(img => img.url === thumbnailUrl)?.pinataUrl || thumbnailUrl;

        const operations = [];
        const metadata = {
            ...(editPost ? JSON.parse(editPost.json_metadata) : {}),
            tags: tags,
            app: 'wilbor-art-blog',
            image: thumbnailPinataUrl ? [thumbnailPinataUrl] : []
        };

        if (editPost) {
            // Edit existing post
            operations.push(["comment", {
                "parent_author": "",
                "parent_permlink": tags[0],
                "author": editPost.author,
                "permlink": editPost.permlink,
                "title": title,
                "body": finalContent,
                "json_metadata": JSON.stringify(metadata)
            }]);
        } else {
            // Create new post
            const permlink = title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            operations.push(["comment", {
                "parent_author": "",
                "parent_permlink": tags[0],
                "author": username,
                "permlink": permlink,
                "title": title,
                "body": finalContent,
                "json_metadata": JSON.stringify(metadata)
            }]);
        }

        const keychain = window.hive_keychain;
        if (keychain) {
            (keychain as any).requestBroadcast(
                editPost?.author || username,
                operations,
                'posting',
                (response: any) => {
                    if (response.success) {
                        alert(editPost ? 'Post updated successfully!' : 'Post published successfully!');
                        onClose();
                    } else {
                        alert('Error publishing post: ' + response.message);
                    }
                    setIsPublishing(false);
                }
            );
        } else {
            alert('Hive Keychain is not installed!');
            setIsPublishing(false);
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

    // Function to close video player
    const closeVideoPlayer = () => {
        setActiveVideo(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start md:items-center justify-center overflow-y-auto">
            <div className="bg-[#1E2028] w-full max-w-[1000px] rounded-xl overflow-hidden shadow-xl my-2 mx-2">
                <div className="min-h-screen md:min-h-0 md:h-[95vh] flex flex-col w-full">
                    {/* Header */}
                    <header className="sticky top-0 z-10 flex-none bg-[#1E2028] border-b border-gray-800">
                        <div className="w-full px-3 md:px-4">
                            <div className="flex justify-between items-center h-14">
                                <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-4">
                                    <h1 className="text-base md:text-xl font-bold text-white">
                                        {editPost ? 'Edit Post' : 'Create Post'}
                                    </h1>
                                    <span className="text-xs md:text-sm text-gray-400">
                                        @{username}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 md:p-2 rounded-full hover:bg-gray-800 transition-colors"
                                    aria-label="Close"
                                >
                                    <BiX size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </header>

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
                                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border text-white border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent"
                                    />
                                </div>

                                {/* Editor Tabs */}
                                <div className="flex-1 min-h-0 flex flex-col">
                                    <div className="flex-none flex flex-wrap md:flex-nowrap border-b border-gray-200 dark:border-gray-700 bg-[#1E2028]">
                                        <div className="flex-1 flex">
                                            <button
                                                onClick={() => setActiveTab('write')}
                                                className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm font-medium ${activeTab === 'write'
                                                        ? 'text-[#E31337] border-b-2 border-[#E31337]'
                                                        : ' dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                Write
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('preview')}
                                                className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm font-medium ${activeTab === 'preview'
                                                        ? 'text-[#E31337] border-b-2 border-[#E31337]'
                                                        : ' dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                Preview
                                            </button>
                                        </div>
                                        {/* Image Upload Section */}
                                        <div className="w-full md:w-auto flex items-center justify-center md:justify-start p-2">
                                            <button
                                                onClick={() => {
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
                                                }}
                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors"
                                                title="Upload Image"
                                            >
                                                <BiImage size={18} />
                                                <span className="text-sm font-medium">Upload</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-h-0 mt-3 md:mt-4">
                                        <div className="flex flex-col gap-3 md:gap-4">
                                            {/* Editor/Preview Section */}
                                            <div className="h-[45vh] md:h-[50vh] flex flex-col overflow-hidden">
                                                {activeTab === 'write' ? (
                                                    <div className="h-full flex flex-col">
                                                        <textarea
                                                            value={value}
                                                            onChange={(e) => {
                                                                setValue(e.target.value);
                                                                syncImagesWithEditor(e.target.value);
                                                            }}
                                                            placeholder="Write your post content here using markdown..."
                                                            className="flex-1 w-full text-white h-full px-3 md:px-4 py-3 md:py-4 text-sm md:text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent resize-none font-mono leading-relaxed"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-full overflow-y-auto overflow-x-hidden prose prose-sm md:prose dark:prose-invert max-w-none p-3 md:p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white">
                                                        <div className="w-full max-w-full break-words">
                                                            <MarkdownPreview
                                                                source={value}
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    color: 'inherit'
                                                                }}
                                                                rehypePlugins={[]}
                                                                className="markdown-preview-custom"
                                                                wrapperElement={{
                                                                    'data-color-mode': 'dark'
                                                                }}
                                                            />
                                                            <style jsx global>{`
                                                                .markdown-preview-custom {
                                                                    color: white;
                                                                    background-color: transparent !important;
                                                                }
                                                                
                                                                /* Fix for all images */
                                                                .markdown-preview-custom img {
                                                                    width: 100% !important;
                                                                    max-width: 100% !important;
                                                                    max-height: 400px !important;
                                                                    object-fit: contain !important;
                                                                    margin: 10px 0 !important;
                                                                    padding: 0 !important;
                                                                    background: none !important;
                                                                    display: block !important;
                                                                    border: none !important;
                                                                    box-shadow: none !important;
                                                                }
                                                                
                                                                /* Static video placeholder */
                                                                .static-video-placeholder {
                                                                    background-color: #161616 !important;
                                                                    color: white !important;
                                                                    padding: 15px !important;
                                                                    margin: 10px 0 !important;
                                                                    border-radius: 8px !important;
                                                                    text-align: center !important;
                                                                    font-size: 14px !important;
                                                                    cursor: pointer !important;
                                                                    border-left: 4px solid #E31337 !important;
                                                                    transition: background-color 0.2s !important;
                                                                }
                                                                
                                                                .static-video-placeholder:hover {
                                                                    background-color: #1f1f1f !important;
                                                                }
                                                                
                                                                .static-video-placeholder::before {
                                                                    content: "▶️" !important;
                                                                    display: inline-block !important;
                                                                    margin-right: 8px !important;
                                                                    font-size: 18px !important;
                                                                }
                                                                
                                                                /* Add this to ensure proper iframe display */
                                                                .markdown-preview-custom iframe {
                                                                    width: 100% !important;
                                                                    max-width: 100% !important;
                                                                    height: 250px !important;
                                                                    border: none !important;
                                                                    padding: 0 !important;
                                                                    margin: 10px 0 !important;
                                                                    background: none !important;
                                                                    display: block !important;
                                                                }
                                                                
                                                                /* Override any wrapper spacing */
                                                                .markdown-preview-custom p {
                                                                    margin: 1em 0 !important;
                                                                }
                                                                
                                                                /* Remove any strange backgrounds from media containers */
                                                                .markdown-preview-custom p:has(img),
                                                                .markdown-preview-custom p:has(.static-video-placeholder),
                                                                .markdown-preview-custom p:has(iframe) {
                                                                    background: none !important;
                                                                    padding: 0 !important;
                                                                    margin: 0 !important;
                                                                }
                                                                
                                                                .markdown-preview-custom h1 { font-size: 1.5rem; }
                                                                .markdown-preview-custom h2 { font-size: 1.25rem; }
                                                                .markdown-preview-custom h3 { font-size: 1.125rem; }
                                                                .markdown-preview-custom ul, 
                                                                .markdown-preview-custom ol { 
                                                                    font-size: 0.875rem;
                                                                    margin: 0.5rem 0;
                                                                }
                                                                .markdown-preview-custom a {
                                                                    color: #E31337;
                                                                    text-decoration: none;
                                                                }
                                                                .markdown-preview-custom a:hover {
                                                                    text-decoration: underline;
                                                                }
                                                                .markdown-preview-custom pre, 
                                                                .markdown-preview-custom code {
                                                                    font-size: 0.75rem;
                                                                    white-space: pre-wrap;
                                                                    overflow-x: auto;
                                                                }
                                                            `}</style>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sidebar with Tags and Thumbnails */}
                                            <div className="flex flex-col gap-3 md:gap-4">
                                                {/* Tags Section */}
                                                <div className="flex-none">
                                                    <label className="text-sm font-medium text-white">
                                                        Tags <span className="text-white">({tags.length}/5)</span>
                                                    </label>
                                                    <div className="mt-2 flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:bg-gray-800/50 min-h-[48px]">
                                                        {tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium bg-[#E31337] text-white"
                                                            >
                                                                #{tag}
                                                                <button
                                                                    onClick={() => handleRemoveTag(tag)}
                                                                    className="ml-1.5 text-white/90 hover:text-white focus:outline-none transition-colors"
                                                                >
                                                                    <BiX size={16} className="hover:scale-110 transition-transform" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {tags.length < 5 && (
                                                        <div className="mt-2 flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={currentTag}
                                                                onChange={(e) => setCurrentTag(e.target.value.replace(/\s+/g, ''))}
                                                                onKeyPress={handleKeyPress}
                                                                placeholder="Digite uma tag"
                                                                className="flex-1 px-3 md:px-4 py-2 text-sm border text-white border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent"
                                                            />
                                                            <button
                                                                onClick={handleAddTag}
                                                                disabled={!currentTag || tags.length >= 5}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!currentTag || tags.length >= 5
                                                                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-300 cursor-not-allowed'
                                                                        : 'bg-[#E31337] text-white hover:bg-[#c11230]'
                                                                    }`}
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thumbnail Selection */}
                                                {uploadedImages.length > 0 && (
                                                    <div className="flex-none">
                                                        <label className="block text-sm font-medium text-white dark:text-gray-300 mb-2">
                                                            Imagem de Capa
                                                        </label>
                                                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-transparent dark:bg-gray-800/50">
                                                            {/* Mobile Carousel */}
                                                            <div className="md:hidden relative">
                                                                <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                                                                    <div className="flex gap-2">
                                                                        {uploadedImages.map((image, index) => (
                                                                            <button
                                                                                key={image.hash}
                                                                                onClick={() => handleThumbnailSelect(image.url)}
                                                                                className={`relative flex-none w-[200px] aspect-video overflow-hidden rounded-lg transition-all snap-center ${thumbnailUrl === image.url
                                                                                        ? 'ring-2 ring-[#E31337] scale-[1.02]'
                                                                                        : 'ring-1 ring-gray-300 dark:ring-gray-700 hover:ring-[#E31337] hover:scale-[1.02]'
                                                                                    }`}
                                                                                title={thumbnailUrl === image.url ? 'Imagem de capa selecionada' : 'Clique para selecionar como capa'}
                                                                            >
                                                                                <img
                                                                                    src={image.url}
                                                                                    alt={`Miniatura ${index + 1}`}
                                                                                    className="h-full w-full object-cover"
                                                                                />
                                                                                {thumbnailUrl === image.url && (
                                                                                    <div className="absolute inset-0 bg-[#E31337]/10 flex items-center justify-center">
                                                                                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E31337]"></div>
                                                                                    </div>
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {/* Gradient Indicators */}
                                                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1E2028] to-transparent pointer-events-none" />
                                                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1E2028] to-transparent pointer-events-none" />
                                                            </div>

                                                            {/* Desktop Grid */}
                                                            <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-2">
                                                                {uploadedImages.map((image, index) => (
                                                                    <button
                                                                        key={image.hash}
                                                                        onClick={() => handleThumbnailSelect(image.url)}
                                                                        className={`relative aspect-video overflow-hidden rounded-lg transition-all ${thumbnailUrl === image.url
                                                                                ? 'ring-2 ring-[#E31337] scale-[1.02]'
                                                                                : 'ring-1 ring-gray-300 dark:ring-gray-700 hover:ring-[#E31337] hover:scale-[1.02]'
                                                                            }`}
                                                                        title={thumbnailUrl === image.url ? 'Imagem de capa selecionada' : 'Clique para selecionar como capa'}
                                                                    >
                                                                        <img
                                                                            src={image.url}
                                                                            alt={`Miniatura ${index + 1}`}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                        {thumbnailUrl === image.url && (
                                                                            <div className="absolute inset-0 bg-[#E31337]/10 flex items-center justify-center">
                                                                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E31337]"></div>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {isUploading && (
                                                    <div className="flex-none p-3 md:p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white">
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E31337]"></div>
                                                            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                                                                Uploading...
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Video Player Modal */}
                    {activeVideo && (
                        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center" onClick={closeVideoPlayer}>
                            <div className="w-full max-w-[90%] max-h-[90%] relative" onClick={(e) => e.stopPropagation()}>
                                <video
                                    src={activeVideo}
                                    controls
                                    autoPlay
                                    className="w-full h-auto max-h-[80vh]"
                                />
                                <button
                                    className="absolute top-2 right-2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                                    onClick={closeVideoPlayer}
                                >
                                    <BiX size={24} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <footer className="flex-none border-t border-gray-800 bg-[#1E2028]">
                        <div className="px-3 md:px-4 py-3">
                            <div className="flex flex-row items-center justify-between gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isPublishing
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-[#E31337] hover:bg-[#c11230]'
                                        }`}
                                >
                                    {isPublishing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Publishing...
                                        </div>
                                    ) : (
                                        'Publish'
                                    )}
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
} 