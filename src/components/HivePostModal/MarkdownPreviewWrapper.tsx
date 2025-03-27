import MarkdownPreview from '@uiw/react-markdown-preview';

interface MarkdownPreviewWrapperProps {
    value: string;
}

export const MarkdownPreviewWrapper = ({ value }: MarkdownPreviewWrapperProps) => {
    return (
        <div className="h-full overflow-y-auto overflow-x-hidden prose prose-sm md:prose dark:prose-invert max-w-none p-3 md:p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white">
            <div className="w-full max-w-full break-words">
                <MarkdownPreview
                    source={value}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'inherit'
                    }}
                    rehypePlugins={[]}
                    className="markdown-preview-custom"
                    wrapperElement={{
                        'data-color-mode': 'dark'
                    }}
                />
                <style jsx global>{`
                    .markdown-preview-custom {
                        color: white !important;
                        background-color: transparent !important;
                    }
                    
                    /* Base text styles - ensuring text is visible */
                    .markdown-preview-custom * {
                        color: white !important;
                    }
                    
                    .markdown-preview-custom p,
                    .markdown-preview-custom span,
                    .markdown-preview-custom li,
                    .markdown-preview-custom td,
                    .markdown-preview-custom th,
                    .markdown-preview-custom h1,
                    .markdown-preview-custom h2,
                    .markdown-preview-custom h3,
                    .markdown-preview-custom h4,
                    .markdown-preview-custom h5,
                    .markdown-preview-custom h6 {
                        color: white !important;
                    }
                    
                    /* Fix for all images */
                    .markdown-preview-custom img {
                        width: 100% !important;
                        max-width: 100% !important;
                        max-height: 400px !important;
                        object-fit: contain !important;
                        margin: 10px 0 !important;
                        padding: 0 !important;
                        background: none !important;
                        display: block !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    
                    /* Static video placeholder */
                    .static-video-placeholder {
                        background-color: #161616 !important;
                        color: white !important;
                        padding: 15px !important;
                        margin: 10px 0 !important;
                        border-radius: 8px !important;
                        text-align: center !important;
                        font-size: 14px !important;
                        cursor: pointer !important;
                        border-left: 4px solid #E31337 !important;
                        transition: background-color 0.2s !important;
                    }
                    
                    .static-video-placeholder:hover {
                        background-color: #1f1f1f !important;
                    }
                    
                    .static-video-placeholder::before {
                        content: "▶️" !important;
                        display: inline-block !important;
                        margin-right: 8px !important;
                        font-size: 18px !important;
                    }
                    
                    /* Add this to ensure proper iframe display */
                    .markdown-preview-custom iframe {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: 250px !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 10px 0 !important;
                        background: none !important;
                        display: block !important;
                    }
                    
                    /* Override any wrapper spacing */
                    .markdown-preview-custom p {
                        margin: 1em 0 !important;
                    }
                    
                    /* Remove any strange backgrounds from media containers */
                    .markdown-preview-custom p:has(img),
                    .markdown-preview-custom p:has(.static-video-placeholder),
                    .markdown-preview-custom p:has(iframe) {
                        background: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .markdown-preview-custom h1 { font-size: 1.5rem; }
                    .markdown-preview-custom h2 { font-size: 1.25rem; }
                    .markdown-preview-custom h3 { font-size: 1.125rem; }
                    .markdown-preview-custom ul, 
                    .markdown-preview-custom ol { 
                        font-size: 0.875rem;
                        margin: 0.5rem 0;
                    }
                    .markdown-preview-custom a {
                        color: #E31337 !important;
                        text-decoration: none;
                    }
                    .markdown-preview-custom a:hover {
                        text-decoration: underline;
                    }
                    .markdown-preview-custom pre, 
                    .markdown-preview-custom code {
                        font-size: 0.75rem;
                        white-space: pre-wrap;
                        overflow-x: auto;
                        background-color: #1a1a1a !important;
                        padding: 0.5rem !important;
                        border-radius: 4px !important;
                    }
                    
                    /* Ensure code blocks have proper colors */
                    .markdown-preview-custom pre code {
                        color: #e6e6e6 !important;
                    }
                    
                    /* Table styles */
                    .markdown-preview-custom table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }
                    .markdown-preview-custom thead {
                        background-color: #161616 !important;
                    }
                    .markdown-preview-custom th, 
                    .markdown-preview-custom td {
                        border: 1px solid #333 !important;
                        padding: 0.5em !important;
                    }
                    .markdown-preview-custom tbody tr:nth-child(odd) {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                    }
                `}</style>
            </div>
        </div>
    );
}; 