import express from "express";
import fs from "fs/promises";
import path from "path";

const pageRouter = express.Router();

const environment = process.env.NODE_ENV;

pageRouter.get("/*", async (_req, res) => {
  const data = {
    environment,
    manifest: await parseManifest(),
  };

  res.render("index.html.ejs", data);
});

const parseManifest = async () => {
  if (environment !== "production") return {};

  const manifestPath = path.join(path.resolve(), "dist", "manifest.json");
  const manifestFile = await fs.readFile(manifestPath);

  return JSON.parse(manifestFile);
};

export default pageRouter;