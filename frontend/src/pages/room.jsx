import React, { useCallback, useEffect, useState } from "react";
import { IoMdCall } from "react-icons/io";
import { FiCheck } from "react-icons/fi";
import { FcCancel } from "react-icons/fc";
import { useSocket } from "../context/socket";
import { useParams } from "react-router";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router";
import { FiCameraOff, FiCamera } from "react-icons/fi";
import { Container } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import { IoMdMic } from "react-icons/io";
import { IoMdMicOff } from "react-icons/io";

export default function Room() {
  const socket = useSocket();
  const [remoteSocketId, setremoteSocketId] = useState(null);
  const [remoteUser, setremoteUser] = useState(null);
  const [localStream, setlocalStream] = useState(null);
  const [remoteStream, setremoteStream] = useState(null);
  const [userCalled, setuserCalled] = useState(false);
  const [userDisconneted, setUserDisconneted] = useState(false);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [userReceived, setuserReceived] = useState(false)
  const [isCaller, setIsCaller] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const navigate = useNavigate();

  const { userid, id } = useParams();

  const handleUserCall = useCallback(async () => {
    const localuserstream = await navigator.mediaDevices.getUserMedia({
      audio: localAudioEnabled,
      video: localVideoEnabled,
    });
    const offer = await peer.createOffer();
    socket.emit("user:call", { from: userid, to: remoteSocketId, offer });
    setlocalStream(localuserstream);
    sendLocalStream();
    setuserCalled(true);
    setIsCaller(true);
  }, [socket, remoteSocketId, localAudioEnabled, localVideoEnabled]);

  const handleUserJoin = useCallback(({ from, email }) => {
    setremoteSocketId(from);
    setremoteUser(email);
  }, []);
  const handleUserLeave = () => {
    socket.emit("user:hangup", { to: remoteSocketId });
    const remoteSocketIdref = remoteSocketId;
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    peer.peer.close();
    setlocalStream(null);
    setremoteStream(null);
    setremoteSocketId(null);
    setremoteUser(null);
    setuserCalled(false);
    socket.emit("user:disconnected", { to: remoteSocketIdref });
    peer.reinitializeConnection();
    navigate("/");
  };
  const handleIncomingCall = useCallback(
    async ({ from, offer, email }) => {
      const localuserstream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setremoteSocketId(from);
      setremoteUser(email);
      setlocalStream(localuserstream);
      const ans = await peer.createAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      setuserCalled(true);
      setIsCaller(false);
    },
    [socket]
  );
  const sendLocalStream = useCallback(() => {
    if (localStream) {
      const tracks = localStream.getTracks();
      tracks.forEach((track) => {
        if (track.kind === "audio") {
          track.enabled = localAudioEnabled;
        } else if (track.kind === "video") {
          track.enabled = localVideoEnabled;
        }
      });

      tracks.forEach((track) => {
        if (localAudioEnabled && track.kind === "audio") {
          peer.peer.addTrack(track, localStream);
        } else if (localVideoEnabled && track.kind === "video") {
          peer.peer.addTrack(track, localStream);
        } else {
          peer.peer.removeTrack(track, localStream);
        }
      });
    }
  }, [localStream, localAudioEnabled, localVideoEnabled]);
  const handleCallAcceptance = useCallback(
    ({ from, ans }) => {
      peer.setRemoteDescription(ans);
      sendLocalStream();
      setCallAccepted(true);
    },
    [sendLocalStream]
  );
  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.createOffer();
    socket.emit("nego:needed", { to: remoteSocketId, offer });
  }, [socket, remoteSocketId]);

  const handleNegotiationAcceptance = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.createAnswer(offer);
      socket.emit("nego:final", { to: from, ans });
    },
    [socket]
  );
  const handleNegotiationFinal = useCallback(
    async ({ from, ans }) => {
      await peer.setRemoteDescription(ans);
    },
    [socket, peer]
  );
  const handleUserDisconnected = useCallback(() => {
    setUserDisconneted(true);
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    // navigate("/")
  }, []);
  useEffect(() => {
    peer.peer.addEventListener("track", (e) => {
      const streams = e.streams;
      console.log("Got tracks");
      setremoteStream(streams[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:join", handleUserJoin);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAcceptance);
    socket.on("nego:accept", handleNegotiationAcceptance);
    socket.on("nego:final", handleNegotiationFinal);
    socket.on("user:disconnected", handleUserDisconnected);
    return () => {
      socket.off("user:join", handleUserJoin);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAcceptance);
      socket.off("nego:accept", handleNegotiationAcceptance);
      socket.off("nego:final", handleNegotiationFinal);
      socket.off("user:disconnected", handleUserDisconnected);
    };
  }, [
    socket,
    handleUserJoin,
    handleIncomingCall,
    handleCallAcceptance,
    handleNegotiationAcceptance,
    handleNegotiationFinal,
    handleUserDisconnected,
  ]);
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return () => {
      peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  return (
    <>
      <div className="container my-2">
        <div className="w-75 m-auto d-flex justify-content-between align-items-center">
          <div>
            <h4>
              Welcome To Room {id} {userid?.split("@")[0]}
            </h4>
          </div>
          <div className="d-flex gap-3">
            {remoteSocketId && !userCalled && !userDisconneted ? (
              <div className="d-flex gap-3">

                <button
                  className="btn btn-outline-danger"
                  onClick={handleUserCall}
                >
                  Call<IoMdCall />
                </button>
                <Avatar sx={{ bgcolor: red[600] }}>{remoteUser[0]?.toUpperCase()}</Avatar>
              </div>
            ) : (
              remoteSocketId && (
                <button
                  className="btn btn-outline-info"
                  onClick={handleUserLeave}
                >
                  Hang Up
                </button>
              )
            )}
            {(remoteSocketId && userCalled && localStream && remoteStream && !userReceived) && <>
              <div className="d-flex gap-3">
                <Avatar sx={{ bgcolor: red[600] }}>
                  {remoteUser[0]?.toUpperCase()}
                </Avatar>
                <span>
                  {isCaller && !callAccepted ? "calling" : ""}
                </span>
              </div>
              {!isCaller && !userReceived && (
                <button
                  className="btn btn-outline-success"
                  onClick={() => {
                    setuserReceived(true);
                    sendLocalStream();
                  }}
                >
                  Receive <FaVideo />
                </button>
              )}
            </>}
          </div>
          <div>

            {remoteSocketId ? (
              <div className="d-flex gap-3"><Avatar sx={{ bgcolor: red[600] }}>{remoteUser[0]?.toUpperCase()}</Avatar><span> Joined the room <FiCheck color="green" /></span></div>
            ) : (
              <span> No one is there in room <FcCancel color="red" /></span>
            )}
          </div>
        </div>
      </div>
      {localStream &&
        <Container>
          <div className="border rounded localvideocontainer p-2 bg-dark">
            {localStream && (
              <ReactPlayer
                playing={localVideoEnabled}
                muted={!localAudioEnabled}
                url={localStream}
                width={"100%"}
                height={"100%"}
              />
            )}
            <div className="border rounded remotevideocontainer p-2 bg-dark">
              {remoteStream && (
                <div className="position-relative">
                  <ReactPlayer
                    playing={remoteVideoEnabled}
                    muted={!remoteAudioEnabled}
                    url={remoteStream}
                    width={"100%"}
                    height={"100%"}
                  />
                  <div className="d-flex align-items-center position-absolute top-50 start-50 translate-middle gap-3">
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => {
                        setRemoteVideoEnabled((prev) => !prev);
                      }}
                    >
                      {remoteVideoEnabled ? <FiCamera /> : <FiCameraOff />}
                    </button>
                    <button
                      className="btn btn-outline-light btn-lg"
                      onClick={() => {
                        setRemoteAudioEnabled((prev) => !prev);
                      }}
                    >
                      {remoteAudioEnabled ? <IoMdMicOff /> : <IoMdMic />}
                    </button>
                  </div>
                </div>

              )}
            </div>
          </div>
        </Container>
      }
      {userCalled && (
        <div className="m-auto" style={{ width: "max-content" }}>
          <button
            className="btn btn-outline-dark btn-lg"
            onClick={() => {
              setLocalVideoEnabled((prev) => !prev);
            }}
          >
            {localVideoEnabled ? <FiCamera /> : <FiCameraOff />}
          </button>
          <button
            className="btn btn-outline-dark mx-2 my-2 btn-lg"
            onClick={() => {
              setLocalAudioEnabled((prev) => !prev);
            }}
          >
            {localAudioEnabled ? <IoMdMicOff /> : <IoMdMic />}
          </button>
        </div>
      )}
    </>
  );
}
