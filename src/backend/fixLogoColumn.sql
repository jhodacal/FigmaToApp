-- Modificar tabla cursos para soportar URLs de imágenes
USE impulsatech;

-- Cambiar logo_icon de VARCHAR(10) a VARCHAR(500) para URLs
ALTER TABLE cursos MODIFY COLUMN logo_icon VARCHAR(500) DEFAULT '📚';

-- Cambiar banner_url a VARCHAR(500) si no lo es
ALTER TABLE cursos MODIFY COLUMN banner_url VARCHAR(500);

-- Cambiar video_youtube_url a VARCHAR(500) si no lo es  
ALTER TABLE cursos MODIFY COLUMN video_youtube_url VARCHAR(500);

SELECT 'Tabla cursos modificada para soportar URLs' AS Resultado;
