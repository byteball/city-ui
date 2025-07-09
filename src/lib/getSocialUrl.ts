export const getSocialUrl = (social: string, value: string): string | null => {
  let socialLower = social.toLowerCase().trim();
  let valueLower = value.toLowerCase().trim();

  if (valueLower.startsWith("@")) {
    valueLower = valueLower.slice(1); // Remove leading '@' if present
  }

  switch (socialLower) {
    case "twitter":
      return `https://x.com/${valueLower}`;
    case "x":
      return `https://x.com/${valueLower}`;
    case "github":
      return `https://github.com/${valueLower}`;
    case "telegram":
      return `https://t.me/${valueLower}`;
    case "youtube":
      return `https://www.youtube.com/@${valueLower}`;
    case "twitch":
      return `https://www.twitch.tv/${valueLower}`;
    case "reddit":
      return `https://www.reddit.com/user/${valueLower}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${valueLower}`;
    case "facebook":
      return `https://www.facebook.com/${valueLower}`;
    case "instagram":
      return `https://www.instagram.com/${valueLower}`;
    case "medium":
      return `https://medium.com/@${valueLower}`;
    case "mastodon":
      return `https://mastodon.social/@${valueLower}`;
    case "bluesky":
      return `https://bsky.app/profile/${valueLower}`;
    case "threads":
      return `https://www.threads.net/@${valueLower}`;
    case "snapchat":
      return `https://www.snapchat.com/add/${valueLower}`;
    case "tiktok":
      return `https://www.tiktok.com/@${valueLower}`;
    case "patreon":
      return `https://www.patreon.com/cw/${valueLower}`;
    case "buymeacoffee":
      return `https://www.buymeacoffee.com/${valueLower}`;
    case "website":
    case "blog":
      return (valueLower.startsWith("http://") || valueLower.startsWith("https://")) ? valueLower : `https://${valueLower}`;
    default:
      return (valueLower.startsWith("http://") || valueLower.startsWith("https://")) ? valueLower : null;
  }
};