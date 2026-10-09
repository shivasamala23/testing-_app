import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Flame, 
  Database, 
  Layers, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu,
  RefreshCw,
  X
} from 'lucide-react';

export default function ScaleSimulator({ 
  posts, 
  onSimulateBatchLikes, 
  telemetryLogs,
  isOpen, 
  onClose 
}) {
  const [isFirehoseActive, setIsFirehoseActive] = useState(false);
  const [architectureMode, setArchitectureMode] = useState('buffered'); // 'buffered' (Redis+Kafka) vs 'direct_db'
  const [qps, setQps] = useState(1420);
  const [redisHitRate, setRedisHitRate] = useState(99.6);
  const [dbWriteLoad, setDbWriteLoad] = useState(12); // % load
  const [latency, setLatency] = useState(4.2); // ms
  const [kafkaQueueDepth, setKafkaQueueDepth] = useState(340);
  const [totalHandledRequests, setTotalHandledRequests] = useState(14820000);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFirehoseActive) {
        // High traffic burst
        const burst = Math.floor(Math.random() * 8000 + 15000);
        setQps(burst);
        setTotalHandledRequests(prev => prev + burst);

        if (architectureMode === 'buffered') {
          // Redis + Kafka absorption: DB is safe!
          setLatency(Math.floor(Math.random() * 3 + 4)); // 4-7ms
          setRedisHitRate(99.8);
          setDbWriteLoad(Math.min(38, Math.floor(Math.random() * 8 + 25))); // batch writes keep DB cool
          setKafkaQueueDepth(Math.floor(Math.random() * 2000 + 4000));
        } else {
          // Direct DB hammer: DB crashes / spikes!
          setLatency(Math.floor(Math.random() * 120 + 380)); // 380ms+ lag
          setRedisHitRate(12.4);
          setDbWriteLoad(98); // RED ALERT
          setKafkaQueueDepth(0);
        }

        // Fire mock likes to the top viral post
        onSimulateBatchLikes('post_viral_01', Math.floor(burst / 25));
      } else {
        // Baseline traffic
        const baseQps = Math.floor(Math.random() * 400 + 1200);
        setQps(baseQps);
        setTotalHandledRequests(prev => prev + baseQps);
        setLatency(3.8 + Number((Math.random() * 0.8).toFixed(1)));
        setRedisHitRate(99.4);
        setDbWriteLoad(14);
        setKafkaQueueDepth(120 + Math.floor(Math.random() * 50));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFirehoseActive, architectureMode]);

  if (!isOpen) return null;

  return (
    <div className="scale-telemetry-drawer">
      <div className="telemetry-header">
        <div className="telemetry-title-group">
          <Activity size={20} className="telemetry-glow-icon" />
          <h3>High-Scale Distributed Telemetry</h3>
          <span className="live-badge">REAL-TIME ENGINE</span>
        </div>
        <button className="telemetry-close-btn" onClick={onClose} aria-label="Close telemetry">
          <X size={20} />
        </button>
      </div>

      <div className="telemetry-content">
        {/* Architecture Mode Selector */}
        <div className="telemetry-section arch-selector">
          <div className="section-label">Architecture Pipeline:</div>
          <div className="arch-toggle-buttons">
            <button 
              className={`arch-btn ${architectureMode === 'buffered' ? 'selected' : ''}`}
              onClick={() => setArchitectureMode('buffered')}
            >
              <ShieldCheck size={16} />
              <div>
                <strong>Redis In-Memory + Kafka Write-Back</strong>
                <span>Atomic $O(1)$ operations + 500ms bulk persistence</span>
              </div>
            </button>

            <button 
              className={`arch-btn dangerous ${architectureMode === 'direct_db' ? 'selected' : ''}`}
              onClick={() => setArchitectureMode('direct_db')}
            >
              <AlertTriangle size={16} />
              <div>
                <strong>Direct-to-Database Writes (Unbuffered)</strong>
                <span>Row locks under 10k+ QPS burst (causes DB failure)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Live Gauges Grid */}
        <div className="telemetry-grid">
          {/* Gauge 1: QPS */}
          <div className="telemetry-card">
            <div className="card-top">
              <span className="metric-title">Traffic Ingestion</span>
              <Cpu size={16} />
            </div>
            <div className="metric-value-row">
              <span className="metric-huge">{qps.toLocaleString()}</span>
              <span className="metric-unit">QPS</span>
            </div>
            <div className="metric-bar-track">
              <div 
                className="metric-bar-fill qps-bar" 
                style={{ width: `${Math.min(100, (qps / 25000) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Gauge 2: Response Latency */}
          <div className={`telemetry-card ${latency > 150 ? 'danger-state' : ''}`}>
            <div className="card-top">
              <span className="metric-title">p99 Read/Write Latency</span>
              <Zap size={16} />
            </div>
            <div className="metric-value-row">
              <span className="metric-huge">{latency}</span>
              <span className="metric-unit">ms</span>
            </div>
            <span className={`status-tag ${latency < 20 ? 'good' : 'bad'}`}>
              {latency < 20 ? 'Optimal (Sub-10ms)' : 'DB Lock Contention!'}
            </span>
          </div>

          {/* Gauge 3: Redis Hit Ratio */}
          <div className="telemetry-card">
            <div className="card-top">
              <span className="metric-title">Redis Cache Hit Ratio</span>
              <Layers size={16} />
            </div>
            <div className="metric-value-row">
              <span className="metric-huge">{redisHitRate}%</span>
              <span className="metric-unit">hit rate</span>
            </div>
            <div className="metric-bar-track">
              <div 
                className="metric-bar-fill cache-bar" 
                style={{ width: `${redisHitRate}%` }} 
              />
            </div>
          </div>

          {/* Gauge 4: DB Write Load */}
          <div className={`telemetry-card ${dbWriteLoad > 85 ? 'danger-state' : ''}`}>
            <div className="card-top">
              <span className="metric-title">Primary DB Load</span>
              <Database size={16} />
            </div>
            <div className="metric-value-row">
              <span className="metric-huge">{dbWriteLoad}%</span>
              <span className="metric-unit">IOPS capacity</span>
            </div>
            <div className="metric-bar-track">
              <div 
                className={`metric-bar-fill ${dbWriteLoad > 85 ? 'danger-bar' : 'db-bar'}`} 
                style={{ width: `${dbWriteLoad}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Action Controls: Firehose simulation */}
        <div className="firehose-control-box">
          <div className="firehose-desc">
            <h4>Viral Post Like-Spike Simulator</h4>
            <p>
              Simulate millions of users instantly liking viral post <span className="highlight-tag">#nasa</span> (James Webb Telescope). Observe how cache absorbs the impact.
            </p>
          </div>
          <button 
            className={`firehose-toggle-btn ${isFirehoseActive ? 'active' : ''}`}
            onClick={() => setIsFirehoseActive(!isFirehoseActive)}
          >
            <Flame size={20} className={isFirehoseActive ? 'flame-anim' : ''} />
            {isFirehoseActive ? 'Stop Viral Firehose' : 'Launch 25,000 Likes/sec Firehose'}
          </button>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="pipeline-flow-diagram">
          <div className="flow-step">
            <span className="step-num">1</span>
            <span className="step-name">Edge CDN</span>
            <span className="step-sub">Cached Photos</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="step-num">2</span>
            <span className="step-name">API Gateway</span>
            <span className="step-sub">Token Auth</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step active-step">
            <span className="step-num">3</span>
            <span className="step-name">Redis Cluster</span>
            <span className="step-sub">Atomic In-Memory Set</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="step-num">4</span>
            <span className="step-name">Kafka Topic</span>
            <span className="step-sub">Buffered Queue</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="step-num">5</span>
            <span className="step-name">Postgres Shard</span>
            <span className="step-sub">Batched Flush (500ms)</span>
          </div>
        </div>

        {/* Live Event Stream Log */}
        <div className="telemetry-event-log">
          <div className="log-header">
            <span>Live Distributed Event Stream</span>
            <span className="log-counter">{totalHandledRequests.toLocaleString()} events processed</span>
          </div>
          <div className="log-scroll">
            {telemetryLogs.slice(-6).map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className="log-type">{log.type}</span>
                <span className="log-target">{log.target}</span>
                <span className="log-latency">{log.latency}ms</span>
                <span className="log-strategy">{log.strategy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
