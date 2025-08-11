import React, { useState, useEffect } from 'react';

function DowntimeLog() {
  const [entries, setEntries] = useState([]);
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Assume the username is stored in localStorage (set during login)
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchDowntimeEntries();
  }, []);

  const fetchDowntimeEntries = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/downtime?username=${username}`);
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError('Error fetching downtime entries');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entryData = { username, clockIn, clockOut, notes };
    try {
      let response;
      if (editingId) {
        // Update an existing entry
        response = await fetch(`http://localhost:5001/api/downtime/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        });
      } else {
        // Add a new entry
        response = await fetch('http://localhost:5001/api/downtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        });
      }
      if (response.ok) {
        // Clear the form fields and reset editing state
        setClockIn('');
        setClockOut('');
        setNotes('');
        setEditingId(null);
        fetchDowntimeEntries();
      } else {
        const data = await response.json();
        setError(data.error || 'Error saving entry');
      }
    } catch (err) {
      setError('Error saving entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    // Format for datetime-local input: take first 16 characters of ISO string
    setClockIn(entry.clockIn.slice(0, 16));
    setClockOut(entry.clockOut ? entry.clockOut.slice(0, 16) : '');
    setNotes(entry.notes || '');
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/downtime/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchDowntimeEntries();
      } else {
        setError('Error deleting entry');
      }
    } catch (err) {
      setError('Error deleting entry');
    }
  };

  // <-- Place the downtime total calculation here, before the return statement -->
  const totalMillis = entries.reduce((total, entry) => {
    if (entry.clockOut) {
      return total + (new Date(entry.clockOut) - new Date(entry.clockIn));
    }
    return total;
  }, 0);

  const totalMinutes = Math.floor(totalMillis / 60000);
  let totalTimeDisplay = '';

  if (totalMinutes >= 1440) { // 1440 minutes = 24 hours
    const days = Math.floor(totalMinutes / 1440);
    const remainingMinutes = totalMinutes % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    totalTimeDisplay = `${days}d ${hours}h ${minutes}m`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    totalTimeDisplay = `${hours}h ${minutes}m`;
  }

  return (
    <div className="downtime-log">
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
          <label htmlFor="clockOut">End Date and Time: </label>
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
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>{new Date(entry.clockIn).toLocaleString()}</td>
              <td>{entry.clockOut ? new Date(entry.clockOut).toLocaleString() : 'N/A'}</td>
              <td>{entry.clockOut ? formatLength(entry.clockIn, entry.clockOut) : 'N/A'}</td>
              <td>{entry.notes}</td>
              <td>
                <button onClick={() => handleEdit(entry)}>Edit</button>
                <button onClick={() => handleDelete(entry.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="downtime-total">
        <h3>Total Downtime: {totalTimeDisplay}</h3>
      </div>
    </div>
    </div>
  );
}

// Helper function to format the length for each entry
const formatLength = (clockIn, clockOut) => {
  if (!clockOut) return 'N/A';
  const diffMillis = new Date(clockOut) - new Date(clockIn);
  const diffMinutes = Math.floor(diffMillis / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffRemainingMinutes = diffMinutes % 60;
  return diffHours > 0 ? `${diffHours}h ${diffRemainingMinutes}m` : `${diffRemainingMinutes}m`;
};

export default DowntimeLog;
