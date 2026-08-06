module.exports = {
  apps: [
    {
      name: 'prakerin-fe',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      // Anda bisa mengganti 'max' dengan angka (misal: 2) jika RAM VPS terbatas
      instances: 'max', 
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
