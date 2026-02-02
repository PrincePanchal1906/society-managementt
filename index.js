const express = require("express");
const app = express();
const PORT = 8888;
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
require("./cron/endStayCron");
const { errHandleMulter } = require("./services/errHandleMulter")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use((req, res, next) => {
  res.locals.oldData = {};
  res.locals.error = null;
  next();
});
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(errHandleMulter);



const userRoutes = require("./routes/user");
const blockRoutes = require("./routes/blockRoutes")
const visitorRoutes = require("./routes/visitorRoutes")
const flatRoutes = require("./routes/flatRoutes");
const memberRoutes = require("./routes/memberRoutes")
const tenantRoutes = require("./routes/tenantRoutes")
const flatStayMasterRoute = require("./routes/flatStay")
const documentViewerRoutes = require("./routes/documentViewerRoutes")
const maintenanceRoutes = require("./routes/maintenance")
const transferMemberRoutes = require("./routes/transferMember")
mongoose.connect("mongodb://localhost:27017/society-managment", { autoIndex: false })
  .then((e) => console.log(`connected mongodb successfully`))


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


<<<<<<< HEAD

=======
// app.use("/",staticRoutes); helloooo
<p>helo everyone</p>
>>>>>>> ffc292511e16d6849e8cac0b36e64643003be9e3
app.use("/", userRoutes);
app.use("/block", blockRoutes);
app.use("/flat", flatRoutes);
app.use("/member", memberRoutes)
app.use("/visitor", visitorRoutes)
app.use("/tenant", tenantRoutes)
app.use("/flatStayMaster", flatStayMasterRoute)
app.use("/document-master", documentViewerRoutes)
app.use("/maintenance", maintenanceRoutes)
app.use("/transferMember", transferMemberRoutes)

app.listen(PORT, () => console.log(`server started at ${PORT} `))
