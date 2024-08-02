export const uint8_to_hexStr = (uint8: Buffer | Uint8Array) => {
  return Array.from(uint8)
    .map((i) => i.toString(16).padStart(2, "0"))
    .join("");
};

export const hexStr_to_uint8 = (hexString: string) =>
  new Uint8Array(
    (hexString.match(/[\da-f]{2}/gi) ?? []).map(function (byte) {
      return parseInt(byte, 16);
    })
  );

export const hexStr_to_arrayBuffer = (hexString: string) =>
  new Uint8Array(
    (hexString.match(/[\da-f]{2}/gi) ?? []).map(function (byte) {
      return parseInt(byte, 16);
    })
  );
