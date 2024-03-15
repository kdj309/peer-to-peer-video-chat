import { useEffect, useState } from "react";
import "./App.css";
import { useSocket } from "./context/socket";
import { useNavigate } from "react-router";
function App() {
  const socket = useSocket();
  const [email, setemail] = useState("");
  const [roomId, setroomId] = useState("");
  const navigate = useNavigate();
  const submitHandler = (e) => {
    e.preventDefault();
    socket.emit("user:join", { email, roomId });
  };
  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    socket.on("room:join", ({ email, roomId }) => {
      navigate(`/room/${email}/${roomId}`);
    });
    return () => {
      socket.off("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });
      socket.off("room:join", ({ email, roomId }) => {
        navigate(`/room/${roomId}`);
      });
    };
  }, []);

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{height:"100vh"}}>
      <form onSubmit={submitHandler} className="w-50 m-auto">
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={email}
            onChange={(e) => setemail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
            Room ID
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputPassword1"
            value={roomId}
            onChange={(e) => setroomId(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
