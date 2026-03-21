import ArticleEditor from "../../../../../components/admin/ArticleEditor";

export default function EditPostPage({ params }) {
  return (
    <div>
      <h1 className="hero-title" style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>
        Edit Article
      </h1>
      <ArticleEditor mode="edit" postId={params.id} />
    </div>
  );
}
