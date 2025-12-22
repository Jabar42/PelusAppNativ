/**
 * Mock para react-native-svg/lib/module/lib/extract/transformToRn.js
 * 
 * Este archivo tiene un problema de ES Modules (usa module.exports en lugar de export)
 * Este mock proporciona las exportaciones necesarias en formato ES Modules
 * 
 * CRÍTICO: Debe exportar 'parse' como named export para que extractTransform.js lo encuentre
 */

// Exportar las funciones que se esperan desde transformToRn
// extractTransform.js importa como: import { parse as parseTransformSvgToRnStyle } from './transformToRn'
export function parse(transform) {
  // Mock simple - devolver un objeto de transformación básico
  if (!transform || typeof transform !== 'string') {
    return {};
  }
  
  // Parsear transformaciones SVG básicas (translate, scale, rotate, etc.)
  const result = {};
  const transforms = transform.match(/(\w+)\(([^)]+)\)/g) || [];
  
  transforms.forEach((t) => {
    const match = t.match(/(\w+)\(([^)]+)\)/);
    if (match) {
      const [, type, values] = match;
      const nums = values.split(/[,\s]+/).map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      
      switch (type) {
        case 'translate':
          result.translateX = nums[0] || 0;
          result.translateY = nums[1] || nums[0] || 0;
          break;
        case 'scale':
          result.scaleX = nums[0] || 1;
          result.scaleY = nums[1] || nums[0] || 1;
          break;
        case 'rotate':
          result.rotation = nums[0] || 0;
          break;
        default:
          // Ignorar otros tipos de transformación
          break;
      }
    }
  });
  
  return result;
}

// Exportar como named export (requerido por extractTransform.js)
export { parse as parseTransformSvgToRnStyle };

// Exportar como default también para compatibilidad
export default {
  parse,
  parseTransformSvgToRnStyle: parse,
};






