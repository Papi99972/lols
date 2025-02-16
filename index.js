const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const logFile = path.join(__dirname, "ip_logs.json");
const htmlFile = path.join(__dirname, "logged_ips.html");

// Function to get client's IP
const getClientIp = (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress;

// Function to update HTML file
const updateHtmlFile = () => {
    let html = "<h1>Logged IPs</h1><ul>";
    if (fs.existsSync(logFile)) {
        const logs = JSON.parse(fs.readFileSync(logFile));
        let uniqueIps = new Set(logs.map(log => log.ip));
        uniqueIps.forEach(ip => {
            html += `<li>${ip}</li>`;
        });
    } else {
        html += "<li>No IPs logged yet.</li>";
    }
    html += "</ul>";
    fs.writeFileSync(htmlFile, html);
};

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
    
    updateHtmlFile();
    res.json({ message: "IP logged successfully." });
});

// Serve the HTML page
app.get("/", (req, res) => {
    if (!fs.existsSync(htmlFile)) {
        updateHtmlFile();
    }
    res.sendFile(htmlFile);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    updateHtmlFile();
});
