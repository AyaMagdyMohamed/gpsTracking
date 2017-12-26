var mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/gpsTracking', function (err, database) {
  if (err) {
    console.log('error connecting to to db ')
  } else {
    console.log('connected to db')
  }
})

module.exports = mongoose
