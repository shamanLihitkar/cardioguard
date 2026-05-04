import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const payload = JSON.stringify({
    userId: Math.floor(Math.random() * 5) + 1,
    heartRate: Math.random() > 0.9 ? 0 : 70 + Math.random() * 50,
    spo2: 97 + Math.random(),
    lat: 18.7,
    lng: 73.4,
  });

  const url = "https://cardioguard-wfks.onrender.com/vitals";

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: "60s", // important for Render cold start
  };

  const res = http.post(url, payload, params);

  // 🔍 DEBUG LOGS
  console.log("➡️ Request sent to:", url);
  console.log("📦 Payload:", payload);
  console.log("📡 Status:", res.status);
  console.log("⏱️ Response time:", res.timings.duration, "ms");

  // ❌ Error logging
  if (res.status !== 200) {
    console.error("❌ Request failed:", res.body);
  }

  sleep(0.3);
}