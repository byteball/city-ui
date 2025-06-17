export default {
  AA_ADDRESS: import.meta.env.VITE_AA_ADDRESS,
  GOLDEN_PLOTS: [183],
  TESTNET: import.meta.env.VITE_TESTNET,
  LAUNCH_DATE: import.meta.env.VITE_LAUNCH_DATE, // YYYY-MM-DD
  MAP_SCALE: 0.01, // 1:100, please do not change this value
  OG_IMAGE_URL: import.meta.env.VITE_OG_IMAGE_URL ?? "https://city.obyte.org",
  DISCORD_BOT_URL: "obyte:Ama48/uKO+/Tjv28zFKwElBO4SEQNuWAM1VPJkl4DTZO@obyte.org/bb#0000",
  TELEGRAM_BOT_URL: "obyte:A1KwcOAZSWwBnXwa1BKfmhEP2yow1kaUuoi5A6HLOzJZ@obyte.org/bb#0000",
  ATTESTORS: import.meta.env.VITE_TESTNET
    ? {
      discord: "EJC4A7WQGHEZEKW6RLO7F26SAR4LAQBU",
      telegram: "WMFLGI2GLAB2MDF2KQAH37VNRRMK7A5N",
    }
    : {
      discord: "5KM36CFPBD2QJLVD65PHZG34WEM4RPY2",
      telegram: "JBW7HT5CRBSF7J7RD26AYLQG6GZDPFPS",
    },
} as const;

