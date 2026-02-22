import cron from "cron";
import https from "https";

const URL = "https://threads-clone-9if3.onrender.com";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        // Request sent successfully
      } else {
        // Request failed
      }
    })
    .on("error", (e) => {
      console.error("Error while sending request", e);
    });
});

export default job;
