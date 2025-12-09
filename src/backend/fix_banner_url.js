const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'Smart',
    password: '123456789',
    database: 'impulsatech',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function fixDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('🔌 Conectado a DB');

        console.log('🛠️ Alterando tabla cursos...');
        await connection.query('ALTER TABLE cursos MODIFY COLUMN banner_url LONGTEXT');
        console.log('✅ columna banner_url modificada a LONGTEXT');

        // También modificar logo_icon por si acaso
        await connection.query('ALTER TABLE cursos MODIFY COLUMN logo_icon VARCHAR(500)');
        console.log('✅ columna logo_icon modificada a VARCHAR(500)');

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDatabase();
