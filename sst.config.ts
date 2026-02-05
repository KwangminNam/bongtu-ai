import { SSTConfig } from "sst";
import { Api } from "./stacks/Api";

export default {
  config(_input) {
    return {
      name: "maum-jangbu",
      region: "ap-northeast-2",
    };
  },
  stacks(app) {
    app.stack(Api);
  },
} satisfies SSTConfig;
