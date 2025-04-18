import Link from 'next/link'

export default function ContactPage() {
    return (
        <main className="flex flex-col items-center py-8 px-6">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl text-center">
                <h1 className="text-3xl sm:text-4xl font-bold ">Entre em Contato</h1>
                <p className=" mt-2 text-lg sm:text-xl">
                    Estou disponível para responder suas mensagens.
                </p>

                {/* Contato WhatsApp */}
                <div className="flex items-center justify-center gap-4 mt-6 p-4 border rounded-lg shadow-md hover:shadow-lg transition-all">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <a href="https://wa.me/5521986351316" className="text-lg sm:text-xl font-semibold  hover:text-green-600 transition-all" target="_blank" rel="noopener noreferrer">
                        +55 21 98635-1316
                    </a>
                </div>

                {/* Contato Email */}
                <div className="flex items-center justify-center gap-4 mt-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-all">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <a href="mailto:wilsondomingues@gmail.com" className="text-lg sm:text-xl font-semibold  hover:text-blue-600 transition-all" target="_blank" rel="noopener noreferrer">
                        wilsondomingues@gmail.com
                    </a>
                </div>

                <p className="mt-6  text-lg">Ficarei feliz em atender você!</p>

                <div className="mt-4">
                    <Link href="/" className="  text-lg font-medium transition-all">
                        ← Voltar para a página inicial
                    </Link>
                </div>
            </div>
        </main>
    )
}
