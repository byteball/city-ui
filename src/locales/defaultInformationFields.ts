interface IDefaultInformationHints {
  placeholder?: string;
  validationRule: string;
  validationFunc: (value: string) => boolean;
  type: "website" | "socialNetwork" | "default";
  hint?: string;
}

const validateSocialNetworkUsername = (username: string) => {
  let trimmedUserName = username.trim().replace("@", "");

  return !!trimmedUserName && trimmedUserName.length >= 3 && trimmedUserName.length <= 20;
};

export const defaultInformationFields: { [name: string]: IDefaultInformationHints } = {
  name: {
    placeholder: "ex. Tonych",
    validationRule: "Must be 3-20 characters long.",
    type: "default",
    validationFunc: (value) => {
      let trimmedValue = value.trim().replace("@", "");
      return !!trimmedValue && trimmedValue.length >= 3 && trimmedValue.length <= 20;
    },
    hint: "How do you want to name your plot/house",
  },
  homepage: {
    placeholder: "ex. https://obyte.org",
    validationRule: "Must be a valid website URL (e.g., https://obyte.org).",
    type: "website",
    validationFunc: (value) => {
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|" + // domain name
          "localhost|" + // localhost
          "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|" + // OR ip (v4) address
          "\\[?[a-fA-F0-9]*:[a-fA-F0-9:]+\\]?)" + // OR ip (v6) address
          "(\\:\\d+)?(\\/[-a-zA-Z0-9+&@#/%=~_|$?!:,.;]*)*"
      );
      return urlPattern.test(value);
    },
    hint: "Your blog or social profile. It’ll be linked from your plot/house page.",
  },
  twitter: {
    placeholder: "ex. @obyteOrg",
    validationRule: "Must be 3-20 characters long. Just the username without URL.",
    type: "socialNetwork",
    validationFunc: validateSocialNetworkUsername,
    hint: "Your twitter (X) username.",
  },
  telegram: {
    placeholder: "ex. @obyteOrg",
    validationRule: "Must be 3-20 characters long. Just the username without URL.",
    type: "socialNetwork",
    validationFunc: validateSocialNetworkUsername,
    hint: "Your telegram username (personal account or group).",
  },
  facebook: {
    placeholder: "ex. @obyteOrg",
    validationRule: "Must be 3-20 characters long. Just the username without URL.",
    type: "socialNetwork",
    validationFunc: validateSocialNetworkUsername,
    hint: "Your facebook username (personal account or page).",
  },
  instagram: {
    placeholder: "ex. @obyteOrg",
    validationRule: "Must be 3-20 characters long. Just the username without URL.",
    type: "socialNetwork",
    validationFunc: validateSocialNetworkUsername,
    hint: "Your instagram username.",
  },
  discord: {
    placeholder: "ex. @obyteOrg",
    validationRule: "Must be 3-20 characters long. Just the username without URL.",
    type: "socialNetwork",
    validationFunc: validateSocialNetworkUsername,
    hint: "Your discord username.",
  },
} as const;

