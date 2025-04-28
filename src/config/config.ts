import "dotenv/config";

interface IConfig {
  DB: {
    readonly MONGODB_URI: string | undefined;
    readonly MONGODB_DIRECT_URI: string | undefined;
    readonly MONGODB_LOCAL_URI: string | undefined;
  };
}
const config: IConfig = {
  DB: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DIRECT_URI: process.env.MONGODB_DIRECT_URI,
    MONGODB_LOCAL_URI: process.env.MONGODB_LOCAL_URI,
  },
};

export default config;
