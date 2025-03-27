import { UploadedImage } from './types';

interface ThumbnailSelectorProps {
    uploadedImages: UploadedImage[];
    thumbnailUrl: string;
    handleThumbnailSelect: (url: string) => void;
}

export const ThumbnailSelector = ({
    uploadedImages,
    thumbnailUrl,
    handleThumbnailSelect
}: ThumbnailSelectorProps) => {
    if (uploadedImages.length === 0) return null;
    
    return (
        <div className="flex-none">
            <label className="block text-sm font-medium text-white mb-2">
            Cover Image
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
                                    title={thumbnailUrl === image.url ? 'Selected cover image' : 'Click to select as cover'}
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
                                title={thumbnailUrl === image.url ? 'Selected cover image' : 'Click to select as cover'}
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
    );
}; 