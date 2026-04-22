import { Server } from "socket.io";
import http from "http"
import { livePrices } from "../services/livePrices.service";
import redisClient from "./redis";

let io: Server

export const initializeSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.on('connection', (socket) => {
        console.log("client connected: ", socket.id)
        
        // Send prices in 1s interval
        const Interval = setInterval(async () => {
            const prices = await livePrices();
            await redisClient.set("livePrices", JSON.stringify(prices))
            io.emit("gold_silver_prices", prices)
        }, 1000)

        socket.on('disconnect',()=>{
            clearInterval(Interval)
        })
    })

}