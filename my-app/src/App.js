import React from "react";
import Chatkit from "@pusher/chatkit-client";
import MessageList from "./components/MessageList";
import SendMessageForm from "./components/SendMessageForm";
import RoomList from "./components/RoomList";
import NewRoomForm from "./components/NewRoomForm";

import { tokenURL, instanceLocator } from "./config";

class App extends React.Component() {
  constructor() {
    super(); //calls constructor function in React.Component class
    this.state = {
      messages: [],
      joinableRooms: [],
      joinedRooms: []
    };
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator,
      userId: "Greg",
      tokenProvider: new Chatkit.tokenProvider({
        url: tokenURL
        // in a non-testing environment, you'd have your own endpoint via Node
      })
    });

    chatManager
      .connect()
      .then(currentUser => {
        this.currentUser = currentUser;

        this.currentUser
          .getJoinableRooms()
          .then(joinableRooms => {
            this.setState({
              joinableRooms,
              joinedRooms: this.currentUser.rooms
            });
          })
          .catch(err => console.log("error on joinableRooms: ", err));

        this.currentUser.subscribeToRoom({
          roomId: 19423871,
          hooks: {
            onNewMessage: message => {
              console.log("message.text: ", message.text);
              this.setState({
                messages: [...this.state.messages, message] // Don't want to modify the original array, use setState()
              });
            }
          }
        });
      })
      .catch(err => console.log("error on connecting: ", err));
  }

  sendMessage(text) {
    this.currentUser.sendMessage({
      text,
      roomId: 19423871
    });
  }

  render() {
    console.log("this.state.messages: ", this.state.messages);
    return (
      <div className="app">
        <RoomList
          rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]}
        />
        <MessageList messages={this.state.messages} />
        <SendMessageForm sendMessage={this.sendMessage} />
        <NewRoomForm />
      </div>
    );
  }
}

export default App;
