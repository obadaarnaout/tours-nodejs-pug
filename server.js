const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE
            .replace('<DATABASE_USERNAME>',process.env.DATABASE_USERNAME)
            .replace('<DATABASE_PASSWORD>',process.env.DATABASE_PASSWORD)
            .replace('<DATABASE_NAME>',process.env.DATABASE_NAME);

mongoose.connect(DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  }).then(con => {
    console.log('Successfully connected to database');
  })



const port = process.env.PORT;

const server = app.listen(port,() => {
    console.log('app started');
});

process.on('unhandledRejection',err => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});