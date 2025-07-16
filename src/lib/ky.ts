import ky from "ky";

const kyInstance = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_APP_URL,
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At") && typeof value === "string") {
        return new Date(value);
      }
      return value;
    }),
});

export default kyInstance;
