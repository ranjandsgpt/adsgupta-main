import ArticleEditor from "../../../../components/admin/ArticleEditor";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>
        New Article
      </h1>
      <ArticleEditor mode="new" />
    </div>
  );
}
