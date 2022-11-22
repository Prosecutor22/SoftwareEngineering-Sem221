var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-nqk:quangkhanh09@cluster0.iqely.mongodb.net/uwc')
  .then(() => console.log("Connect MongoDB successfully!"))
  .catch(error => console.log(error))

exports.backOfficerSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String
});

exports.BackOfficer = mongoose.model('backofficers', exports.backOfficerSchema);