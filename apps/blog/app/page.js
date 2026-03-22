import ArticleCard from "../components/ArticleCard";
import HomeNewsletter from "../components/HomeNewsletter";
import { getAllPosts } from "../lib/posts";
import { groupPostsByChannel, getChannelMeta, assignChannel } from "../lib/channel-taxonomy";

export default async function Home() {
  const posts = (await getAllPosts()) || [];
  const featured = posts[0];
  const sideStories = posts.slice(1, 4);
  const belowFold = posts.slice(4);
  const channelSections = groupPostsByChannel(belowFold, 6);

  return (
    <div className="pub-home">
      <section className="pub-hero shell-wide">
        <div className="pub-hero__grid">
          <div className="pub-hero__main">
            {featured ? (
              <ArticleCard
                post={featured}
                variant="featured"
                accent={getChannelMeta(assignChannel(featured)).color}
                categoryLabel={getChannelMeta(assignChannel(featured)).label}
              />
            ) : (
              <p className="pub-empty">No articles yet.</p>
            )}
          </div>
          <div className="pub-hero__side">
            <p className="pub-hero__side-label">Latest</p>
            <div className="pub-hero__stack">
              {sideStories.map((post, i) => (
                <ArticleCard
                  key={post.slug}
                  post={post}
                  variant="compact"
                  rank={i + 1}
                  accent={getChannelMeta(assignChannel(post)).color}
                  categoryLabel={getChannelMeta(assignChannel(post)).label}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {channelSections.map((section) => (
        <section key={section.id} className="pub-channel shell-wide" id={`channel-${section.slug}`}>
          <header
            className="pub-channel__header"
            style={{ borderLeftColor: section.color, "--pub-channel-accent": section.color }}
          >
            <h2 className="pub-channel__title">{section.label}</h2>
          </header>
          {section.posts.length === 0 ? (
            <p className="pub-channel__empty">More stories in this channel soon.</p>
          ) : (
            <div className="pub-channel__grid">
              {section.posts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  post={post}
                  accent={section.color}
                  categoryLabel={section.label}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      <div className="shell-wide">
        <HomeNewsletter />
      </div>
    </div>
  );
}
