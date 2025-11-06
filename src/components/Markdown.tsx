import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ImageCarousel from './ImageCarousel';

interface MarkdownProps {
  children: string;
  className?: string;
  removeMedia?: boolean;
  images?: { src: string; alt?: string; }[];
  videoPoster?: string; // thumbnail para vídeos
  columns?: boolean; 
}

function removeImagesAndVideosFromMarkdown(markdown: string): string {
  let result = markdown.replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
  result = result.replace(/<video[\s\S]*?<\/video>/gi, '');
  result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  return result;
}


function splitMarkdownWithImageBlocks(markdown: string) {
  // Divide o markdown em linhas para facilitar
  const lines = markdown.split(/\n+/);
  const blocks: Array<{ type: 'carousel' | 'markdown'; content: string[]; images?: { src: string; alt?: string }[] }> = [];
  let currentBlock: string[] = [];
  let currentImages: { src: string; alt?: string }[] = [];
  const imgMdRegex = /^!\[([^\]]*)\]\(([^\)]+)\)$/;
  const imgHtmlRegex = /^<img [^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/>$/;

  function pushMarkdownBlock() {
    if (currentBlock.length > 0) {
      blocks.push({ type: 'markdown', content: currentBlock });
      currentBlock = [];
    }
  }
  function pushCarouselBlock() {
    if (currentImages.length > 0) {
      blocks.push({ type: 'carousel', content: [], images: currentImages });
      currentImages = [];
    }
  }

  for (const line of lines) {
    const mdMatch = imgMdRegex.exec(line.trim());
    const htmlMatch = imgHtmlRegex.exec(line.trim());
    if (mdMatch) {
      pushMarkdownBlock();
      currentImages.push({ src: mdMatch[2], alt: mdMatch[1] });
    } else if (htmlMatch) {
      pushMarkdownBlock();
      currentImages.push({ src: htmlMatch[1], alt: htmlMatch[2] });
    } else {
      pushCarouselBlock();
      currentBlock.push(line);
    }
  }
  pushMarkdownBlock();
  pushCarouselBlock();
  return blocks;
}

export default function Markdown({ children, className = '', removeMedia = false, images, videoPoster, columns = false }: MarkdownProps) {
  const content = removeMedia ? removeImagesAndVideosFromMarkdown(children) : children;
  const hasSingleImage = images && images.length === 1;

  // Mover components para cima!
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
        className="text-red-600 hover:text-red-800 transition-colors"
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
    img: (props) => {
      if (hasSingleImage && images) {
        // Renderiza a imagem única normalmente
        return (
          <img
            className="rounded-lg max-w-full h-auto my-4"
            style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            alt={props.alt || ''}
            src={images[0].src}
            {...props}
          />
        );
      } else {
        // Comportamento padrão
        return (
          <img
            className="rounded-lg max-w-full h-auto my-4"
            style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            alt={props.alt || ''}
            {...props}
          />
        );
      }
    },
    video: (props) => {
      // Usa a prop videoPoster do componente para o poster
      return (
        <video
          controls
          poster={videoPoster || props.poster}
          className="w-full my-4 rounded-lg bg-black"
          {...props}
        />
      );
    },
  };

  // só divide em colunas se columns for true
  if (columns) {
    const columnBlocks = content.split(/\n---+\n/);
    if (columnBlocks.length > 1) {
      return (
        <div className={`w-full flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-12 ${className}`}>
          {columnBlocks.map((block, idx) => (
            <div key={idx} className="flex-1 min-w-[220px] max-w-xs sm:max-w-sm md:max-w-md">
              <div className="prose prose-lg dark:prose-invert max-w-none text-left leading-relaxed text-base sm:text-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={components}
                >
                  {block.trim()}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  // Divide o markdown em blocos de markdown e blocos de imagens consecutivas
  const blocks = splitMarkdownWithImageBlocks(content);

  return (
    <div
      className={`prose prose-lg dark:prose-invert max-w-none text-left leading-relaxed text-base sm:text-lg ${className}`}
    >
      {blocks.map((block, idx) => {
        if (block.type === 'carousel' && block.images && block.images.length > 0) {
          return <ImageCarousel key={idx} images={block.images} />;
        }
        // Renderiza bloco markdown normalmente
        return (
          <ReactMarkdown
            key={idx}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {block.content.join('\n')}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
