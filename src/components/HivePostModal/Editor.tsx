interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    syncImagesWithEditor: (value: string) => void;
}

export const Editor = ({ value, onChange, syncImagesWithEditor }: EditorProps) => {
    return (
        <div className="h-full flex flex-col">
            <textarea
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    syncImagesWithEditor(e.target.value);
                }}
                placeholder="Write your post content here using markdown..."
                className="flex-1 w-full h-full px-3 md:px-4 py-3 md:py-4 text-sm md:text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-[#E31337] focus:border-transparent resize-none font-mono leading-relaxed"
            />
        </div>
    );
}; 