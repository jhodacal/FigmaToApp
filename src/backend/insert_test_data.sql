-- Script para insertar datos de prueba en la base de datos
-- Ejecutar después de crear las tablas

USE impulsatech;

-- Primero insertar categorías
INSERT INTO categorias (nombre, icono, descripcion) VALUES
('Programación', '💻', 'Cursos de programación y desarrollo de software'),
('Análisis de Datos', '📊', 'Cursos de análisis y ciencia de datos'),
('Diseño', '🎨', 'Cursos de diseño gráfico y UI/UX'),
('Desarrollo Web', '🌐', 'Cursos de desarrollo web frontend y backend'),
('Desarrollo Móvil', '📱', 'Cursos de desarrollo de aplicaciones móviles'),
('Infraestructura', '☁️', 'Cursos de cloud, DevOps y sistemas'),
('Marketing Digital', '📈', 'Cursos de marketing y estrategias digitales');

-- Insertar cursos de prueba (los primeros 10 para empezar)
INSERT INTO cursos (titulo, subtitulo, descripcion, company, categoria_id, logo_icon, activo) VALUES
-- Curso 1: Python
('Python', 'Curso 1: Introducción a la programación', 
'Empieza con Python y aprende a programar con este curso básico y rápido. Ideal para principiantes que buscan una base sólida en codificación.',
'ImpulsaTech', 1, '🐍', TRUE),

-- Curso 2: Java
('Java', 'Curso 2: Desarrollo Empresarial con Java',
'Curso intensivo de Java enfocado en el desarrollo de aplicaciones empresariales. Aprende los patrones de diseño y la creación de APIs robustas.',
'EBSA', 1, '☕', TRUE),

-- Curso 3: Excel
('Excel', 'Curso 3: Análisis de Datos y VBA',
'Convierte datos sin procesar en conocimientos prácticos. Este curso te llevará desde las funciones básicas hasta la automatización con VBA.',
'NTT DATA', 2, '📊', TRUE),

-- Curso 4: JavaScript
('JavaScript', 'Curso 4: Desarrollo Web Moderno',
'Domina JavaScript desde los fundamentos hasta frameworks modernos como React y Vue.',
'TAC DIGITAL', 4, '🌐', TRUE),

-- Curso 5: React Native
('React Native', 'Curso 5: Desarrollo Móvil Multiplataforma',
'Construye aplicaciones móviles nativas para iOS y Android usando React Native.',
'ImpulsaTech', 5, '📱', TRUE),

-- Curso 6: Power BI
('Power BI', 'Curso 6: Business Intelligence y Visualización',
'Aprende a crear dashboards interactivos y reportes profesionales con Power BI.',
'NTT DATA', 2, '📈', TRUE),

-- Curso 7: AWS Cloud
('AWS Cloud', 'Curso 7: Arquitectura en la Nube',
'Domina Amazon Web Services y aprende a diseñar arquitecturas escalables en la nube.',
'INDRA GROUP', 6, '☁️', TRUE),

-- Curso 8: UI/UX Design
('UI/UX Design', 'Curso 8: Diseño de Experiencias Digitales',
'Crea experiencias de usuario excepcionales y interfaces visuales atractivas.',
'TAC DIGITAL', 3, '🎨', TRUE),

-- Curso 9: Python Data Science
('Python Data Science', 'Curso 9: Ciencia de Datos con Python',
'Explora el mundo de la ciencia de datos con Python, desde análisis exploratorio hasta machine learning.',
'ImpulsaTech', 2, '🔬', TRUE),

-- Curso 10: Marketing Digital
('Marketing Digital', 'Curso 10: Estrategias Digitales Efectivas',
'Aprende a crear y ejecutar estrategias de marketing digital que generen resultados.',
'TAC DIGITAL', 7, '🎯', TRUE);

-- Insertar períodos para cada curso
-- Python (curso_id = 1)
INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES
(1, 'Python Básico', '2 meses', 0),
(1, 'Python Avanzado', '2 meses', 1),
(1, 'Proyectos', '1 mes', 2);

-- Java (curso_id = 2)
INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES
(2, 'Java Fundamentos', '3 meses', 0),
(2, 'Spring Framework', '3 meses', 1);

-- Excel (curso_id = 3)
INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES
(3, 'Excel Básico/Intermedio', '1 mes', 0),
(3, 'Fórmulas Avanzadas y Tablas Dinámicas', '1 mes', 1),
(3, 'VBA para Automatización', '2 meses', 2);

-- JavaScript (curso_id = 4)
INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES
(4, 'JavaScript Básico', '2 meses', 0),
(4, 'JavaScript Avanzado', '2 meses', 1),
(4, 'Frameworks Modernos', '2 meses', 2);

-- React Native (curso_id = 5)
INSERT INTO periodos_curso (curso_id, nombre, duracion, orden) VALUES
(5, 'React Native Básico', '2 meses', 0),
(5, 'React Native Avanzado', '3 meses', 1);

-- Insertar objetivos de aprendizaje
-- Python
INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES
(1, 'Aprenderás desde los fundamentos de la sintaxis de Python.', 0),
(1, 'Te familiarizarás con estructuras de datos, funciones y POO.', 1),
(1, 'Desarrollarás tus primeros proyectos prácticos y funcionales.', 2),
(1, 'Estarás listo para tomar cursos de Data Science o Web Backend.', 3);

-- Java
INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES
(2, 'Dominarás la programación orientada a objetos en Java.', 0),
(2, 'Implementarás servicios RESTful utilizando Spring Boot.', 1),
(2, 'Conocerás bases de datos SQL y NoSQL con JPA/Hibernate.', 2),
(2, 'Estarás preparado para roles de Backend Developer.', 3);

-- Excel
INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES
(3, 'Crearás informes dinámicos y tableros de control profesionales.', 0),
(3, 'Automatizarás tareas repetitivas usando macros y VBA.', 1),
(3, 'Aprenderás a manejar grandes volúmenes de datos de manera eficiente.', 2);

-- JavaScript
INSERT INTO objetivos_curso (curso_id, descripcion, orden) VALUES
(4, 'Aprenderás los fundamentos de JavaScript ES6+.', 0),
(4, 'Dominarás el DOM y la manipulación de eventos.', 1),
(4, 'Crearás aplicaciones web interactivas y dinámicas.', 2),
(4, 'Trabajarás con frameworks modernos de frontend.', 3);

-- Insertar algunas lecciones de ejemplo para Python (curso_id = 1)
INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) VALUES
(1, 'Introducción a Python', 'Conoce Python y configura tu entorno de desarrollo', 'dQw4w9WgXcQ', 15, 1),
(1, 'Variables y Tipos de Datos', 'Aprende sobre variables, strings, números y booleanos', 'dQw4w9WgXcQ', 20, 2),
(1, 'Estructuras de Control', 'If, elif, else y bucles en Python', 'dQw4w9WgXcQ', 25, 3),
(1, 'Funciones en Python', 'Crea y usa funciones para organizar tu código', 'dQw4w9WgXcQ', 30, 4),
(1, 'Listas y Diccionarios', 'Estructuras de datos fundamentales en Python', 'dQw4w9WgXcQ', 35, 5);

-- Insertar lecciones para Java (curso_id = 2)
INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) VALUES
(2, 'Introducción a Java', 'Historia de Java y configuración del JDK', 'dQw4w9WgXcQ', 18, 1),
(2, 'POO en Java', 'Clases, objetos, herencia y polimorfismo', 'dQw4w9WgXcQ', 40, 2),
(2, 'Collections Framework', 'ArrayList, HashMap, Set y más', 'dQw4w9WgXcQ', 30, 3),
(2, 'Manejo de Excepciones', 'Try-catch y gestión de errores', 'dQw4w9WgXcQ', 25, 4);

-- Insertar lecciones para JavaScript (curso_id = 4)
INSERT INTO lecciones (curso_id, titulo, descripcion, youtube_url, duracion_minutos, orden) VALUES
(4, 'Fundamentos de JavaScript', 'Variables, operadores y tipos de datos', 'dQw4w9WgXcQ', 20, 1),
(4, 'Funciones y Scope', 'Funciones, closures y ámbito de variables', 'dQw4w9WgXcQ', 30, 2),
(4, 'DOM Manipulation', 'Interactuar con elementos HTML desde JavaScript', 'dQw4w9WgXcQ', 35, 3),
(4, 'ES6+ Features', 'Arrow functions, destructuring, spread operator', 'dQw4w9WgXcQ', 28, 4),
(4, 'Async JavaScript', 'Promises, async/await y manejo asíncrono', 'dQw4w9WgXcQ', 40, 5);

SELECT 'Datos de prueba insertados correctamente!' as Resultado;
