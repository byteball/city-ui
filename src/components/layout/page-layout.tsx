import { FC } from "react";
import { Helmet } from "react-helmet-async";

import { TextShimmerWave } from "../ui/text-shimmer-wave";

import appConfig from "@/appConfig";

interface IPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  loading?: boolean; // show loader
  ogImageKey?: string; // for og:image
}

export const PageLayout: FC<IPageLayoutProps> = ({ children, title, loading = false, description, ogImageKey }) => {
  return (
    <>
      <Helmet>
        <title>Obyte City — {title}</title>
        <meta name="description" content={description} />
        {ogImageKey && <meta property="og:image" content={`${appConfig.OG_IMAGE_URL}/og/${ogImageKey}`} />}
      </Helmet>

      <div className="min-h-[80vh] px-4 md:px-0">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">{title}</h1>
          {description ? <p className="max-w-4xl mt-4 text-xl text-muted-foreground">{description}</p> : null}
        </div>
        {loading ? (
          <TextShimmerWave className="font-mono text-md" duration={1.5}>
            Loading data...
          </TextShimmerWave>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </>
  );
};

