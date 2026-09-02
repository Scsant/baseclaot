import ReactMarkdown from "react-markdown";

const components = {
  h1: ({ children }) => <h1 className="mb-4 mt-2 text-xl font-bold text-foreground">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-6 border-b border-border pb-2 text-base font-bold text-foreground">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-sm font-bold text-foreground">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-6 text-foreground/90">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  blockquote: ({ children }) => <blockquote className="my-3 rounded-r-lg border-l-4 border-primary bg-primary/5 px-4 py-2 text-muted-foreground">{children}</blockquote>,
  table: ({ children }) => <div className="my-4 overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[560px] border-collapse text-xs">{children}</table></div>,
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }) => <th className="border-b border-border px-3 py-2.5 text-left font-bold text-foreground">{children}</th>,
  td: ({ children }) => <td className="border-b border-border/70 px-3 py-2.5 align-top leading-5 text-foreground/85">{children}</td>,
  hr: () => <hr className="my-5 border-border" />,
};

export default function MarkdownReport({ children }) {
  return <div className="text-sm"><ReactMarkdown components={components}>{children || ""}</ReactMarkdown></div>;
}