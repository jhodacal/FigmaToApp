// Script para generar lecciones automáticamente para todos los cursos
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'Smart',
    password: '123456789',
    database: 'impulsatech',
    waitForConnections: true,
    connectionLimit: 10
});

// Videos educativos reales de YouTube por categoría
const videosByCategory = {
    'Programación': [
        { url: 'https://www.youtube.com/watch?v=RqzGzwTY-6w', title: 'Introducción a la Programación', duration: 15 },
        { url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', title: 'Variables y Tipos de Datos', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=Z34BF9PCfYg', title: 'Estructuras de Control', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', title: 'Funciones y Métodos', duration: 22 },
        { url: 'https://www.youtube.com/watch?v=N4mEzFDjqtA', title: 'Programación Orientada a Objetos', duration: 25 },
        { url: 'https://www.youtube.com/watch?v=Kp4Mvapo5kc', title: 'Arrays y Colecciones', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=1l_8-5Rs2ds', title: 'Manejo de Excepciones', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=YEaWDRgCFSo', title: 'Archivos y Entrada/Salida', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=b093aqAZiPU', title: 'Estructuras de Datos Avanzadas', duration: 24 },
        { url: 'https://www.youtube.com/watch?v=cWNEl4HE2OE', title: 'Algoritmos de Búsqueda y Ordenamiento', duration: 21 },
        { url: 'https://www.youtube.com/watch?v=GUDLRa0OVvw', title: 'Patrones de Diseño', duration: 23 },
        { url: 'https://www.youtube.com/watch?v=Jc8M9-LoEuo', title: 'Testing y Depuración', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=1h_yrg3LqYk', title: 'Buenas Prácticas de Código', duration: 15 },
        { url: 'https://www.youtube.com/watch?v=iFo12DZHhfU', title: 'Optimización de Código', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=ssgw48wB1EI', title: 'Proyecto Final y Mejores Prácticas', duration: 30 }
    ],
    'Diseño': [
        { url: 'https://www.youtube.com/watch?v=YiLUYf4HDh4', title: 'Principios de Diseño', duration: 14 },
        { url: 'https://www.youtube.com/watch?v=_2LLXnUdUIc', title: 'Teoría del Color', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=sByzHoiYFX0', title: 'Tipografía y Fuentes', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=a5KYlHNKQB8', title: 'Composición y Layout', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=3iVVM_DgWY4', title: 'Diseño de Interfaces', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=RFv7cYzbFLU', title: 'UX/UI Fundamentals', duration: 22 },
        { url: 'https://www.youtube.com/watch?v=Ovj4hFxko7c', title: 'Prototipado y Wireframes', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=YCwhtVen26g', title: 'Herramientas de Diseño', duration: 15 },
        { url: 'https://www.youtube.com/watch?v=zHUp73KdSPc', title: 'Diseño Responsive', duration: 21 },
        { url: 'https://www.youtube.com/watch?v=cKZEgtQUxlU', title: 'Branding y Identidad', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=wIuVvCuiJhU', title: 'Design Systems', duration: 23 },
        { url: 'https://www.youtube.com/watch?v=O-xERfzFVpE', title: 'Accesibilidad en Diseño', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=t0aCoqXKFOU', title: 'Animaciones y Microinteracciones', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=68w2VwalD5w', title: 'Portfolio de Diseño', duration: 14 },
        { url: 'https://www.youtube.com/watch?v=8oKErZe91M0', title: 'Proyecto de Diseño Completo', duration: 25 }
    ],
    'Marketing': [
        { url: 'https://www.youtube.com/watch?v=mUBaJRFGYn0', title: 'Fundamentos de Marketing Digital', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=gCGU64y8LZM', title: 'SEO y Posicionamiento Web', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=jQJlkKW1GwU', title: 'Marketing en Redes Sociales', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=5zb40pYsJ8A', title: 'Email Marketing', duration: 15 },
        { url: 'https://www.youtube.com/watch?v=SnvFjdbxc9w', title: 'Content Marketing', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=nU-IIXBWlS4', title: 'Google Ads y PPC', duration: 22 },
        { url: 'https://www.youtube.com/watch?v=EgYSOr5CmYk', title: 'Analytics y Métricas', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=F3SZgGvBxHA', title: 'Funnel de Ventas', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=AjOPE_Oqp0A', title: 'Copywriting y Redacción', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=kPbB0fJikwY', title: 'Influencer Marketing', duration: 14 },
        { url: 'https://www.youtube.com/watch?v=P1zMbg3q5BA', title: 'Video Marketing', duration: 21 },
        { url: 'https://www.youtube.com/watch?v=E9xwkBBqZO4', title: 'Marketing Automation', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=W4NYduwMIgk', title: 'Estrategias de Growth Hacking', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=iT7jxP8C2hE', title: 'ROI y Retorno de Inversión', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=PFqy8lBkAWo', title: 'Campaña de Marketing Completa', duration: 25 }
    ],
    'Negocios': [
        { url: 'https://www.youtube.com/watch?v=F8Qa-156K0w', title: 'Fundamentos de Negocios', duration: 15 },
        { url: 'https://www.youtube.com/watch?v=UV-Q1JmhEPs', title: 'Plan de Negocios', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=8w4pxzMkxr0', title: 'Análisis Financiero', duration: 22 },
        { url: 'https://www.youtube.com/watch?v=5-pqYqAV1Xk', title: 'Gestión de Proyectos', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=sURTg9yflYE', title: 'Liderazgo y Gestión de Equipos', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=9LLDZGAgTYs', title: 'Emprendimiento y Startups', duration: 21 },
        { url: 'https://www.youtube.com/watch?v=_5-F3WRMZZQ', title: 'Negociación Empresarial', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=jQAHxS6JN8A', title: 'Estrategia Empresarial', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=1CLU5c5SJ-Y', title: 'Recursos Humanos', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=D-_cPJY3Zd8', title: 'Operaciones y Logística', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=Bje5GRol5yg', title: 'Contabilidad para Empresarios', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=pJmmFLOKpyg', title: 'Ventas y Desarrollo Comercial', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=pNB8YSNqN4A', title: 'Innovación Empresarial', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=dYL1pP-9e7w', title: 'Escalamiento de Negocios', duration: 21 },
        { url: 'https://www.youtube.com/watch?v=c_XEXs7jHlU', title: 'Caso de Negocio Real', duration: 24 }
    ],
    'default': [
        { url: 'https://www.youtube.com/watch?v=kN1XP-Bef7w', title: 'Introducción al Curso', duration: 12 },
        { url: 'https://www.youtube.com/watch?v=9No-FiEInLA', title: 'Conceptos Fundamentales', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=PIBNr7AdMH0', title: 'Herramientas y Recursos', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', title: 'Práctica Guiada', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA', title: 'Técnicas Avanzadas', duration: 22 },
        { url: 'https://www.youtube.com/watch?v=yfoY53QXEnI', title: 'Casos de Estudio', duration: 19 },
        { url: 'https://www.youtube.com/watch?v=pWG7ajC_OVo', title: 'Mejores Prácticas', duration: 17 },
        { url: 'https://www.youtube.com/watch?v=3aGSqAsVPsI', title: 'Proyecto Práctico I', duration: 25 },
        { url: 'https://www.youtube.com/watch?v=dGcsHMXbSOA', title: 'Proyecto Práctico II', duration: 26 },
        { url: 'https://www.youtube.com/watch?v=3ResTHKVxf4', title: 'Análisis y Revisión', duration: 15 },
        { url: 'https://www.youtube.com/watch?v=g7T23Xzys1I', title: 'Optimización', duration: 18 },
        { url: 'https://www.youtube.com/watch?v=kPLcn1aVkzw', title: 'Tendencias Actuales', duration: 16 },
        { url: 'https://www.youtube.com/watch?v=W0_DPi0PmF0', title: 'Recursos Adicionales', duration: 14 },
        { url: 'https://www.youtube.com/watch?v=5b51dRHuD6M', title: 'Certificación y Próximos Pasos', duration: 20 },
        { url: 'https://www.youtube.com/watch?v=g9A_V1Ct4iA', title: 'Proyecto Final', duration: 30 }
    ]
};

// Posibles cantidades de lecciones por curso
const possibleLessonCounts = [5, 8, 10, 15];

function getRandomLessonCount() {
    return possibleLessonCounts[Math.floor(Math.random() * possibleLessonCounts.length)];
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

async function seedLessons() {
    try {
        console.log('🌱 Generando lecciones para todos los cursos...\n');

        // Obtener todos los cursos activos
        const [cursos] = await pool.execute(
            `SELECT c.id, c.titulo, cat.nombre as categoria
       FROM cursos c
       LEFT JOIN categorias cat ON c.categoria_id = cat.id
       WHERE c.activo = TRUE`
        );

        console.log(`📚 Encontrados ${cursos.length} cursos activos\n`);

        let totalLessonsCreated = 0;

        for (const curso of cursos) {
            // Determinar cantidad de lecciones para este curso
            const lessonCount = getRandomLessonCount();

            // Seleccionar videos según la categoría o usar default
            let availableVideos = videosByCategory[curso.categoria] || videosByCategory['default'];

            // Si no hay suficientes videos, usar los default
            if (availableVideos.length < lessonCount) {
                availableVideos = videosByCategory['default'];
            }

            // Mezclar y seleccionar videos
            const shuffledVideos = shuffleArray(availableVideos);
            const selectedVideos = shuffledVideos.slice(0, lessonCount);

            console.log(`📖 Curso: "${curso.titulo}"`);
            console.log(`   Categoría: ${curso.categoria || 'Sin categoría'}`);
            console.log(`   Lecciones a crear: ${lessonCount}`);

            // Insertar lecciones
            for (let i = 0; i < selectedVideos.length; i++) {
                const video = selectedVideos[i];
                const descripcion = `Lección ${i + 1} del curso ${curso.titulo}. ${video.title}`;

                await pool.execute(
                    `INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [curso.id, video.title, descripcion, video.url, video.duration, i + 1]
                );

                totalLessonsCreated++;
            }

            console.log(`   ✅ ${lessonCount} lecciones creadas\n`);
        }

        console.log(`\n✨ Proceso completado!`);
        console.log(`   📊 Total de lecciones creadas: ${totalLessonsCreated}`);
        console.log(`   📚 Total de cursos procesados: ${cursos.length}`);
        console.log(`   📈 Promedio de lecciones por curso: ${(totalLessonsCreated / cursos.length).toFixed(1)}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error generando lecciones:', error);
        process.exit(1);
    }
}

seedLessons();
