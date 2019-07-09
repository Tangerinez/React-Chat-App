import React from "react";
import Message from ".Message";

class MessageList extends React.Component {
  render() {
    return (
      <div className="message-list">
        {this.props.messages.map((message, index) => {
          // props passed from App.js
          return <Message key={index} username={message.senderId} />;
        })}
      </div>
    );
  }
}

export default MessageList;
