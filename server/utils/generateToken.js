const jwt = require('jsonwebtoken');

const generateTokenAndSetCookies = (userId, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: isProduction ? 'None' : 'Lax',
        path: '/',
        // The frontend and Render API are different sites in production.
        // Partitioning keeps the auth cookie available to this top-level app
        // even when the browser restricts unpartitioned third-party cookies.
        ...(isProduction ? { partitioned: true } : {}),
    });

    return token;
}

module.exports = generateTokenAndSetCookies;