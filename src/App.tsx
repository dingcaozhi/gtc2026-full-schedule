import { useState, useMemo } from 'react';
import { Search, Calendar, Clock, Users, Tag, Filter, ChevronDown, ChevronUp, Globe, Building2 } from 'lucide-react';
import { Session, DayData } from './types';
import data from './data.json';
import './App.css';

const daysData = data as DayData[];

function App() {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const currentDay = daysData[selectedDay];

  // Get unique topics and formats for filters
  const { allTopics, allFormats } = useMemo(() => {
    const topics = new Set<string>();
    const formats = new Set<string>();
    
    daysData.forEach(day => {
      day.sessions.forEach(session => {
        if (session.topic) topics.add(session.topic);
        if (session.format) formats.add(session.format);
      });
    });
    
    return {
      allTopics: Array.from(topics).sort(),
      allFormats: Array.from(formats).sort()
    };
  }, []);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return currentDay.sessions.filter(session => {
      const matchesSearch = searchQuery === '' || 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.speakers.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFormat = selectedFormat === 'all' || session.format === selectedFormat;
      const matchesLevel = selectedLevel === 'all' || session.level.includes(selectedLevel);
      const matchesTopic = selectedTopic === 'all' || session.topic === selectedTopic;
      
      return matchesSearch && matchesFormat && matchesLevel && matchesTopic;
    });
  }, [currentDay, searchQuery, selectedFormat, selectedLevel, selectedTopic]);

  // Group sessions by time
  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: Session[] } = {};
    
    filteredSessions.forEach(session => {
      const timeKey = session.time.split(' - ')[0];
      if (!groups[timeKey]) groups[timeKey] = [];
      groups[timeKey].push(session);
    });
    
    return Object.entries(groups).sort((a, b) => {
      // Sort by time (handle am/pm)
      const timeA = a[0];
      const timeB = b[0];
      return timeA.localeCompare(timeB);
    });
  }, [filteredSessions]);

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'Talk': return '#667eea';
      case 'Panel': return '#f093fb';
      case 'In-Person': return '#4CAF50';
      case 'Virtual': return '#2196F3';
      case 'Training': return '#FF9800';
      case 'Certification': return '#9C27B0';
      default: return '#667eea';
    }
  };

  const getLevelColor = (level: string) => {
    if (level.includes('Beginner')) return '#4CAF50';
    if (level.includes('Intermediate')) return '#FF9800';
    if (level.includes('Advanced')) return '#f44336';
    return '#667eea';
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🚀 GTC 2026 Full Schedule</h1>
          <p>NVIDIA AI Conference & Expo • March 15-19, 2026 • San Jose, CA</p>
          
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{daysData.reduce((sum, d) => sum + d.sessions.length, 0)}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
            <div className="stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Days</span>
            </div>
            <div className="stat">
              <span className="stat-number">{currentDay.sessions.length}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>
        </div>
      </header>

      <div className="day-tabs">
        {daysData.map((day, index) => (
          <button
            key={day.date}
            className={`day-tab ${selectedDay === index ? 'active' : ''}`}
            onClick={() => setSelectedDay(index)}
          >
            <span className="day-name">{day.dayName}</span>
            <span className="day-date">{day.date.replace('March ', 'Mar ').replace(', 2026', '')}</span>
            <span className="day-count">{day.sessions.length}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search sessions, speakers, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label><Filter size={14} /> Format</label>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
              <option value="all">All Formats</option>
              {allFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label><Tag size={14} /> Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="filter-group">
            <label><Globe size={14} /> Topic</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              <option value="all">All Topics</option>
              {allTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-count">
          Showing {filteredSessions.length} of {currentDay.sessions.length} sessions
        </div>
      </div>

      <main className="sessions-container">
        {groupedSessions.length === 0 ? (
          <div className="no-results">
            <p>No sessions found matching your criteria.</p>
          </div>
        ) : (
          groupedSessions.map(([time, sessions]) => (
            <div key={time} className="time-group">
              <div className="time-header">
                <Clock size={18} />
                <span>{time}</span>
                <span className="session-count">({sessions.length} sessions)</span>
              </div>
              
              <div className="sessions-grid">
                {sessions.map(session => (
                  <div
                    key={session.session_id}
                    className={`session-card ${expandedSessions.has(session.session_id) ? 'expanded' : ''}`}
                  >
                    <div className="card-header">
                      <div className="badges">
                        <span 
                          className="badge format"
                          style={{ backgroundColor: getFormatColor(session.format) }}
                        >
                          {session.format}
                        </span>
                        <span 
                          className="badge level"
                          style={{ backgroundColor: getLevelColor(session.level) }}
                        >
                          {session.level}
                        </span>
                        {session.language === 'Chinese' && (
                          <span className="badge language">🇨🇳 中文</span>
                        )}
                      </div>
                      
                      <button 
                        className="expand-btn"
                        onClick={() => toggleSession(session.session_id)}
                      >
                        {expandedSessions.has(session.session_id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    <h3 className="session-title">{session.title}</h3>
                    
                    <div className="session-meta">
                      <span className="meta-item">
                        <Clock size={14} />
                        {session.time}
                      </span>
                      {session.topic && (
                        <span className="meta-item">
                          <Tag size={14} />
                          {session.topic}
                          {session.sub_topic && ` - ${session.sub_topic}`}
                        </span>
                      )}
                    </div>

                    {session.speakers.length > 0 && (
                      <div className="speakers">
                        <Users size={14} />
                        <span>{session.speakers.length} speaker{session.speakers.length > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {expandedSessions.has(session.session_id) && (
                      <div className="expanded-content">
                        <p className="description">{session.description}</p>
                        
                        {session.speakers.length > 0 && (
                          <div className="speakers-list">
                            <h4>Speakers:</h4>
                            <ul>
                              {session.speakers.map((speaker, idx) => (
                                <li key={idx}>{speaker}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {session.additional_times && session.additional_times.length > 0 && (
                          <div className="additional-times">
                            <h4>Also available:</h4>
                            {session.additional_times.map((time, idx) => (
                              <div key={idx} className="additional-time">
                                <Calendar size={14} />
                                {time.date} • {time.time}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="session-id">
                          <Building2 size={14} />
                          {session.session_id}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="footer">
        <p>GTC 2026 Schedule • Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
