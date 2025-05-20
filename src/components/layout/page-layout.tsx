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
  seoTitle?: string; // for SEO title
  seoDescription?: string; // for SEO description
}

export const PageLayout: FC<IPageLayoutProps> = ({
  children,
  title,
  seoTitle,
  loading = false,
  description,
  seoDescription,
  ogImageKey,
}) => {
  return (
    <>
      <Helmet>
        <title>Obyte City — {seoTitle || title}</title>
        <meta name="og:title" content={`Obyte City — ${seoTitle || title}`} />
        <meta name="twitter:title" content={`Obyte City — ${seoTitle || title}`} />

        <meta name="og:description" content={seoDescription || description} />
        <meta name="description" content={seoDescription || description} />
        <meta name="twitter:description" content={seoDescription || description} />

        {ogImageKey && <meta name="twitter:image" content={`${appConfig.OG_IMAGE_URL}/og/${ogImageKey}`} />}
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

