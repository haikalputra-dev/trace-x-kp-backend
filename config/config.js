module.exports = {
    project_starter_db: {
        name: process.env.starter_database_name,
        username: process.env.starter_database_user,
        password: process.env.starter_database_password,
        host: process.env.starter_database_host,
        dialect: process.env.starter_database_dialect,
        port: process.env.starter_database_port,
        logging: false,

    },
    server: {
        port: process.env.Port
    },
    security: {
        salt: process.env.starter_salt

    }
}