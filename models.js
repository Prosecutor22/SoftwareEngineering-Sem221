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

exports.MCP = mongoose.model('mcps', exports.MCPSchema);


exports.routeSchema = new mongoose.Schema({
  id: String,
  path: String,
  vehicle_id: String
});

exports.Route = mongoose.model('Routes', exports.routeSchema);

exports.collectorSchema = new mongoose.Schema({
  id: String,
  name: String
});

exports.Collector = mongoose.model('Collectors', exports.collectorSchema);

exports.janitorSchema = new mongoose.Schema({
  id: String,
  name: String
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

exports.historySchema = new mongoose.Schema({
  Week: String,
  ID: String,
  Name: String,
  MCP: String,
  Troller: String,
  Route: String,
  Vehicle: String
});

exports.Histories = mongoose.model('histories', exports.historySchema);

exports.taskSchema = new mongoose.Schema({
  week: String,
  id: String,
  mcp: String,
  troller: String,
  route: String,
  vehicle: String
});

exports.Tasks = mongoose.model('tasks', exports.taskSchema);

exports.weekSchema = new mongoose.Schema({
  week: Number,
  status: String,
  lastModified: Date,
  startDay: Date
});

exports.weekTime = mongoose.model('week_timestamps', exports.weekSchema);
