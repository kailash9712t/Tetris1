import { v4 as uuid } from "uuid";
export default (io) => {
    const Clients = new Map();
    io.on('connection', (socket) => {
        console.log("Client Connected");

        const Client = new ClientConnection(socket);
        Clients.set(Client.id,Client);
    });

    

    class ClientConnection{
        constructor(socket){
            this.socket = socket;
            this.id = uuid();
            this.HandleRoutes();
        }
        HandleRoutes(){
            this.SendData("ClientID",this.id);
            this.socket.on("RealTimeChat",(data) => this.RealTimeChats(data));
            this.socket.on("MessageSeen",(data) => this.MessageSeen(data));
            this.socket.on("disconnect",() => this.Disconnect());
        }
        updateIdWithName(){

        }
        SendData(Route, Data){
            this.socket.emit(Route,Data);
        }
        MessageSeen(data){
            const sender = data.sender;
            const targetClient = Clients.get(sender);

            if(!targetClient){
                targetClient.SendData("SeenMessage",data);
            }else{
                console.log("User not available on socket connection");
            }
        }

        MessageArrivedToServer(data){
            const sender = data.From;
            const targetClient = Clients.get(sender);
            if(!targetClient){
                const data = {
                    SeenStatus : 1,
                    MessageId : data.MessageId
                }
                this.SendData("MessageStatus",data);
            }else{
                console.log("User not present");
            }
        }

        RealTimeChats(data){
            const receiverName = data.To;
            const targetClient = Clients.get(receiverName);
            if(!targetClient){
                targetClient.SendData("RealTimeChat",data);

                this.MessageArrivedToServer(data);

                console.log("new Message");
            }else{
                console.log("Client not present is map");
            }
        }
        Disconnect(){
            this.socket.removeAllListeners();
            Clients.delete(this.id);
        }

    }
}