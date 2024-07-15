// const express = require("express");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// dotenv.config();
// const app = express();
// const port = process.env.PORT || 5000;

// // CORS middleware
// const corsOptions = {
//   origin: "*",
//   methods: ["GET", "POST"],
//   allowedHeaders: ["Content-Type"],
// };

// app.use(cors(corsOptions));
// app.use(express.json());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Salesforce OAuth configuration
// const clientId = process.env.SF_CLIENT_ID;
// const clientSecret = process.env.SF_CLIENT_SECRET;
// const redirectUri = `https://apex-6huo.onrender.com/auth/callback`;
// const salesforceLoginUrl = "https://login.salesforce.com";

// // Routes
// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// // Route to initiate OAuth flow
// app.get("/auth/salesforce", (req, res) => {
//   // Redirect user to Salesforce login page
//   res.send(
//     `${salesforceLoginUrl}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`
//   );
// });

// // Callback route after user authorizes
// app.get("/auth/callback", async (req, res) => {
//   const code = req.query.code;

//   try {
//     // Exchange authorization code for access token
//     const response = await axios.post(
//       `${salesforceLoginUrl}/services/oauth2/token`,
//       `grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`,
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );
//     console.log(response);

//     // Optionally, you can store the access token securely for further API calls
//     const accessToken = response.data.access_token;
//     const instanceUrl = response.data.instance_url;

//     // Redirect to frontend or send response with access token
//     res.json({ accessToken, instanceUrl });
//   } catch (error) {
//     console.error("Salesforce OAuth error:", error.response.data);
//     res
//       .status(500)
//       .json({ error: "Failed to complete Salesforce OAuth process" });
//   }
// });

// // Endpoint to receive Salesforce notifications
// app.post("/notifications", (req, res) => {
//   const notification = req.body;

//   // Forward notification to all connected WebSocket clients
//   io.emit("salesforce-notification", notification);

//   res.status(200).send("Notification received");
// });

// // Start server
// server.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// const express = require("express");
// const cors = require("cors");
// const app = express();
// const port = 3000;
// app.use(cors());
// app.get("/api/personality", (req, res) => {
//   console.log(req);
//   const data = {
//     discType: "IC",
//     oceanType: "OCEA",
//     about:
//       "Harsh Dubey is a passionate and motivated student and MERN stack developer with a strong foundation in data science and programming. They are proficient in various programming languages and frameworks, including React, Node.js, and MongoDB. They are constantly evolving their skills and integrating their theoretical knowledge with practical development experience.",
//   };
//   res.json(data);
// });

// app.listen(port, () => {
//   console.log(`Personality server is running at http://localhost:${port}`);
// });
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// CORS middleware
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Salesforce OAuth configuration
const sfClientId = process.env.SF_CLIENT_ID;
const sfClientSecret = process.env.SF_CLIENT_SECRET;
const sfRedirectUri = `https://apex-6huo.onrender.com/auth/salesforce/callback`;
const salesforceLoginUrl = "https://login.salesforce.com";

// HubSpot OAuth configuration
const hsClientId = process.env.HS_CLIENT_ID;
const hsClientSecret = process.env.HS_CLIENT_SECRET;
const hsRedirectUri = `https://apex-6huo.onrender.com/auth/hubspot/callback`;
const hubspotLoginUrl = "https://app.hubspot.com/oauth/authorize";

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Salesforce OAuth flow
app.get("/auth/salesforce", (req, res) => {
  res.send(
    `${salesforceLoginUrl}/services/oauth2/authorize?response_type=code&client_id=${sfClientId}&redirect_uri=${sfRedirectUri}`
  );
});

app.get("/auth/salesforce/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post(
      `${salesforceLoginUrl}/services/oauth2/token`,
      `grant_type=authorization_code&client_id=${sfClientId}&client_secret=${sfClientSecret}&code=${code}&redirect_uri=${sfRedirectUri}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = response.data.access_token;
    const instanceUrl = response.data.instance_url;
    res.json({ accessToken, instanceUrl });
  } catch (error) {
    console.error("Salesforce OAuth error:", error.response.data);
    res
      .status(500)
      .json({ error: "Failed to complete Salesforce OAuth process" });
  }
});

// HubSpot OAuth flow
app.get("/auth/hubspot", (req, res) => {
  res.send(
    `${hubspotLoginUrl}?client_id=${hsClientId}&redirect_uri=${hsRedirectUri}&scope=contacts`
  );
});

app.get("/auth/hubspot/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post(
      `https://api.hubapi.com/oauth/v1/token`,
      `grant_type=authorization_code&client_id=${hsClientId}&client_secret=${hsClientSecret}&code=${code}&redirect_uri=${hsRedirectUri}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("HubSpot OAuth error:", error.response.data);
    res.status(500).json({ error: "Failed to complete HubSpot OAuth process" });
  }
});

// Endpoint to receive Salesforce notifications
app.post("/notifications", (req, res) => {
  const notification = req.body;
  console.log(req.body);
  io.emit("salesforce-notification", notification);
  res.status(200).send("Notification received");
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
