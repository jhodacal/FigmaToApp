-- TEST: Verifica si las tablas del panel admin existen
-- Copia y pega esto en MySQL Workbench

-- 1. Ver si existe la tabla categorias
SELECT COUNT(*) as 'Categorias creadas' FROM categorias;

-- 2. Ver si existe la tabla cursos - 3. Ver si tu usuario es admin
SELECT username, role FROM usuarios WHERE username = 'admin';

-- Si estas queries fallan con "Table doesn't exist", 
-- significa que AÚN NO has ejecutado el archivo create_tables.sql
