import { getBlockchainRid } from "./utils";

export const chromiaClientConfig = {
  blockchainRid:
    "56B4895B43D7507C3113406A91CA44113CA626CE7FA0B635F716678E394734B7",
  directoryNodeUrlPool: [
    "https://node0.projectnet.chromia.dev:7740",
    "https://node1.projectnet.chromia.dev:7740",
    "https://node2.projectnet.chromia.dev:7740",
    "https://node3.projectnet.chromia.dev:7740",
  ],
};

export const getChromiaClientDevConfig = async () => ({
  blockchainRid: await getBlockchainRid(),
  nodeUrlPool: "http://localhost:7740",
});
