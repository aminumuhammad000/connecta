module.exports = {
    apps: [
        {
            name: "connecta-scraper",
            script: "dist/index.js",
            cron_restart: "0 2 * * *", // runs every 24 hours at 2 AM
            autorestart: false,
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
