import { beforeAll, expect, describe, it } from "vitest";

import updateUserOptions from "./updateUserOptions";
import { getRandomMockCtxAndUser } from "test/shared";
import db from "db";

beforeAll(() => {
  (global as any).sessionConfig = {
    getSessions() {
      return [];
    },
  };
});

describe("updateUserOptions", () => {
  it("coordinateOrder", async () => {
    const { ctx } = await getRandomMockCtxAndUser();
    await expect(
      updateUserOptions(
        {
          coordinateOrder: "LONLAT",
        },
        ctx
      )
    ).resolves.toHaveProperty("coordinateOrder", "LONLAT");
  });

  it("themePreference", async () => {
    const { ctx } = await getRandomMockCtxAndUser();
    await expect(
      updateUserOptions(
        {
          themePreference: "DARK",
        },
        ctx
      )
    ).resolves.toHaveProperty("themePreference", "DARK");
  });

  it("name", async () => {
    const { ctx, user } = await getRandomMockCtxAndUser();
    expect(
      await updateUserOptions(
        {
          name: "Yeah yeah yeah",
        },
        ctx
      )
    ).toHaveProperty("name", "Yeah yeah yeah");
    const userAfter = await db.user.findFirst({
      where: { id: user.id },
    });
    expect(userAfter?.name).toBe("Yeah yeah yeah");
  });
});
