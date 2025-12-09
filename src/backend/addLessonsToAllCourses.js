// Script para añadir lecciones a TODOS los cursos
const mysql = require('mysql2/promise');

// Lecciones genéricas que se adaptarán a cada curso
const lessonTemplates = [
    { title: 'Introducción y Fundamentos', description: 'Conoce los conceptos básicos y configura tu entorno', duration: 15, order: 1 },
    { title: 'Primeros Pasos Prácticos', description: 'Empieza a trabajar con ejemplos simples', duration: 20, order: 2 },
    { title: 'Conceptos Intermedios', description: 'Profundiza en técnicas y estructuras importantes', duration: 25, order: 3 },
    { title: 'Técnicas Avanzadas', description: 'Aprende patrones y mejores prácticas', duration: 30, order: 4 },
    { title: 'Proyecto Práctico', description: 'Aplica todo lo aprendido en un proyecto real', duration: 40, order: 5 },
    { title: 'Tips y Trucos', description: 'Optimiza tu flujo de trabajo', duration: 15, order: 6 },
    { title: 'Debugging y Solución de Problemas', description: 'Aprende a resolver errores comunes', duration: 20, order: 7 },
    { title: 'Proyecto Final', description: 'Crea tu proyecto completo paso a paso', duration: 45, order: 8 }
];

// URLs de YouTube educativas (puedes reemplazar con URLs reales)
const youtubeUrl = 'dQw4w9WgXcQ'; // Placeholder

const insertLessonsToAllCourses = async () => {
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
        console.log(`📚 Añadiendo lecciones a ${cursos.length} cursos...\n`);

        for (const curso of cursos) {
            // Adaptar el título de cada lección al curso
            for (const template of lessonTemplates) {
                const lessonTitle = template.title.includes('Introducción')
                    ? `Introducción a ${curso.titulo}`
                    : `${curso.titulo}: ${template.title}`;

                await connection.execute(
                    `INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [curso.id, lessonTitle, template.description, youtubeUrl, template.duration, template.order]
                );
            }

            console.log(`  ✅ ${curso.titulo} - 8 lecciones añadidas`);
        }

        // Verificar total
        const [totalLessons] = await connection.execute('SELECT COUNT(*) as count FROM lecciones');
        console.log(`\n🎉 ¡Completado! Total de lecciones: ${totalLessons[0].count}`);

        connection.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

insertLessonsToAllCourses();
