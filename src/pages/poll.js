import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2cF6rVGusj97WXgab0_ZmHYFtvhMBI0g",
  authDomain: "jesien25-cd53b.firebaseapp.com",
  projectId: "jesien25-cd53b",
  databaseURL: "https://jesien25-cd53b-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "jesien25-cd53b.firebasestorage.app",
  messagingSenderId: "557329099544",
  appId: "1:557329099544:web:f801e81254547845418c6d",
  measurementId: "G-EHS5DBQXJZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Poll = ({ onClose }) => {
  const [votes, setVotes] = useState(null);

  // Load votes from Firebase on component mount
  useEffect(() => {
    const votesRef = ref(database, "votes");
    onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        setVotes(snapshot.val());
      }
    });
  }, []);

  if (!votes) {
    return <div style={{ color: "white" }}>Ładowanie ankiety...</div>;
  }

  // Calculate the total number of votes
  const totalVotes = votes.option1.count + votes.option2.count + votes.oldRules.count;

  // Calculate the percentage for each option
  const option1Percentage = totalVotes ? (votes.option1.count / totalVotes) * 100 : 0;
  const option2Percentage = totalVotes ? (votes.option2.count / totalVotes) * 100 : 0;
  const oldRulesPercentage = totalVotes ? (votes.oldRules.count / totalVotes) * 100 : 0;

  // Determine the winner and runners-up
  const options = [
    { name: "Bonus 10 🥮", count: votes.option1.count, percentage: option1Percentage },
    { name: "Bonus 50 🥮", count: votes.option2.count, percentage: option2Percentage },
    { name: "Stare zasady", count: votes.oldRules.count, percentage: oldRulesPercentage },
  ];

  options.sort((a, b) => b.count - a.count); // Sort by vote count in descending order

  const [winner, secondPlace, thirdPlace] = options;

  return (
    <div style={pollContainerStyle}>
      <div style={pollContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          X
        </button>
        <h3>Zaczynamy grę ! </h3>
        <p style={{ color: "black" }}>
          Dziękujemy za wzięcie udziału w ankiecie. Oto wyniki : 
          <hr></hr>
          <p style={{ color: "black", marginTop: "20px", fontWeight: "bold" }}>
        Zrzutka w tej rundzie wynosi 62 🥮, podział nagród będzie wyglądał następująco:
        <hr></hr>
            <b>1 miejsce:</b>  400 🥮
          <hr></hr>
            <b>2 miejsce:</b> 200 🥮
          <hr></hr>
            <b>3 miejsce:</b> 100 🥮
            <hr></hr>
           + Bonus - nagroda za każdą wygraną kolejkę to 10 🥮. W przypadku więcej niż jednego wygranego, nagroda kumuluje na następną kolejkę itd.
        </p><hr></hr>Wyniki ankiety :
        </p>
        <div>
          <div
            style={{
              ...optionContainerStyle,
              backgroundColor: winner.name === "Bonus 10 🥮" ? "lightgreen" : "white",
            }}
          >
            <label style={optionLabelStyle}>
              <b>1. Bonus 10 🥮 - za każdą wygraną kolejkę</b>
            </label>
            <p style={voteCountStyle}>
              Głosy: {votes.option1.count} ({option1Percentage.toFixed(2)}%)
            </p>
            <div style={progressBarContainerStyle}>
              <div
                style={{
                  ...progressBarStyle,
                  width: `${option1Percentage}%`,
                }}
              ></div>
            </div>
            <div style={votersStyle}>
              {(votes.option1.voters || []).map((voter, index) => (
                <span key={index}>{voter} </span>
              ))}
            </div>
          </div>
          <div
            style={{
              ...optionContainerStyle,
              backgroundColor: winner.name === "Bonus 50 🥮" ? "lightgreen" : "white",
            }}
          >
            <label style={optionLabelStyle}>
              <b>2. Bonus 50 🥮 dla najlepszego typera miesiąca</b>
            </label>
            <p style={voteCountStyle}>
              Głosy: {votes.option2.count} ({option2Percentage.toFixed(2)}%)
            </p>
            <div style={progressBarContainerStyle}>
              <div
                style={{
                  ...progressBarStyle,
                  width: `${option2Percentage}%`,
                }}
              ></div>
            </div>
            <div style={votersStyle}>
              {(votes.option2.voters || []).map((voter, index) => (
                <span key={index}>{voter} </span>
              ))}
            </div>
          </div>
          <div
            style={{
              ...optionContainerStyle,
              backgroundColor: winner.name === "Stare zasady" ? "lightgreen" : "white",
            }}
          >
            <label style={optionLabelStyle}>
              <b>3. Stare zasady - bez dodatkowych bonusów</b>
            </label>
            <p style={voteCountStyle}>
              Głosy: {votes.oldRules.count} ({oldRulesPercentage.toFixed(2)}%)
            </p>
            <div style={progressBarContainerStyle}>
              <div
                style={{
                  ...progressBarStyle,
                  width: `${oldRulesPercentage}%`,
                }}
              ></div>
            </div>
            <div style={votersStyle}>
              {(votes.oldRules.voters || []).map((voter, index) => (
                <span key={index}>{voter} </span>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

const pollContainerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  overflow: "hidden",
};

const pollContentStyle = {
  backgroundColor: "white",
  borderRadius: "10px",
  padding: "20px",
  width: "90%",
  maxWidth: "500px",
  textAlign: "center",
  position: "relative",
  maxHeight: "80%",
  overflowY: "auto",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "red",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  cursor: "pointer",
};

const optionContainerStyle = {
  margin: "10px 0",
  padding: "10px",
  borderRadius: "5px",
  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
};

const optionLabelStyle = {
  display: "block",
  margin: "10px 0",
  color: "black",
};

const voteCountStyle = {
  fontSize: "14px",
  color: "black",
};

const progressBarContainerStyle = {
  width: "100%",
  height: "10px",
  backgroundColor: "#ccc",
  borderRadius: "5px",
  marginBottom: "10px",
};

const progressBarStyle = {
  height: "100%",
  backgroundColor: "green",
  borderRadius: "5px",
};

const votersStyle = {
  fontSize: "12px",
  color: "gray",
  marginBottom: "10px",
};

export default Poll;
