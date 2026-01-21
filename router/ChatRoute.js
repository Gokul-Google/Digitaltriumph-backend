const express = require("express");
const router = express.Router();
const { WebClient } = require("@slack/web-api");
const sessionStore = require('../sessionStore')

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
function cleanSlackText(text = "") {
  return text
    // mailto
    .replace(/<mailto:([^|>]+)\|[^>]+>/g, "$1")
    // user mentions
    .replace(/<@([A-Z0-9]+)>/g, "User")
    // links
    .replace(/<([^|>]+)\|[^>]+>/g, "$1");
}

// SEND MESSAGE
router.post("/send", async (req, res) => {
  try {
    const {userName, userId, message, sessionId} = req.body;
let session  = sessionStore[sessionId];

    if (!session ) {
      const parent = await slack.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
       // text: `Session: ${sessionId}|New Chat`,
       text: `User: ${userName || "Guest"} (${userId || "N/A"})\nSession: ${sessionId}`,
      });
     let  threadTs = parent.ts;
      sessionStore[sessionId] = {
        threadTs,
        userId,
        userName
    };
    session = sessionStore[sessionId];
    }

     const reply = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      thread_ts: session.threadTs,
      text: message,
    });

    res.json({ success: true, ts: reply.ts  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Slack send failed" });
  }
});

// GET MESSAGES ✅
// router.get("/messages", async (req, res) => {
//   try {
//     const { sessionId } = req.query;
//     if (!sessionId) {
//       return res.status(400).json({ error: "sessionId required" });
//     }
//     const history = await slack.conversations.history({
//      channel: process.env.SLACK_CHANNEL_ID,
//       limit: 20,
//     });
//     let allMessages = [];
    

//      for (const msg of history.messages) {
//          // Match Slack messages with or without space after colon
// if (!msg.text?.startsWith(`Session:${sessionId}|`) && !msg.text?.startsWith(`Session: ${sessionId}|`)) continue;


//           const content = msg.text.split("|")[1];
//       if (!content) continue;
//       // parent message
//       allMessages.push({
//         text: content,
//         ts: msg.ts,
//         from: "user",
//       });
// if (msg.reply_count && msg.reply_count > 0) {
//         const replies = await slack.conversations.replies({
//           channel: process.env.SLACK_CHANNEL_ID,
//           ts: msg.ts,
//         });
        
//         replies.messages.slice(1).forEach(r => {
//           allMessages.push({
//             text: r.text,
//             ts: r.ts,
//             from: "slack",
//           });
//         });
//       }
//     }

//     // sort by time
//     allMessages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

//     res.json(allMessages); // 🔥 THIS MUST BE AN ARRAY
//   } catch (err) {
//   console.error("Slack error:", err.data || err.message);
//   res.status(500).json({
//     error: "Slack fetch failed",
//     details: err.data || err.message,
//   });
// }
// });


router.get("/messages", async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }

    const session = sessionStore[sessionId];

    // No messages yet for this session
    if (!session) {
      return res.json([]);
    }

    const replies = await slack.conversations.replies({
      channel: process.env.SLACK_CHANNEL_ID,
      ts: session.threadTs,
    });

    const messages = replies.messages.slice(1).map(m => ({
      text:cleanSlackText(m.text),
      ts: m.ts,
      from: m.bot_id ? "slack" : "user",
    }));

    // Slack already returns ordered, but keep safe
    messages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

    res.json(messages);
  } catch (err) {
    console.error("Slack error:", err.data || err.message);
    res.status(500).json({
      error: "Slack fetch failed",
      details: err.data || err.message,
    });
  }
});


const sleep = ms => new Promise(r => setTimeout(r, ms));

router.delete("/clear-slack-history", async (req, res) => {
  try {
    const history = await slack.conversations.history({
      channel: process.env.SLACK_CHANNEL_ID,
      limit: 200,
    });

    let deleted = 0;

    for (const msg of history.messages) {
      // ✅ Bot messages only
      if (msg.bot_id) {
        await slack.chat.delete({
          channel: process.env.SLACK_CHANNEL_ID,
          ts: msg.ts,
        });

        deleted++;
        await sleep(1200); // 🔥 REQUIRED to avoid rate limit
      }
    }

    res.json({ success: true, deleted });
  } catch (err) {
    console.error("Slack clear failed:", err);
    res.status(500).json({ error: "Failed to clear Slack history" });
  }
});

module.exports = router;
