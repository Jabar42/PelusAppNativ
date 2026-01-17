const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Excluir directorios corruptos de OpenTelemetry del escaneo de Metro
// Esto evita errores de I/O al escanear node_modules
const problematicPaths = [
  /node_modules\/@opentelemetry\/\.exporter-logs-otlp-http-.*\/node_modules\/@opentelemetry\/core\/build\/esnext\/baggage/,
  /node_modules\/@opentelemetry\/\.exporter-prometheus-.*\/node_modules\/@opentelemetry\/core\/build\/esm\/trace/,
];

// Agregar blockList para excluir estos directorios
config.resolver = config.resolver || {};
config.resolver.blockList = Array.isArray(config.resolver.blockList) 
  ? [...config.resolver.blockList, ...problematicPaths]
  : problematicPaths;

module.exports = withNativeWind(config, { input: './global.css' });





