// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Configurar CORS correctamente
app.use(cors({
  origin: ['http://localhost:8081', 'http://10.168.178.112:8081', 'exp://10.168.178.112:8081'], // Puertos comunes de Expo
  credentials: true
}));

app.use(express.json());

// Configuración de MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'Smart',
  password: '123456789',
  database: 'impulsatech',
  waitForConnections: true,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  jwt.verify(token, 'tu_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Endpoint de REGISTRO
app.post('/api/auth/register', async (req, res) => {
  const { nombres, apellidos, dni, email, numero, username, password } = req.body;

  console.log('Datos recibidos para registro:', { nombres, apellidos, dni, email, numero, username });

  try {
    // Validar campos requeridos
    if (!nombres || !apellidos || !dni || !email || !numero || !username || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Validar longitud del DNI
    if (dni.length !== 8) {
      return res.status(400).json({ message: 'El DNI debe tener 8 dígitos' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario, email o DNI ya existen
    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuarios WHERE username = ? OR email = ? OR dni = ?',
      [username, email, dni]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El usuario, email o DNI ya están registrados' });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const [result] = await pool.execute(
      `INSERT INTO usuarios 
       (nombres, apellidos, dni, email, numero, username, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, dni, email, numero, username, hashedPassword]
    );

    console.log('Usuario registrado con ID:', result.insertId);

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: result.insertId, 
        username: username,
        email: email 
      },
      'tu_secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: token,
      user: {
        id: result.insertId,
        nombres: nombres,
        apellidos: apellidos,
        username: username,
        email: email,
        dni: dni,
        numero: numero
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
});

// Endpoint de LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Intento de login para usuario:', username);

  try {
    // Buscar usuario por username o email
    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      },
      'tu_secret_key',
      { expiresIn: '24h' }
    );

    console.log('Login exitoso para usuario:', username);

    res.json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        username: user.username,
        email: user.email,
        dni: user.dni,
        numero: user.numero
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor: ' + error.message });
  }
});

// Endpoint para verificar token (opcional)
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token válido',
    user: req.user 
  });
});

// Endpoint para obtener perfil de usuario
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, nombres, apellidos, dni, email, numero, username, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Ruta para verificar conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
    res.json({ 
      message: 'Conexión a la base de datos exitosa',
      result: rows[0].result 
    });
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    res.status(500).json({ 
      message: 'Error conectando a la base de datos',
      error: error.message 
    });
  }
});



app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL local: http://localhost:${PORT}`);
  console.log(`📍 URL red: http://10.168.178.112:${PORT}`);
});