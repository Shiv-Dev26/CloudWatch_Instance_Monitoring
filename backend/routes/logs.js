const express = require('express');
const router = express.Router();

router.get('/:instanceId', async (req, res) => {
    try {
        const instanceId = req.params.instanceId;
        res.json({ instanceId, message: "Logs fetched successfully" });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
