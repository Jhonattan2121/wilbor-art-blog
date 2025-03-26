const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

export const uploadFileToIPFS = async (file: File) => {
   
    const formData = new FormData();
    formData.append("file", file);

    const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    
    // Verificar se as chaves existem
    if (!PINATA_API_KEY || !PINATA_SECRET) {
        console.error("Pinata credentials are missing");
        return;
    }

    try {
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_SECRET
            },
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
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
};
