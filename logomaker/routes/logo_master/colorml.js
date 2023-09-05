var express = require('express');
var router = express.Router({
    mergeParams: true
});

//var PythonShell = require('python-shell');


exports.post = function (req, res) {
  console.log('Server Side Connection Done!');
  payload = req.body;
  console.log(payload);
  var spawn = require("child_process").spawn;
  var process = spawn('python',["./pylab/compute_color.py", 
      payload.industry,
      payload.description,
      payload.AV_dict.luxury,
      payload.AV_dict.masculine,
      payload.AV_dict.modern]);
  
  process.stdout.on('data', function(data) {
    console.log(data.toString());
    console.log('Data Recieved');
    res.send(data.toString()); 
  } ) 
};
