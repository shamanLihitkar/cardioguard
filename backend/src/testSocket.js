import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected to server");

  let count = 0;

  const interval = setInterval(() => {
    const data = {
      userId: 1,
      heartRate: 0, // keep 0 to trigger alert
      spo2: 85,
      lat: 18.52,
      lng: 73.85
    };

    console.log("📤 Sending:", data);

    socket.emit("vitals", data);

    count++;

    if (count === 5) {
      clearInterval(interval);
      console.log("🛑 Stopped sending");
    }
  }, 5000); // every 5 sec
});