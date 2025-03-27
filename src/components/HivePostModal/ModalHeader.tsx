import { BiX } from 'react-icons/bi';

interface ModalHeaderProps {
    editPost?: boolean;
    username: string;
    onClose: () => void;
}

export const ModalHeader = ({ editPost, username, onClose }: ModalHeaderProps) => {
    return (
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
                        className="p-1.5 md:p-2 rounded-full hover:bg-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <BiX size={20} className=" hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </header>
    );
}; 