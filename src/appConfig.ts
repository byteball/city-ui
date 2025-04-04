export default {
  AA_ADDRESS: import.meta.env.VITE_AA_ADDRESS,
  TESTNET: !!import.meta.env.VITE_TESTNET,
  MAP_SCALE: 0.01, // 1:100,
  ATTESTORS: !!import.meta.env.VITE_TESTNET
    ? {
        discord: "EJC4A7WQGHEZEKW6RLO7F26SAR4LAQBU",
        telegram: "WMFLGI2GLAB2MDF2KQAH37VNRRMK7A5N",
      }
    : {},
} as const;

