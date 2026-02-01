const cron = require("node-cron");
const FlatStay = require("../models/flatStay");
const Flat = require("../models/flat");
const CronLog = require("../models/cronLog");

cron.schedule("1 0 * * *", async () => {
  console.log("🕛 Stay auto-end cron started");

  try {
    const today = new Date();

    const stays = await FlatStay.find({
      isActive: true,
      stayTo: { $lt: today }
    });
    for (let stay of stays) {
      try {
        stay.isActive = false;
        stay.residentType = null;
        stay.endedBy = "CRON";
        await stay.save();

        const flatId = stay.flat._id || stay.flat;
        await Flat.findByIdAndUpdate(flatId, {
          residentType: null,
          resident: null,

        });

        await CronLog.create({
          jobName: `auto end stay`,
          stayId: stay._id,
          flatId,
          status: `SUCCESS`,
          message: `Stay auto-ended successfully`,
        })
        console.log("✅ Auto-ended stay:", stay._id);

      } catch (error) {
        await CronLog.create({
          jobName: "AUTO_END_STAY",
          stayId: stay._id,
          status: "FAILED",
          message: error.message
        });
        console.error("❌ Cron stay error:", error.message);
      }
    }
  } catch (error) {
    console.error("❌ Cron fatal error:", error.message);
  }
},
  {
    timezone: `Asia/Kolkata`
  }

);
