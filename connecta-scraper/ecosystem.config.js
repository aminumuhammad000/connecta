module.exports = {
    apps: [
        {
            name: "connecta-scraper",
            script: "dist/index.js",
            cron_restart: "0 0 * * *", // runs every 24 hours at midnight
            autorestart: false,
            watch: false,
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
