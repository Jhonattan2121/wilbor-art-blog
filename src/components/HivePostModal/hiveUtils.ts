import { HivePostData, UploadedImage } from "./types";

export const prepareContentForPublish = (
    value: string,
    uploadedImages: UploadedImage[],
    thumbnailUrl: string
) => {
    // Convert all public URLs to Pinata URLs in the final content
    let finalContent = value;

    // Replace all image and video URLs with Pinata URLs
    const imgRegex = /<img src="(https:\/\/ipfs\.io\/ipfs\/[^"]+)" data-pinata-url="([^"]+)"/g;
    finalContent = finalContent.replace(imgRegex, '<img src="$2"');

    const videoRegex = /data-video-url="(https:\/\/ipfs\.io\/ipfs\/[^"]+)" data-pinata-url="([^"]+)"/g;
    finalContent = finalContent.replace(videoRegex, 'data-video-url="$2"');

    // Get Pinata URL for the thumbnail if it exists
    const thumbnailPinataUrl = uploadedImages.find(img => img.url === thumbnailUrl)?.pinataUrl || thumbnailUrl;

    return { 
        finalContent, 
        thumbnailPinataUrl 
    };
};

export const createHiveOperations = (
    title: string,
    content: string,
    tags: string[],
    thumbnailUrl: string | null,
    username: string,
    editPost?: HivePostData
) => {
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
            "body": content,
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
            "body": content,
            "json_metadata": JSON.stringify(metadata)
        }]);
    }

    return operations;
};

export const publishToHive = (
    operations: any[],
    username: string,
    editPost?: HivePostData
) => {
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
        const keychain = window.hive_keychain;
        if (keychain) {
            (keychain as any).requestBroadcast(
                editPost?.author || username,
                operations,
                'posting',
                (response: any) => {
                    if (response.success) {
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, message: response.message });
                    }
                }
            );
        } else {
            resolve({ success: false, message: 'Hive Keychain is not installed!' });
        }
    });
}; 