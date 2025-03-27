interface ModalFooterProps {
    onClose: () => void;
    handlePublish: () => void;
    isPublishing: boolean;
}

export const ModalFooter = ({ onClose, handlePublish, isPublishing }: ModalFooterProps) => {
    return (
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
    );
}; 