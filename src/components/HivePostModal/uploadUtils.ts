import { uploadFileToIPFS } from "@/utils/ipfs";
import { UploadedImage } from "./types";

export const uploadFile = async (
    file: File,
    setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
    thumbnailUrl: string,
    setThumbnailUrl: (url: string) => void,
    setValue: (value: string | ((prevValue: string) => string)) => void
) => {
    if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/gif" && file.type !== "video/mp4") {
        throw new Error("Invalid file type. Only images and videos are allowed.");
    }

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

    return { publicUrl, pinataUrl, hash: ipfsData.IpfsHash };
};

export const syncImagesWithEditor = (
    newValue: string,
    uploadedImages: UploadedImage[],
    setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>,
    thumbnailUrl: string,
    setThumbnailUrl: (url: string) => void
) => {
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