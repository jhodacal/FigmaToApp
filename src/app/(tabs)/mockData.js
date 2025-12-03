// mockData.js

/**
 * Estructura de datos simulada para los cursos.
 * Incluye información para las pantallas de Dashboard (Inicio) y Detalle de Curso.
 */
const courses = [
  {
    id: '1',
    title: 'Python',
    subtitle: 'Curso 1: Introducción a la programación',
    company: 'ImpulsaTech',
    logoIcon: '🐍',
    bannerAsset: 'placeholder_python_banner.png', // Placeholder
    periods: [
      { name: 'Python Básico', duration: '2 meses' },
      { name: 'Python Avanzado', duration: '2 meses' },
      { name: 'Proyectos', duration: '1 mes' },
    ],
    description: 'Empieza con Python y aprende a programar con este curso básico y rápido. Ideal para principiantes que buscan una base sólida en codificación.',
    learningObjectives: [
      'Aprenderás desde los fundamentos de la sintaxis de Python.',
      'Te familiarizarás con estructuras de datos, funciones y POO.',
      'Desarrollarás tus primeros proyectos prácticos y funcionales.',
      'Estarás listo para tomar cursos de Data Science o Web Backend.',
    ],
  },
  {
    id: '2',
    title: 'Java',
    subtitle: 'Curso 2: Desarrollo Empresarial con Java',
    company: 'EBSA',
    logoIcon: '☕',
    bannerAsset: 'placeholder_java_banner.png', // Placeholder
    periods: [
      { name: 'Java Fundamentos', duration: '3 meses' },
      { name: 'Spring Framework', duration: '3 meses' },
    ],
    description: 'Curso intensivo de Java enfocado en el desarrollo de aplicaciones empresariales. Aprende los patrones de diseño y la creación de APIs robustas.',
    learningObjectives: [
      'Dominarás la programación orientada a objetos en Java.',
      'Implementarás servicios RESTful utilizando Spring Boot.',
      'Conocerás bases de datos SQL y NoSQL con JPA/Hibernate.',
      'Estarás preparado para roles de Backend Developer.',
    ],
  },
  {
    id: '3',
    title: 'Excel',
    subtitle: 'Curso 3: Análisis de Datos y VBA',
    company: 'NTT DATA',
    logoIcon: '📊',
    bannerAsset: 'placeholder_excel_banner.png', // Placeholder
    periods: [
      { name: 'Excel Básico/Intermedio', duration: '1 mes' },
      { name: 'Fórmulas Avanzadas y Tablas Dinámicas', duration: '1 mes' },
      { name: 'VBA para Automatización', duration: '2 meses' },
    ],
    description: 'Convierte datos sin procesar en conocimientos prácticos. Este curso te llevará desde las funciones básicas hasta la automatización con VBA.',
    learningObjectives: [
      'Crearás informes dinámicos y tableros de control profesionales.',
      'Automatizarás tareas repetitivas usando macros y VBA.',
      'Aprenderás a manejar grandes volúmenes de datos de manera eficiente.',
    ],
  },
  {
    id: '4',
    title: 'Revit',
    subtitle: 'Curso 4: Introducción al Modelado BIM',
    company: 'INDRA GROUP',
    logoIcon: '📐',
    bannerAsset: 'placeholder_revit_banner.png', // Placeholder
    periods: [
      { name: 'Modelado Arquitectónico', duration: '3 meses' },
    ],
    description: 'Aprende a usar Revit para el diseño y documentación de proyectos de construcción bajo la metodología BIM.',
    learningObjectives: [
      'Crearás modelos arquitectónicos 3D detallados.',
      'Generarás planos de documentación precisos.',
      'Entenderás la colaboración en entornos BIM.',
    ],
  },
];
export default courses;
export const convenios = [
  { id: 'c1', name: 'NTT DATA', icon: '🌎' },
  { id: 'c2', name: 'EBSA', icon: '💻' },
  { id: 'c3', name: 'INDRA GROUP', icon: '🛡️' },
  { id: 'c4', name: 'TAC DIGITAL', icon: '💡' },
  { id: 'c5', name: 'Tech Peru', icon: '🇵🇪' },
];

export const users = [
  { id: '1', username: 'admin', displayName: 'Admin' },
  { id: '2', username: 'user', displayName: 'User' },
];
