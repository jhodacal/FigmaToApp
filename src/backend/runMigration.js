// Script para ejecutar migraciones de base de datos
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'Smart',
    password: '123456789',
    database: 'impulsatech',
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true
});

async function runMigration() {
    try {
        console.log('📦 Ejecutando migración de base de datos...');

        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'migrations', 'createLessonsSchema.sql');
        const sqlContent = await fs.readFile(sqlPath, 'utf8');

        // Ejecutar el SQL
        await pool.query(sqlContent);

        console.log('✅ Migración completada exitosamente!');
        console.log('   - Tabla inscripciones creada');
        console.log('   - Tabla lecciones creada');
        console.log('   - Tabla progreso_lecciones creada');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error);
        process.exit(1);
    }
}

runMigration();
