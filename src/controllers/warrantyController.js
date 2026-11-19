// Ez a függvény szimulálja a KÜLSŐ, harmadik féltől (pl. gyártó) származó API-t
export const mockExternalWarrantyApi = (req, res) => {
    // A szimulált külső API szándékosan egy "mérgezett" adatot ad vissza.
    // Egy valós támadásnál a támadó a külső partner rendszerét törné fel, 
    // hogy ezt a payloadot eljuttassa hozzád.
    res.status(200).json({
        status: 'valid',
        vendorInfo: 'Sony/Dell',
        // Injektált payload (pl. egy NoSQL operátor vagy egy XSS script)
        notes: '{"$ne": null} <script>alert("XSS")</script>'
    });
};

export const checkWarrantyVulnerable = async (req, res) => {
    try {
        const deviceId = req.params.id;
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`;

        // Ha a router '/api/warranty' alatt van felcsatolva:
        const response = await fetch(
            `${baseUrl}/api/warranty/internal-mock/warranty/${encodeURIComponent(deviceId)}`
        );

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Hiba a külső szolgáltatás elérésekor',
                status: response.status
            });
        }

        const data = await response.json();

        return res.status(200).json({
            message: 'Garancia információ sikeresen lekérdezve a partner rendszertől.',
            deviceId: deviceId,
            vendorResponse: data
        });
    } catch (error) {
        return res.status(500).json({ error: 'Hiba a külső szolgáltatás elérésekor' });
    }
};