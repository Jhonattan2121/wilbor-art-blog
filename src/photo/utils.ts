interface ParsedPhotoId {
  author?: string;
  title?: string;
  ipfsHash?: string;
  originalUrl?: string;
  permlink?: string;
  
}

export function parsePhotoId(photoId: string): ParsedPhotoId {
  try {
    const parts = decodeURIComponent(photoId).split('-');
    const author = parts[0];
    
    // Encontra o hash IPFS na URL
    const ipfsMatch = photoId.match(/Qm[A-Za-z0-9]{44}/);
    const ipfsHash = ipfsMatch ? ipfsMatch[0] : undefined;
    
    // Extrai a URL original se presente
    const urlMatch = photoId.match(/https?:\/\/[^\s]+/);
    const originalUrl = urlMatch ? decodeURIComponent(urlMatch[0]) : undefined;
    
    // Remove autor e URL para obter o título
    const title = parts
      .slice(1, urlMatch ? -1 : undefined)
      .join('-');
    
    return { author, title, ipfsHash, originalUrl };
  } catch (error) {
    console.error('Erro ao analisar ID da foto:', error);
    return {};
  }
}