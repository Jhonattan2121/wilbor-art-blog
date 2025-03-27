interface UploadIndicatorProps {
    isUploading: boolean;
}

export const UploadIndicator = ({ isUploading }: UploadIndicatorProps) => {
    if (!isUploading) return null;
    
    return (
        <div className="flex-none p-3 md:p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent">
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E31337]"></div>
                <span className="ml-3 text-sm text-white">
                    Uploading...
                </span>
            </div>
        </div>
    );
}; 