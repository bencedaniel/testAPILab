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
// BIZTONSÁGOS: Saját profil frissítése (Update)
export const updateMyProfileSecure = async (req, res) => {
    try {
        // Szigorú mezőszűrés (API3 BOPLA védelem): Nem engedjük a 'role' mező felülírását
        const allowedUpdates = {
            username: req.body.username,
            email: req.body.email
        };
        
        // Eltávolítjuk azokat a mezőket, amiket nem küldött be a felhasználó
        Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

        // A frissítendő felhasználó ID-ja szigorúan a hitelesítő tokenből jön (API1 BOLA védelem)
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $set: allowedUpdates }, 
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Hiba a profil frissítésekor.' });
    }
};

// BIZTONSÁGOS: Saját fiók törlése (Delete)
export const deleteMyProfileSecure = async (req, res) => {
    try {
        // Kliens oldali azonosító (req.params.id) ignorálása (API1 BOLA védelem)
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: 'Fiók sikeresen törölve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba a törlés során.' });
    }
};
