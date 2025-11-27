const jwt = require('jsonwebtoken');

class AuthMiddleware {
  static authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'moneyflow-secret', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }
      
      req.user = user;
      next();
    });
  }

  static optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET || 'moneyflow-secret', (err, user) => {
        if (!err) {
          req.user = user;
        }
      });
    }

    next();
  }
}

module.exports = AuthMiddleware;