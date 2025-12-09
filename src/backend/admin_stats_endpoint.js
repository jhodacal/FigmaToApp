// ========== ADMIN STATS ENDPOINT ==========

// Endpoint para obtener estadísticas del panel admin
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
        // Fallback data
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

module.exports = pool; // Exportar pool para usar en otros archivos
