# Exercise the real Liquid include through Jekyll, including JSON string escaping
# and pages that must not receive post breadcrumbs.
require 'json'
require 'nokogiri'

class PostBreadcrumbsTest < Minitest::Test
  def build_breadcrumbs(front_matter = {}, title: 'A "quoted" title \\ path & café < 3')
    Dir.mktmpdir('jekyll-breadcrumbs') do |source|
      %w[_posts _includes _layouts _data/locales].each do |dir|
        FileUtils.mkdir_p(File.join(source, dir))
      end
      %w[metadata-hook.html topbar.html].each do |name|
        FileUtils.cp(File.expand_path("../../_includes/#{name}", __dir__),
                     File.join(source, '_includes', name))
      end
      File.write(File.join(source, '_data/locales/en.yml'), "tabs:\n  home: home\n")
      layout = "{% assign lang = 'en' %}{% include metadata-hook.html %}{% include topbar.html lang=lang %}{{ content }}"
      %w[post home page].each { |name| File.write(File.join(source, "_layouts/#{name}.html"), layout) }
      data = { 'title' => title, 'layout' => 'post', 'permalink' => '/posts/example/' }.merge(front_matter)
      File.write(File.join(source, '_posts/2020-01-01-example.md'), "#{data.to_yaml}---\nArticle body\n")
      %w[index 404 redirect].each do |name|
        page = { 'layout' => name == 'index' ? 'home' : 'page', 'title' => name }
        page['redirect_to'] = '/posts/example/' if name == 'redirect'
        File.write(File.join(source, "#{name}.html"), "#{page.to_yaml}---\nPage body\n")
      end
      config = Jekyll.configuration('source' => source, 'destination' => File.join(source, '_site'),
                                    'config' => [], 'quiet' => true, 'url' => 'https://tront.xyz',
                                    'baseurl' => '/blog')
      Jekyll::Site.new(config).process
      yield File.join(source, '_site')
    end
  end

  def scripts(path)
    Nokogiri::HTML(File.read(path)).css('script[type="application/ld+json"]')
  end

  def test_post_matches_visible_trail_and_escapes_json
    build_breadcrumbs do |destination|
      html = File.read(File.join(destination, 'posts/example/index.html'))
      doc = Nokogiri::HTML(html)
      json = scripts(File.join(destination, 'posts/example/index.html'))
      assert_equal 1, json.length
      refute_includes json.first.content, '<'
      trail = JSON.parse(json.first.content)
      assert_equal 'https://schema.org', trail['@context']
      assert_equal 'BreadcrumbList', trail['@type']
      items = trail['itemListElement']
      assert_equal [1, 2], items.map { |item| item['position'] }
      assert_equal ['ListItem', 'ListItem'], items.map { |item| item['@type'] }
      assert_equal ['https://tront.xyz/blog/', 'https://tront.xyz/blog/posts/example/'], items.map { |item| item['item'] }
      assert_equal doc.css('#breadcrumb > span').map { |span| span.text.strip }, items.map { |item| item['name'] }
      assert_includes html, 'Article body'
      %w[index.html 404.html redirect.html].each do |path|
        assert_empty scripts(File.join(destination, path)), path
      end
    end
  end

  def test_excluded_post_variants_have_no_breadcrumb
    [{ 'redirect_to' => 'https://tront.xyz/' }, { 'sitemap' => false }, { 'noindex' => true },
     { 'layout' => 'page' }, { 'canonical_url' => 'https://example.org/original/' }].each do |data|
      build_breadcrumbs(data) do |destination|
        assert_empty scripts(File.join(destination, 'posts/example/index.html')), data.inspect
      end
    end
  end
end
