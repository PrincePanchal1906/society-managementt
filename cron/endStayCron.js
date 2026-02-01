const cron = require("node-cron");
const FlatStay = require("../models/flatStaySchema");
const Flat = require("../models/flat");
const { isAsync } = require("../joiValidation/joiFlatSchema");


cron.schedule("*/5 * * * *", async () => {
   try {
      const today = new Date();
      const stays = await FlatStay.find({
         isActive: true,
         stayTo: { $lte: today }
      }).select("_id flat");
      if (stays.length === 0) {
         return
      }
      const stayIds = [];
      const flatIds = [];

      for (let stay of stays) {
         stayIds.push(stay._id)
         flatIds.push(stay.flat)
      }
      await FlatStay.updateMany(
         { _id: { $in: stayIds } },
         {
            $set: {
               isActive: false,
               endedBy: "CRON"
            }
         }
      )
      await Flat.updateMany(
         { _id: { $in: flatIds } },
         {
            $set: {
               residentType: null,
               resident: null,
            }
         }
      )

   } catch (error) {
      console.log(error);
   }
})
console.log("Running stay auto-end cron");