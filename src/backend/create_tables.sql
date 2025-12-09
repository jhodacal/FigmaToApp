-- ========================================
-- Script SQL: Crear Tablas para Sistema de Cursos Dinámico
-- Base de datos: impulsatech
-- ========================================

USE impulsatech;

-- 1. Actualizar tabla usuarios para agregar role
ALTER TABLE usuarios 
ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER password;

-- Crear un usuario admin de prueba (opcional)
-- UPDATE usuarios SET role = 'admin' WHERE username = 'admin';

-- 2. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  icono VARCHAR(10),
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Crear tabla de cursos
CREATE TABLE IF NOT EXISTS cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  subtitulo VARCHAR(300),
  descripcion TEXT,
  company VARCHAR(100),
  categoria_id INT,
  logo_icon VARCHAR(10) DEFAULT '📚',
  banner_url VARCHAR(500),
  video_youtube_url VARCHAR(500), -- Link de YouTube
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_categoria (categoria_id),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Crear tabla de períodos del curso
CREATE TABLE IF NOT EXISTS periodos_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  duracion VARCHAR(50),
  orden INT DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Crear tabla de objetivos del curso
CREATE TABLE IF NOT EXISTS objetivos_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  descripcion TEXT NOT NULL,
  orden INT DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Datos iniciales: Categorías
-- ========================================

INSERT INTO categorias (nombre, icono, descripcion) VALUES
('Programación', '💻', 'Cursos de lenguajes de programación y desarrollo de software'),
('Desarrollo Web', '🌐', 'Cursos de desarrollo web frontend y backend'),
('Desarrollo Móvil', '📱', 'Cursos de desarrollo de aplicaciones móviles'),
('Diseño', '🎨', 'Cursos de diseño gráfico, UI/UX y multimedia'),
('Análisis de Datos', '📊', 'Cursos de data science, análisis y visualización'),
('Infraestructura', '☁️', 'Cursos de DevOps, cloud computing y sistemas'),
('Marketing Digital', '🎯', 'Cursos de marketing digital y estrategias online')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- ========================================
-- Verificar resultados
-- ========================================

SELECT '=== CATEGORÍAS CREADAS ===' AS '';
SELECT * FROM categorias;

SELECT '=== ESTRUCTURA DE TABLAS ===' AS '';
SHOW TABLES LIKE '%curso%' OR SHOW TABLES LIKE 'categorias';

SELECT '=== TABLA USUARIOS (verificar columna role) ===' AS '';
DESCRIBE usuarios;

-- ========================================
-- Script completado exitosamente
-- ========================================
