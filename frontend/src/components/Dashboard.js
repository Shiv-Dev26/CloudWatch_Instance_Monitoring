import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const metricOptions = ["CPUUtilization", "NetworkIn", "NetworkOut", "DiskReadOps", "DiskWriteOps"];
const timeRangeOptions = ["1h", "6h", "12h", "24h", "7d", "30d"];

export default function CloudWatchDashboard() {
  const [instanceId, setInstanceId] = useState("");
  const [region, setRegion] = useState("");
  const [metric, setMetric] = useState("CPUUtilization");
  const [timeRange, setTimeRange] = useState("1h");
  const [metrics, setMetrics] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [minYValue, setMinYValue] = useState(0);
  const [maxYValue, setMaxYValue] = useState(12);

  // Calculate the unit based on the metric
  const getMetricUnit = () => {
    switch(metric) {
      case "CPUUtilization": return "%";
      case "NetworkIn":
      case "NetworkOut": return "Bytes";
      case "DiskReadOps":
      case "DiskWriteOps": return "Count";
      default: return "";
    }
  };

  const fetchMetrics = async () => {
    if (!instanceId || !region) {
      setError("Instance ID and Region are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use the correct API endpoint
      const response = await axios.post("http://localhost:5000/api/metrics", {
        instanceId,
        region,
        metric,
        timeRange,
      });

      const { metrics = [], predictions = [] } = response.data;

      // Sort data by timestamp
      const sortedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp);
      const sortedPredictions = [...predictions].sort((a, b) => a.timestamp - b.timestamp);

      // Calculate min and max for Y axis
      const allValues = [...sortedMetrics.map(m => m.value), ...sortedPredictions.map(p => p.value)];
      if (allValues.length > 0) {
        const min = Math.max(0, Math.floor(Math.min(...allValues) * 0.9));
        const max = Math.ceil(Math.max(...allValues) * 1.1);
        setMinYValue(min);
        setMaxYValue(max);
      }

      setMetrics(sortedMetrics);
      setPredictions(sortedPredictions);
      console.log("✅ API Response:", response.data);
    } catch (err) {
      console.error("❌ Error fetching metrics:", err);
      setError(
        err.response?.data?.error || 
        "Failed to fetch metrics. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: darkMode ? "#0d1b2a" : "#f8fafc",
        color: darkMode ? "#f1f5f9" : "#1e293b",
        padding: "20px",
        width: "100%",
        boxSizing: "border-box",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        width: "100%", 
        maxWidth: "1200px",
        marginBottom: "20px"
      }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "8px 16px",
            backgroundColor: darkMode ? "#f1f5f9" : "#334155",
            color: darkMode ? "#0f172a" : "#f1f5f9",
            fontSize: "14px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background-color 0.3s, color 0.3s",
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <h2 style={{ 
        fontSize: "28px", 
        fontWeight: "bold", 
        color: darkMode ? "#38bdf8" : "#0284c7", 
        marginBottom: "24px",
        textAlign: "center"
      }}>
        AWS CloudWatch Metrics Dashboard
      </h2>

      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "16px", 
        width: "100%", 
        maxWidth: "500px",
        marginBottom: "32px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="instanceId" style={{ fontSize: "14px", marginBottom: "4px" }}>
            Instance ID
          </label>
          <input 
            id="instanceId"
            type="text" 
            placeholder="e.g., i-0123456789abcdef0" 
            value={instanceId} 
            onChange={(e) => setInstanceId(e.target.value)} 
            style={{ 
              padding: "12px", 
              borderRadius: "8px", 
              backgroundColor: darkMode ? "#1e293b" : "white", 
              color: darkMode ? "white" : "#0f172a", 
              fontSize: "16px", 
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              outline: "none" 
            }} 
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="region" style={{ fontSize: "14px", marginBottom: "4px" }}>
            AWS Region
          </label>
          <input 
            id="region"
            type="text" 
            placeholder="e.g., us-east-1" 
            value={region} 
            onChange={(e) => setRegion(e.target.value)} 
            style={{ 
              padding: "12px", 
              borderRadius: "8px", 
              backgroundColor: darkMode ? "#1e293b" : "white", 
              color: darkMode ? "white" : "#0f172a", 
              fontSize: "16px", 
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              outline: "none" 
            }} 
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="metric" style={{ fontSize: "14px", marginBottom: "4px" }}>
            Metric
          </label>
          <select 
            id="metric"
            value={metric} 
            onChange={(e) => setMetric(e.target.value)} 
            style={{ 
              padding: "12px", 
              borderRadius: "8px", 
              backgroundColor: darkMode ? "#1e293b" : "white", 
              color: darkMode ? "white" : "#0f172a", 
              fontSize: "16px", 
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              outline: "none" 
            }}
          >
            {metricOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="timeRange" style={{ fontSize: "14px", marginBottom: "4px" }}>
            Time Range
          </label>
          <select 
            id="timeRange"
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)} 
            style={{ 
              padding: "12px", 
              borderRadius: "8px", 
              backgroundColor: darkMode ? "#1e293b" : "white", 
              color: darkMode ? "white" : "#0f172a", 
              fontSize: "16px", 
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              outline: "none" 
            }}
          >
            {timeRangeOptions.map((option) => (
              <option key={option} value={option}>
                Last {option.replace("h", " Hours").replace("d", " Days")}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={fetchMetrics} 
          disabled={loading} 
          style={{ 
            padding: "14px", 
            backgroundColor: loading ? "#64748b" : "#0284c7", 
            color: "white", 
            fontSize: "16px", 
            fontWeight: "bold", 
            cursor: loading ? "not-allowed" : "pointer", 
            border: "none",
            borderRadius: "8px", 
            transition: "0.3s", 
            boxShadow: darkMode ? "none" : "0px 4px 6px rgba(0, 0, 0, 0.1)",
            marginTop: "8px"
          }}
        >
          {loading ? "Fetching..." : "Fetch Metrics"}
        </button>
      </div>

      {error && (
        <div style={{ 
          color: "#ef4444", 
          backgroundColor: darkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(254, 226, 226, 0.8)", 
          padding: "12px 16px", 
          borderRadius: "8px", 
          marginBottom: "24px",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {(metrics.length > 0 || predictions.length > 0) && (
        <div style={{ 
          width: "100%", 
          maxWidth: "1200px", 
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center"
        }}>
          {/* Actual Metrics Chart */}
          <div style={{ 
            flex: "1 1 45%", 
            minWidth: "400px",
            backgroundColor: darkMode ? "#1e293b" : "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: darkMode ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ 
              fontSize: "18px", 
              marginBottom: "16px", 
              color: "#38bdf8",
              fontWeight: "500"
            }}>
              {metric} ({getMetricUnit()}) - Actual Values
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={metrics}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke={darkMode ? "#94a3b8" : "#64748b"} 
                  tickFormatter={formatTimestamp}
                  label={{ 
                    value: 'Time', 
                    position: 'insideBottomRight', 
                    offset: -10,
                    fill: darkMode ? "#94a3b8" : "#64748b"
                  }}
                />
                <YAxis 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  domain={[minYValue, maxYValue]}
                  label={{ 
                    value: `${metric} (${getMetricUnit()})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: darkMode ? "#94a3b8" : "#64748b"
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? "#0f172a" : "white",
                    color: darkMode ? "#f1f5f9" : "#0f172a",
                    border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0"
                  }}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Actual" 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: "#38bdf8" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "16px",
              fontSize: "14px",
              color: darkMode ? "#94a3b8" : "#64748b"
            }}>
              <div>Start: {metrics.length > 0 ? new Date(metrics[0].timestamp).toLocaleString() : "N/A"}</div>
              <div>End: {metrics.length > 0 ? new Date(metrics[metrics.length - 1].timestamp).toLocaleString() : "N/A"}</div>
            </div>
          </div>

          {/* Predicted Metrics Chart */}
          <div style={{ 
            flex: "1 1 45%", 
            minWidth: "400px",
            backgroundColor: darkMode ? "#1e293b" : "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: darkMode ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ 
              fontSize: "18px", 
              marginBottom: "16px", 
              color: "#f59e0b",
              fontWeight: "500"
            }}>
              {metric} ({getMetricUnit()}) - Predicted Values
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={predictions}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke={darkMode ? "#94a3b8" : "#64748b"} 
                  tickFormatter={formatTimestamp}
                  label={{ 
                    value: 'Time', 
                    position: 'insideBottomRight', 
                    offset: -10,
                    fill: darkMode ? "#94a3b8" : "#64748b"
                  }}
                />
                <YAxis 
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  domain={[minYValue, maxYValue]}
                  label={{ 
                    value: `${metric} (${getMetricUnit()})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: darkMode ? "#94a3b8" : "#64748b"
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? "#0f172a" : "white",
                    color: darkMode ? "#f1f5f9" : "#0f172a",
                    border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0"
                  }}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Predicted" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: "#f59e0b" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "16px",
              fontSize: "14px",
              color: darkMode ? "#94a3b8" : "#64748b"
            }}>
              <div>Start: {predictions.length > 0 ? new Date(predictions[0].timestamp).toLocaleString() : "N/A"}</div>
              <div>End: {predictions.length > 0 ? new Date(predictions[predictions.length - 1].timestamp).toLocaleString() : "N/A"}</div>
            </div>
          </div>
        </div>
      )}

      {!loading && metrics.length === 0 && predictions.length === 0 && (
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          color: darkMode ? "#94a3b8" : "#64748b",
          backgroundColor: darkMode ? "#1e293b" : "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "800px"
        }}>
          No data to display. Please fetch metrics to see the charts.
        </div>
      )}
    </div>
  );
}
