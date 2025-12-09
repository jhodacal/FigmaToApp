// Script para actualizar logos de cursos con URLs de imágenes
const mysql = require('mysql2/promise');

const updateCourseLogos = async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'Smart',
        password: '123456789',
        database: 'impulsatech',
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL\n');

        // Mapeo de cursos principales con sus logos
        const logoMap = {
            'Python': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png',
            'Java': 'https://logos-world.net/wp-content/uploads/2022/07/Java-Logo.png',
            'JavaScript': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
            'React Native': 'https://www.datocms-assets.com/45470/1631026680-logo-react-native.png',
            'Excel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/1200px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png',
            'Power BI': 'https://logos-world.net/wp-content/uploads/2022/02/Microsoft-Power-BI-Symbol.png',
            'AWS Cloud': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1200px-Amazon_Web_Services_Logo.svg.png',
            'UI/UX Design': 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png',
            'Docker & Kubernetes': 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png',
            'Marketing Digital': 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png'
        };

        console.log('📝 Actualizando logos de cursos...\n');

        for (const [courseName, logoUrl] of Object.entries(logoMap)) {
            await connection.execute(
                'UPDATE cursos SET logo_icon = ? WHERE titulo = ?',
                [logoUrl, courseName]
            );
            console.log(`  ✅ ${courseName} - Logo actualizado`);
        }

        console.log('\n🎉 ¡Logos actualizados con URLs de imágenes reales!');

        connection.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updateCourseLogos();
