import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function PlayerStatsPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/players');
      // Pull all players from Mongo to derive summaries.
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const totals = useMemo(() => {
    // Aggregate totals across all players in Mongo.
    if (!players.length) return { runs: 0, wickets: 0 };
    return players.reduce(
      (acc, p) => {
        acc.runs += p.runs || 0;
        acc.wickets += p.wickets || 0;
        return acc;
      },
      { runs: 0, wickets: 0 }
    );
  }, [players]);

  const topRunScorers = useMemo(() => {
    // Top 15 by runs.
    return [...players].sort((a, b) => (b.runs || 0) - (a.runs || 0)).slice(0, 15);
  }, [players]);

  const topWicketTakers = useMemo(() => {
    // Top 15 by wickets.
    return [...players].sort((a, b) => (b.wickets || 0) - (a.wickets || 0)).slice(0, 15);
  }, [players]);

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Player Stats</div>
            <div className="section-subtitle">
              Simple stats computed from your players collection in MongoDB.
            </div>
          </div>
        </div>
      </section>

      {loading && <div>Loading stats...</div>}
      {error && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{error}</div>}

      {!loading && !error && (
        <>
          <section className="section">
            <div className="grid grid-2">
              <div className="card">
                <div className="card-title">Total Runs</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 600 }}>{totals.runs}</div>
              </div>
              <div className="card">
                <div className="card-title">Total Wickets</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 600 }}>{totals.wickets}</div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="grid grid-2">
              <div className="card">
                <div className="card-title">Top Run Scorers</div>
                <div className="card-meta">Top 15 by total runs (international)</div>
                <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
                  {topRunScorers.map((p, idx) => (
                    <li key={p._id || idx} style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                      <strong style={{ marginRight: '0.4rem' }}>{idx + 1}.</strong>
                      {p.name} ({p.team}) • {p.runs} runs
                      <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                        {p.hundreds || 0} x 100s · {p.fifties || 0} x 50s · Avg {p.battingAverage ?? '—'}
                      </div>
                    </li>
                  ))}
                  {topRunScorers.length === 0 && (
                    <li style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No players yet.</li>
                  )}
                </ul>
              </div>
              <div className="card">
                <div className="card-title">Top Wicket Takers</div>
                <div className="card-meta">Top 15 by total wickets (international)</div>
                <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
                  {topWicketTakers.map((p, idx) => (
                    <li key={p._id || idx} style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                      <strong style={{ marginRight: '0.4rem' }}>{idx + 1}.</strong>
                      {p.name} ({p.team}) • {p.wickets} wickets
                    </li>
                  ))}
                  {topWicketTakers.length === 0 && (
                    <li style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No players yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div>
                <div className="section-title">All Players (Live API)</div>
                <div className="section-subtitle">Fetched from CricAPI via backend proxy (first 50).</div>
              </div>
            </div>
            {liveLoading && <div>Loading live players...</div>}
            {liveError && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{liveError}</div>}
            {!liveLoading && !liveError && (
              <div className="card">
                <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.5rem', padding: 0 }}>
                  {livePlayers.map((p) => (
                    <li key={p.id} style={{ fontSize: '0.9rem' }}>
                      <strong>{p.name}</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{p.country}</div>
                    </li>
                  ))}
                  {livePlayers.length === 0 && (
                    <li style={{ fontSize: '0.85rem', color: '#9ca3af' }}>No live players returned.</li>
                  )}
                </ul>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
