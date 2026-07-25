// Auth Controller - Simple Admin Authentication
const login = (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        if (username === 'admin' && password === 'admin123') {
            return res.json({
                success: true,
                message: 'Login successful',
                user: {
                    username: 'admin',
                    role: 'Emergency Monitoring Administrator',
                    token: 'admin-jwt-session-token-key-2026'
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server authentication error' });
    }
};

module.exports = { login };
