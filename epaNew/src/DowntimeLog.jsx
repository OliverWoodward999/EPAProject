import React, { useState, useEffect } from 'react';
import { apiUrl } from './api';

function DowntimeLog() {
  const [entries, setEntries] = useState([]);
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const username = localStorage.getItem('username') || '';

  useEffect(() => {
    if (!username) {
      setError('You are not logged in.');
      return;
    }
    fetchDowntimeEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchDowntimeEntries = async () => {
    try {
      const res = await fetch(
        apiUrl(`/api/downtime?username=${encodeURIComponent(username)}`)
      );
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error fetching downtime entries');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const entryData = { username, clockIn, clockOut, notes };

    try {
      const url = editingId
        ? apiUrl(`/api/downtime/${editingId}`)
        : apiUrl('/api/downtime');
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error saving entry');
      }

      // clear form + refresh
      setClockIn('');
      setClockOut('');
      setNotes('');
      setEditingId(null);
      fetchDowntimeEntries();
    } catch (err) {
      setError(err.message || 'Error saving entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setClockIn(entry.clockIn?.slice(0, 16) || '');
    setClockOut(entry.clockOut ? entry.clockOut.slice(0, 16) : '');
    setNotes(entry.notes || '');
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(apiUrl(`/api/downtime/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting entry');
      fetchDowntimeEntries();
    } catch (err) {
      setError(err.message || 'Error deleting entry');
    }
  };

  // total downtime display
  const totalMillis = entries.reduce((total, entry) => {
    if (entry.clockOut) {
      return total + (new Date(entry.clockOut) - new Date(entry.clockIn));
    }
    return total;
  }, 0);

  const totalMinutes = Math.floor(totalMillis / 60000);
  const totalTimeDisplay =
    totalMinutes >= 1440
      ? (() => {
          const days = Math.floor(totalMinutes / 1440);
          const remaining = totalMinutes % 1440;
          const hours = Math.floor(remaining / 60);
          const minutes = remaining % 60;
          return `${days}d ${hours}h ${minutes}m`;
        })()
      : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  return (
    <div className="downtime-log fade-in">
      <h2>Downtime Log</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="clockIn">Start Date and Time:</label>
          <input
            type="datetime-local"
            id="clockIn"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="clockOut">End Date and Time:</label>
          <input
            type="datetime-local"
            id="clockOut"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="notes">Notes:</label>
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit">{editingId ? 'Update Entry' : 'Add Entry'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Length</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.clockIn).toLocaleString()}</td>
              <td>{entry.clockOut ? new Date(entry.clockOut).toLocaleString() : 'N/A'}</td>
              <td>{entry.clockOut ? formatLength(entry.clockIn, entry.clockOut) : 'N/A'}</td>
              <td>{entry.notes}</td>
              <td>
                <button type="button" onClick={() => handleEdit(entry)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(entry.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="downtime-total">
        <h3>Total Downtime: {totalTimeDisplay}</h3>
      </div>
    </div>
  );
}

const formatLength = (clockIn, clockOut) => {
  if (!clockOut) return 'N/A';
  const diffMillis = new Date(clockOut) - new Date(clockIn);
  const diffMinutes = Math.floor(diffMillis / 60000);
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default DowntimeLog;
