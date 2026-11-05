module.exports = {
  apps: [
    {
      name: "compass-web",
      script: "/home/ubuntu/apps/compass-website/current/server.js",
      cwd: "/home/ubuntu/apps/compass-website/current",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: "3009",
        HOSTNAME: "127.0.0.1",
        NODE_EXTRA_CA_CERTS: "/home/ubuntu/.postgresql/global-bundle.pem",
      },
    },
  ],
};
