import "./chat.css";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

function Chat({ userID }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUserChat, setCurrentUserChat] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();

  useEffect(() => {
    socket.current = io("https://projectsworkbboard.onrender.com", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt:
          new Date(Date.now()).getHours() +
          " : " +
          new Date(Date.now()).getMinutes(),
      });
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   arrivalMessage &&
  //     currentUserChat?.includes(arrivalMessage.sender) &&
  //     setMessageList((prev) => [...prev, arrivalMessage]);
  // }, [arrivalMessage, currentUserChat]);

  useEffect(() => {
    if (
      arrivalMessage &&
      currentUserChat.some((user) => user.user === arrivalMessage.sender)
    ) {
      setMessageList((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentUserChat]);

  useEffect(() => {
    // setCurrentUserChat(...currentUserChat, { user: userID });
    setCurrentUserChat((prev) => [...prev, { user: userID }]);
    socket.current.emit("addUser", userID);
    socket.current.on("getUsers", (users) => {
      console.log(users);
    });
    socket.current.on("disconnect", () => {
      setCurrentUserChat((prev) =>
        prev.filter((current) => current.user !== userID)
      );
    });
  }, [userID, currentUserChat]);

  const sendMessage = async () => {
    if (currentMessage !== "" || currentMessage.trim()) {
      const messageData = {
        sender: userID,
        text: currentMessage,
        createdAt:
          new Date(Date.now()).getHours() +
          " : " +
          new Date(Date.now()).getMinutes(),
      };

      // const receiverId = currentUserChat.find((member) => member !== userID);
      const receiverId = currentUserChat.find(
        (member) => member.user !== userID
      )?.user;
      if (receiverId) {
        socket.current.emit("sendMessage", {
          senderId: userID,
          receiverId,
          messageData,
        });
      }

      setMessageList((prev) => [
        ...prev,
        {
          sender: userID,
          text: currentMessage,
          createdAt:
            new Date().getHours() +
            ":" +
            String(new Date().getMinutes()).padStart(2, "0"),
        },
      ]);

      setCurrentMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-body">
        {messageList.map((messageContent, index) => (
          <div
            key={index + 1}
            className="message"
            id={userID === messageContent.sender ? "you" : "other"}
          >
            <div>
              <div className="message-content">
                <p>{messageContent.text}</p>
              </div>
              <div className="message-meta">
                <p id="time">{messageContent.createdAt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-send-cont">
        <input
          className="chat-in"
          type="text"
          placeholder="Enter a message!"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
        />
        <button onClick={sendMessage} className="chat-send">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
