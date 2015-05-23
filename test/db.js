var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.1.5/tmc', function (err) {
    if (err) {
        console.error('connect to %s error: ', config.MONGODB.db, err.message);
        process.exit(1);
    }
});
