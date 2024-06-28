const Message = ({ text, sender }) => (
    <div className="container flex-row">
      <div
        className={`message-container ${
          sender === "user" ? "user-message" : "assistant-message"
        }`}
      ></div>
      <div
        style={
          sender === "user"
            ? {
                display: "flex",
                // justifyContent: "flex-end",
                marginLeft: "25%",
              }
            : { marginLeft: "0", marginRight: "15%" }
        }
        className={`message-text ${
          sender === "assistant" ? "assistant-text" : "user-text"
        }`}
      >
        {text}
      </div>
    </div>
  );
  
  export default Message;
  