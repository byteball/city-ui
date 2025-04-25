import { PageLayout } from "@/components/layout/page-layout";
import { FC, ReactNode } from "react";

const faqs = [
  {
    id: 1,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 2,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },

  {
    id: 3,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 4,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 5,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 6,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
];

export default () => {
  return (
    <PageLayout
      title="F.A.Q."
      description="Have a different question and can’t find the answer you’re looking for? Reach out to our support team by sending us an email and we’ll get back to you as soon as we can."
      loading={false}
    >
      <div className="max-w-5xl prose-xl">
        <div className="space-y-16 sm:grid sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
          <FaqItem>
            <FaqTitle>What is Obyte City?</FaqTitle>
            <FaqContent>
              Obyte City is a community space for Obyte. Here, Obyte community members can establish closer connections
              with each other, while having their own place in the city and potentially making money in CITY tokens.
              Anyone can own a plot of land in the City. When buying a plot, it gets random coordinates, and if it
              happens to be a neighbor of another plot, both owners get:
              <ul>
                <li>houses on their plots;</li>
                <li>
                  two new plots for each owner at new random locations. The owners can leave the new plots and get CITY
                  tokens (worth two plots) in exchange, or wait for a new neighbor to appear.
                </li>
              </ul>
            </FaqContent>
          </FaqItem>
        </div>
      </div>

      <div className="mt-8">
        Any other questions? Ask on{" "}
        <a href="https://discord.obyte.org/" target="_blank" rel="noopener" className="text-blue-400">
          Discord
        </a>
      </div>
    </PageLayout>
  );
};

const FaqItem: FC<{ children: ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

const FaqTitle: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="font-semibold text-white text-xl/7">{children}</div>;
};

const FaqContent: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="mt-2 text-gray-300 text-base/7">{children}</div>;
};

