import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // all | live | upcoming | completed

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/matches');
      // API returns live + cached recent fixtures; sort/filter later.
      setMatches(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const formatDate = (value) => {
    if (!value) return 'TBD';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? value
      : d.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const formatTeams = (m) => {
    // Prefer normalized teams; otherwise stitch legacy fields or name.
    if (m.teams?.length) return m.teams.join(' vs ');
    if (m.teamA || m.teamB) return `${m.teamA || 'TBD'} vs ${m.teamB || 'TBD'}`;
    return m.name || 'Match';
  };

  const formatScore = (scoreArr = []) => {
    if (!Array.isArray(scoreArr) || scoreArr.length === 0) return null;
    return scoreArr
      .slice(0, 2)
      .map((s) => {
        const parts = [];
        if (s.inning) parts.push(s.inning);
        if (s.r !== undefined && s.w !== undefined) parts.push(`${s.r}/${s.w}`);
        if (s.o !== undefined) parts.push(`${s.o} ov`);
        return parts.join(' • ');
      })
      .filter(Boolean)
      .join(' | ');
  };

  const categorizeStatus = (statusText) => {
    const s = (statusText || '').toLowerCase();
    if (!s) return 'upcoming';
    if (
      s.includes('won') ||
      s.includes('lost') ||
      s.includes('abandon') ||
      s.includes('no result') ||
      s.includes('draw') ||
      s.includes('tie')
    ) {
      return 'completed';
    }
    if (
      s.includes('live') ||
      s.includes('stumps') ||
      s.includes('lunch') ||
      s.includes('tea') ||
      s.includes('session') ||
      s.includes('trail') ||
      s.includes('lead') ||
      s.includes('innings')
    ) {
      return 'live';
    }
    if (s.includes('scheduled') || s.includes('upcoming') || s.includes('start') || s.includes('match not started')) {
      return 'upcoming';
    }
    return 'live';
  };

  const totalOversForFormat = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('t20')) return 20;
    if (t.includes('odi') || t.includes('one day')) return 50;
    return 20;
  };

  const computeWinProbability = (m) => {
    // Lightweight chasing probability derived from RR, required RR, and wickets.
    const scores = Array.isArray(m.score) ? m.score : [];
    if (scores.length < 2) return null;
    const first = scores[0];
    const second = scores[1];
    if (first?.r === undefined || second?.r === undefined) return null;
    const totalOvers = totalOversForFormat(m.matchType || '');
    const target = (first.r || 0) + 1;
    const runsNeeded = target - (second.r || 0);
    const oversPlayed = Number(second.o) || 0;
    const oversRemaining = Math.max(totalOvers - oversPlayed, 0);
    if (runsNeeded <= 0) return { battingWin: 100, bowlingWin: 0 };
    if (oversRemaining <= 0) return { battingWin: 0, bowlingWin: 100 };
    const curRR = (second.r || 0) / Math.max(oversPlayed, 0.1);
    const reqRR = runsNeeded / Math.max(oversRemaining, 0.1);
    const wicketsInHand = 10 - (second.w || 0);
    const advantage = (curRR - reqRR) / (reqRR + 0.1) + 0.08 * (wicketsInHand - 5);
    let chasingWin = 0.5 + 0.25 * advantage;
    chasingWin = Math.min(0.97, Math.max(0.03, chasingWin));
    const bowlingWin = Math.round((1 - chasingWin) * 100);
    const battingWin = Math.round(chasingWin * 100);
    return { battingWin, bowlingWin };
  };

  const sortedMatches = [...matches].sort((a, b) => {
    // Ascending by start time so nearest matches appear first.
    const aDate = new Date(a.startTime || a.date || 0).getTime();
    const bDate = new Date(b.startTime || b.date || 0).getTime();
    return aDate - bDate;
  });

  const filteredMatches = sortedMatches.filter((m) => {
    const cat = categorizeStatus(m.status);
    return filter === 'all' ? true : cat === filter;
  });

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Matches</div>
            <div className="section-subtitle">
              Upcoming and completed fixtures stored in MongoDB.
            </div>
          </div>
        </div>
        <div className="filter-chips">
          {['all', 'live', 'upcoming', 'completed'].map((key) => (
            <button
              key={key}
              className={`chip ${filter === key ? 'chip-active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {loading && <div>Loading matches...</div>}
      {error && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{error}</div>}

      {!loading && !error && (
        <div className="grid grid-2">
          {filteredMatches.map((m) => {
            const category = categorizeStatus(m.status);
            const prob = category === 'live' ? computeWinProbability(m) : null;
            return (
            <div
              key={m._id || m.id}
              className="card match-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelected(m)}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(m)}
            >
              <div className="card-title">{formatTeams(m)}</div>
              <div className="card-meta">{m.venue}</div>
              <div className="card-meta match-meta-row">
                <span>{formatDate(m.startTime || m.date)}</span>
                <span
                  className={`badge ${
                    category === 'live'
                      ? 'badge-live'
                      : category === 'completed'
                      ? 'badge-completed'
                      : 'badge-upcoming'
                  }`}
                >
                  {m.status || category}
                </span>
              </div>
              {formatScore(m.score) && (
                <div className="card-meta match-score">{formatScore(m.score)}</div>
              )}
              {m.result && <div className="card-meta">{m.result}</div>}
              {prob && (
                <div className="card-meta">
                  Win Probability: {m.teamB || m.teams?.[1] || 'Chasing'} {prob.battingWin}% –{' '}
                  {m.teamA || m.teams?.[0] || 'Defending'} {prob.bowlingWin}%
                </div>
              )}
            </div>
          );
          })}
          {filteredMatches.length === 0 && (
            <div className="card">
              <div className="card-title">No matches yet</div>
              <div className="card-meta">
                Use the backend API or an admin tool to insert fixtures into the database.
              </div>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{formatTeams(selected)}</div>
                <div className="modal-subtitle">{selected.venue}</div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <div className="modal-content">
              <div className="match-detail-row">
                <span className="label-quiet">Date/Time</span>
                <span>{formatDate(selected.startTime || selected.date)}</span>
              </div>
              <div className="match-detail-row">
                <span className="label-quiet">Status</span>
                <span
                  className={`badge ${
                    categorizeStatus(selected.status) === 'live'
                      ? 'badge-live'
                      : categorizeStatus(selected.status) === 'completed'
                      ? 'badge-completed'
                      : 'badge-upcoming'
                  }`}
                >
                  {selected.status || 'Scheduled'}
                </span>
              </div>
              {formatScore(selected.score) && (
                <div className="match-detail-row">
                  <span className="label-quiet">Scores</span>
                  <span>{formatScore(selected.score)}</span>
                </div>
              )}
              {selected.result && (
                <div className="match-detail-row">
                  <span className="label-quiet">Result</span>
                  <span>{selected.result}</span>
                </div>
              )}
              {(() => {
                const probLive =
                  categorizeStatus(selected.status) === 'live' ? computeWinProbability(selected) : null;
                if (!probLive) return null;
                return (
                <div className="match-detail-row">
                  <span className="label-quiet">Win Probability</span>
                  <span>
                    {selected.teamB || selected.teams?.[1] || 'Chasing'} {probLive.battingWin}% –{' '}
                    {selected.teamA || selected.teams?.[0] || 'Defending'} {probLive.bowlingWin}%
                  </span>
                </div>
                );
              })()}
              {selected.matchType && (
                <div className="match-detail-row">
                  <span className="label-quiet">Format</span>
                  <span>{selected.matchType.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
