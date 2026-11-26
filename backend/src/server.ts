import app from "./app.js";
import { connectToDb } from "./db/db.js";

connectToDb();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("App is live at port:", PORT);
});
