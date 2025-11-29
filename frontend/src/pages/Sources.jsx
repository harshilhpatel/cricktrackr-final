import React from 'react';

const sections = [
  {
    title: 'Frontend',
    items: [
      'React 18 with Vite',
      'React Router for routing',
      'Axios for API requests',
      'Custom light/dark/stadium-night theme cycle with persisted preference',
      'Player comparison radar chart + stat table',
    ],
  },
  {
    title: 'Backend',
    items: [
      'Node.js + Express server',
      'Mongoose ODM for MongoDB',
      'JWT authentication (register/login, auth middleware)',
      'Match cache in Mongo (last 5 days) plus manual fixture seeding',
      'Player import via CricAPI `players_info` IDs',
    ],
  },
  {
    title: 'Data & APIs',
    items: [
      'CricAPI `/v1/currentMatches` for live matches',
      'CricAPI `/v1/players_info` for player imports',
      'MongoDB Atlas for players, match archive, and manual fixtures',
    ],
  },
  {
    title: 'Environment',
    items: [
      'Backend `.env`: `MONGO_URI`, `JWT_SECRET`, `CRICKET_API_KEY`, `PORT`',
      'Frontend `.env`: `VITE_API_URL` pointing to backend',
    ],
  },
  {
    title: 'UI/UX',
    items: [
      'Responsive cards/grid for matches, players, stats',
      'Modal details for match info',
      'Win probability display for live matches',
      'Navbar navigation + logout',
      'Typography and spacing tuned for both light and dark themes',
    ],
  },
  {
    title: 'Videos',
    items: [
      { label: 'YouTube Reference 1', href: 'https://www.youtube.com/watch?v=Rybzg_W6-p4&t=3947s' },
      { label: 'YouTube Reference 2', href: 'https://www.youtube.com/watch?v=zKHWu1KlnRc&t=1878s' },
      { label: 'YouTube Reference 3', href: 'https://www.youtube.com/watch?v=sD4n5Ds3mKM&t=3864s' },
      { label: 'YouTube Reference 4', href: 'https://www.youtube.com/watch?v=zD72gpwSzxI&t=2s' },
      { label: 'YouTube Reference 5', href: 'https://www.youtube.com/watch?v=M5oOSP03Oq4&t=2787s' },
    ],
  },
];

export default function SourcesPage() {
  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Sources & Stack</div>
            <div className="section-subtitle">
              References and components used to build CrickTrackr+.
            </div>
          </div>
        </div>
      </section>

      {/* Cards that list stack references and helpful links. */}
      <div className="grid grid-2">
        {sections.map((section) => (
          <div className="card" key={section.title}>
            <div className="card-title">{section.title}</div>
            <div className="card-meta">
              {section.items.map((item) => {
                if (typeof item === 'string') {
                  return (
                    <div key={item} style={{ marginBottom: '0.25rem' }}>
                      • {item}
                    </div>
                  );
                }
                return (
                  <div key={item.href} style={{ marginBottom: '0.25rem' }}>
                    • <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
