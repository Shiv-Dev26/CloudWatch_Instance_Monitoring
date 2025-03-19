const express = require("express");
const cors = require("cors");
const tf = require("@tensorflow/tfjs"); // TensorFlow.js for AI
const { CloudWatchClient, GetMetricStatisticsCommand } = require("@aws-sdk/client-cloudwatch");
const { performance } = require('node:perf_hooks');
require("dotenv").config();

const router = express.Router();

// Middleware
router.use(express.json());
router.use(cors());

// Route to Fetch Metrics + AI Predictions
router.post("/", async (req, res) => {
    const startTime = performance.now();
    const { instanceId, region, metric, timeRange } = req.body;

    if (!instanceId || !region || !metric || !timeRange) {
        return res.status(400).json({ error: "Missing required parameters: instanceId, region, metric, timeRange" });
    }

    try {
        const timeDiff = getTimeRange(timeRange);
        if (!timeDiff) {
            return res.status(400).json({ error: "Invalid time range provided." });
        }

        const startDate = new Date(Date.now() - timeDiff);
        const endDate = new Date();

        console.log("📅 Start Time:", startDate.toISOString());
        console.log("📅 End Time:", endDate.toISOString());

        // Check for AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            return res.status(500).json({ error: "AWS credentials not configured" });
        }

        const cloudwatch = new CloudWatchClient({
            region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        const period = getPeriod(timeRange);
        const params = {
            MetricName: metric,
            Namespace: "AWS/EC2",
            Dimensions: [{ Name: "InstanceId", Value: instanceId }],
            StartTime: startDate,
            EndTime: endDate,
            Period: period,
            Statistics: ["Average"],
            Unit: getMetricUnit(metric),
        };

        const command = new GetMetricStatisticsCommand(params);
        const data = await cloudwatch.send(command);

        // Handle case when no datapoints are returned
        if (!data.Datapoints || data.Datapoints.length === 0) {
            return res.json({
                instanceId,
                metric,
                timeRange,
                metrics: [],
                predictions: []
            });
        }

        let sortedMetrics = data.Datapoints.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

        // Extract timestamps & metric values
        let timestamps = sortedMetrics.map((dp) => new Date(dp.Timestamp).getTime());
        let values = sortedMetrics.map((dp) => dp.Average);

        console.log(`📊 CloudWatch Metrics: ${values.length} datapoints received`);

        // AI Predictions - only if we have enough data
        let predictions = [];
        if (values.length >= 3) { // Need at least 3 points for meaningful prediction
            predictions = await predictFutureMetrics(values, timestamps, metric);
        }

        const endTime = performance.now();
        console.log(`⏱️ Request processing time: ${(endTime - startTime).toFixed(2)}ms`);

        res.json({
            instanceId,
            metric,
            timeRange,
            metrics: sortedMetrics.map(dp => ({
                timestamp: new Date(dp.Timestamp).getTime(),
                value: dp.Average,
                type: "Actual"
            })),
            predictions
        });
    } catch (error) {
        console.error("❌ Error fetching CloudWatch metrics:", error);
        res.status(500).json({ error: error.message || "Failed to fetch metrics" });
    }
});

// AI Model for Predictions
async function predictFutureMetrics(values, timestamps, metric) {
    if (values.length < 3) return []; // Need at least 3 points for meaningful prediction

    try {
        console.log("🔴 Training New AI Model...");
        performance.mark('training-start');

        // Normalize data for better training
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        
        // Prevent division by zero
        const normalizedValues = range > 0 
            ? values.map(v => (v - min) / range) 
            : values.map(() => 0.5);

        // Create and configure the model
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 12, inputShape: [1], activation: "relu" }));
        model.add(tf.layers.dense({ units: 8, activation: "relu" }));
        model.add(tf.layers.dense({ units: 1 }));

        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: "meanSquaredError",
        });

        // Prepare training data
        const xs = tf.tensor2d(Array.from({ length: values.length }, (_, i) => [i / values.length]));
        const ys = tf.tensor2d(normalizedValues.map(v => [v]));

        // Train the model with early stopping
        await model.fit(xs, ys, { 
            epochs: 200,
            batchSize: Math.min(32, values.length),
            shuffle: true,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 50 === 0) {
                        console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                    }
                }
            }
        });

        performance.mark('training-end');
        performance.measure('Model Training Time', 'training-start', 'training-end');
        console.log(`⏱️ Model training completed in ${performance.getEntriesByName('Model Training Time')[0].duration.toFixed(2)}ms`);

        // Predict next 5 steps
        let predictions = [];
        let lastTimestamp = timestamps[timestamps.length - 1];

        // Calculate average time interval between data points
        const timeIntervals = [];
        for (let i = 1; i < timestamps.length; i++) {
            timeIntervals.push(timestamps[i] - timestamps[i-1]);
        }
        const avgInterval = timeIntervals.length > 0 
            ? timeIntervals.reduce((sum, val) => sum + val, 0) / timeIntervals.length 
            : 60000; // Default to 1-minute interval

        for (let i = 1; i <= 5; i++) {
            const nextIndex = (values.length - 1 + i) / values.length;
            const predictionTensor = model.predict(tf.tensor2d([[nextIndex]]));
            let predictionValue = predictionTensor.dataSync()[0];
            
            // Denormalize the prediction
            if (range > 0) {
                predictionValue = predictionValue * range + min;
            }
            
            // Ensure prediction is not negative for metrics that can't be negative
            if (["CPUUtilization", "NetworkIn", "NetworkOut", "DiskReadOps", "DiskWriteOps"].includes(metric)) {
                predictionValue = Math.max(0, predictionValue);
            }
            
            // For percentage metrics, cap at 100%
            if (metric === "CPUUtilization") {
                predictionValue = Math.min(100, predictionValue);
            }

            // Calculate next timestamp
            lastTimestamp += avgInterval;

            predictions.push({
                timestamp: lastTimestamp,
                value: predictionValue,
                type: "Prediction"
            });
        }

        console.log(`🔮 AI Predictions: Generated ${predictions.length} predictions`);
        return predictions;
    } catch (error) {
        console.error("⚠️ AI Prediction Error:", error);
        return [];
    }
}

// Helper Functions
function getTimeRange(range) {
    const ranges = {
        "1h": 60 * 60 * 1000,  
        "6h": 6 * 60 * 60 * 1000,  
        "12h": 12 * 60 * 60 * 1000,  
        "24h": 24 * 60 * 60 * 1000,  
        "7d": 7 * 24 * 60 * 60 * 1000,  
        "30d": 30 * 24 * 60 * 60 * 1000,  
    };
    return ranges[range] || null; // Return null for invalid ranges
}

function getPeriod(range) {
    const periods = {
        "1h": 60,    // 1 minute for 1 hour
        "6h": 300,   // 5 minutes for 6 hours
        "12h": 600,  // 10 minutes for 12 hours
        "24h": 1800, // 30 minutes for 24 hours
        "7d": 3600,  // 1 hour for 7 days
        "30d": 21600 // 6 hours for 30 days
    };
    return periods[range] || 60;
}

function getMetricUnit(metric) {
    const units = {
        "CPUUtilization": "Percent",
        "NetworkIn": "Bytes",
        "NetworkOut": "Bytes",
        "DiskReadOps": "Count",
        "DiskWriteOps": "Count",
        "DiskReadBytes": "Bytes",
        "DiskWriteBytes": "Bytes",
        "MemoryUtilization": "Percent",
        "StatusCheckFailed": "Count"
    };
    return units[metric] || "None";
}

module.exports = router;
