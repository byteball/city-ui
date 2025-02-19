import { FC } from "react";

interface IPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  loading?: boolean; // show loader
}

export const PageLayout: FC<IPageLayoutProps> = ({ children, title, loading = false, description }) => {
  return (
    <div className="min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">{title}</h1>
        {description ? <p className="max-w-4xl mt-4 text-xl text-muted-foreground">{description}</p> : null}
      </div>
      {loading ? <div>Loading...</div> : <div>{children}</div>}
    </div>
  );
};

