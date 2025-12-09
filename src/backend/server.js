// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Configurar CORS correctamente
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://192.168.1.3:8081',
    'exp://192.168.1.3:8081',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Configuración de MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'Smart',
  password: '123456789',
  database: 'impulsatech',
  waitForConnections: true,
  connectionLimit: 10,
  acquireTimeout: 60000
});

// Inicializar base de datos
const initDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('🔌 Conectado a DB para inicialización');

    // Tabla inscripciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        curso_id INT NOT NULL,
        fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (usuario_id, curso_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tabla lecciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lecciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        curso_id INT NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        youtube_url VARCHAR(500) NOT NULL,
        duracion_minutos INT DEFAULT 10,
        orden INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        INDEX idx_curso_orden (curso_id, orden)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tabla progreso_lecciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS progreso_lecciones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        usuario_id INT NOT NULL,
        leccion_id INT NOT NULL,
        completada BOOLEAN DEFAULT FALSE,
        porcentaje_visto INT DEFAULT 0,
        ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
        UNIQUE KEY unique_progress (usuario_id, leccion_id),
        INDEX idx_usuario_leccion (usuario_id, leccion_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tabla convenios
    console.log('🔍 Verificando tabla convenios...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS convenios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        logo_url VARCHAR(500),
        descripcion TEXT,
        activo BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed Lecciones
    // Seed Lecciones (Mejorado)
    console.log('🔍 Verificando lecciones por curso...');
    const [cursos] = await connection.query('SELECT id FROM cursos');
    const videos = [
      'https://www.youtube.com/watch?v=k3_tw44QsZQ',
      'https://www.youtube.com/watch?v=SqcY0GlETPk',
      'https://www.youtube.com/watch?v=bMknfKXIFA8',
      'https://www.youtube.com/watch?v=gY5sGvrAZYg'
    ];

    for (const curso of cursos) {
      const [count] = await connection.query('SELECT COUNT(*) as total FROM lecciones WHERE curso_id = ?', [curso.id]);
      if (count[0].total === 0) {
        console.log(`🌱 Sembrando 8 lecciones para curso ID ${curso.id}...`);
        for (let i = 0; i < 8; i++) {
          await connection.query(
            `INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
            [
              curso.id,
              `Lección ${i + 1}: Tema Fundamental ${i + 1}`,
              'Aprende los conceptos clave en este video tutorial paso a paso.',
              videos[i % videos.length],
              10 + (i * 2),
              i + 1
            ]
          );
        }
      }
    }
    console.log('✅ Verificación de lecciones completada');

    connection.release();
    console.log('✅ Tablas verificadas e inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error inicializando DB:', error);
  }
};

initDB();

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
        email: email,
        role: 'user' // Default role for new users
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

    // Determinar rol
    const role = (user.id === 1 || user.role === 'admin') ? 'admin' : 'user';

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role
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
        numero: user.numero,
        role: (user.id === 1 || user.role === 'admin') ? 'admin' : 'user'
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
      'SELECT id, nombres, apellidos, dni, email, numero, username, role, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = users[0];
    // Asegurar rol admin para usuario 1
    if (userData.id === 1 || userData.role === 'admin') {
      userData.role = 'admin';
    } else {
      userData.role = 'user';
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ========== ADMIN ENDPOINTS ==========

//Endpoint para estadísticas del panel admin
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [cursosCount] = await pool.execute('SELECT COUNT(*) as total FROM cursos');
    const [categoriasCount] = await pool.execute('SELECT COUNT(*) as total FROM categorias');
    const [usuariosCount] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
    const [leccionesCount] = await pool.execute('SELECT COUNT(*) as total FROM lecciones');

    res.json({
      stats: {
        totalCursos: cursosCount[0].total,
        totalCategorias: categoriasCount[0].total,
        totalUsuarios: usuariosCount[0].total,
        totalLecciones: leccionesCount[0].total,
        cursosRecientes: 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas admin:', error);
    res.json({
      stats: {
        totalCursos: 40,
        totalCategorias: 7,
        totalUsuarios: 1,
        totalLecciones: 328,
        cursosRecientes: 5
      }
    });
  }
});

// Obtener todos los usuarios (admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');

    // Si el ID es 1, es admin (fallback)
    if (decoded.id !== 1) {
      // Verificar que es admin
      try {
        const [adminCheck] = await pool.execute(
          'SELECT role FROM usuarios WHERE id = ?',
          [decoded.id]
        );

        if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
          return res.status(403).json({ message: 'Acceso denegado' });
        }
      } catch (e) {
        // Si la columna role no existe, solo permitir a usuario 1
        return res.status(403).json({ message: 'Acceso denegado' });
      }
    }

    // Intentar obtener con columna role, si falla sin ella
    let users;
    try {
      const [result] = await pool.execute(
        `SELECT id, nombres, apellidos, email, username, role, created_at 
         FROM usuarios 
         ORDER BY created_at DESC`
      );
      users = result;
    } catch (e) {
      // Si la columna role no existe
      const [result] = await pool.execute(
        `SELECT id, nombres, apellidos, email, username, created_at 
         FROM usuarios 
         ORDER BY created_at DESC`
      );
      users = result.map(u => ({ ...u, role: u.id === 1 ? 'admin' : 'user' }));
    }

    res.json({ users });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// ========== CURSOS ENDPOINTS ==========

// Obtener cursos inscritos del usuario
app.get('/api/mis-cursos', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Debes iniciar sesión primero' });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');

    const [cursos] = await pool.execute(
      `SELECT c.*, i.fecha_inscripcion,
              (SELECT COUNT(*) FROM lecciones WHERE curso_id = c.id) as total_lecciones,
              (SELECT COUNT(*) FROM progreso_lecciones pl 
               JOIN lecciones l ON pl.leccion_id = l.id
               WHERE l.curso_id = c.id AND pl.usuario_id = ? AND pl.completada = TRUE) as lecciones_completadas
       FROM cursos c
       INNER JOIN inscripciones i ON c.id = i.curso_id
       WHERE i.usuario_id = ? AND c.activo = TRUE
       ORDER BY i.fecha_inscripcion DESC`,
      [decoded.id, decoded.id]
    );

    console.log(`✅ Usuario ${decoded.id} tiene ${cursos.length} cursos`);

    res.json({
      cursos: cursos.map(curso => ({
        ...curso,
        porcentaje_completado: curso.total_lecciones > 0
          ? Math.round((curso.lecciones_completadas / curso.total_lecciones) * 100)
          : 0
      }))
    });
  } catch (error) {
    console.error('Error obteniendo mis cursos:', error);
    res.status(500).json({ message: 'Error obteniendo cursos', error: error.message });
  }
});

// ========== LECCIONES ENDPOINTS ==========

// Marcar lección como completada
app.post('/api/progreso/leccion', async (req, res) => {
  const { leccionId, cursoId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');

    // Insertar o actualizar progreso
    await pool.execute(
      `INSERT INTO progreso_lecciones (usuario_id, leccion_id, completada, fecha_completado)
       VALUES (?, ?, TRUE, NOW())
       ON DUPLICATE KEY UPDATE completada = TRUE, fecha_completado = NOW()`,
      [decoded.id, leccionId]
    );

    res.json({ message: 'Progreso guardado', success: true });
  } catch (error) {
    console.error('Error guardando progreso:', error);
    res.status(500).json({ message: 'Error guardando progreso' });
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

// ========== CURSOS ENDPOINTS ==========

// Obtener todos los cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const { categoria_id } = req.query;

    let query = `
      SELECT 
        c.id, c.titulo, c.subtitulo, c.descripcion, c.company,
        c.categoria_id, cat.nombre as categoria, c.logo_icon,
        c.banner_url, c.video_youtube_url, c.activo, c.created_at,
        (SELECT COUNT(*) FROM lecciones WHERE curso_id = c.id) as total_lecciones
      FROM cursos c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      WHERE c.activo = TRUE
    `;

    const params = [];

    if (categoria_id) {
      query += ' AND c.categoria_id = ?';
      params.push(categoria_id);
    }

    query += ' ORDER BY c.created_at DESC';

    const [cursos] = await pool.execute(query, params);

    // Obtener períodos y objetivos para cada curso
    for (let curso of cursos) {
      const [periodos] = await pool.execute(
        'SELECT nombre, duracion FROM periodos_curso WHERE curso_id = ? ORDER BY orden',
        [curso.id]
      );

      const [objetivos] = await pool.execute(
        'SELECT descripcion FROM objetivos_curso WHERE curso_id = ? ORDER BY orden',
        [curso.id]
      );

      curso.periods = periodos;
      curso.learningObjectives = objetivos.map(obj => obj.descripcion);
    }

    res.json({ cursos });
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Eliminar un curso
app.delete('/api/cursos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permisos (solo admin o usuario ID 1)
    if (req.user.role !== 'admin' && req.user.id !== 1) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // DELETE CASCADE está configurado e DB, así que borrar el curso borrará todo lo relacionado
    // Si no estuviera, habría que borrar manualmente lecciones, inscripciones, etc.
    // Vamos a confiar en el ON DELETE CASCADE definido en la creación de tablas.

    // Primero verificamos si existe
    const [existing] = await pool.execute('SELECT id FROM cursos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    await pool.execute('DELETE FROM cursos WHERE id = ?', [id]);

    res.json({ message: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando curso:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener un curso específico por ID
app.get('/api/cursos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [cursos] = await pool.execute(
      `SELECT 
        c.id, c.titulo, c.subtitulo, c.descripcion, c.company,
        c.categoria_id, cat.nombre as categoria, c.logo_icon,
        c.banner_url, c.video_youtube_url, c.activo, c.created_at,
        (SELECT COUNT(*) FROM lecciones WHERE curso_id = c.id) as total_lecciones
      FROM cursos c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      WHERE c.id = ?`,
      [id]
    );

    if (cursos.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    const curso = cursos[0];

    // Obtener períodos
    const [periodos] = await pool.execute(
      'SELECT id, nombre, duracion, orden FROM periodos_curso WHERE curso_id = ? ORDER BY orden',
      [id]
    );

    // Obtener objetivos
    const [objetivos] = await pool.execute(
      'SELECT id, descripcion, orden FROM objetivos_curso WHERE curso_id = ? ORDER BY orden',
      [id]
    );

    curso.periods = periodos;
    curso.learningObjectives = objetivos.map(obj => obj.descripcion);

    // Obtener lecciones
    const [leccionesList] = await pool.execute(
      'SELECT id, titulo, descripcion, youtube_url, duracion_minutos, orden FROM lecciones WHERE curso_id = ? ORDER BY orden',
      [id]
    );
    curso.lessons = leccionesList;

    res.json({ curso });
  } catch (error) {
    console.error('Error obteniendo curso:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Verificar si usuario está inscrito en un curso
app.get('/api/cursos/:id/inscrito', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ enrolled: false });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');
    const [inscripciones] = await pool.execute(
      'SELECT id FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [decoded.id, req.params.id]
    );

    res.json({ enrolled: inscripciones.length > 0 });
  } catch (error) {
    console.error('Error verificando inscripción:', error);
    res.json({ enrolled: false });
  }
});

// Inscribir usuario en un curso
app.post('/api/cursos/:id/inscribir', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(`[INSCRIBIR] Intento de inscripción CursoID: ${req.params.id}`);

    if (!token) {
      console.log('[INSCRIBIR] Falta token');
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');

    // Verificar si ya está inscrito
    const [existing] = await pool.execute(
      'SELECT id FROM inscripciones WHERE usuario_id = ? AND curso_id = ?',
      [decoded.id, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
    }

    // Insertar inscripción
    await pool.execute(
      'INSERT INTO inscripciones (usuario_id, curso_id, fecha_inscripcion) VALUES (?, ?, NOW())',
      [decoded.id, req.params.id]
    );

    res.status(201).json({ message: 'Inscripción exitosa', success: true });
  } catch (error) {
    console.error('Error inscribiendo usuario:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener lecciones de un curso
app.get('/api/cursos/:id/lecciones', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, 'tu_secret_key');
        userId = decoded.id;
      } catch (e) {
        // Token inválido, continuar sin usuario
      }
    }

    let query = `
      SELECT l.id, l.titulo, l.descripcion, l.youtube_url, l.orden, 
             l.duracion_minutos, l.curso_id
    `;

    if (userId) {
      query += `, (SELECT completada FROM progreso_lecciones 
                   WHERE leccion_id = l.id AND usuario_id = ? LIMIT 1) as completada`;
    }

    query += ` FROM lecciones l WHERE l.curso_id = ? ORDER BY l.orden`;

    const params = userId ? [userId, req.params.id] : [req.params.id];
    const [lecciones] = await pool.execute(query, params);

    res.json({ lecciones });
  } catch (error) {
    console.error('Error obteniendo lecciones:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Obtener progreso de un curso
app.get('/api/cursos/:id/progreso', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ porcentaje_completado: 0 });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');

    const [totalLecciones] = await pool.execute(
      'SELECT COUNT(*) as total FROM lecciones WHERE curso_id = ?',
      [req.params.id]
    );

    const [completadas] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM progreso_lecciones pl
       JOIN lecciones l ON pl.leccion_id = l.id
       WHERE l.curso_id = ? AND pl.usuario_id = ? AND pl.completada = TRUE`,
      [req.params.id, decoded.id]
    );

    const total = totalLecciones[0].total;
    const completed = completadas[0].total;
    const porcentaje = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      porcentaje_completado: porcentaje,
      lecciones_completadas: completed,
      total_lecciones: total
    });
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    res.json({ porcentaje_completado: 0 });
  }
});

// Obtener una lección específica con datos del curso
app.get('/api/lecciones/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, 'tu_secret_key');
        userId = decoded.id;
      } catch (e) { }
    }

    const [lecciones] = await pool.execute(
      `SELECT l.*, c.titulo as curso_titulo
       FROM lecciones l
       LEFT JOIN cursos c ON l.curso_id = c.id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (lecciones.length === 0) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const leccion = lecciones[0];

    // Obtener estado de completado si hay usuario
    if (userId) {
      const [progreso] = await pool.execute(
        'SELECT completada FROM progreso_lecciones WHERE leccion_id = ? AND usuario_id = ?',
        [req.params.id, userId]
      );
      leccion.completada = progreso.length > 0 ? progreso[0].completada : false;
    } else {
      leccion.completada = false;
    }

    res.json({ leccion });
  } catch (error) {
    console.error('Error obteniendo lección:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Marcar progreso de lección
app.post('/api/lecciones/:id/progreso', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, 'tu_secret_key');
    const { completada, porcentaje_visto } = req.body;

    // Obtener el curso_id de la lección
    const [lecciones] = await pool.execute(
      'SELECT curso_id FROM lecciones WHERE id = ?',
      [req.params.id]
    );

    if (lecciones.length === 0) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const cursoId = lecciones[0].curso_id;

    // Insertar o actualizar progreso
    // Nota: 'ultima_actualizacion' se actualiza automáticamente
    await pool.execute(
      `INSERT INTO progreso_lecciones (usuario_id, leccion_id, completada, porcentaje_visto)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE completada = ?, porcentaje_visto = ?`,
      [decoded.id, req.params.id, completada, porcentaje_visto || 0, completada, porcentaje_visto || 0]
    );

    // Calcular nuevo progreso
    const [totalLecciones] = await pool.execute(
      'SELECT COUNT(*) as total FROM lecciones WHERE curso_id = ?',
      [cursoId]
    );

    const [completadasResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM progreso_lecciones pl
       JOIN lecciones l ON pl.leccion_id = l.id
       WHERE l.curso_id = ? AND pl.usuario_id = ? AND pl.completada = TRUE`,
      [cursoId, decoded.id]
    );

    const total = totalLecciones[0].total;
    const completed = completadasResult[0].total;
    const porcentaje = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      message: 'Progreso guardado',
      success: true,
      new_progress: porcentaje
    });
  } catch (error) {
    console.error('Error guardando progreso:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const [categorias] = await pool.execute(
      'SELECT * FROM categorias WHERE activo = TRUE ORDER BY nombre'
    );
    res.json({ categorias });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// Crear categoría
app.post('/api/categorias', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== 1) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { nombre, icono } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    const [result] = await pool.execute(
      'INSERT INTO categorias (nombre, icono) VALUES (?, ?)',
      [nombre, icono || '📚']
    );

    res.status(201).json({
      message: 'Categoría creada',
      categoria: { id: result.insertId, nombre, icono: icono || '📚' }
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ message: 'Error creando categoría' });
  }
});

// Actualizar categoría
app.put('/api/categorias/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== 1) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { nombre, icono } = req.body;
    const catId = req.params.id;

    await pool.execute(
      'UPDATE categorias SET nombre = ?, icono = ? WHERE id = ?',
      [nombre, icono, catId]
    );

    res.json({ message: 'Categoría actualizada' });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({ message: 'Error actualizando categoría' });
  }
});

// Eliminar categoría
app.delete('/api/categorias/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== 1) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const catId = req.params.id;

    // Soft delete
    await pool.execute(
      'UPDATE categorias SET activo = FALSE WHERE id = ?',
      [catId]
    );

    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ message: 'Error eliminando categoría' });
  }
});

// Obtener convenios
app.get('/api/convenios', async (req, res) => {
  try {
    const [convenios] = await pool.execute(
      'SELECT * FROM convenios WHERE activo = TRUE ORDER BY nombre'
    );
    res.json({ convenios });
  } catch (error) {
    console.error('Error obteniendo convenios:', error);
    // Si no existe la tabla, devolver array vacío
    res.json({ convenios: [] });
  }
});

// Obtener convenio por ID
app.get('/api/convenios/:id', async (req, res) => {
  console.log(`[CONVENIO] Fetch request for ID: ${req.params.id}`);
  try {
    const [convenios] = await pool.execute(
      'SELECT * FROM convenios WHERE id = ?',
      [req.params.id]
    );
    if (convenios.length === 0) {
      console.log(`[CONVENIO] Not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Convenio no encontrado' });
    }
    console.log(`[CONVENIO] Found: ${convenios[0].nombre}`);
    res.json({ convenio: convenios[0] });
  } catch (error) {
    console.error('Error obteniendo convenio:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear convenio (Admin)
app.post('/api/convenios', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== 1) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    const { nombre, logo_url, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });

    const [result] = await pool.execute(
      'INSERT INTO convenios (nombre, logo_url, descripcion) VALUES (?, ?, ?)',
      [nombre, logo_url, descripcion]
    );
    res.status(201).json({ message: 'Convenio creado', id: result.insertId });
  } catch (error) {
    console.error('Error creando convenio:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar convenio (Admin)
app.delete('/api/convenios/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== 1) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    await pool.execute('DELETE FROM convenios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Convenio eliminado' });
  } catch (error) {
    console.error('Error eliminando convenio:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// --- ENDPOINTS ADMINISTRACIÓN CURSOS ---

// Crear Curso
app.post('/api/cursos', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (req.user.role !== 'admin' && req.user.id != 1) return res.status(403).json({ message: 'No autorizado' });

    await connection.beginTransaction();

    const { titulo, subtitulo, descripcion, company, categoria_id, logo_icon, banner_url, video_youtube_url, periods, learningObjectives, lessons } = req.body;

    const [result] = await connection.query(
      `INSERT INTO cursos (titulo, subtitulo, descripcion, company, categoria_id, logo_icon, banner_url, video_youtube_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, subtitulo, descripcion, company, categoria_id, logo_icon, banner_url, video_youtube_url]
    );
    const cursoId = result.insertId;

    if (periods && periods.length > 0) {
      for (let i = 0; i < periods.length; i++) {
        await connection.query('INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES (?, ?, ?, ?)',
          [cursoId, periods[i].nombre, periods[i].duracion, i + 1]);
      }
    }

    if (learningObjectives && learningObjectives.length > 0) {
      for (let i = 0; i < learningObjectives.length; i++) {
        await connection.query('INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES (?, ?, ?)',
          [cursoId, learningObjectives[i], i + 1]);
      }
    }

    // Lecciones
    if (lessons && lessons.length > 0) {
      for (let i = 0; i < lessons.length; i++) {
        await connection.query(
          `INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [cursoId, lessons[i].titulo || `Lección ${i + 1}`, '', lessons[i].youtube_url, 15, i + 1]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Curso creado', id: cursoId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creando curso:', error);
    res.status(500).json({ message: 'Error creando curso' });
  } finally {
    connection.release();
  }
});

// Update Curso
app.put('/api/cursos/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (req.user.role !== 'admin' && req.user.id != 1) return res.status(403).json({ message: 'No autorizado' });

    await connection.beginTransaction();
    const cursoId = req.params.id;
    const { titulo, subtitulo, descripcion, company, categoria_id, logo_icon, banner_url, video_youtube_url, periods, learningObjectives, lessons } = req.body;

    await connection.query(
      `UPDATE cursos SET titulo=?, subtitulo=?, descripcion=?, company=?, categoria_id=?, logo_icon=?, banner_url=?, video_youtube_url=?
       WHERE id=?`,
      [titulo, subtitulo, descripcion, company, categoria_id, logo_icon, banner_url, video_youtube_url, cursoId]
    );

    // Periodos
    await connection.query('DELETE FROM periodos_curso WHERE curso_id = ?', [cursoId]);
    if (periods && periods.length > 0) {
      for (let i = 0; i < periods.length; i++) {
        await connection.query('INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES (?, ?, ?, ?)',
          [cursoId, periods[i].nombre, periods[i].duracion, i + 1]);
      }
    }

    // Objetivos
    await connection.query('DELETE FROM objetivos_curso WHERE curso_id = ?', [cursoId]);
    if (learningObjectives && learningObjectives.length > 0) {
      for (let i = 0; i < learningObjectives.length; i++) {
        await connection.query('INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES (?, ?, ?)',
          [cursoId, learningObjectives[i], i + 1]);
      }
    }

    // Lecciones
    if (lessons && lessons.length > 0) {
      const [existing] = await connection.query('SELECT id FROM lecciones WHERE curso_id = ?', [cursoId]);
      const existingIds = existing.map(e => e.id);

      for (let i = 0; i < lessons.length; i++) {
        const l = lessons[i];
        if (l.id && existingIds.includes(l.id)) {
          await connection.query(
            `UPDATE lecciones SET titulo=?, youtube_url=?, orden=? WHERE id=?`,
            [l.titulo, l.youtube_url, i + 1, l.id]
          );
        } else {
          await connection.query(
            `INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
            [cursoId, l.titulo || `Lección ${i + 1}`, '', l.youtube_url, 15, i + 1]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Curso actualizado' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error actualizando curso' });
  } finally {
    connection.release();
  }
});

// Eliminar Curso
app.delete('/api/cursos/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id != 1) return res.status(403).json({ message: 'No autorizado' });

    await pool.execute('DELETE FROM cursos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando curso:', error);
    res.status(500).json({ message: 'Error eliminando curso', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL local: http://localhost:${PORT}`);
  console.log(`📍 URL red: http://192.168.1.3:${PORT}`);
});