// Script para añadir períodos y objetivos a TODOS los cursos
const mysql = require('mysql2/promise');

const insertPeriodsAndObjectives = async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'Smart',
        password: '123456789',
        database: 'impulsatech',
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL\n');

        // Obtener todos los cursos
        const [cursos] = await connection.execute('SELECT id, titulo FROM cursos ORDER BY id');
        console.log(`📚 Procesando ${cursos.length} cursos...\n`);

        for (const curso of cursos) {
            // Insertar períodos genéricos
            await connection.execute(
                `INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES 
         (?, 'Nivel Básico', '2 meses', 0),
         (?, 'Nivel Avanzado', '2 meses', 1),
         (?, 'Proyectos Prácticos', '1 mes', 2)`,
                [curso.id, curso.id, curso.id]
            );

            // Insertar objetivos genéricos
            await connection.execute(
                `INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES
         (?, 'Dominarás los fundamentos y conceptos básicos.', 0),
         (?, 'Aprenderás técnicas avanzadas y mejores prácticas.', 1),
         (?, 'Desarrollarás proyectos reales y aplicarás lo aprendido.', 2),
         (?, 'Estarás preparado para roles profesionales en la industria.', 3)`,
                [curso.id, curso.id, curso.id, curso.id]
            );

            console.log(`  ✅ ${curso.titulo} - Períodos y objetivos añadidos`);
        }

        console.log(`\n🎉 ¡Completado! Todos los cursos ahora tienen períodos y objetivos`);

        connection.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

insertPeriodsAndObjectives();
