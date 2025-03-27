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
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
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

            const operations = createHiveOperations(
                title,
                finalContent,
                tags,
                thumbnailPinataUrl,
                username,
                editPost
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