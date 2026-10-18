import { useState } from "react";
import "./App.css";

function App() {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("(bio goes here)");
  const [role, setRole] = useState("");

  function handleEditClick() {
    setIsEditing(!isEditing);
  }

  return (
    <div className="screen-container">
      <header className="profile-info">
        <h1 className="logoText">DataOwl</h1>

        <div className="side-container">
          <div className="box-one">
            <img
              className="profilePic"
              src="/owl.png"
              alt="Profile"
            />
          </div>

          <div className="box-two">
            <p>Username</p>
            <p>0 Followers | 0 Following</p>
          </div>
        </div>

        {isEditing ? (
          <>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />

            <label htmlFor="custom-role">Role</label>
            <input
              type="text"
              id="custom-role"
              placeholder="Enter your role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </>
        ) : (
          <>
            <p>{bio}</p>
            {role && <p>Role: {role}</p>}
          </>
        )}

        <button onClick={handleEditClick}>
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
      </header>

      <section className="Dataset-content">
        <button className="Datasets">
          <img src="/posts.png" alt="Posts" />
        </button>

        <button className="Datasets">
          <img src="/reposts.png" alt="Reposts" />
        </button>

        <button className="Datasets">
          <img src="/saved.png" alt="Saved posts" />
        </button>
      </section>

      <section>
        <table className="data-table">
          <tbody>
            <tr>
              <td>
                <img src="/pinned.png" className="post-icons" alt="Pinned" />
                <p>Post 1</p>
              </td>

              <td>
                <img
                  src="/collaborated.png"
                  className="post-icons"
                  alt="Collaborated"
                />
                <p>Post 2</p>
              </td>

              <td>
                <img src="/solo.png" className="post-icons" alt="Solo" />
                <p>Post 3</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;