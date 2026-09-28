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

// API10:2023 - Unsafe Consumption of APIs
export const checkWarrantyVulnerable = async (req, res) => {
    try {
        const deviceId = req.params.id;

        // VULNERABLE: A rendszer meghívja a külső szolgáltatást...
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
        const response = await fetch(`${baseUrl}/api/internal-mock/warranty/${deviceId}`);
        const data = await response.json();

        // ...és mindenféle szanálás (tisztítás) vagy validáció nélkül 
        // egy az egyben feldolgozza és visszaadja a kliensnek.
        res.status(200).json({
            message: 'Garancia információ sikeresen lekérdezve a partner rendszertől.',
            deviceId: deviceId,
            vendorResponse: data 
        });
    } catch (error) {
        res.status(500).json({ error: 'Hiba a külső szolgáltatás elérésekor' });
    }
};