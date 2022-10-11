const errorHandler = require('./../controllers/errorsController');
module.exports = fn => {
    return (req,res,next) => {
        fn(req,res,next).catch((err) => {
            errorHandler(err,req,res,next);
        })
    }
}