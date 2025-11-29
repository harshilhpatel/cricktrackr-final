import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const metrics = ['runs', 'hundreds', 'fifties', 'battingAverage', 'wickets', 'strikeRate'];

export default function PlayerComparePage() {
  const [players, setPlayers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [leftId, setLeftId] = useState('');
  const [rightId, setRightId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/players');
        setPlayers(res.data || []);
        if (res.data?.length) {
          setLeftId(res.data[0]._id);
          setRightId(res.data[1]?._id || res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load players');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPlayers = useMemo(() => {
    // Optional role filter to narrow dropdowns.
    if (roleFilter === 'all') return players;
    return players.filter((p) => (p.role || '').toLowerCase() === roleFilter.toLowerCase());
  }, [players, roleFilter]);

  const left = players.find((p) => p._id === leftId);
  const right = players.find((p) => p._id === rightId);

  const normalized = useMemo(() => {
    const maxVals = {};
    metrics.forEach((m) => {
      maxVals[m] = Math.max(...players.map((p) => Number(p[m]) || 0), 1);
    });
    // Normalize shapes to each metric max so the radar is readable at any scale.
    const shape = (player) =>
      metrics.map((m) => {
        const val = Number(player?.[m]) || 0;
        return Math.max(0.05, (val / maxVals[m]));
      });
    return { leftShape: shape(left || {}), rightShape: shape(right || {}) };
  }, [left, right, players]);

  const radarPoints = (shape, radius = 120) => {
    const step = (2 * Math.PI) / shape.length;
    return shape
      .map((r, idx) => {
        const angle = step * idx - Math.PI / 2;
        const x = radius * r * Math.cos(angle) + radius;
        const y = radius * r * Math.sin(angle) + radius;
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Player Comparison</div>
            <div className="section-subtitle">Select two players, filter by role, and view radar stats.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select className="input input-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
              <option value="Wicket-Keeper">Wicket-Keeper</option>
            </select>
          </div>
        </div>
      </section>

      {loading && <div>Loading players...</div>}
      {error && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{error}</div>}

      {!loading && !error && (
        <div className="grid grid-2" style={{ alignItems: 'stretch' }}>
          <div className="card">
            <div className="card-meta" style={{ marginBottom: '0.5rem' }}>Pick players</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <select className="input" value={leftId} onChange={(e) => setLeftId(e.target.value)}>
                {filteredPlayers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.team})
                  </option>
                ))}
              </select>
              <select className="input" value={rightId} onChange={(e) => setRightId(e.target.value)}>
                {filteredPlayers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.team})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <div className="card-title">{left?.name || 'Select player'}</div>
                <div className="card-meta">{left?.team}</div>
              </div>
              <div>
                <div className="card-title">{right?.name || 'Select player'}</div>
                <div className="card-meta">{right?.team}</div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="260" height="260" viewBox="0 0 240 240">
                <polygon
                  points={radarPoints(normalized.leftShape, 110)}
                  fill="rgba(34,197,94,0.25)"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <polygon
                  points={radarPoints(normalized.rightShape, 110)}
                  fill="rgba(59,130,246,0.2)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              </svg>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span className="badge" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  {left?.name || '—'}
                </span>
                <span className="badge" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>
                  {right?.name || '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-meta" style={{ marginBottom: '0.5rem' }}>Stat table</div>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>{left?.name || 'Player A'}</th>
                  <th>{right?.name || 'Player B'}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m}>
                    <td>{m}</td>
                    <td>{left?.[m] ?? '—'}</td>
                    <td>{right?.[m] ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
