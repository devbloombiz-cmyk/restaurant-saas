module.exports = {
  apps: [
    {
      name: "restaurant-saas-backend",
      cwd: "./apps/backend",
      script: "dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "350M",
      exp_backoff_restart_delay: 200,
      restart_delay: 2000,
      min_uptime: "30s",
      max_restarts: 20,
      time: true,
      out_file: "./logs/backend-out.log",
      error_file: "./logs/backend-error.log",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
