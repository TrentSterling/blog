require "jekyll"
require "tmpdir"
require "fileutils"
require "minitest/autorun"

class UniquePostUrlsTest < Minitest::Test
  def build_posts(permalinks, taxonomy = "")
    Dir.mktmpdir("jekyll-post-urls") do |source|
      FileUtils.mkdir_p(File.join(source, "_posts"))
      FileUtils.mkdir_p(File.join(source, "_plugins"))
      FileUtils.cp(File.expand_path("../_plugins/unique_post_urls.rb", __dir__),
                   File.join(source, "_plugins", "unique_post_urls.rb"))
      permalinks.each_with_index do |permalink, index|
        File.write(File.join(source, "_posts", "2020-01-0#{index + 1}-article.md"),
                   "---\ntitle: Article #{index}\npermalink: #{permalink}\n#{taxonomy}---\nArticle #{index}\n")
      end
      config = Jekyll.configuration("source" => source, "destination" => File.join(source, "_site"),
                                    "config" => [], "quiet" => true)
      site = Jekyll::Site.new(config)
      site.process
      yield site.dest if block_given?
    end
  end

  def test_colliding_posts_abort_the_actual_build
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_posts(["/posts/article/", "/posts/article/"])
    end
    assert_includes error.message, "2020-01-01-article.md"
    assert_includes error.message, "2020-01-02-article.md"
  end

  def test_distinct_permalinks_preserve_both_articles
    build_posts(["/posts/article/", "/posts/article-history/"]) do |destination|
      assert_includes File.read(File.join(destination, "posts/article/index.html")), "Article 0"
      assert_includes File.read(File.join(destination, "posts/article-history/index.html")), "Article 1"
    end
  end

  def test_tag_spellings_that_slugify_to_one_url_abort
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_posts(["/posts/article/"], "tags: [Three.js, three-js]\n")
    end
    assert_includes error.message, "tags/three-js"
  end

  def test_category_case_collisions_abort
    error = assert_raises(Jekyll::Errors::FatalException) do
      build_posts(["/posts/article/"], "categories: [DevBlog, devblog]\n")
    end
    assert_includes error.message, "categories/devblog"
  end
end
