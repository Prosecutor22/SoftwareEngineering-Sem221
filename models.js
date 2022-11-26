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

exports.MCPSchema = new mongoose.Schema({
  name: String,
  location: String,
});

exports.MCP = mongoose.model('MCPs', exports.MCPSchema);


exports.routeSchema = new mongoose.Schema({
  // fill this
});

exports.Route = mongoose.model('Routes', exports.routeSchema);

exports.collectorSchema = new mongoose.Schema({
  // fill this
});

exports.Collector = mongoose.model('Collectors', exports.collectorSchema);

exports.janitorSchema = new mongoose.Schema({
  // fill this
});

exports.Janitor = mongoose.model('janitors', exports.janitorSchema);

exports.trollerSchema = new mongoose.Schema({
  // fill this
});

exports.Troller = mongoose.model('trollers', exports.trollerSchema);

exports.vehicleSchema = new mongoose.Schema({
  // fill this
});

exports.Vehicle = mongoose.model('vehicles', exports.vehicleSchema);
