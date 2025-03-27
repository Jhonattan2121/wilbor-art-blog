import { BiX } from 'react-icons/bi';

interface VideoPlayerProps {
    activeVideo: string | null;
    closeVideoPlayer: () => void;
}

export const VideoPlayer = ({ activeVideo, closeVideoPlayer }: VideoPlayerProps) => {
    if (!activeVideo) return null;
    
    return (
        <div 
            className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center" 
            onClick={closeVideoPlayer}
        >
            <div 
                className="w-full max-w-[90%] max-h-[90%] relative" 
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    src={activeVideo}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[80vh]"
                />
                <button
                    className="absolute top-2 right-2 bg-white/30 text-white p-2 rounded-full hover:bg-white/40 transition-colors"
                    onClick={closeVideoPlayer}
                >
                    <BiX size={24} className="hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
}; 