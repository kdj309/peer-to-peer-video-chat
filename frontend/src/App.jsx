import { useEffect, useState } from "react";
import "./App.css";
import { useSocket } from "./context/socket";
import { useNavigate } from "react-router";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
function App() {
  const socket = useSocket();
  const [email, setemail] = useState("");
  const [roomId, setroomId] = useState("");
  const [availableRooms, setavailableRooms] = useState([]);

  const navigate = useNavigate();
  const [alert, setalert] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    alertype: "info",
  });
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setalert((prev) => ({
      ...prev,
      open: false,
    }));
  };
  const submitHandler = (e) => {
    e.preventDefault();
    if (!email || !roomId) {
      setalert({
        open: true,
        message: "Please enter email and room ID",
        vertical: "top",
        horizontal: "center",
        alertype: "error",
      });
      return;
    }
    socket.emit("user:join", { email, roomId });
  };
  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    socket.on("room:join", ({ email, roomId }) => {
      navigate(`/room/${email}/${roomId}`);
    });
    const getRooms = async () => {
      const rooms = await fetch("https://probable-space-garbanzo-9w56vpjgqg92957j-3000.app.github.dev/rooms");
      const data = await rooms.json();
      setavailableRooms(data.rooms);
    };
    getRooms();
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
    <>
      <CustomAlert
        open={alert.open}
        vertical={alert.vertical}
        horizontal={alert.horizontal}
        alertMessage={alert.message}
        handleClose={handleClose}
        alertType={alert.alertype}
      />
      {availableRooms.length ?
        <div className="container d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
          <div className="d-flex flex-column">
            <h4 className="display-4">Available Rooms</h4>
            <ul className="list-group flex-row align-items-center gap-2">
              {availableRooms.map((room) => (
                <li
                  className="list-group-item"
                  style={{ width: "max-content", cursor: "pointer" }}
                  key={room}
                  onClick={() => {
                    setroomId(room);
                  }}
                >
                  {room}
                </li>
              ))}
            </ul></div>
        </div> : null}
      <div
        className="container d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <div>
          <h3 className="display-4 border-end p-2 mx-2">
            Video calls and meetings for everyone
          </h3>
        </div>
        <form
          onSubmit={submitHandler}
          className="w-50 m-auto p-3 mx-2"
          style={{ boxShadow: " rgba(0, 0, 0, 0.08) 0px 4px 12px" }}
        >
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
    </>
  );
}

export default App;

function CustomAlert({
  alertMessage,
  open,
  alertType,
  handleClose,
  vertical,
  horizontal,
}) {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        anchorOrigin={{ vertical, horizontal }}
        severity={alertType}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {alertMessage}
      </Alert>
    </Snackbar>
  );
}
