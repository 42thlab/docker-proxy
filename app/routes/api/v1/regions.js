'use strict';

let express = require('express'),
  RegionSizeManager = require('../../../services').RegionSizeManager;

let router = express.Router();

router
.get('/', (err, res, next) => {
  let manager = new RegionSizeManager();

  manager.getRegions().then(regions => {
    res.json({ regions: regions });
  }).catch(next);
});

module.exports = router;
