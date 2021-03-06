import React from "react";
import Chatkit from "@pusher/chatkit-client";
import MessageList from "./components/MessageList/MessageList";
import SendMessageForm from "./components/SendMessageForm/SendMessageForm";
import RoomList from "./components/RoomList/RoomList";
import NewRoomForm from "./components/NewRoomForm/NewRoomForm";

import { tokenURL, instanceLocator } from "./config";

class App extends React.Component {
  constructor() {
    super(); //calls constructor function in React.Component class
    this.state = {
      roomId: null,
      messages: [],
      joinableRooms: [],
      joinedRooms: []
    };
    this.sendMessage = this.sendMessage.bind(this);
    this.subscribeToRoom = this.subscribeToRoom.bind(this);
    this.getRooms = this.getRooms.bind(this);
    this.createRoom = this.createRoom.bind(this);
  }

  componentDidMount() {
    const chatManager = new Chatkit.ChatManager({
      instanceLocator,
      userId: "Greg",
      tokenProvider: new Chatkit.TokenProvider({
        url: tokenURL
        // in a non-testing environment, you'd have your own endpoint via Node
      })
    });

    chatManager
      .connect()
      .then(currentUser => {
        console.log(currentUser);
        this.currentUser = currentUser;
        this.getRooms();
      })
      .catch(err => console.log("error on connecting: ", err));
  }

  getRooms() {
    this.currentUser
      .getJoinableRooms()
      .then(joinableRooms => {
        this.setState({
          joinableRooms,
          joinedRooms: this.currentUser.rooms
        });
      })
      .catch(err => console.log("error on joinableRooms: ", err));
  }

  sendMessage(text) {
    console.log("app", text);
    console.log(this.state.roomId);
    this.currentUser.sendMessage({
      text,
      roomId: this.state.roomId
    });
  }

  createRoom(name) {
    this.currentUser
      .createRoom({
        name
      })
      .then(room => this.subscribeToRoom(room.id))
      .catch(err => console.log("error with creatRoom: ", err));
  }

  subscribeToRoom(roomId) {
    this.setState({ messages: [] });
    this.currentUser
      .subscribeToRoom({
        roomId: roomId,
        hooks: {
          onMessage: message => {
            console.log("Added new message");
            this.setState({
              messages: [...this.state.messages, message] // Don't want to modify the original array, use setState()
            });
          }
        }
      })
      .then(room => {
        this.setState({
          roomId: room.id
        });
        this.getRooms();
      })
      .catch(err => console.log("error on subscribing to room: ", err));
  }

  render() {
    console.log("this.state.messages: ", this.state.messages);
    return (
      <div className="app">
        <RoomList
          roomId={this.state.roomId}
          subscribeToRoom={this.subscribeToRoom}
          rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]}
        />
        <MessageList
          roomId={this.state.roomId}
          messages={this.state.messages}
        />
        <SendMessageForm
          disabled={!this.state.roomId}
          sendMessage={this.sendMessage}
        />
        <NewRoomForm createRoom={this.createRoom} />
      </div>
    );
  }
}

export default App;
