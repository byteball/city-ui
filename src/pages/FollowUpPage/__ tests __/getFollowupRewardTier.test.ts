import { describe, expect, it } from "vitest";
import { getFollowupRewardTier } from "../utils";

describe("getFollowupRewardTier", () => {
  it("should return 1 for days less than 60", () => {
    expect(getFollowupRewardTier(59)).toBe(1);
  });

  it("should return null for days greater than 18 months", () => {
    expect(getFollowupRewardTier(1620 + 10)).toBe(7);
  });

  it("should return the correct tier for various days", () => {
    expect(getFollowupRewardTier(30)).toBe(1);
    expect(getFollowupRewardTier(60)).toBe(1);
    expect(getFollowupRewardTier(65)).toBe(1);
    expect(getFollowupRewardTier(120)).toBe(1);
    expect(getFollowupRewardTier(140)).toBe(1);

    expect(getFollowupRewardTier(150)).toBe(2);
    expect(getFollowupRewardTier(155)).toBe(2);
    expect(getFollowupRewardTier(161)).toBe(2);
    expect(getFollowupRewardTier(200)).toBe(2);
    expect(getFollowupRewardTier(230)).toBe(2);

    expect(getFollowupRewardTier(270)).toBe(3);
    expect(getFollowupRewardTier(300)).toBe(3);
    expect(getFollowupRewardTier(320)).toBe(3);
    expect(getFollowupRewardTier(400)).toBe(3);
    expect(getFollowupRewardTier(430)).toBe(3);
    expect(getFollowupRewardTier(449)).toBe(3);

    expect(getFollowupRewardTier(450)).toBe(4);
    expect(getFollowupRewardTier(460)).toBe(4);
    expect(getFollowupRewardTier(470)).toBe(4);
    expect(getFollowupRewardTier(550)).toBe(4);
    expect(getFollowupRewardTier(650)).toBe(4);
    expect(getFollowupRewardTier(719)).toBe(4);

    expect(getFollowupRewardTier(720)).toBe(5);
    expect(getFollowupRewardTier(722)).toBe(5);
    expect(getFollowupRewardTier(822)).toBe(5);
    expect(getFollowupRewardTier(922)).toBe(5);
    expect(getFollowupRewardTier(1000)).toBe(5);
    expect(getFollowupRewardTier(1079)).toBe(5);

    expect(getFollowupRewardTier(1080)).toBe(6);
    expect(getFollowupRewardTier(1180)).toBe(6);
    expect(getFollowupRewardTier(1280)).toBe(6);
    expect(getFollowupRewardTier(1380)).toBe(6);
    expect(getFollowupRewardTier(1480)).toBe(6);
    expect(getFollowupRewardTier(1580)).toBe(6);
    expect(getFollowupRewardTier(1619)).toBe(6);

    expect(getFollowupRewardTier(1620)).toBe(7);
    expect(getFollowupRewardTier(1625)).toBe(7);
    expect(getFollowupRewardTier(1629)).toBe(7);
    expect(getFollowupRewardTier(1630)).toBe(7);
    expect(getFollowupRewardTier(1631)).toBeNull();
  });
});

