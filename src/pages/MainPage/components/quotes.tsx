export interface IQuote {
  author: "Hal Finney" | "Satoshi" | "Tim May" | "Nick Szabo" | "Adam Back" | "David Friedman" | "Wei Dai" | "Phil Zimmermann" | "Eric Hughes" | "John Gilmore",
  text: React.ReactNode;
  imageName?: string;
}

export const quotes: IQuote[] = [
  {
    author: "Hal Finney",
    text: "Here we are faced with the problems of loss of privacy, creeping computerization, massive databases, more centralization - and [David] Chaum offers a completely different direction to go in, one which puts power into the hands of individuals rather than governments and corporations. The computer can be used as a tool to liberate and protect people, rather than to control them.",
    imageName: "hal_finney.jpg"
  },
  {
    author: "Hal Finney",
    text: "The computer can be used as a tool to liberate and protect people, rather than to control them.",
    imageName: "hal_finney.jpg"
  },
  {
    author: "Satoshi",
    text: "The root problem with conventional currency is all the trust that’s required to make it work.",
  },
  {
    author: "Satoshi",
    text: "What is needed is an electronic payment system based on cryptographic proof instead of trust, allowing any two willing parties to transact directly with each other without the need for a trusted third party.",
  },
  {
    author: "Satoshi",
    text: "With e-currency based on cryptographic proof, without the need to trust a third party middleman, money can be secure and transactions effortless.",
  },
  {
    author: "Satoshi",
    text: "Governments are good at cutting off the heads of a centrally controlled networks like Napster, but pure P2P networks like Gnutella and Tor seem to be holding their own.",
  },

  {
    author: "Tim May",
    text: "Just as the technology of printing altered and reduced the power of medieval guilds and the social power structure, so too will cryptologic methods fundamentally alter the nature of corporations and of government interference in economic transactions.",
    imageName: "tim_may.jpg"
  },
  {
    author: "Tim May",
    text: "A specter is haunting the modern world, the specter of crypto anarchy.",
    imageName: "tim_may.jpg"
  },
  {
    author: "Tim May",
    text: "Attempts to be \"regulatory-friendly\" will likely kill the main uses for cryptocurrencies, which are NOT just \"another form of PayPal or Visa.\"",
    imageName: "tim_may.jpg"
  },
  {
    author: "Tim May",
    text: <>There's a real possibility that all the noise about "governance", "regulation" and "blockchain" will effectively create a surveillance state, a dossier society. <br /><br />I think Satoshi would barf. Or at least work on a replacement for bitcoin as he first described it in 2008-2009.</>,
    imageName: "tim_may.jpg"
  },
  {
    author: "Tim May",
    text: "Sorry if this ruins the narrative, but I think the narrative is fucked. Satoshi did a brilliant thing, but the story is far from over. She/he/it even acknowledged this, that the bitcoin version in 2008 was not some final answer received from the gods.",
    imageName: "tim_may.jpg"
  },
  {
    author: "Tim May",
    text: "What's exciting is the bypassing of gatekeepers, of exorbitant fee collectors, of middlemen who decide whether Wikileaks — to pick a timely example — can have donations reach it. And to allow people to send money abroad.",
    imageName: "tim_may.jpg"
  },
  {
    author: "Tim May",
    text: "Remember, the excitement about bitcoin was mostly about bypassing controls, to enable exotic new uses like Silk Road. It was some cool and edgy stuff, not just another PayPal.",
    imageName: "tim_may.jpg"
  },

  {
    author: "Nick Szabo",
    text: "Trusted third parties are security holes.",
    imageName: "nick_szabo.jpg"
  },
  {
    author: "Nick Szabo",
    text: "The most important and hardest part of trust minimization is governance minimization.",
    imageName: "nick_szabo.jpg"
  },
  {
    author: "Nick Szabo",
    text: "Financial institutions make people feel safe by hiding risk behind layers of complexity. Crypto brings risk front and center and brags about it on the internet.",
    imageName: "nick_szabo.jpg"
  },

  {
    author: "Adam Back",
    text: "Crypto anarchy is a pivotal tool to reduce government power, and enable freedom and privacy.",
    imageName: "adam_back.jpg"
  },

  {
    author: "David Friedman",
    text: "The direct use of force is such a poor solution to any problem, it is generally employed only by small children and large nations.",
    imageName: "david_friedman.jpg"
  },
  {
    author: "David Friedman",
    text: "I believe, as many say they believe, that everyone has the right to run his own life—to go to hell in his own fashion.",
    imageName: "david_friedman.jpg"
  },
  {
    author: "Wei Dai",
    text: "There has never been a government that didn't sooner or later try to reduce the freedom of its subjects and gain more control over them, and there probably will never be one. Therefore, instead of trying to convince our current government not to try, we’ll develop the technology that will make it impossible for the government to succeed."
  },
  {
    author: "Wei Dai",
    text: "My motivation for b-money was to enable online economies that are purely voluntary… ones that couldn’t be taxed or regulated through the threat of force."
  },


  {
    author: "Phil Zimmermann",
    text: "If privacy is outlawed, only outlaws will have privacy.",
    imageName: "phil_zimmermann.jpg"
  },
  {
    author: "Phil Zimmermann",
    text: "The ability of computers to track us doubles every eighteen months.",
    imageName: "phil_zimmermann.jpg"
  },
  {
    author: "Phil Zimmermann",
    text: "The intelligence agencies are living in a golden age of surveillance.",
    imageName: "phil_zimmermann.jpg"
  },
  {
    author: "Phil Zimmermann",
    text: "At no time in the past century has public distrust of the government been so broadly distributed across the political spectrum, as it is today.",
    imageName: "phil_zimmermann.jpg"
  },
  {
    author: "Phil Zimmermann",
    text: "The only way to hold the line on privacy in the information age is strong cryptography.",
    imageName: "phil_zimmermann.jpg"
  },
  {
    author: "Phil Zimmermann",
    text: "If you hide your mail inside envelopes, does that mean you must be a subversive or a drug dealer, or maybe a paranoid nut?",
    imageName: "phil_zimmermann.jpg"
  },
  {
    author: "Eric Hughes",
    text: "Cypherpunks write code. We know that someone has to write software to defend privacy, and since we can't get privacy unless we all do, we're going to write it.",
    imageName: "eric_hughes.jpg"
  },
  {
    author: "Eric Hughes",
    text: "For privacy to be widespread it must be part of a social contract. People must come and together deploy these systems for the common good. Privacy only extends so far as the cooperation of one's fellows in society.",
    imageName: "eric_hughes.jpg"
  },
  {
    author: "Eric Hughes",
    text: "My main goal for cypherpunks is to get people to defend their own privacy, rather than relying on someone else to provide it for them.",
    imageName: "eric_hughes.jpg"
  },

  {
    author: "John Gilmore",
    text: "The Internet interprets censorship as damage and routes around it.",
    imageName: "john_gilmore.jpg"
  },
  {
    author: "John Gilmore",
    text: "I want a guarantee — with physics and mathematics, not with laws — that we can give ourselves real privacy of personal communications.",
    imageName: "john_gilmore.jpg"
  },
  {
    author: "John Gilmore",
    text: "If governments succeed in outlawing crypto, only \"the rich, the powerful, police agencies, and a technologically skilled elite\" will have privacy.",
    imageName: "john_gilmore.jpg"
  },
];