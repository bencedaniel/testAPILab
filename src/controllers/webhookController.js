export const registerWebhookVulnerable = async (req, res) => {
    const { targetUrl } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: 'A targetUrl megadása kötelező.' });
    }

    try {
        // VULNERABLE: A rendszer semmilyen ellenőrzést nem végez a targetUrl-en.
        // Nincs tiltólista (blacklist) a belső IP címekre (pl. 127.0.0.1, 192.168.x.x, 10.x.x.x),
        // és nincs korlátozva a protokoll sem.
        const response = await fetch(targetUrl);
        const data = await response.text();

        // A szerver ráadásul vissza is adja a lekérdezett belső szolgáltatás válaszát, 
        // ami egy "Blind SSRF" helyett egy sokkal veszélyesebb, teljes SSRF sebezhetőség.
        res.status(200).json({
            message: 'Webhook végpont sikeresen tesztelve.',
            httpStatus: response.status,
            responsePreview: data.substring(0, 200) 
        });
    } catch (error) {
        // Ha a kérés elszáll (pl. zárt port miatt), a hibaüzenet is 
        // információt szivárogtat a belső hálózat topológiájáról.
        res.status(500).json({ 
            error: 'Nem sikerült elérni a webhook célpontját.',
            details: error.message 
        });
    }
};