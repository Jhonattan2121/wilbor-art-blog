import { useTheme } from 'next-themes';
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
    inExpandedCard?: boolean;
    hasLittleContent?: boolean;
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

export default function Markdown({ children, className = '', removeMedia = false, images, videoPoster, columns = false, inExpandedCard = false, hasLittleContent = false }: MarkdownProps) {
    const content = removeMedia ? removeImagesAndVideosFromMarkdown(children) : children;
    const hasSingleImage = images && images.length === 1;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Cores baseadas no tema - mesma cor em ambos os modos
    const textColor = '#888888';

    // Mover components para cima!
    const components: Components = {
        h1: (props) => (
            <h1 className="text-3xl font-bold mt-8 mb-4" style={{  color: textColor }} {...props} />
        ),
        h2: (props) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3" style={{  color: textColor }} {...props} />
        ),
        h3: (props) => (
            <h3 className="text-xl font-semibold mt-4 mb-2" style={{  color: textColor }} {...props} />
        ),
        h4: (props) => (
            <h4 className="text-lg font-semibold mt-3 mb-2" style={{  color: textColor }} {...props} />
        ),
        h5: (props) => (
            <h5 className="text-base font-semibold mt-2 mb-1" style={{  color: textColor }} {...props} />
        ),
        h6: (props) => (
            <h6 className="text-sm font-semibold mt-2 mb-1" style={{  color: textColor }} {...props} />
        ),
        p: (props) => (
            <p style={{  color: textColor }} {...props} />
        ),
        li: (props) => (
            <li style={{  color: textColor }} {...props} />
        ),
        a: (props) => (
            <a
                style={{  color: textColor, textDecoration: 'none' }}
                className="hover:underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            />
        ),
        ul: (props) => <ul className="list-disc pl-6 my-2" {...props} />,
        ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
        strong: (props) => (
            <strong style={{  color: textColor }} {...props} />
        ),
        em: (props) => (
            <em style={{  color: textColor }} {...props} />
        ),
        blockquote: (props) => (
            <blockquote className="border-l-4 border-gray-400 pl-4 italic my-4" style={{  color: textColor }} {...props} />
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
                        className={inExpandedCard ? "rounded-lg w-full max-w-full h-auto my-6 block" : "rounded-lg max-w-full h-auto my-6 block"}
                        style={inExpandedCard ? { marginLeft: 0, marginRight: 0 } : { marginLeft: 'auto', marginRight: 'auto' }}
                        alt={props.alt || ''}
                        src={images[0].src}
                        {...props}
                    />
                );
            } else {
                // Comportamento padrão
                return (
                    <img
                        className={inExpandedCard ? "rounded-lg w-full max-w-full h-auto my-6 block" : "rounded-lg max-w-full h-auto my-6 block"}
                        style={inExpandedCard ? { marginLeft: 0, marginRight: 0 } : { marginLeft: 'auto', marginRight: 'auto' }}
                        alt={props.alt || ''}
                        {...props}
                    />
                );
            }
        },
        video: (props: any) => {
            // Usa a prop videoPoster do componente para o poster
            return (
                <div
                    className={inExpandedCard ? 'w-full rounded-lg overflow-hidden bg-black' : 'w-full rounded-lg overflow-hidden bg-black'}
                    style={{
                        scrollMarginTop: '0',
                        scrollMarginBottom: '0',
                        width: '100%',
                        aspectRatio: '16 / 9',
                        position: 'relative',
                        marginTop: '1rem',
                        marginBottom: '1rem',
                    }}
                    onMouseDown={(e) => {
                        // Previne qualquer comportamento padrão de scroll
                        e.preventDefault();
                    }}
                >
                    <video
                        controls
                        poster={videoPoster || props.poster}
                        className="w-full h-full my-0 bg-black"
                        style={{
                            scrollMarginTop: '0',
                            scrollMarginBottom: '0',
                            aspectRatio: '16 / 9',
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            ...props.style
                        }}
                        {...props}
                    />
                </div>
            );
        },
        iframe: (props: any) => {
            const styleProp = props.style as unknown;
            const styleStr = typeof styleProp === 'string' ? styleProp.replace(/\s+/g, '').toLowerCase() : '';
            const isAbsolute =
                (typeof styleProp === 'object' && styleProp !== null && (styleProp as any).position === 'absolute') ||
                styleStr.includes('position:absolute');

            // Vimeo geralmente vem dentro de um wrapper com padding-top e iframe absoluto.
            // Aqui a gente envolve com um container ABSOLUTO (não cria altura extra) só pra clipar o raio.
            if (isAbsolute) {
                const { style, ...rest } = props;
                return (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            background: 'black',
                        }}
                    >
                        <iframe
                            {...rest}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 0,
                            }}
                            allowFullScreen
                        />
                    </div>
                );
            }

            // Fallback para iframes "soltos" (sem wrapper do provider)
            return (
                <div
                    className="w-full rounded-lg overflow-hidden bg-black"
                    style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        position: 'relative',
                        marginTop: '1rem',
                        marginBottom: '1rem',
                    }}
                >
                    <iframe
                        {...props}
                        className="w-full h-full"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            ...(typeof props.style === 'object' && props.style ? props.style : null),
                        }}
                        allowFullScreen
                    />
                </div>
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
                            <div className="max-w-none text-left leading-relaxed text-base sm:text-lg" style={{ color: textColor,  }}>
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

    const containerClassName = [
        'w-full max-w-none text-left leading-relaxed text-base sm:text-lg markdown-content-custom',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={containerClassName}
            style={{ color: textColor,  }}
        >
            {blocks.map((block, idx) => {
                if (block.type === 'carousel' && block.images && block.images.length > 0) {
                    return (
                        <div
                            key={idx}
                            className={
                                inExpandedCard
                                    ? "my-0 w-full px-0"
                                    : "my-6 first:mt-0 last:mb-0"
                            }
                        >
                            <ImageCarousel images={block.images} inExpandedCard={inExpandedCard} hasLittleContent={hasLittleContent} />
                        </div>
                    );
                }
                // Renderiza bloco markdown normalmente
                return (
                    <div
                        key={idx}
                        className={inExpandedCard
                            ? "my-3 px-3 sm:px-6 first:mt-0 last:mb-0"
                            : "my-4 first:mt-0 last:mb-0"}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={components}
                        >
                            {block.content.join('\n')}
                        </ReactMarkdown>
                    </div>
                );
            })}
        </div>
    );
}
