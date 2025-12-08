import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import usersData from '../gameData/users.json';
import gameData from '../gameData/data.json';
import teamsData from '../gameData/teams.json';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import ExpandableCard from '../components/expandableCard';
import Pagination from '../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';

const firebaseConfig = {
  apiKey: "AIzaSyC2cF6rVGusj97WXgab0_ZmHYFtvhMBI0g",
  authDomain: "jesien25-cd53b.firebaseapp.com",
  projectId: "jesien25-cd53b",
  databaseURL: "https://jesien25-cd53b-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "jesien25-cd53b.firebasestorage.app",
  messagingSenderId: "557329099544",
  appId: "1:557329099544:web:f801e81254547845418c6d",
  measurementId: "G-EHS5DBQXJZ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth();
const database = getDatabase();

const groupGamesIntoKolejki = (games) => {
  const kolejki = [];
  games.forEach((game, index) => {
    const currentKolejkaId = Math.floor(index / 9) + 1;
    game.kolejkaId = currentKolejkaId;
    if (!kolejki[currentKolejkaId - 1]) {
      kolejki[currentKolejkaId - 1] = { id: currentKolejkaId, games: [] };
    }
    kolejki[currentKolejkaId - 1].games.push(game);
  });
  return kolejki;
};

const Bets = () => {
  const [kolejki, setKolejki] = useState(groupGamesIntoKolejki(gameData));
  const [selectedUser, setSelectedUser] = useState('');
  const [submittedData, setSubmittedData] = useState({});
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [results, setResults] = useState({});
  const [currentKolejkaIndex, setCurrentKolejkaIndex] = useState(0);
  const [areInputsEditable, setAreInputsEditable] = useState(true);

  useEffect(() => {
    const lastChosenUser = localStorage.getItem('selectedUser');
    if (lastChosenUser) setSelectedUser(lastChosenUser);

    auth.onAuthStateChanged((user) => {
      if (user) setSelectedUser(user.displayName);
    });

    const dbRef = ref(database, 'submittedData');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSubmittedData(data);
        setIsDataSubmitted(true);
      }
    });

    const resultsRef = ref(database, 'results');
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setResults(data);
    });

    const now = new Date();
    const nextGameIndex = gameData.findIndex(game => new Date(`${game.date}T${game.kickoff}:00+02:00`) > now);
    const kolejkaIndex = Math.floor(nextGameIndex / 9);
    setCurrentKolejkaIndex(kolejkaIndex);
  }, []);

  const isReadOnly = (user, gameId) => submittedData[user] && submittedData[user][gameId];

  const gameStarted = (gameDate, gameKickoff) => {
    const now = DateTime.now().setZone('Europe/Warsaw');
    const kickoff = DateTime.fromISO(`${gameDate}T${gameKickoff}:00`, { zone: 'Europe/Warsaw' });
    return now >= kickoff;
  };

  const autoDetectBetType = (score) => {
    const [home, away] = score.split(':').map(Number);
    if (home === away) return 'X';
    return home > away ? '1' : '2';
  };

  const handleScoreChange = (gameId, scoreInput) => {
    const cleaned = scoreInput.replace(/[^0-9:]/g, '');
    const formatted = cleaned.replace(/^(?:(\d))([^:]*$)/, '$1:$2');

    const updated = kolejki.map(kolejka => ({
      ...kolejka,
      games: kolejka.games.map(game =>
        game.id === gameId
          ? { ...game, score: formatted, bet: autoDetectBetType(formatted) }
          : game
      )
    }));
    setKolejki(updated);
  };

  const handleUserChange = (e) => {
    const user = e.target.value;
    setSelectedUser(user);
    localStorage.setItem('selectedUser', user);
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      alert('Proszę wybrać użytkownika.');
      return;
    }

    const currentKolejka = kolejki[currentKolejkaIndex];
    const userSubmittedBets = submittedData[selectedUser] || {};

    const newBetsToSubmit = currentKolejka.games.reduce((acc, game) => {
      if (game.score && !userSubmittedBets[game.id]) {
        acc[game.id] = {
          home: game.home,
          away: game.away,
          score: game.score,
          bet: autoDetectBetType(game.score),
          kolejkaId: game.kolejkaId,
        };
      }
      return acc;
    }, {});

    if (Object.keys(newBetsToSubmit).length === 0) {
      alert("Wszystkie zakłady zostały już przesłane.");
      return;
    }

    update(ref(database, `submittedData/${selectedUser}`), newBetsToSubmit)
      .then(() => {
        setSubmittedData(prev => ({
          ...prev,
          [selectedUser]: {
            ...prev[selectedUser],
            ...newBetsToSubmit
          }
        }));
        setIsDataSubmitted(true);
        alert('Zakłady zostały pomyślnie przesłane!');
      })
      .catch((error) => {
        console.error('Błąd:', error);
        alert('Wystąpił błąd przy zapisie. Spróbuj ponownie.');
      });
  };

  const getTeamLogo = (name) => teamsData[name]?.logo || '';
  const toggleEditableOff = () => setAreInputsEditable(false);
  const toggleEditableOn = () => setAreInputsEditable(true);
return (
    <div className="fade-in" style={{ textAlign: 'center' }}>
      <p>Wybrany użytkownik : </p>
      <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px', fontSize: '14px', color: 'yellow' }} />
      <select
        style={{ margin: '1px', backgroundColor: 'pink', fontWeight: 'bold', fontFamily: 'Rubik' }}
        value={selectedUser}
        onChange={handleUserChange}
      >
        <option value="">Użytkownik</option>
        {Object.keys(usersData).map((user, index) => (
          <option key={index} value={user}>{user}</option>
        ))}
      </select>

      <div style={{ backgroundColor: '#212529ab', color: 'aliceblue', padding: '20px', textAlign: 'center', marginBottom: '10px', marginTop: '5%' }}>
        <Pagination
          currentPage={currentKolejkaIndex}
          totalPages={kolejki.length}
          onPageChange={(page) => setCurrentKolejkaIndex(page)}
          label="Kolejka"
        />

        <table style={{ width: '100%', border: '0.5px solid #444', borderCollapse: 'collapse', marginTop: '5%' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}></th>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}>Gospodarz</th>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}></th>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}>Gość</th>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}>Wynik</th>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}>1X2</th>
              <th style={{ borderBottom: '0.5px solid #444', textAlign: 'center' }}>Typ</th>
            </tr>
          </thead>
          <tbody>
            {/* Check if kolejki and the selected currentKolejkaIndex are valid */}
            {kolejki && kolejki[currentKolejkaIndex] && kolejki[currentKolejkaIndex].games ? (
              kolejki[currentKolejkaIndex].games.map((game, index) => (
                <React.Fragment key={index}>
                  <tr
                    style={{
                      opacity: game.disabled ? '0.5' : '1',
                      pointerEvents: game.disabled ? 'none' : 'auto',
                      backgroundColor: gameStarted(game.date, game.kickoff) ? '#214029ab' : 'transparent',
                    }}
                  >
                    <td
                      colSpan="12"
                      className="date"
                      style={{ textAlign: 'left', color: 'gold', fontSize: '10px', paddingLeft: '10%' }}
                    >
                      &nbsp;&nbsp;&nbsp;
                      {game.date}
                      &nbsp;&nbsp;&nbsp;
                      {game.kickoff}
                       &nbsp;&nbsp;&nbsp;
                      {game.message}
                    </td>
                  </tr>
                  <tr
                    style={{
                      borderBottom: '1px solid #444',
                      opacity: game.disabled ? '0.5' : '1',
                      pointerEvents: game.disabled ? 'none' : 'auto',
                      backgroundColor: gameStarted(game.date, game.kickoff) ? '#214029ab' : 'transparent',
                    }}
                  >
                    <p style={{ color: 'grey' }}>{game.id}.</p>
                    <td style={{ textAlign: 'center', paddingRight: '10px', fontSize: '20px' }}>
                      <img src={getTeamLogo(game.home)} className="logo" />
                      {game.home}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '20px' }}>-</td>
                    <td style={{ textAlign: 'left', paddingLeft: '10px', fontSize: '20px' }}>
                      <img src={getTeamLogo(game.away)} className="logo" />
                      {game.away}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '20px' }}>{results[game.id]}</td>
                    <td style={{ textAlign: 'center' }}>
                      <select value={game.bet} disabled>
                        <option value="1">1</option>
                        <option value="X">X</option>
                        <option value="2">2</option>
                      </select>
                    </td>
                    <td>
                      <input
                        style={{
                          width: '50px',
                          backgroundColor: game.score
                            ? isReadOnly(selectedUser, game.id)
                              ? 'transparent'
                              : 'white'
                            : 'white',
                          cursor: isReadOnly(selectedUser, game.id) ? 'not-allowed' : 'text',
                          color: 'red',
                        }}
                        type="text"
                        placeholder={isReadOnly(selectedUser, game.id) ? '✔️' : 'x:x'}
                        value={game.score}
                        onChange={(e) => handleScoreChange(game.id, e.target.value)}
                        maxLength="3"
                        readOnly={areInputsEditable && isReadOnly(selectedUser, game.id)}
                        title={areInputsEditable && isReadOnly(selectedUser, game.id) ? '✔️' : ''}
                        disabled={areInputsEditable && gameStarted(game.date, game.kickoff)}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding:'5%' }}>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#00FFAA', fontFamily:"Rubik", textAlign:"center"}}>
              To już koniec rundy – dzięki za wspólną zabawę!
            </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button
            style={{ backgroundColor: '#DC3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'inline-block', margin: '10px', fontSize: '14px', width: '60%', transition: 'background-color 0.3s' }}
            onClick={handleSubmit}
          >
            Prześlij
          </button>
          {isDataSubmitted && Object.keys(submittedData).map((user) => (
          <ExpandableCard key={user} user={user} bets={submittedData[user]} results={results} />))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
  <button
    style={{
      backgroundColor: '#28a745', 
      color: 'white', 
      padding: '10px 20px', 
      border: 'none', 
      borderRadius: '5px', 
      marginRight: '10px', 
      cursor: 'pointer'
    }}
    onClick={toggleEditableOff}
  >
    
  </button>
  <button
    style={{
      backgroundColor: '#007bff', 
      color: 'white', 
      padding: '10px 20px', 
      border: 'none', 
      borderRadius: '5px', 
      cursor: 'pointer'
    }}
    onClick={toggleEditableOn}
  >
   
  </button>
</div>
      </div>
    
  );
};

  
export default Bets;
