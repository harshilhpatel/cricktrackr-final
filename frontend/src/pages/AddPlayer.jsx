import React, { useState } from 'react';
import axios from 'axios';

export default function AddPlayerPage() {
  const [form, setForm] = useState({
    name: '',
    team: '',
    role: 'Batsman',
    matches: '',
    runs: '',
    hundreds: '',
    fifties: '',
    battingAverage: '',
    wickets: '',
    strikeRate: '',
    economy: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [teamOpen, setTeamOpen] = useState(false);
  const [showCustomTeam, setShowCustomTeam] = useState(false);

  // Preset teams (with flags) plus a manual entry option.
  const teamOptions = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
    { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'GB', name: 'England', flag: '🏴' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'US', name: 'USA', flag: '🇺🇸' },
    { code: 'SC', name: 'Scotland', flag: '🏴' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'RO', name: 'Romania', flag: '🇷🇴' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'OTHER', name: 'Other (type manually)', flag: '✏️' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      // Coerce numeric fields; backend expects numbers, not strings.
      const payload = {
        ...form,
        matches: Number(form.matches) || 0,
        runs: Number(form.runs) || 0,
        hundreds: Number(form.hundreds) || 0,
        fifties: Number(form.fifties) || 0,
        battingAverage: Number(form.battingAverage) || 0,
        wickets: Number(form.wickets) || 0,
        strikeRate: Number(form.strikeRate) || 0,
        economy: Number(form.economy) || 0
      };
      await axios.post('/api/players', payload);
      setMessage('Player added successfully.');
      setForm({
        name: '',
        team: '',
        role: 'Batsman',
        matches: '',
        runs: '',
        hundreds: '',
        fifties: '',
        battingAverage: '',
        wickets: '',
        strikeRate: '',
        economy: ''
      });
    } catch (err) {
      console.error(err);
      setMessage('Failed to add player.');
    } finally {
      setSaving(false);
    }
  };

  const handleTeamSelect = (option) => {
    // Toggle custom team input if "Other" is chosen; otherwise apply preset.
    if (option.code === 'OTHER') {
      setShowCustomTeam(true);
      setForm((prev) => ({ ...prev, team: '' }));
    } else {
      setShowCustomTeam(false);
      setForm((prev) => ({ ...prev, team: option.name }));
    }
    setTeamOpen(false);
  };

  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Add Player</div>
            <div className="section-subtitle">
              Fill the form below to insert a new player into the MongoDB collection.
            </div>
          </div>
        </div>
      </section>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label className="label">Name</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label className="label">Team</label>
              <div className="select-wrapper">
                {!showCustomTeam ? (
                  <button
                    type="button"
                    className="input select-button"
                    onClick={() => setTeamOpen((prev) => !prev)}
                  >
                    {form.team ? form.team : 'Select a team'}
                  </button>
                ) : (
                  <input
                    className="input"
                    name="team"
                    value={form.team}
                    onChange={handleChange}
                    placeholder="Enter team name"
                    required
                  />
                )}
                {teamOpen && (
                  <div className="select-dropdown">
                    {teamOptions.map((opt) => (
                      <div
                        key={opt.code}
                        className="select-option"
                        onClick={() => handleTeamSelect(opt)}
                      >
                        <span>{opt.flag}</span>
                        <span>{opt.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="label">Role</label>
              <select
                className="input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Matches</label>
              <input
                className="input"
                type="number"
                name="matches"
                value={form.matches}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="label">Runs</label>
              <input
                className="input"
                type="number"
                name="runs"
                value={form.runs}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="field">
              <label className="label">Wickets</label>
              <input
                className="input"
                type="number"
                name="wickets"
                value={form.wickets}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="label">100s</label>
              <input
                className="input"
                type="number"
                name="hundreds"
                value={form.hundreds}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="field">
              <label className="label">50s</label>
              <input
                className="input"
                type="number"
                name="fifties"
                value={form.fifties}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="label">Strike Rate</label>
              <input
                className="input"
                type="number"
                step="0.01"
                name="strikeRate"
                value={form.strikeRate}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="field">
              <label className="label">Batting Avg</label>
              <input
                className="input"
                type="number"
                step="0.01"
                name="battingAverage"
                value={form.battingAverage}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="field">
              <label className="label">Economy</label>
              <input
                className="input"
                type="number"
                step="0.01"
                name="economy"
                value={form.economy}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {message && (
            <div style={{ fontSize: '0.8rem', marginBottom: '0.6rem' }}>{message}</div>
          )}

          <button type="submit" className="btn btn-secondary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Player'}
          </button>
        </form>
      </div>
    </div>
  );
}
