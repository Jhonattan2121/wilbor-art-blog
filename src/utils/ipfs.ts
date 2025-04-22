const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

export const uploadFileToIPFS = async (file: File) => {
   
    const formData = new FormData();
    formData.append("file", file);

    const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    
    // Verificar se as chaves existem
    if (!PINATA_API_KEY || !PINATA_SECRET) {
        console.error("Pinata credentials are missing");
        throw new Error("Failed to upload file to IPFS");
    }

    console.log("Pinata key length:", PINATA_API_KEY?.length);
    console.log("Pinata key starts with:", PINATA_API_KEY?.substring(0, 10) + "...");
    
    try {
        const isJWT = PINATA_API_KEY?.startsWith("eyJ");
        
        const headers: Record<string, string> = isJWT 
            ? {
                "Authorization": `Bearer ${PINATA_API_KEY}`
              }
            : {
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_SECRET
              };
        
        console.log("Using authentication method:", isJWT ? "JWT" : "API Key");
        
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers,
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Upload successful:", data);
            return data;
        } else {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            try {
                const errorJson = JSON.parse(errorText);
                console.error("Parsed error:", errorJson);
            } catch (e) {
                console.error("Raw error text:", errorText);
            }
            throw new Error("Failed to upload file to IPFS");
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};
