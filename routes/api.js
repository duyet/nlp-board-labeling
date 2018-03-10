var express = require('express');
var router = express.Router();
var json2csv = require('json2csv').parse;

var Data = require('../utils/db').Data;

router.get('/fetch_data', function(req, res, next) {
  new Data().orderBy('content_length', 'ASC').fetchAll().then(data => {
    res.send(data);
  })
});

router.get('/report.csv', function(req, res, next) {
  new Data().orderBy('content_length', 'ASC').fetchAll().then(data => {
    res.attachment('report.csv');
    data = JSON.parse(JSON.stringify(data))
    data = json2csv(data);
    res.status(200).send(data);
  })
});

router.post('/set_label', function(req, res, next) {
  var id = req.body.id;
  var label = req.body.label;
  if (!id || !label) return res.status(400).send({error: 1});

  label = parseInt(label);
  new Data({id: id}).fetch().then(data => {
  	if (!data) return res.status(400).send({error: 1});
  	data.save({label: label}).then(x => {
      if (x) return res.send(x);
      else return res.status(400).send({error: 1});
    })
  	 
  })
});

module.exports = router;
