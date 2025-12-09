// Script para insertar datos de prueba en la base de datos
const mysql = require('mysql2/promise');

const insertTestData = async () => {
    console.log('🔄 Conectando a la base de datos...');

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'Smart',
        password: '123456789',
        database: 'impulsatech',
        waitForConnections: true,
        connectionLimit: 10,
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL');

        // Verificar si ya existen cursos
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM cursos');
        if (existing[0].count > 0) {
            console.log(`⚠️  Ya existen ${existing[0].count} cursos en la base de datos`);
            console.log('❓ ¿Deseas eliminarlos y volver a insertar? (Este script los insertará de todos modos)');
        }

        console.log('\n📝 Insertando cursos de prueba...\n');

        // Insertar cursos
        const cursos = [
            ['Python', 'Curso 1: Introducción a la programación', 'Empieza con Python y aprende a programar con este curso básico y rápido.', 'ImpulsaTech', 1, '🐍'],
            ['Java', 'Curso 2: Desarrollo Empresarial con Java', 'Curso intensivo de Java enfocado en el desarrollo de aplicaciones empresariales.', 'EBSA', 1, '☕'],
            ['Excel', 'Curso 3: Análisis de Datos y VBA', 'Convierte datos sin procesar en conocimientos prácticos.', 'NTT DATA', 2, '📊'],
            ['JavaScript', 'Curso 4: Desarrollo Web Moderno', 'Domina JavaScript desde los fundamentos hasta frameworks modernos.', 'TAC DIGITAL', 4, '🌐'],
            ['React Native', 'Curso 5: Desarrollo Móvil Multiplataforma', 'Construye aplicaciones móviles nativas para iOS y Android.', 'ImpulsaTech', 5, '📱'],
            ['Power BI', 'Curso 6: Business Intelligence y Visualización', 'Aprende a crear dashboards interactivos y reportes profesionales.', 'NTT DATA', 2, '📈'],
            ['AWS Cloud', 'Curso 7: Arquitectura en la Nube', 'Domina Amazon Web Services y aprende a diseñar arquitecturas escalables.', 'INDRA GROUP', 6, '☁️'],
            ['UI/UX Design', 'Curso 8: Diseño de Experiencias Digitales', 'Crea experiencias de usuario excepcionales y interfaces visuales atractivas.', 'TAC DIGITAL', 3, '🎨'],
            ['Python Data Science', 'Curso 9: Ciencia de Datos con Python', 'Explora el mundo de la ciencia de datos con Python.', 'ImpulsaTech', 2, '🔬'],
            ['Marketing Digital', 'Curso 10: Estrategias Digitales Efectivas', 'Aprende a crear y ejecutar estrategias de marketing digital.', 'TAC DIGITAL', 7, '🎯'],
        ];

        for (const curso of cursos) {
            const [result] = await connection.execute(
                'INSERT INTO cursos (titulo, subtitulo, descripcion, company, categoria_id, logo_icon, activo) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
                curso
            );
            console.log(`✅ Insertado: ${curso[0]} (ID: ${result.insertId})`);
        }

        // Insertar períodos para Python (ID 1)
        console.log('\n📅 Insertando períodos del curso...');
        await connection.execute(
            'INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES (1, "Python Básico", "2 meses", 0), (1, "Python Avanzado", "2 meses", 1), (1, "Proyectos", "1 mes", 2)'
        );
        console.log('✅ Períodos insertados para Python');

        // Insertar objetivos para Python
        console.log('\n🎯 Insertando objetivos de aprendizaje...');
        await connection.execute(
            `INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES 
       (1, 'Aprenderás desde los fundamentos de la sintaxis de Python.', 0),
       (1, 'Te familiarizarás con estructuras de datos, funciones y POO.', 1),
       (1, 'Desarrollarás tus primeros proyectos prácticos y funcionales.', 2),
       (1, 'Estarás listo para tomar cursos de Data Science o Web Backend.', 3)`
        );
        console.log('✅ Objetivos insertados para Python');

        // Insertar lecciones para Python
        console.log('\n📚 Insertando lecciones...');
        await connection.execute(
            `INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) VALUES
       (1, 'Introducción a Python', 'Conoce Python y configura tu entorno', 'dQw4w9WgXcQ', 15, 1),
       (1, 'Variables y Tipos de Datos', 'Aprende sobre variables, strings, números', 'dQw4w9WgXcQ', 20, 2),
       (1, 'Estructuras de Control', 'If, elif, else y bucles en Python', 'dQw4w9WgXcQ', 25, 3),
       (1, 'Funciones en Python', 'Crea y usa funciones para organizar tu código', 'dQw4w9WgXcQ', 30, 4),
       (1, 'Listas y Diccionarios', 'Estructuras de datos fundamentales', 'dQw4w9WgXcQ', 35, 5)`
        );
        console.log('✅ Lecciones insertadas para Python');

        // Verificar
        const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM cursos');
        console.log(`\n🎉 ¡COMPLETADO! Ahora hay ${finalCount[0].count} cursos en la base de datos`);

        connection.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

insertTestData();
