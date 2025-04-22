export interface UploadedImage {
    url: string;
    pinataUrl: string;
    hash: string;
}

export interface HivePostData {
    author: string;
    permlink: string;
    title: string;
    body: string;
    json_metadata: string;
} 