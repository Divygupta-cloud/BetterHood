// BetterHood/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // clean up the listener
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to BetterHood Home Page</h1>
      {user ? (
        <div>
          <p>You are logged in as <strong>{user.email}</strong></p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <button onClick={() => navigate("/login")}>Login</button>
          <br /><br />
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      )}
    </div>
  );
};

export default Home;
