var config = {};

config.port = process.env.APP_PORT || 3001;
config.backend = process.env.BACKEND || 'https://api-dev.optoutadvertising.com/noax2';
config.timeout = process.env.BACKEND_TIMEOUT || 60000;
config.adServerUrl = process.env.XBLC_SERVER || "https://dev.xb.lc";
config.serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
config.useMemcached = false //process.env.HAS_MEM_CACHED || true;
config.dashboarduser = process.env.DASHBOARD_USER || "hoiikbenhetdashboard";
config.dashboardpass = process.env.DASHBOARD_PW || "qxkf9Eyqz63oixS1kKHG";
// try {
//   var hosts = JSON.parse(process.env.MEM_CACHED_HOSTS);
//   if (!Array.isArray(hosts)) {
//     throw new Error("configuration error: MEM_CACHED_HOSTS must be a valid JSON array");
//   }
//   config.memcachedHosts = hosts;
// } catch (err) {
//   console.warn(err);
// }



config.memcachedHosts = ["127.0.0.1:11211"];

module.exports = config;