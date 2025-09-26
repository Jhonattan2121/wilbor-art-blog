import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
  className?: string;
  removeMedia?: boolean;
}

function removeImagesAndVideosFromMarkdown(markdown: string): string {
  let result = markdown.replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
  result = result.replace(/<video[\s\S]*?<\/video>/gi, '');
  result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  return result;
}

export default function Markdown({ children, className = '', removeMedia = false }: MarkdownProps) {
  const content = removeMedia ? removeImagesAndVideosFromMarkdown(children) : children;
  const components: Components = {
    h1: (props) => (
      <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
    ),
    h2: (props) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
    ),
    h3: (props) => (
      <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
    ),
    a: (props) => (
      <a
        className="text-blue-600 underline hover:text-blue-800 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    ul: (props) => <ul className="list-disc pl-6 my-2" {...props} />,
    ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
    blockquote: (props) => (
      <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-500 dark:text-gray-400 my-4" {...props} />
    ),
    code(props: any) {
      const { inline, children, ...rest } = props;
      return inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm" {...rest}>{children}</code>
      ) : (
        <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto my-4 text-sm">
          <code {...rest}>{children}</code>
        </pre>
      );
    },
    img: (props) => (
      <img
        className="rounded-lg max-w-full h-auto my-4 mx-auto"
        alt={props.alt || ''}
        {...props}
      />
    ),
  };
  return (
    <div
      className={`prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
