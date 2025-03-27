'use client';

import Modal from '@/components/Modal';
import { uploadFileToIPFS } from '@/utils/ipfs';
import MarkdownPreview from '@uiw/react-markdown-preview';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BiImage, BiPencil, BiShow, BiX } from 'react-icons/bi';
import { useDebounce } from 'use-debounce';
import { HiveKeychainResponse } from '../types/hive-keychain'; // Adjust the path based on your project structure

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
    const [uploadedImages, setUploadedImages] = useState<{ url: string, hash: string }[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [inputUsername, setInputUsername] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    useEffect(() => {
        // Check if user is already logged in
        const storedUsername = localStorage.getItem('hive_username');
        if (storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        }
    }, []);

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
        
        const ipfsData = await uploadFileToIPFS(file);
        if (ipfsData !== undefined) {
            const ipfsUrl = `https://lime-useful-snake-714.mypinata.cloud/ipfs/${ipfsData.IpfsHash}`;
            const markdownLink = file.type.startsWith("video/")
                ? `<iframe src="${ipfsUrl}" allowFullScreen={true}></iframe>`
                : `![Image](${ipfsUrl})`;
            setValue(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);

            // Add to uploadedImages only if it's an image and not already present
            if (!file.type.startsWith("video/")) {
                setUploadedImages(prev => {
                    // Check if image already exists
                    if (prev.some(img => img.hash === ipfsData.IpfsHash)) {
                        return prev;
                    }
                    return [...prev, {
                        url: ipfsUrl,
                        hash: ipfsData.IpfsHash
                    }];
                });

                // Set as thumbnail if none is set
                if (thumbnailUrl === '') {
                    setThumbnailUrl(ipfsUrl);
                }
            }
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

    if (!isOpen) return null;

    return (
        <Modal onClose={onClose} className="z-[9999] max-w-6xl w-[95vw] h-[90vh] overflow-hidden">
            <div className="h-full flex flex-col space-y-4 relative">
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 p-2 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors z-10"
                    aria-label="Close modal"
                >
                    <BiX size={20} />
                </button>
               
                    <div className="h-full flex flex-col space-y-4 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Create Post</h2>
                            <span className="text-sm text-gray-500">@{username}</span>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your post title"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent"
                            />
                        </div>

                        {/* Editor Tabs and Content */}
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => setActiveTab('write')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'write'
                                            ? 'text-[#E31337] border-b-2 border-[#E31337]'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-[#E31337]'
                                    }`}
                                >
                                    <BiPencil size={18} />
                                    Write
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'preview'
                                            ? 'text-[#E31337] border-b-2 border-[#E31337]'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-[#E31337]'
                                    }`}
                                >
                                    <BiShow size={18} />
                                    Preview
                                </button>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 min-h-0">
                                {activeTab === 'write' ? (
                                    <div className="h-full relative" data-color-mode="light" {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="text-white">Uploading...</div>
                                            </div>
                                        )}
                                        <MDEditor
                                            value={value}
                                            onChange={(val) => {
                                                setValue(val || '');
                                                syncImagesWithEditor(val || '');
                                            }}
                                            preview="edit"
                                            height="100%"
                                            className="h-full !border-gray-300 dark:!border-gray-700 rounded-lg overflow-auto"
                                            visibleDragbar={false}
                                            extraCommands={[
                                                {
                                                    name: 'upload',
                                                    keyCommand: 'upload',
                                                    buttonProps: { 'aria-label': 'Upload image' },
                                                    icon: (
                                                        <div className="flex items-center gap-2">
                                                            <BiImage size={16} />
                                                            <span>Upload</span>
                                                        </div>
                                                    ),
                                                    execute: () => {
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
                                                        return true;
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-full overflow-auto">
                                        <div className="markdown-body w-full p-4">
                                            <MarkdownPreview 
                                                source={value} 
                                                wrapperElement={{
                                                    "data-color-mode": "light"
                                                }}
                                                style={{
                                                    backgroundColor: 'transparent'
                                                }}
                                                components={{
                                                    img: ({ src, alt }) => {
                                                        if (!src) return null;
                                                        let imageSrc = src;
                                                        
                                                        if (src.includes('lime-useful-snake-714.mypinata.cloud')) {
                                                            const ipfsHash = src.split('/ipfs/')[1];
                                                            if (ipfsHash) {
                                                                imageSrc = `https://ipfs.io/ipfs/${ipfsHash}`;
                                                            }
                                                        }
                                                        else if (src.includes('ipfs/Qm') || src.startsWith('Qm')) {
                                                            const ipfsHash = src.split('/').pop()?.split('?')[0];
                                                            if (ipfsHash && ipfsHash.startsWith('Qm')) {
                                                                imageSrc = `https://ipfs.io/ipfs/${ipfsHash}`;
                                                            }
                                                        }

                                                        return (
                                                            <img 
                                                                src={imageSrc} 
                                                                alt={alt || 'Post image'} 
                                                                style={{ 
                                                                    maxWidth: '100%', 
                                                                    height: 'auto',
                                                                    display: 'block',
                                                                    margin: '0 auto'
                                                                }} 
                                                                loading="lazy"
                                                            />
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail and Tags Section */}
                        <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                            {/* Thumbnail Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Featured Image
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {uploadedImages.map((image, index) => (
                                        <div
                                            key={image.hash}
                                            onClick={() => handleThumbnailSelect(image.url)}
                                            className={`relative w-32 h-32 overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                                                thumbnailUrl === image.url 
                                                    ? 'border-[#E31337] scale-105' 
                                                    : 'border-gray-300 dark:border-gray-700 hover:border-[#E31337] hover:scale-105'
                                            }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Uploaded image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    if (!img.dataset.retried) {
                                                        img.dataset.retried = 'true';
                                                        if (img.src.includes('pinata')) {
                                                            const ipfsHash = img.src.split('/ipfs/')[1];
                                                            if (ipfsHash) {
                                                                img.src = `https://ipfs.io/ipfs/${ipfsHash}`;
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tags (max 5)
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-1"
                                        >
                                            #{tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-red-500"
                                            >
                                                <BiX />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {tags.length < 5 && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={currentTag}
                                            onChange={(e) => setCurrentTag(e.target.value.replace(/\s+/g, ''))}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Add a tag"
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent"
                                        />
                                        <button
                                            onClick={handleAddTag}
                                            className="px-4 py-2 bg-[#E31337] text-white rounded-lg hover:bg-[#c11230] transition-colors"
                                        >
                                            Add Tag
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                onClick={onClose}
                                className="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePost}
                                className={`button primary ${(!title.trim() || !value.trim() || tags.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!title.trim() || !value.trim() || tags.length === 0}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                
            </div>
        </Modal>
    );
} 