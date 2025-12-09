-- Tabla de convenios para empresas asociadas
CREATE TABLE IF NOT EXISTS convenios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos convenios de ejemplo
INSERT INTO convenios (nombre, descripcion, logo_url, activo) VALUES
('Microsoft', 'Convenio con Microsoft para capacitación en tecnologías Azure y Office', '/logos/microsoft.png', TRUE),
('Google', 'Programa de formación en Google Cloud y herramientas digitales', '/logos/google.png', TRUE),
('Amazon', 'Capacitación en AWS y servicios cloud de Amazon', '/logos/amazon.png', TRUE),
('IBM', 'Formación en inteligencia artificial y Watson', '/logos/ibm.png', TRUE),
('Oracle', 'Cursos de base de datos y cloud computing', '/logos/oracle.png', TRUE),
('Cisco', 'Certificaciones en redes y ciberseguridad', '/logos/cisco.png', TRUE);
