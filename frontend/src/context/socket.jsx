import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext(null);
function useSocket() {
  return useContext(SocketContext);
}
export { useSocket };
function SocketProvider({ children }) {
  const socket = useMemo(() => {
    const socketinstance = io("http://localhost:3000");
    return socketinstance;
  });
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
export default SocketProvider;
