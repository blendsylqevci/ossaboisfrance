import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertRequiredLayers,
  collectHouseMediaIds,
  FRANCE_KULM_ENABLE_FLAGS,
  ETAGE_KULM_ENABLE_FLAGS,
  isMeKulmHouseSlug,
  ME_KULM_HOUSE_SLUGS,
} from "./house-import-shared.ts";

describe("house-import-shared", () => {
  it("collectHouseMediaIds gathers layer and hero IDs", () => {
    const ids = collectHouseMediaIds({
      defaultImage: 10,
      finalImage: 11,
      layers: {
        backgroundLayer: 20,
        constructionLayer: { id: 21 },
      },
    });
    assert.deepEqual(Array.from(ids).sort((a, b) => a - b), [10, 11, 20, 21]);
  });

  it("assertRequiredLayers throws when a field is missing", () => {
    assert.throws(
      () =>
        assertRequiredLayers(
          { backgroundLayer: 1 },
          ["backgroundLayer", "couverture_pare_pluie_lattage"],
          "Test"
        ),
      /couverture_pare_pluie_lattage/
    );
  });

  it("France kulm disables étanchéité, enables couverture", () => {
    assert.equal(FRANCE_KULM_ENABLE_FLAGS.enableEtancheiteOption, false);
    assert.equal(FRANCE_KULM_ENABLE_FLAGS.enableCouvertureOption, true);
  });

  it("lists all me kulm house slugs", () => {
    assert.equal(ME_KULM_HOUSE_SLUGS.length, 6);
    assert.equal(isMeKulmHouseSlug("enea-avec-toit"), true);
    assert.equal(isMeKulmHouseSlug("france-comble"), false);
  });

  it("Etage kulm keeps étanchéité and couverture", () => {
    assert.equal(ETAGE_KULM_ENABLE_FLAGS.enableEtancheiteOption, true);
    assert.equal(ETAGE_KULM_ENABLE_FLAGS.enableCouvertureOption, true);
  });
});
