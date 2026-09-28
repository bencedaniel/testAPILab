import User from '../models/User.js';

// API1:2023 - BOLA sebezhetőség
export const getUserProfileVulnerable = async (req, res) => {
    try {
        const requestedId = req.params.id;
        
        // VULNERABLE: A rendszer nem ellenőrzi, hogy a bejelentkezett felhasználó (req.user.id)
        // azonos-e a lekért ID-val. A scanner itt egyszerűen ID-kat iterálhat.
        const user = await User.findById(requestedId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Szerverhiba' });
    }
};

// HIBAMENTES / BIZTONSÁGOS VÉGPONT (Reference Secure Implementation)
export const getMyProfileSecure = async (req, res) => {
    try {
        // BIZTONSÁGOS: Nincs URL paraméter. A lekérdezés kizárólag a hitelesítő middleware 
        // által validált, megszerkeszthetetlen JWT token payloadjából származó ID alapján történik.
        const userId = req.user.id; 
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Szerverhiba' });
    }
};

