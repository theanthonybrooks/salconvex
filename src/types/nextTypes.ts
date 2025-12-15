export type ParamsProps = {
  params: Promise<{ slug: string }>;
};

export type ParamsYearProps = {
  params: Promise<{ slug: string; year: string }>;
};
