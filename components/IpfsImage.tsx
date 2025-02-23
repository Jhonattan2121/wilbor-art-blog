interface IpfsImageProps {



  ipfsHash?: string;
  id?: string;
  alt?: string;
  className?: string;
  pinataToken?: string;
}

export function IpfsImage({ ipfsHash, id, alt = '', className = '',
  pinataToken = "" }: IpfsImageProps) {
  const gateways = [
    'https://ipfs.skatehive.app/ipfs',
    'https://ipfs.io/ipfs',
    'https://gateway.pinata.cloud/ipfs'
  ];


  const getMediaUrl = (gateway: string) => {
    const baseUrl = `${gateway}/${ipfsHash}`;
    return pinataToken ? `${baseUrl}?pinataGatewayToken=${pinataToken}` : baseUrl;
  };

  const isVideo = ipfsHash?.match(/\.(mp4|webm|mov)$/i);

  if (isVideo) {
    return (
      <video
        className={className}
        controls
        src={getMediaUrl(gateways[0])}
        onError={(e) => {
          const video = e.target as HTMLVideoElement;
          const currentGateway = video.src.split('/ipfs/')[0];
          const nextGatewayIndex = gateways.indexOf(currentGateway) + 1;

          if (nextGatewayIndex < gateways.length) {
            video.src = getMediaUrl(gateways[nextGatewayIndex]);
          }
        }}
      >
        <source src={getMediaUrl(gateways[0])} type="video/mp4" />
        Your browser does not support the video element.
      </video>
    );
  }

  return (
    <img
      src={getMediaUrl(gateways[0])}
      alt={alt}
      className={className}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        const currentGateway = img.src.split('/ipfs/')[0];
        const nextGatewayIndex = gateways.indexOf(currentGateway) + 1;

        if (nextGatewayIndex < gateways.length) {
          img.src = getMediaUrl(gateways[nextGatewayIndex]);
        }
      }}
    />
  );
}