// Textos de marca configurables por despliegue. Los valores reales vienen de variables de entorno
// inyectadas en build/quasar.config.js > build.env (ver .env.example); estos son solo los defaults
// para desarrollo local. Ningún componente debería tener el nombre del sistema o de la institución
// escrito literal — todos importan de aquí.
//
// Para desplegar este mismo código para otra institución: definir estas variables antes del build
// (no se requiere tocar ningún archivo .vue). Los assets (logo, fondo, favicons) y los colores de
// marca se configuran aparte — ver BRANDING.md.

export const SYSTEM_NAME = process.env.SYSTEM_NAME || "Gestión Documental";
export const INSTITUTION_NAME =
  process.env.INSTITUTION_NAME || "Instituto Estatal Electoral de Nayarit";
export const INSTITUTION_SHORT_NAME = process.env.INSTITUTION_SHORT_NAME || "IEEN";
export const LOGIN_SUBTITLE = process.env.LOGIN_SUBTITLE || "Archivo — acceso al sistema";
export const FOOTER_TEXT =
  process.env.FOOTER_TEXT || "© Unidad Técnica de Informática y Estadística";

// Firmante de la Cédula de préstamo del archivo institucional (Anexo 11). A diferencia de lo
// anterior, esto es una firma real y debe mantenerse al día independientemente de si el sistema
// se reutiliza o no para otra institución.
export const ANEXO11_FIRMANTE_NOMBRE =
  process.env.ANEXO11_FIRMANTE_NOMBRE || "Jorge Arturo Langarica Zepeda";
export const ANEXO11_FIRMANTE_CARGO =
  process.env.ANEXO11_FIRMANTE_CARGO || "Coordinador de Archivo del IEEN";
