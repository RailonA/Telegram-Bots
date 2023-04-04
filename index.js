require('dotenv').config()

const Telegram = require('node-telegram-bot-api');
// const cronJob = require("cron").CronJob;
const schedule = require('node-schedule');
const rwClient = require("./scripts/twitter_API.js");

// const tokens = JSON.parse(fs.readFileSync("./tokens/telegram_token.json", "utf8"));
// Create a TelegramBot that uses 'polling' to fetch new updates
const FxNewsBot = new Telegram('process.env.FX_NEWS_BOT', { polling: true });
// const CryptoNewsBot = new Telegram(process.env.CRYPTO_NEWS_BOT, { polling: true });

const startDate = new Date();

try {
  FxNewsBot.on('message', async (message) => {

    if (new Date(message.date * 1000) > startDate && message.text) {
      console.log("Got a telegram message: " + message.text);

      //populate object with Telegram information
      let plateformObject = {
        platform: "telegram",
        userID: message.from.id,
        message: message,
        chatID: message.chat.id
      }

      let   fxCurrenTweet = "";

      // Checking Twitter page 12 am for new tweet
      let job = schedule.scheduleJob(' 0 * * * * *', async function () {
        const forexLiveNews= await rwClient.v1.userTimelineByUsername("@ForexLive");
        let tweetList = forexLiveNews.tweets;
        let fxNewsTweet = tweetList[0].full_text
        
        if (fxNewsTweet !== fxCurrenTweet) {
          FxNewsBot.sendMessage(plateformObject.chatID, '@ForexLive Tweeted:');
          FxNewsBot.sendMessage(plateformObject.chatID, fxNewsTweet)
          fxCurrenTweet = fxNewsTweet;
          return fxCurrenTweet
        } else {
          console.log("DONT PRINT ")
        }
      })

      job.start


    } else if (message.text) {
      console.log("Skipping telegram message: " + message.text);
      return null;
    }
  })

  // CryptoNewsBot.on('message', async (message) => {

  //   if (new Date(message.date * 1000) > startDate && message.text) {
  //     console.log("Got a telegram message: " + message.text);

  //     //populate object with Telegram information
  //     let plateformObject = {
  //       platform: "telegram",
  //       userID: message.from.id,
  //       message: message,
  //       chatID: message.chat.id
  //     }

  //     let   cryptoCurrenTweet = "";

  //     // Checking Twitter page 12 am for new tweet
  //     let job = schedule.scheduleJob(' 0 * * * * *', async function () {
  //       const cryptoLiveNews= await rwClient.v1.userTimelineByUsername("@itscrypto_news");
  //       let tweetList = cryptoLiveNews.tweets;
  //       let cryptoNewsTweet = tweetList[0].full_text
        
  //       if (cryptoNewsTweet !== cryptoCurrenTweet) {
  //         CryptoNewsBot.sendMessage(plateformObject.chatID, '@itscrypto_news Tweeted:');
  //         CryptoNewsBot.sendMessage(plateformObject.chatID, cryptoNewsTweet)
  //         cryptoCurrenTweet = cryptoNewsTweet;
  //         return cryptoCurrenTweet
  //       } else {
  //         console.log("DONT PRINT ")
  //       }
  //     })

  //     job.start


  //   } else if (message.text) {
  //     console.log("Skipping telegram message: " + message.text);
  //     return null;
  //   }
  // })

} catch (e) {
  Rollbar.error("Something went wrong", e);
  console.log("Something went wrong", e);
}

