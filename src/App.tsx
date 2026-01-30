import { useState, useEffect } from 'react';
import { useLeagueStore } from './store/leagueStore';
import { Login } from './components/Login';
import { RoundDeclaration } from './components/RoundDeclaration';
import { ScoreEntry } from './components/ScoreEntry';
import { LeaderBoard } from './components/LeaderBoard';
import { CommissionerDashboard } from './components/CommissionerDashboard';
import './App.css';
import { subscribeRounds, subscribePlayers, subscribeWeeks } from './services/firestore';
import { onAuthChange, fetchPlayerDoc } from './services/auth';

function App() {
  const { currentUser, logout } = useLeagueStore();
  const [activeTab, setActiveTab] = useState<'declare' | 'scores' | 'weekly' | 'season' | 'admin'>('declare');
  const [currentWeek, setCurrentWeek] = useState(1);

  if (!currentUser) {
    return <Login onSuccess={() => {}} />;
  }

  useEffect(() => {
    // Only subscribe if Firebase is configured via env
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;

    const unsubRounds = subscribeRounds((rounds) => {
      useLeagueStore.setState({ rounds });
    });

    const unsubPlayers = subscribePlayers((players) => {
      useLeagueStore.setState({ players });
    });

    const unsubWeeks = subscribeWeeks((activeWeeks) => {
      useLeagueStore.setState({ activeWeeks });
    });

    return () => {
      unsubRounds();
      unsubPlayers();
      unsubWeeks();
    };
  }, []);

  // Auth listener: update currentUser from Firebase Auth
  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    const unsubAuth = onAuthChange(async (user: any) => {
      if (!user) {
        useLeagueStore.setState({ currentUser: null });
        return;
      }
      // Fetch players doc for this uid
      const player = await fetchPlayerDoc(user.uid);
      useLeagueStore.setState({
        currentUser: player
          ? { id: player.id, username: player.username, email: player.email, isCommissioner: player.isCommissioner }
          : { id: user.uid, username: user.email || '', email: user.email || '', isCommissioner: false },
      });
    });

    return () => unsubAuth();
  }, []);


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>PSK Golf League</h1>
          <div className="user-info">
            <span className="welcome">Welcome, {currentUser.username}</span>
            {currentUser.isCommissioner && (
              <span className="commissioner-badge">🛡️ Commissioner</span>
            )}
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'declare' ? 'active' : ''}`}
          onClick={() => setActiveTab('declare')}
        >
          Declare Round
        </button>
        <button
          className={`nav-btn ${activeTab === 'scores' ? 'active' : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          Submit Scores
        </button>
        <button
          className={`nav-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Standings
        </button>
        <button
          className={`nav-btn ${activeTab === 'season' ? 'active' : ''}`}
          onClick={() => setActiveTab('season')}
        >
          Season Standings
        </button>
        {currentUser.isCommissioner && (
          <button
            className={`nav-btn admin ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel
          </button>
        )}
      </nav>

      <main className="app-content">
        {activeTab === 'declare' && (
          <RoundDeclaration onRoundDeclared={setCurrentWeek} currentWeek={currentWeek} />
        )}
        {activeTab === 'scores' && <ScoreEntry onSubmit={setCurrentWeek} />}
        {activeTab === 'weekly' && (
          <div className="leaderboard-container">
            <div className="week-selector-standalone">
              {Array.from({ length: 6 }, (_, i) => i + 1).map((week) => (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className={`week-btn ${currentWeek === week ? 'active' : ''}`}
                >
                  Week {week}
                </button>
              ))}
            </div>
            <LeaderBoard weekNumber={currentWeek} />
          </div>
        )}
        {activeTab === 'season' && <LeaderBoard />}
        {activeTab === 'admin' && currentUser.isCommissioner && (
          <CommissionerDashboard />
        )}
      </main>

      <footer className="app-footer">
        <p>PSK Golf League | Virginia Tech Campus Course | 6-Week Season</p>
        <p className="rules-link">
          Buy-In: $20 | Prize: Winner-Take-All | Deadline: Sunday 11:59 PM
        </p>
      </footer>
    </div>
  );
}

export default App;
