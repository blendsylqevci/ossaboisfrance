import { describe, it } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { optimizeHouseUploadImage } from "./optimize-house-upload-image.ts";

describe("optimizeHouseUploadImage", () => {
  it("rejects declared image dimensions above the caller's pixel budget", async () => {
    const oversizedSvg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="4100" height="4100"><rect width="100%" height="100%" fill="white"/></svg>'
    );

    await assert.rejects(
      () =>
        optimizeHouseUploadImage(oversizedSvg, "screenshot.jpg", {
          limitInputPixels: 16_000_000,
        }),
      /pixel limit/i
    );
  });

  it("keeps a normal configurator screenshot within the expected dimensions", async () => {
    const screenshot = await sharp({
      create: {
        width: 3840,
        height: 2160,
        channels: 3,
        background: "#ffffff",
      },
    })
      .jpeg()
      .toBuffer();

    const result = await optimizeHouseUploadImage(screenshot, "screenshot.jpg", {
      limitInputPixels: 16_000_000,
    });
    const metadata = await sharp(result.buffer).metadata();

    assert.equal(result.mimetype, "image/jpeg");
    assert.equal(metadata.width, 3840);
    assert.equal(metadata.height, 2160);
  });
});
