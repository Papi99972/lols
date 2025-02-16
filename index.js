const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const logFile = path.join(__dirname, "ip_logs.json");

// Function to get client's IP
const getClientIp = (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress;

// Endpoint to log IP
app.post("/log-ip", (req, res) => {
    const ip = getClientIp(req);
    const timestamp = new Date().toISOString();
    
    const logEntry = { ip, timestamp };
    let logs = [];
    
    if (fs.existsSync(logFile)) {
        logs = JSON.parse(fs.readFileSync(logFile));
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log("Logged IP:", logEntry);

    res.json({ message: "IP logged successfully." });
});

// Serve logged IPs at /hugs.html
app.get("/hugs.html", (req, res) => {
    if (!fs.existsSync(logFile)) {
        return res.send("No IPs logged yet.");
    }
    
    const logs = JSON.parse(fs.readFileSync(logFile));
    let html = "<h1>Logged IPs</h1><ul>";
    logs.forEach(log => {
        html += `<li>${log.ip} - ${log.timestamp}</li>`;
    });
    html += "</ul>";
    
    res.send(html);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
