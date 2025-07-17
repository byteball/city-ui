import { Maximize2Icon, Minimize2Icon, QuoteIcon } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { FC, memo, useEffect, useMemo, useState } from "react";

import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { getQuote } from "./utils/getQuote";

const transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.1,
};

const contentVariants = {
  open: {
    maxHeight: "500px",
    opacity: 1,
    maxWidth: "280px",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  collapsed: {
    maxHeight: 0,
    opacity: 0,
    maxWidth: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

interface FamousBlockquoteProps {
  name?: string;
  plotNum?: number;
}

export const FamousBlockquote: FC<FamousBlockquoteProps> = memo(({ name, plotNum }) => {
  const [isOpen, setIsOpen] = useState(true);
  const inited = useSettingsStore((state) => state.inited);
  const stateInited = useAaStore((state) => state.loaded);

  useEffect(() => {
    setIsOpen(true);
  }, [plotNum]);

  const currentQuote = useMemo(() => getQuote(name, plotNum), [name, plotNum]);

  if (!inited || !stateInited) return null;

  return (<MotionConfig transition={transition}>
    <div className="absolute left-0 z-50 flex justify-end w-full p-4 text-black top-[40px] sm:top-[101px] pointer-events-none">
      <div className="relative bg-white rounded-xl">
        <motion.div initial={false} animate={{ opacity: isOpen ? 1 : 0 }}>
          <QuoteIcon className="absolute w-16 h-16 bottom-6 right-6 stroke-muted-foreground/20" />
        </motion.div>
        <div className="flex justify-end p-2 pointer-events-auto md:p-4">
          <button onClick={() => setIsOpen((v) => !v)} className="cursor-pointer md:w-6 md:h-6 stroke-muted-foreground">
            {isOpen ? <Minimize2Icon /> : <Maximize2Icon />}
          </button>
        </div>
        <motion.div
          initial={false}
          animate={isOpen ? "open" : "collapsed"}
          variants={contentVariants}
          className="overflow-hidden text-sm rounded-b-xl"
        >
          <figure
            className="p-4 pt-1 w-[260px]"
          >
            <blockquote className="pl-4 text-gray-900 border-l-4 pointer-events-auto border-link/30">
              <p>
                <q>
                  {currentQuote.text}
                </q>
              </p>
            </blockquote>
            <figcaption className="flex mt-6 gap-x-4">
              {currentQuote.imageName ? <img
                alt={currentQuote.author}
                src={'/people/' + currentQuote.imageName}
                className="flex-none w-6 h-6 rounded-full bg-gray-50"
              /> : <div className="flex items-center justify-center flex-none w-6 h-6 bg-gray-200 rounded-full">
                <img src="/profile.svg" className="w-4 h-4" />
              </div>}
              <div className="text-sm/6">
                <strong className="font-semibold text-gray-900">{currentQuote.author}</strong>
              </div>
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </div>
  </MotionConfig>)
});