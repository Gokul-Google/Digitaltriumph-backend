const express = require('express');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const router = express.Router();

const analyticsClient = new BetaAnalyticsDataClient({
    keyFilename: 'path/to/your-service-account-file.json',
});

const PROPERTY_ID = 'YOUR_GA4_PROPERTY_ID';



router.get('/api/live-active-users', async (req, res) => {
  try {
    const [response] = await analyticsClient.runRealtimeReport({
      property: `properties/${PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';

    res.json({ activeUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Historical metrics (sessions, pageviews)
router.get('/metrics', async (req, res) => {
  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'pageviews' },
        { name: 'users' },
      ],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    });
    const data = response.rows.map(row => ({
      date: row.dimensionValues[0].value,
      sessions: row.metricValues[0].value,
      pageviews: row.metricValues[1].value,
      users: row.metricValues[2].value,
    }));
    res.json({ data });
      
  } catch (error) {
     console.error(error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
  }
);
module.exports = router;
