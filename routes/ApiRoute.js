const express = require('express');
const { parse } = require('node-html-parser');
const NodeCache = require('node-cache');
const { fetchHTML, extractData } = require('../utils/ScrapeUtils');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

router.post('/scrape', async (req, res) => {
    try {
        const { url, parentSelector, childSelectors } = req.body;

        if (!url || typeof url !== 'string' || !parentSelector || typeof parentSelector !== 'string' || !Array.isArray(childSelectors)) {
            return res.status(400).json({ error: 'Invalid input: url, parentSelector, and childSelectors are required' });
        }

        const cacheKey = `${url}-${parentSelector}-${JSON.stringify(childSelectors)}`;
        
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const html = await fetchHTML(url);
        const root = parse(html);
        
        const dataArray = extractData(root, parentSelector, childSelectors);

        cache.set(cacheKey, dataArray);
        
        res.json(dataArray);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
