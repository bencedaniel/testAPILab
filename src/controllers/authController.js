import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// API3:2023 - BOPLA / Mass Assignment sebezhetőség
export const register = async (req, res) => {
    try {
        // SÚLYOS HIBA: A teljes req.body átadása validáció nélkül. 
        // A támadó beküldheti a {"role": "admin"} mezőt is a POST requestben.
        const user = new User(req.body);
        await user.save();
        
        res.status(201).json({ 
            message: 'Felhasználó sikeresen regisztrálva',
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// API2:2023 - Broken Authentication sebezhetőség
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // HIBA 1: Nincs rate limiting, végtelen jelszópróbálkozás (brute-force) lehetséges.
        // HIBA 2: Nincs account lockout (fiókzárolás).
        // (A tesztlabor kedvéért most plaintext jelszavakat hasonlítunk össze, 
        // ami önmagában is egy súlyos konfigurációs hiba).
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Hibás email vagy jelszó.' });
        }

        // Token generálása (payload: id és role)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } // HIBA 3: Túl hosszú lejárati idő, nincs token rotáció
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};