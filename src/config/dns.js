// En algunos Windows Node usa un DNS local (127.0.0.1) que no resuelve registros SRV,
// y la conexión "mongodb+srv://" de Atlas falla con "querySrv ECONNREFUSED".
// Si eso pasa, usamos DNS públicos (Google y Cloudflare).
const dns = require('dns');

const servidores = dns.getServers();
if (servidores.length === 0 || servidores.every((s) => s.startsWith('127.') || s === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}
