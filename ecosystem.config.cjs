// PM2 Ecosystem Configuration
// Start with: pm2 start ecosystem.config.cjs
// Or:         pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name:         'sos-backend',
      script:       './backend/server.js',
      cwd:          '/var/www/sosportal',
      instances:    1,               // single instance for internal use
      exec_mode:    'fork',
      watch:        false,           // do not auto-reload on file change in production
      max_memory_restart: '512M',

      env_production: {
        NODE_ENV: 'production',
        PORT:     3001,
      },

      // Logging
      log_date_format:  'YYYY-MM-DD HH:mm:ss',
      out_file:  '/var/log/sos-portal/out.log',
      error_file:'/var/log/sos-portal/error.log',
      merge_logs: true,

      // Auto-restart settings
      autorestart:     true,
      restart_delay:   3000,         // wait 3s before restarting after crash
      max_restarts:    10,
      min_uptime:      '5s',
    },
  ],
};
