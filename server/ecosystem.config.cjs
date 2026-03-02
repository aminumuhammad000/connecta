module.exports = {
    apps: [
        {
            name: 'server',
            script: 'npx',
            args: 'tsx src/app.ts',
            cwd: '/var/www/connecta/server',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '4G',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
                NODE_OPTIONS: '--max-old-space-size=4096'
            },
            error_file: '/var/www/connecta/server/logs/err.log',
            out_file: '/var/www/connecta/server/logs/out.log',
            log_file: '/var/www/connecta/server/logs/combined.log',
            time: true
        }
    ]
};
