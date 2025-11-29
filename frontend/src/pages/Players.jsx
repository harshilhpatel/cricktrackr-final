import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { samplePlayers } from '../data/samplePlayers';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedAttempted, setSeedAttempted] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    team: '',
    role: '',
    matches: 0,
    runs: 0,
    hundreds: 0,
    fifties: 0,
    battingAverage: 0,
    wickets: 0,
    strikeRate: 0,
    economy: 0,
  });

  const seedSamplePlayers = async () => {
    // Insert the static sample players into Mongo so every new user sees data.
    try {
      await Promise.all(
        samplePlayers.map((p) =>
          // Seed database with evergreen sample players if a new user has none.
          axios.post('/api/players', {
            name: p.name,
            team: p.team,
            role: p.role,
            matches: p.matches || 0,
            runs: p.runs || 0,
            hundreds: p.hundreds || 0,
            fifties: p.fifties || 0,
            battingAverage: p.battingAverage || 0,
            wickets: p.wickets || 0,
            strikeRate: p.strikeRate || 0,
            economy: p.economy || 0,
          })
        )
      );
    } catch (err) {
      console.error('Seed sample players failed:', err);
    }
  };

  const fetchPlayers = async () => {
    // Pull players; if empty on first load, seed then re-fetch to populate the table.
    try {
      setLoading(true);
      const res = await axios.get('/api/players');
      if (res.data?.length === 0 && !seedAttempted) {
        // If DB is empty (fresh user), seed sample players once to avoid a blank table.
        setSeedAttempted(true);
        await seedSamplePlayers();
        const seeded = await axios.get('/api/players');
        setPlayers(seeded.data || []);
      } else {
        setPlayers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p) => {
    // Load row into the inline edit form.
    setEditing(p._id);
    setEditForm({
      name: p.name || '',
      team: p.team || '',
      role: p.role || 'Batsman',
      matches: p.matches || 0,
      runs: p.runs || 0,
      hundreds: p.hundreds || 0,
      fifties: p.fifties || 0,
      battingAverage: p.battingAverage || 0,
      wickets: p.wickets || 0,
      strikeRate: p.strikeRate || 0,
      economy: p.economy || 0,
    });
  };

  const saveEdit = async () => {
    // Persist edits and reload the list.
    if (!editing) return;
    try {
      await axios.put(`/api/players/${editing}`, {
        ...editForm,
        matches: Number(editForm.matches) || 0,
        runs: Number(editForm.runs) || 0,
        hundreds: Number(editForm.hundreds) || 0,
        fifties: Number(editForm.fifties) || 0,
        battingAverage: Number(editForm.battingAverage) || 0,
        wickets: Number(editForm.wickets) || 0,
        strikeRate: Number(editForm.strikeRate) || 0,
        economy: Number(editForm.economy) || 0,
      });
      setEditing(null);
      fetchPlayers();
    } catch (err) {
      console.error(err);
      alert('Failed to update player');
    }
  };

  const deletePlayer = async (id) => {
    // Confirm, then delete; refresh the list after.
    if (!id || typeof id !== 'string') return;
    if (!window.confirm('Delete this player?')) return;
    try {
      await axios.delete(`/api/players/${id}`);
      fetchPlayers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete player');
    }
  };

  const teamFlag = (team) => {
    if (!team) return '';
    const name = team.toLowerCase();
    const map = {
      india: '🇮🇳',
      pakistan: '🇵🇰',
      bangladesh: '🇧🇩',
      'sri lanka': '🇱🇰',
      afghanistan: '🇦🇫',
      nepal: '🇳🇵',
      uae: '🇦🇪',
      oman: '🇴🇲',
      australia: '🇦🇺',
      'new zealand': '🇳🇿',
      england: '🏴',
      'south africa': '🇿🇦',
      zimbabwe: '🇿🇼',
      ireland: '🇮🇪',
      canada: '🇨🇦',
      usa: '🇺🇸',
      scotland: '🏴',
      netherlands: '🇳🇱',
      'hong kong': '🇭🇰',
      singapore: '🇸🇬',
      romania: '🇷🇴',
      austria: '🇦🇹'
    };
    return map[name] || '';
  };
  useEffect(() => {
    fetchPlayers();
  }, []);

  const combinedPlayers = useMemo(() => players, [players]);

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Players</div>
            <div className="section-subtitle">
              All players stored in MongoDB. Use &quot;Add Player&quot; to insert new records.
            </div>
          </div>
        </div>
      </section>

      {loading && <div>Loading players...</div>}
      {error && <div style={{ color: '#f97373', marginBottom: '0.75rem' }}>{error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Team</th>
                <th>Role</th>
                <th>Matches</th>
                <th>Runs</th>
                <th>100s</th>
                <th>50s</th>
                <th>Avg</th>
                <th>Wickets</th>
                <th>SR</th>
                <th>Econ</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combinedPlayers.map((p) => {
                const rowKey = p._id || p.id || p.name;
                return (
                  <tr key={rowKey}>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      p.name
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        value={editForm.team}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, team: e.target.value }))}
                      />
                    ) : (
                      <span className="flag-pill">
                        {teamFlag(p.team)} {p.team}
                      </span>
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <select
                        className="input input-sm"
                        value={editForm.role}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                      >
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-Rounder">All-Rounder</option>
                        <option value="Wicket-Keeper">Wicket-Keeper</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      p.role
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.matches}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, matches: e.target.value }))}
                      />
                    ) : (
                      p.matches
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.runs}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, runs: e.target.value }))}
                      />
                    ) : (
                      p.runs
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.hundreds}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, hundreds: e.target.value }))}
                      />
                    ) : (
                      p.hundreds
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.fifties}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, fifties: e.target.value }))}
                      />
                    ) : (
                      p.fifties
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        step="0.01"
                        value={editForm.battingAverage}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, battingAverage: e.target.value }))}
                      />
                    ) : (
                      p.battingAverage
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.wickets}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, wickets: e.target.value }))}
                      />
                    ) : (
                      p.wickets
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.strikeRate}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, strikeRate: e.target.value }))
                        }
                      />
                    ) : (
                      p.strikeRate
                    )}
                  </td>
                  <td>
                    {editing === p._id ? (
                      <input
                        className="input input-sm"
                        type="number"
                        value={editForm.economy}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, economy: e.target.value }))}
                      />
                    ) : (
                      p.economy
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {editing === p._id ? (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => startEdit(p)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => deletePlayer(p._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
