// Verificar cursos en la base de datos
const mysql = require('mysql2/promise');

const checkCourses = async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'Smart',
        password: '123456789',
        database: 'impulsatech',
    });

    try {
        const connection = await pool.getConnection();

        const [cursos] = await connection.execute('SELECT id, titulo, company FROM cursos LIMIT 10');

        console.log(`\n📚 Cursos en la base de datos (${cursos.length}):\n`);
        cursos.forEach(curso => {
            console.log(`  ${curso.id}. ${curso.titulo} - ${curso.company}`);
        });

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

checkCourses();
