module.exports = {
    apps: [
        {
            name: 'connecta-server',
            script: 'npm',
            args: 'start',
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
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true
        }
    ]
};
