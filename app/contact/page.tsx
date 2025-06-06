import ViewSwitcher from '../../src/app/ViewSwitcher';

export default function ContactPage() {
    
    return (
        <>
            <ViewSwitcher currentSelection="contact" />
            <main className="flex flex-col  px-6 sm:px-6 md:px-1">
                <div className="w-full text-left sm:px-6 md:px-12">
                    <div className="flex items-center gap-3 mt-6 py-2 group">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 transition-colors text-gray-400 group-hover:text-black dark:group-hover:text-white" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <a href="https://wa.me/5521986351316" className="text-lg transition-all text-gray-400 group-hover:text-black dark:group-hover:text-white" target="_blank" rel="noopener noreferrer">
                            +55 21 98635-1316
                        </a>
                    </div>

                    <div className="flex items-center gap-3 mt-3 py-2 group">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 transition-colors text-gray-400 group-hover:text-black dark:group-hover:text-white" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <a href="mailto:wilsondomingues@gmail.com" className="text-lg transition-all text-gray-400 group-hover:text-black dark:group-hover:text-white" target="_blank" rel="noopener noreferrer">
                            wilsondomingues@gmail.com
                        </a>
                    </div>

                   
                        <div className="flex items-center gap-3 mt-3 py-2 group">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 transition-colors text-gray-400 group-hover:text-black dark:group-hover:text-white" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <a href="https://www.instagram.com/wilbor_domina/" className="text-lg transition-all text-gray-400 group-hover:text-black dark:group-hover:text-white" target="_blank" rel="noopener noreferrer">
                                @wilbor_domina
                            </a>
                        </div>
                        <div className="flex items-center gap-3 mt-3 py-2 group">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 transition-colors text-gray-400 group-hover:text-black dark:group-hover:text-white" fill="currentColor">
                                <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
                            </svg>
                            <a href="https://vimeo.com/wilbor" className="text-lg transition-all text-gray-400 group-hover:text-black dark:group-hover:text-white" target="_blank" rel="noopener noreferrer">
                                vimeo.com/wilbor
                            </a>
                        </div>
                        <div className="flex items-center gap-3 mt-3 py-2 group">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 transition-colors text-gray-400 group-hover:text-black dark:group-hover:text-white" fill="currentColor">
                                <path d="M12.001 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10.001 10C17.523 22 22 17.523 22 12c0-5.523-4.477-10-9.999-10zm0 1.5c4.694 0 8.5 3.806 8.5 8.5s-3.806 8.5-8.5 8.5-8.5-3.806-8.5-8.5 3.806-8.5 8.5-8.5zm-2.25 4.75a.75.75 0 00-.75.75v6a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H10.5V9a.75.75 0 00-.75-.75zm4.5 0a.75.75 0 00-.75.75v6a.75.75 0 001.5 0v-6a.75.75 0 00-.75-.75z" />
                            </svg>
                            <a href="https://odysee.com/@wilbor:4" className="text-lg transition-all text-gray-400 group-hover:text-black dark:group-hover:text-white" target="_blank" rel="noopener noreferrer">
                                odysee.com/@wilbor:4
                            </a>
                        </div>
                    </div>
               
            </main>
        </>
    )
}
