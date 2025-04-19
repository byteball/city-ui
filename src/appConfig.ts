export default {
  AA_ADDRESS: import.meta.env.VITE_AA_ADDRESS,
  TESTNET: !!import.meta.env.VITE_TESTNET,
  LAUNCH_DATE: import.meta.env.VITE_LAUNCH_DATE, // YYYY-MM-DD
  MAP_SCALE: 0.01, // 1:100, please do not change this value
  ATTESTORS: !!import.meta.env.VITE_TESTNET
    ? {
        discord: "EJC4A7WQGHEZEKW6RLO7F26SAR4LAQBU",
        telegram: "WMFLGI2GLAB2MDF2KQAH37VNRRMK7A5N",
      }
    : {},
} as const;

