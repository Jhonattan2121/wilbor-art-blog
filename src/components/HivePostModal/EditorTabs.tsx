import { BiImage } from 'react-icons/bi';

interface EditorTabsProps {
    activeTab: 'write' | 'preview';
    setActiveTab: (tab: 'write' | 'preview') => void;
    onUploadClick: () => void;
}

export const EditorTabs = ({ activeTab, setActiveTab, onUploadClick }: EditorTabsProps) => {
    return (
        <div className="flex-none flex flex-wrap md:flex-nowrap border-b border-gray-200 dark:border-gray-700 bg-[#1E2028]">
            <div className="flex-1 flex">
                <button
                    onClick={() => setActiveTab('write')}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm font-medium ${
                        activeTab === 'write'
                            ? 'text-[#E31337] border-b-2 border-[#E31337]'
                            : ' dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Write
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm font-medium ${
                        activeTab === 'preview'
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
                    onClick={onUploadClick}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors"
                    title="Upload Image"
                >
                    <BiImage size={18} />
                    <span className="text-sm font-medium">Upload</span>
                </button>
            </div>
        </div>
    );
}; 