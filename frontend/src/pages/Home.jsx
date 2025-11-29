import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { samplePlayers } from '../data/samplePlayers';

const fallbackMatches = [
  {
    id: 'feat-1',
    teams: ['India', 'Australia'],
    venue: 'Melbourne Cricket Ground',
    status: 'Upcoming • Sample',
    note: '2nd Test • Boxing Day special',
    startTime: '2024-12-26T07:30:00Z',
    matchType: 'test',
  },
  {
    id: 'feat-2',
    teams: ['England', 'Pakistan'],
    venue: 'Lord’s Cricket Ground',
    status: 'Live • Sample',
    note: 'ENG lead by 45 runs',
    startTime: '2024-10-15T09:30:00Z',
    matchType: 'odi',
  },
  {
    id: 'feat-3',
    teams: ['South Africa', 'New Zealand'],
    venue: 'Cape Town Stadium',
    status: 'Completed • Sample',
    note: 'SA won by 5 wkts',
    startTime: '2024-08-02T11:30:00Z',
    matchType: 't20',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState('');
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      const res = await axios.get('/api/matches');
      // Prefer live API data; fall back to samples if empty/error.
      setMatches(res.data || []);
      setMatchesError('');
    } catch (err) {
      console.error(err);
      setMatches([]);
      setMatchesError('Failed to load live matches');
    } finally {
      setMatchesLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      setPlayersLoading(true);
      const res = await axios.get('/api/players');
      // Pull user players; sample stars are merged later so the list never looks empty.
      setPlayers(res.data || []);
      setPlayersError('');
    } catch (err) {
      console.error(err);
      setPlayers([]);
      setPlayersError('Failed to load players');
    } finally {
      setPlayersLoading(false);
    }
  };

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
    // Prefer normalized teams array; fall back to legacy teamA/teamB/name.
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
    // Coarse status buckets to drive badges and filters.
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

  const displayMatches = matches.length ? matches.slice(0, 4) : fallbackMatches;
  const mergedPlayers = useMemo(() => {
    // Dedup DB + sample players so seeds/imports don't double-show.
    const seen = new Set();
    const merged = [];
    [...players, ...samplePlayers].forEach((p) => {
      const key = (p._id || p.id || p.name || '').toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(p);
    });
    return merged;
  }, [players]);
  const spotlightPlayers = mergedPlayers.slice(0, 6);
  const goToMatches = () => navigate('/matches');
  const goToPlayers = () => navigate('/players');

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Welcome, {user?.displayName || user?.email || 'Guest'}</div>
            <div className="section-subtitle">
              Track matches, manage players, and view stats in one clean dashboard.
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-title">Featured Matches</div>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/matches')}>
            More
          </button>
        </div>
        {matchesError && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{matchesError}</div>}
        <div className="grid grid-2">
          {matchesLoading && (
            <div className="card">
              <div className="card-title">Loading live matches...</div>
              <div className="card-meta">Pulling the latest fixtures.</div>
            </div>
          )}
          {!matchesLoading &&
            displayMatches.map((m) => {
              const category = categorizeStatus(m.status);
              // Card click opens modal with richer details.
              return (
                <div
                  key={m._id || m.id}
                  className="card match-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMatch(m)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedMatch(m)}
                >
                  <div className="card-title">{formatTeams(m)}</div>
                  <div className="card-meta">{m.venue || 'Venue TBA'}</div>
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
                  {m.note && <div className="card-meta">{m.note}</div>}
                </div>
              );
            })}
          {!matchesLoading && displayMatches.length === 0 && (
            <div className="card">
              <div className="card-title">No live matches yet</div>
              <div className="card-meta">Add fixtures or try again in a moment.</div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-title">Featured Players</div>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/players')}>
            More
          </button>
        </div>
        {playersError && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{playersError}</div>}
        <div className="grid grid-2">
          {playersLoading && (
            <div className="card">
              <div className="card-title">Loading players...</div>
            </div>
          )}
          {!playersLoading &&
            spotlightPlayers.map((p) => (
              <div key={p._id || p.id || p.name} className="card">
                <div className="card-title">{p.name}</div>
                <div className="card-meta">{p.team} • {p.role || 'Batsman'}</div>
                <div className="card-meta">
                  Runs: {p.runs ?? 0} • 100s: {p.hundreds ?? 0} • 50s: {p.fifties ?? 0} • Avg: {p.battingAverage ?? '—'}
                </div>
                <div className="card-meta">
                  Wickets: {p.wickets ?? 0} • SR: {p.strikeRate ?? '—'} • Econ: {p.economy ?? '—'}
                </div>
              </div>
            ))}
          {!playersLoading && spotlightPlayers.length === 0 && (
            <div className="card">
              <div className="card-title">No players yet</div>
              <div className="card-meta">Add your first player to get started.</div>
            </div>
          )}
        </div>
      </section>

      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{formatTeams(selectedMatch)}</div>
                <div className="modal-subtitle">{selectedMatch.venue}</div>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => setSelectedMatch(null)}>
                Close
              </button>
            </div>
            <div className="modal-content">
              <div className="match-detail-row">
                <span className="label-quiet">Date/Time</span>
                <span>{formatDate(selectedMatch.startTime || selectedMatch.date)}</span>
              </div>
              <div className="match-detail-row">
                <span className="label-quiet">Status</span>
                <span
                  className={`badge ${
                    categorizeStatus(selectedMatch.status) === 'live'
                      ? 'badge-live'
                      : categorizeStatus(selectedMatch.status) === 'completed'
                      ? 'badge-completed'
                      : 'badge-upcoming'
                  }`}
                >
                  {selectedMatch.status || 'Scheduled'}
                </span>
              </div>
              {formatScore(selectedMatch.score) && (
                <div className="match-detail-row">
                  <span className="label-quiet">Scores</span>
                  <span>{formatScore(selectedMatch.score)}</span>
                </div>
              )}
              {selectedMatch.result && (
                <div className="match-detail-row">
                  <span className="label-quiet">Result</span>
                  <span>{selectedMatch.result}</span>
                </div>
              )}
              {selectedMatch.matchType && (
                <div className="match-detail-row">
                  <span className="label-quiet">Format</span>
                  <span>{selectedMatch.matchType.toUpperCase()}</span>
                </div>
              )}
              {selectedMatch.note && (
                <div className="match-detail-row">
                  <span className="label-quiet">Notes</span>
                  <span>{selectedMatch.note}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
