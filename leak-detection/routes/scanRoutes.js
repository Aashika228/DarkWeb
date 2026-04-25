const { Router } = require('express');
const { createScan, getScanResults, getHistory } = require('../controllers/scanController');
const router = Router();

router.post('/',        createScan);
router.get('/history',  getHistory);
router.get('/:scan_id', getScanResults);

module.exports = router;