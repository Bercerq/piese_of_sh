module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "dashboard",
      script    : "build/rtb-server.bundle.js",
      env: {
        APP_PORT: 8086,
        MEM_CACHED_HOSTS: [ "127.0.0.1:11211" ],
        BACKEND: "https://api-dev.optoutadvertising.com/noax2",
        BACKEND_TIMEOUT: 60000,
        ADMIN_XBLC_SERVER: "https://dev-admin.xb.lc",
        XBLC_SERVER: "https://dev.xb.lc",
        SERVER_URL: "https://dev-dashboard-v2.adscience.nl"
      },
      env_production : {
        NODE_ENV: "production",
        APP_PORT: 8084,
        MEM_CACHED_HOSTS: [ "127.0.0.1:11211" ],
        BACKEND: "https://api.optoutadvertising.com/noax2",
        BACKEND_TIMEOUT: 60000,
        ADMIN_XBLC_SERVER: "https://admin.xb.lc",
        XBLC_SERVER: "https://xb.lc",
        SERVER_URL: "https://ams-dashboard.adscience.nl"
      }
    }
  ]
}