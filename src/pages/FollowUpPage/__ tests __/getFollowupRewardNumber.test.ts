import { describe, expect, it } from "vitest";
import { getFollowupRewardNumber } from "../utils";

describe("getFollowupRewardNumber", () => {
  it("should return 1 for days less than 60", () => {
    expect(getFollowupRewardNumber(59)).toBe(1);
  });

  it("should return null for days greater than 18 months", () => {
    expect(getFollowupRewardNumber(1620 + 10)).toBe(7);
  });

  it("should return the correct reward number for various days", () => {
    expect(getFollowupRewardNumber(30)).toBe(1);
    expect(getFollowupRewardNumber(60)).toBe(1);
    expect(getFollowupRewardNumber(65)).toBe(1);
    expect(getFollowupRewardNumber(120)).toBe(1);
    expect(getFollowupRewardNumber(140)).toBe(1);

    expect(getFollowupRewardNumber(150)).toBe(2);
    expect(getFollowupRewardNumber(155)).toBe(2);
    expect(getFollowupRewardNumber(161)).toBe(2);
    expect(getFollowupRewardNumber(200)).toBe(2);
    expect(getFollowupRewardNumber(230)).toBe(2);

    expect(getFollowupRewardNumber(270)).toBe(3);
    expect(getFollowupRewardNumber(300)).toBe(3);
    expect(getFollowupRewardNumber(320)).toBe(3);
    expect(getFollowupRewardNumber(400)).toBe(3);
    expect(getFollowupRewardNumber(430)).toBe(3);
    expect(getFollowupRewardNumber(449)).toBe(3);

    expect(getFollowupRewardNumber(450)).toBe(4);
    expect(getFollowupRewardNumber(460)).toBe(4);
    expect(getFollowupRewardNumber(470)).toBe(4);
    expect(getFollowupRewardNumber(550)).toBe(4);
    expect(getFollowupRewardNumber(650)).toBe(4);
    expect(getFollowupRewardNumber(719)).toBe(4);

    expect(getFollowupRewardNumber(720)).toBe(5);
    expect(getFollowupRewardNumber(722)).toBe(5);
    expect(getFollowupRewardNumber(822)).toBe(5);
    expect(getFollowupRewardNumber(922)).toBe(5);
    expect(getFollowupRewardNumber(1000)).toBe(5);
    expect(getFollowupRewardNumber(1079)).toBe(5);

    expect(getFollowupRewardNumber(1080)).toBe(6);
    expect(getFollowupRewardNumber(1180)).toBe(6);
    expect(getFollowupRewardNumber(1280)).toBe(6);
    expect(getFollowupRewardNumber(1380)).toBe(6);
    expect(getFollowupRewardNumber(1480)).toBe(6);
    expect(getFollowupRewardNumber(1580)).toBe(6);
    expect(getFollowupRewardNumber(1619)).toBe(6);

    expect(getFollowupRewardNumber(1620)).toBe(7);
    expect(getFollowupRewardNumber(1625)).toBe(7);
    expect(getFollowupRewardNumber(1629)).toBe(7);
    expect(getFollowupRewardNumber(1630)).toBe(7);
    expect(getFollowupRewardNumber(1631)).toBeNull();
  });
});

