import { KeyboardEvent } from 'react';
import { BiX } from 'react-icons/bi';

interface TagManagerProps {
    tags: string[];
    currentTag: string;
    setCurrentTag: (tag: string) => void;
    handleAddTag: () => void;
    handleRemoveTag: (tag: string) => void;
    handleKeyPress: (e: KeyboardEvent) => void;
}

export const TagManager = ({
    tags,
    currentTag,
    setCurrentTag,
    handleAddTag,
    handleRemoveTag,
    handleKeyPress
}: TagManagerProps) => {
    return (
        <div className="flex-none">
            <label className="text-sm font-medium text-white">
                Tags <span className="text-white">({tags.length}/5)</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:bg-gray-800/50 min-h-[48px]">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium bg-[#E31337] text-white"
                    >
                        #{tag}
                        <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 bg-white text-black hover:bg-white/90 focus:outline-none transition-colors rounded-full p-0.5 w-4 h-4 flex items-center justify-center"
                        >
                            <BiX size={14} className="hover:scale-110 transition-transform" />
                        </button>
                    </span>
                ))}
            </div>
            {tags.length < 5 && (
                <div className="mt-2 flex gap-2">
                    <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value.replace(/\s+/g, ''))}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a tag"
                        className="flex-1 px-3 md:px-4 py-2 text-sm border text-white border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent"
                    />
                    <button
                        onClick={handleAddTag}
                        disabled={!currentTag || tags.length >= 5}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!currentTag || tags.length >= 5
                                ? 'bg-gray-400 dark:bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-[#E31337] text-white hover:bg-[#c11230]'
                            }`}
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
}; 