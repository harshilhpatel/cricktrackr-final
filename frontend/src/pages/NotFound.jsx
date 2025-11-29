import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1>404</h1>
        <p>We couldn&apos;t find that page. Use the navigation or go back home.</p>
        <Link to="/">
          <button className="btn btn-secondary">Back home</button>
        </Link>
      </div>
    </div>
  );
}
