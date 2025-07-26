export const getSocialUrl = (social: string, value: string): string | null => {
  let socialLower = social.toLowerCase().trim();
  let trimmedValue = value.trim();

  if (trimmedValue.startsWith("@")) {
    trimmedValue = trimmedValue.slice(1); // Remove leading '@' if present
  }

  switch (socialLower) {
    case "twitter":
      return `https://x.com/${trimmedValue}`;
    case "x":
      return `https://x.com/${trimmedValue}`;
    case "github":
      return `https://github.com/${trimmedValue}`;
    case "telegram":
      return `https://t.me/${trimmedValue}`;
    case "youtube":
      return `https://www.youtube.com/@${trimmedValue}`;
    case "twitch":
      return `https://www.twitch.tv/${trimmedValue}`;
    case "reddit":
      return `https://www.reddit.com/user/${trimmedValue}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${trimmedValue}`;
    case "facebook":
      return `https://www.facebook.com/${trimmedValue}`;
    case "instagram":
      return `https://www.instagram.com/${trimmedValue}`;
    case "medium":
      return `https://medium.com/@${trimmedValue}`;
    case "mastodon":
      return `https://mastodon.social/@${trimmedValue}`;
    case "bluesky":
      return `https://bsky.app/profile/${trimmedValue}`;
    case "threads":
      return `https://www.threads.net/@${trimmedValue}`;
    case "snapchat":
      return `https://www.snapchat.com/add/${trimmedValue}`;
    case "tiktok":
      return `https://www.tiktok.com/@${trimmedValue}`;
    case "patreon":
      return `https://www.patreon.com/cw/${trimmedValue}`;
    case "buymeacoffee":
      return `https://www.buymeacoffee.com/${trimmedValue}`;
    case "website":
    case "blog":
      return (trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")) ? trimmedValue : `https://${trimmedValue}`;
    default:
      return (trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")) ? trimmedValue : null;
  }
};