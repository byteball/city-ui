import { defaultInformationFields } from "@/locales/defaultInformationFields";

export const getInformationPrefix = (key: string): string => {
  if (!(key in defaultInformationFields)) return "";
  const { type } = defaultInformationFields[key as keyof typeof defaultInformationFields];

  if (type === "socialNetwork") {
    return "@";
  } else if (type === "website") {
    return "https://";
  }

  return "";
};

