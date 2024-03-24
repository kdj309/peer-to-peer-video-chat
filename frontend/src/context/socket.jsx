import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext(null);
function useSocket() {
  return useContext(SocketContext);
}
export { useSocket };
function SocketProvider({ children }) {
  const socket = useMemo(() => {
    const socketinstance = io("https://probable-space-garbanzo-9w56vpjgqg92957j-3000.app.github.dev/");
    return socketinstance;
  });
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
export default SocketProvider;
