// ========================================
// API Routes para Gestión de Cursos
// Agregar al archivo server.js existente
// ========================================

// Middleware para verificar rol de administrador
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Acceso denegado. Se requiere rol de administrador.'
        });
    }
    next();
};

// ========================================
// CATEGORÍAS
// ========================================

// Obtener todas las categorías
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

// Crear categoría (solo admin)
app.post('/api/categorias', authenticateToken, isAdmin, async (req, res) => {
    const { nombre, icono, descripcion } = req.body;

    try {
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }

        const [result] = await pool.execute(
            'INSERT INTO categorias (nombre, icono, descripcion) VALUES (?, ?, ?)',
            [nombre, icono || '📚', descripcion]
        );

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            categoria: { id: result.insertId, nombre, icono, descripcion }
        });
    } catch (error) {
        console.error('Error creando categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'La categoría ya existe' });
        }
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// ========================================
// CURSOS
// ========================================

// Obtener todos los cursos con sus períodos y objetivos
app.get('/api/cursos', async (req, res) => {
    try {
        const { categoria_id } = req.query;

        let query = `
      SELECT 
        c.id, c.titulo, c.subtitulo, c.descripcion, c.company,
        c.categoria_id, cat.nombre as categoria, c.logo_icon,
        c.banner_url, c.video_youtube_url, c.activo, c.created_at
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

// Obtener un curso específico por ID
app.get('/api/cursos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [cursos] = await pool.execute(
            `SELECT 
        c.id, c.titulo, c.subtitulo, c.descripcion, c.company,
        c.categoria_id, cat.nombre as categoria, c.logo_icon,
        c.banner_url, c.video_youtube_url, c.activo, c.created_at
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

        res.json({ curso });
    } catch (error) {
        console.error('Error obteniendo curso:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// Crear curso (solo admin)
app.post('/api/cursos', authenticateToken, isAdmin, async (req, res) => {
    const {
        titulo,
        subtitulo,
        descripcion,
        company,
        categoria_id,
        logo_icon,
        banner_url,
        video_youtube_url,
        periods,
        learningObjectives
    } = req.body;

    try {
        // Validaciones
        if (!titulo || !categoria_id) {
            return res.status(400).json({
                message: 'Título y categoría son requeridos'
            });
        }

        // Iniciar transacción
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insertar curso
            const [result] = await connection.execute(
                `INSERT INTO cursos 
        (titulo, subtitulo, descripcion, company, categoria_id, logo_icon, 
         banner_url, video_youtube_url, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [titulo, subtitulo, descripcion, company, categoria_id, logo_icon || '📚',
                    banner_url, video_youtube_url, req.user.id]
            );

            const cursoId = result.insertId;

            // 2. Insertar períodos
            if (periods && Array.isArray(periods)) {
                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i];
                    await connection.execute(
                        'INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES (?, ?, ?, ?)',
                        [cursoId, period.nombre || period.name, period.duracion || period.duration, i]
                    );
                }
            }

            // 3. Insertar objetivos
            if (learningObjectives && Array.isArray(learningObjectives)) {
                for (let i = 0; i < learningObjectives.length; i++) {
                    const objetivo = learningObjectives[i];
                    const descripcion = typeof objetivo === 'string' ? objetivo : objetivo.descripcion;
                    await connection.execute(
                        'INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES (?, ?, ?)',
                        [cursoId, descripcion, i]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.status(201).json({
                message: 'Curso creado exitosamente',
                curso: { id: cursoId, titulo, categoria_id }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error creando curso:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// Actualizar curso (solo admin)
app.put('/api/cursos/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        titulo,
        subtitulo,
        descripcion,
        company,
        categoria_id,
        logo_icon,
        banner_url,
        video_youtube_url,
        periods,
        learningObjectives
    } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Actualizar curso
            await connection.execute(
                `UPDATE cursos SET 
        titulo = ?, subtitulo = ?, descripcion = ?, company = ?,
        categoria_id = ?, logo_icon = ?, banner_url = ?, video_youtube_url = ?
        WHERE id = ?`,
                [titulo, subtitulo, descripcion, company, categoria_id, logo_icon,
                    banner_url, video_youtube_url, id]
            );

            // 2. Eliminar períodos anteriores e insertar nuevos
            await connection.execute('DELETE FROM periodos_curso WHERE curso_id = ?', [id]);
            if (periods && Array.isArray(periods)) {
                for (let i = 0; i < periods.length; i++) {
                    const period = periods[i];
                    await connection.execute(
                        'INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES (?, ?, ?, ?)',
                        [id, period.nombre || period.name, period.duracion || period.duration, i]
                    );
                }
            }

            // 3. Eliminar objetivos anteriores e insertar nuevos
            await connection.execute('DELETE FROM objetivos_curso WHERE curso_id = ?', [id]);
            if (learningObjectives && Array.isArray(learningObjectives)) {
                for (let i = 0; i < learningObjectives.length; i++) {
                    const objetivo = learningObjectives[i];
                    const descripcion = typeof objetivo === 'string' ? objetivo : objetivo.descripcion;
                    await connection.execute(
                        'INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES (?, ?, ?)',
                        [id, descripcion, i]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.json({ message: 'Curso actualizado exitosamente' });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error actualizando curso:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// Eliminar curso (solo admin) - soft delete
app.delete('/api/cursos/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // Soft delete - solo marcar como inactivo
        const [result] = await pool.execute(
            'UPDATE cursos SET activo = FALSE WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        res.json({ message: 'Curso eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando curso:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// ========================================
// ESTADÍSTICAS DE ADMIN
// ========================================

app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [totalCursos] = await pool.execute('SELECT COUNT(*) as total FROM cursos WHERE activo = TRUE');
        const [totalCategorias] = await pool.execute('SELECT COUNT(*) as total FROM categorias WHERE activo = TRUE');
        const [totalUsuarios] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
        const [cursosRecientes] = await pool.execute('SELECT COUNT(*) as total FROM cursos WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');

        res.json({
            stats: {
                totalCursos: totalCursos[0].total,
                totalCategorias: totalCategorias[0].total,
                totalUsuarios: totalUsuarios[0].total,
                cursosRecientes: cursosRecientes[0].total
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});
