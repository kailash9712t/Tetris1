import { v4 as uuid } from "uuid";
import { OfflineChatSupport } from "../Controller/controller.js";

export default (io) => {
    const Clients = new Map();
    io.on('connection', (socket) => {

        console.log("Client Connected");

        const Client = new ClientConnection(socket);
        Clients.set(Client.id, Client);

        console.log("Client Size", Clients.size);

        socket.on("disconnect", (reason) => {
            Client.Disconnect();
            console.log("User disconnected and the reason is : - ", reason);
            console.log("Client Size", Clients.size);
        })

        socket.on('error', (err) => { 
            console.log("Error occurs : - ", err);
        })
    });

    class ClientConnection {
        constructor(socket) {
            this.socket = socket;
            this.id = uuid();
            this.HandleRoutes();
        }
        HandleRoutes() {
            this.SendData("ClientID", this.id);
            this.socket.on("newUsername", (data) => this.NewUserName(data));
            this.socket.on("RealTimeChat", (data) => this.RealTimeChats(data));
            this.socket.on("penddingData", (data) => this.penddingConfirmation(data));
        }
        penddingConfirmation(data){
            const username = data.username;
            this.deletePendingData(username);
        }
        NewUserName(data) {
            const socket = Clients.get(data["clientId"]);
            Clients.set(data["username"], socket);
            Clients.delete(data["clientId"]);
            this.userPendingData(data["username"]);
            console.log("connected : - ",data["username"]);
            this.id = data["username"];
            console.log("Client Size", Clients);
        }
        SendData(Route, Data) {

            this.socket.emit(Route, Data);
        }
        MessageSeen(data) {
            const sender = data.sender;
            const targetClient = Clients.get(sender);

            if (!targetClient) {
                targetClient.SendData("SeenMessage", data);
            } else {
                console.log("User not available on socket connection");
            }
        }

        MessageArrivedToServer(data) {
            const sender = data.From;
            const targetClient = Clients.get(sender);
            if (!targetClient) {
                const data = {
                    SeenStatus: 1,
                    MessageId: data.MessageId
                }
                this.SendData("MessageStatus", data);
            } else {
                console.log("User not present");
            }
        }

        RealTimeChats(data) {
            console.log("realtimechat")
            console.log(data.to);
            const receiverName = data.to;
            const targetClient = Clients.get(receiverName);
            if (targetClient) {
                targetClient.SendData("RealTimeChat", data);
                console.log("new Message");
            } else {
                // FileHanding.storeData(receiverName, data);
                OfflineChatSupport.addChat(receiverName,data);
                console.log("Client not present is map");

            }
        }
        Disconnect() {
            console.log("User disconneted");
            this.socket.removeAllListeners();
            Clients.delete(this.id);
        }

        async userPendingData(username) {
            console.log("this user want to their pending chats : ",username);
            const chats = await OfflineChatSupport.readChat(username);
            console.log(chats);
            if(chats.length != 0){
                this.socket.emit("penddingData",chats[0].Chats);
            }
        }
        async deletePendingData(username){
            console.log("chats deleted");
            const chats = await OfflineChatSupport.deleteChat(username);

            if(chats == 1){
                console.log("Chats deleted");
            }else if(chats == 0){
                console.log("chats not avaliable for this user");
            }
        }
    }
}