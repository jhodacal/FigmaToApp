-- Crear tabla de inscripciones (enrollments)
CREATE TABLE IF NOT EXISTS inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (usuario_id, curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de lecciones
CREATE TABLE IF NOT EXISTS lecciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curso_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  youtube_url VARCHAR(500) NOT NULL,
  duracion_minutos INT DEFAULT 10,
  orden INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_curso_orden (curso_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS progreso_lecciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  leccion_id INT NOT NULL,
  completada BOOLEAN DEFAULT FALSE,
  porcentaje_visto INT DEFAULT 0,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
  UNIQUE KEY unique_progress (usuario_id, leccion_id),
  INDEX idx_usuario_leccion (usuario_id, leccion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
