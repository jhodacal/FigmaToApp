// Script para insertar TODOS los cursos desde mockData.js a la base de datos
const mysql = require('mysql2/promise');

// Datos de todos los cursos (copiados de mockData.js)
const allCourses = [
    { id: 1, title: 'Python', subtitle: 'Curso 1: Introducción a la programación', company: 'ImpulsaTech', category: 'Programación', logoIcon: '🐍' },
    { id: 2, title: 'Java', subtitle: 'Curso 2: Desarrollo Empresarial con Java', company: 'EBSA', category: 'Programación', logoIcon: '☕' },
    { id: 3, title: 'Excel', subtitle: 'Curso 3: Análisis de Datos y VBA', company: 'NTT DATA', category: 'Análisis de Datos', logoIcon: '📊' },
    { id: 4, title: 'Revit', subtitle: 'Curso 4: Introducción al Modelado BIM', company: 'INDRA GROUP', category: 'Diseño', logoIcon: '📐' },
    { id: 5, title: 'JavaScript', subtitle: 'Curso 5: Desarrollo Web Moderno', company: 'TAC DIGITAL', category: 'Desarrollo Web', logoIcon: '🌐' },
    { id: 6, title: 'React Native', subtitle: 'Curso 6: Desarrollo Móvil Multiplataforma', company: 'ImpulsaTech', category: 'Desarrollo Móvil', logoIcon: '📱' },
    { id: 7, title: 'Power BI', subtitle: 'Curso 7: Business Intelligence y Visualización', company: 'NTT DATA', category: 'Análisis de Datos', logoIcon: '📈' },
    { id: 8, title: 'AWS Cloud', subtitle: 'Curso 8: Arquitectura en la Nube', company: 'INDRA GROUP', category: 'Infraestructura', logoIcon: '☁️' },
    { id: 9, title: 'UI/UX Design', subtitle: 'Curso 9: Diseño de Experiencias Digitales', company: 'TAC DIGITAL', category: 'Diseño', logoIcon: '🎨' },
    { id: 10, title: 'Python Data Science', subtitle: 'Curso 10: Ciencia de Datos con Python', company: 'ImpulsaTech', category: 'Análisis de Datos', logoIcon: '🔬' },
    { id: 11, title: 'Marketing Digital', subtitle: 'Curso 11: Estrategias Digitales Efectivas', company: 'TAC DIGITAL', category: 'Marketing Digital', logoIcon: '🎯' },
    { id: 12, title: 'Docker & Kubernetes', subtitle: 'Curso 12: Contenedores y Orquestación', company: 'INDRA GROUP', category: 'Infraestructura', logoIcon: '🐳' },
    { id: 13, title: 'AutoCAD', subtitle: 'Curso 13: Diseño Asistido por Computadora', company: 'EBSA', category: 'Diseño', logoIcon: '✏️' },
    { id: 14, title: 'Ciberseguridad', subtitle: 'Curso 14: Seguridad Informática', company: 'NTT DATA', category: 'Infraestructura', logoIcon: '🔒' },
    { id: 15, title: 'Node.js', subtitle: 'Curso 15: Backend con JavaScript', company: 'TAC DIGITAL', category: 'Desarrollo Web', logoIcon: '🟢' },
    { id: 16, title: 'SQL Avanzado', subtitle: 'Curso 16: Gestión de Bases de Datos', company: 'EBSA', category: 'Análisis de Datos', logoIcon: '🗄️' },
    { id: 17, title: 'Photoshop', subtitle: 'Curso 17: Edición Profesional de Imágenes', company: 'ImpulsaTech', category: 'Diseño', logoIcon: '🖼️' },
    { id: 18, title: 'Flutter', subtitle: 'Curso 18: Apps Multiplataforma con Dart', company: 'TAC DIGITAL', category: 'Desarrollo Móvil', logoIcon: '🦋' },
    { id: 19, title: 'Machine Learning', subtitle: 'Curso 19: Inteligencia Artificial Aplicada', company: 'NTT DATA', category: 'Análisis de Datos', logoIcon: '🤖' },
    { id: 20, title: 'Git & GitHub', subtitle: 'Curso 20: Control de Versiones Profesional', company: 'INDRA GROUP', category: 'Programación', logoIcon: '🔀' },
    { id: 21, title: 'Angular', subtitle: 'Curso 21: Framework Frontend Empresarial', company: 'NTT DATA', category: 'Desarrollo Web', logoIcon: '🅰️' },
    { id: 22, title: 'Illustrator', subtitle: 'Curso 22: Diseño Vectorial Profesional', company: 'ImpulsaTech', category: 'Diseño', logoIcon: '🎭' },
    { id: 23, title: 'Kotlin', subtitle: 'Curso 23: Desarrollo Android Nativo', company: 'TAC DIGITAL', category: 'Desarrollo Móvil', logoIcon: '📲' },
    { id: 24, title: 'Tableau', subtitle: 'Curso 24: Visualización de Datos Avanzada', company: 'EBSA', category: 'Análisis de Datos', logoIcon: '📉' },
    { id: 25, title: 'MongoDB', subtitle: 'Curso 25: Bases de Datos NoSQL', company: 'INDRA GROUP', category: 'Infraestructura', logoIcon: '🍃' },
    { id: 26, title: 'After Effects', subtitle: 'Curso 26: Motion Graphics y Animación', company: 'TAC DIGITAL', category: 'Diseño', logoIcon: '🎬' },
    { id: 27, title: 'Swift', subtitle: 'Curso 27: Desarrollo iOS Nativo', company: 'ImpulsaTech', category: 'Desarrollo Móvil', logoIcon: '🍎' },
    { id: 28, title: 'R Programming', subtitle: 'Curso 28: Análisis Estadístico', company: 'NTT DATA', category: 'Análisis de Datos', logoIcon: '📊' },
    { id: 29, title: 'Vue.js', subtitle: 'Curso 29: Framework JavaScript Progresivo', company: 'TAC DIGITAL', category: 'Desarrollo Web', logoIcon: '💚' },
    { id: 30, title: 'Premiere Pro', subtitle: 'Curso 30: Edición de Video Profesional', company: 'ImpulsaTech', category: 'Diseño', logoIcon: '🎥' },
    { id: 31, title: 'Rust', subtitle: 'Curso 31: Programación de Sistemas', company: 'INDRA GROUP', category: 'Programación', logoIcon: '🦀' },
    { id: 32, title: 'Scrum Master', subtitle: 'Curso 32: Metodologías Ágiles', company: 'EBSA', category: 'Marketing Digital', logoIcon: '🏃' },
    { id: 33, title: 'Blender', subtitle: 'Curso 33: Modelado y Animación 3D', company: 'TAC DIGITAL', category: 'Diseño', logoIcon: '🎨' },
    { id: 34, title: 'Go (Golang)', subtitle: 'Curso 34: Programación Concurrente', company: 'NTT DATA', category: 'Programación', logoIcon: '🔵' },
    { id: 35, title: 'Redis', subtitle: 'Curso 35: Base de Datos en Memoria', company: 'INDRA GROUP', category: 'Infraestructura', logoIcon: '🔴' },
    { id: 36, title: 'Unity', subtitle: 'Curso 36: Desarrollo de Videojuegos', company: 'TAC DIGITAL', category: 'Desarrollo Móvil', logoIcon: '🎮' },
    { id: 37, title: 'Jenkins', subtitle: 'Curso 37: CI/CD y Automatización', company: 'EBSA', category: 'Infraestructura', logoIcon: '⚙️' },
    { id: 38, title: 'Figma', subtitle: 'Curso 38: Diseño UI/UX Colaborativo', company: 'ImpulsaTech', category: 'Diseño', logoIcon: '🎨' },
    { id: 39, title: 'Terraform', subtitle: 'Curso 39: Infrastructure as Code', company: 'NTT DATA', category: 'Infraestructura', logoIcon: '🏗️' },
    { id: 40, title: 'C++', subtitle: 'Curso 40: Programación de Alto Rendimiento', company: 'INDRA GROUP', category: 'Programación', logoIcon: '⚡' },
];

// Mapeo de categorías
const categoryMap = {
    'Programación': 1,
    'Análisis de Datos': 2,
    'Diseño': 3,
    'Desarrollo Web': 4,
    'Desarrollo Móvil': 5,
    'Infraestructura': 6,
    'Marketing Digital': 7
};

const insertAllCourses = async () => {
    console.log('🔄 Conectando a la base de datos...');

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'Smart',
        password: '123456789',
        database: 'impulsatech',
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL\n');

        // Verificar cursos existentes
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM cursos');
        console.log(`📊 Cursos actuales en BD: ${existing[0].count}`);

        // Limpiar cursos existentes si es necesario
        if (existing[0].count > 0) {
            console.log('🗑️  Eliminando cursos existentes para evitar duplicados...');
            await connection.execute('DELETE FROM cursos');
            console.log('✅ Cursos eliminados\n');
        }

        console.log(`📝 Insertando ${allCourses.length} cursos...\n`);

        let inserted = 0;
        for (const course of allCourses) {
            const categoryId = categoryMap[course.category] || 1;

            try {
                await connection.execute(
                    'INSERT INTO cursos (titulo, subtitulo, descripcion, company, categoria_id, logo_icon, activo) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
                    [
                        course.title,
                        course.subtitle,
                        `Curso completo de ${course.title}`,
                        course.company,
                        categoryId,
                        course.logoIcon
                    ]
                );
                inserted++;
                if (inserted % 10 === 0) {
                    console.log(`  ✅ ${inserted} cursos insertados...`);
                }
            } catch (error) {
                console.error(`  ❌ Error insertando ${course.title}:`, error.message);
            }
        }

        console.log(`\n🎉 ¡COMPLETADO! Se insertaron ${inserted} de ${allCourses.length} cursos`);

        // Verificar final
        const [final] = await connection.execute('SELECT COUNT(*) as count FROM cursos');
        console.log(`📚 Total de cursos en BD: ${final[0].count}`);

        connection.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

insertAllCourses();
