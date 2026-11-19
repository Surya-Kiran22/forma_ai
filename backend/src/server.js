

// Trust Render's reverse proxy / load balancer so that
// express-rate-limit can correctly read the client IP from
// the X-Forwarded-For header instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Forma AI API is running" });
});

const extractionRoutes = require("./routes/extractionRoutes");
app.use("/api/extraction", extractionRoutes);

const draftRoutes = require("./routes/draftRoutes");
app.use("/api/drafts", draftRoutes);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
