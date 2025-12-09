// AGREGAR AL SERVIDOR - server.js
// Copiar y pegar DESPUÉS de la línea 587 (después del endpoint /api/admin/stats)

// Listado de usuarios (solo admin)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT id, username, email, nombres, apellidos, dni, numero, role, created_at 
       FROM usuarios 
       ORDER BY created_at DESC`
        );

        res.json({ users });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});

// ============================================
// TAMBIÉN REEMPLAZA el endpoint /api/admin/stats (líneas 568-587) con esto:
// ============================================

app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [totalCursos] = await pool.execute('SELECT COUNT(*) as total FROM cursos WHERE activo = TRUE');
        const [totalCategorias] = await pool.execute('SELECT COUNT(*) as total FROM categorias WHERE activo = TRUE');
        const [totalUsuarios] = await pool.execute('SELECT COUNT(*) as total FROM usuarios');
        const [totalAdmins] = await pool.execute("SELECT COUNT(*) as total FROM usuarios WHERE role = 'admin'");
        const [cursosRecientes] = await pool.execute('SELECT COUNT(*) as total FROM cursos WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');

        res.json({
            stats: {
                totalCursos: totalCursos[0].total,
                totalCategorias: totalCategorias[0].total,
                totalUsuarios: totalUsuarios[0].total,
                totalAdmins: totalAdmins[0].total,  // ← NUEVA LÍNEA
                cursosRecientes: cursosRecientes[0].total
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
});
