require 'jekyll'
require 'tmpdir'
require 'fileutils'
require 'minitest/autorun'
require 'nokogiri'
require 'json'

class AuthorProfilesTest < Minitest::Test
  ROOT = File.expand_path('../..', __dir__)
  ID = 'https://tront.xyz/#trent-sterling'
  GUEST = 'https://example.org/guest/?a=1&b=2'
  ESCAPED = "Dana & Lee <script>alert(1)</script> \"O'Neil\" \\ café"

  def test_actual_post_layout_and_existing_seo_tag
    fixtures = {
      'default' => [{}, ['Trent Sterling'], ['https://tront.xyz/']],
      'keyed' => [{ 'author' => 'guest' }, ['Guest Author'], [GUEST]],
      'scalar' => [{ 'author' => 'Unregistered Guest' }, ['Unregistered Guest'], [nil]],
      'list' => [{ 'authors' => ['guest', 'offline', 'Unregistered Guest'] }, ['Guest Author', 'Offline Guest', 'Unregistered Guest'], [GUEST, nil, nil]],
      'author-list' => [{ 'author' => ['offline', 'guest'] }, ['Offline Guest', 'Guest Author'], [nil, GUEST]],
      'hash' => [{ 'author' => { 'name' => ESCAPED, 'url' => GUEST } }, [ESCAPED], [GUEST]],
      'no-url' => [{ 'author' => 'offline' }, ['Offline Guest'], [nil]],
      'empty-url' => [{ 'author' => { 'name' => 'Empty URL', 'url' => '' } }, ['Empty URL'], [nil]],
      'unsafe-url' => [{ 'author' => { 'name' => 'Unsafe URL', 'url' => 'javascript:alert(1)' } }, ['Unsafe URL'], [nil]],
      'relative-url' => [{ 'author' => { 'name' => 'Unverified URL', 'url' => '/guest/' } }, ['Unverified URL'], [nil]],
      'precedence' => [{ 'author' => 'offline', 'authors' => ['guest'] }, ['Offline Guest'], [nil]],
      'mixed' => [{ 'authors' => ['guest', { 'name' => ESCAPED }] }, ['Guest Author', ESCAPED], [GUEST, nil]],
      'trent-full-name' => [{ 'author' => 'Trent Sterling (Tront)' }, ['Trent Sterling (Tront)'], [nil]],
      'id-without-url' => [{ 'author' => { 'name' => 'Unlinked Guest', '@id' => ID } }, ['Unlinked Guest'], [nil]],
      'trent-name' => [{ 'author' => 'Trent Sterling' }, ['Trent Sterling'], [nil]],
      'empty-authors' => [{ 'authors' => [] }, ['Trent Sterling'], ['https://tront.xyz/']],
      'empty-author' => [{ 'author' => '', 'authors' => ['offline'] }, ['Offline Guest'], [nil]],
      'organization' => [{ 'author' => { 'name' => 'Guest Studio', 'type' => 'Organization', 'url' => GUEST } }, ['Guest Studio'], [GUEST]]
    }
    Dir.mktmpdir('author-profiles') do |source|
      %w[_posts _layouts _includes _plugins _data].each { |dir| FileUtils.mkdir_p(File.join(source, dir)) }
      %w[_layouts/post.html _includes/post-authors.html _plugins/author_profiles.rb].each do |file|
        FileUtils.cp(File.join(ROOT, file), File.join(source, file))
      end
      File.write(File.join(source, '_layouts/default.html'), '<!doctype html><html><head><meta charset="utf-8">{% seo %}</head><body>{{ content }}</body></html>')
      File.write(File.join(source, '_data/authors.yml'), { 'guest' => { 'name' => 'Guest Author', 'url' => GUEST }, 'offline' => { 'name' => 'Offline Guest' } }.to_yaml)
      fixtures.each do |slug, (data, _labels, _urls)|
        front = { 'title' => "Fixture #{slug}", 'layout' => 'post', 'permalink' => "/posts/#{slug}/", 'date' => '2020-01-01', 'toc' => false }.merge(data)
        File.write(File.join(source, "_posts/2020-01-01-#{slug}.md"), "#{front.to_yaml}---\nOriginal article & collaborator credit.\n")
      end
      File.write(File.join(source, 'about.html'), "---\nlayout: default\ntitle: About\npermalink: /about/\n---\nAbout body")
      config = Jekyll.configuration('source' => source, 'destination' => File.join(source, '_site'), 'config' => [], 'quiet' => true,
        'theme' => 'jekyll-theme-chirpy', 'plugins' => ['jekyll-seo-tag'], 'url' => 'https://tront.xyz', 'baseurl' => '/blog', 'lang' => 'en', 'timezone' => 'UTC',
        'author' => { 'name' => 'Trent Sterling (Tront)', 'url' => 'https://tront.xyz/', '@id' => ID }, 'social' => { 'name' => 'Trent Sterling' })
      Jekyll::Site.new(config).process
      fixtures.each do |slug, (_, labels, urls)|
        doc = Nokogiri::HTML(File.read(File.join(source, "_site/posts/#{slug}/index.html")))
        byline = doc.at_css('.post-authors')
        assert_equal labels, byline.css('em').map(&:text), slug
        assert_equal urls.compact, byline.css('a').map { |a| a['href'] }, slug
        assert byline.css('a').all? { |a| a['rel'] == 'author' }, slug
        assert_empty byline.css('script'), slug
        assert_includes doc.at_css('article .content').text, 'Original article & collaborator credit.', slug
        scripts = doc.css('script[type="application/ld+json"]')
        assert_equal 1, scripts.size, slug
        schema = JSON.parse(scripts.first.content)
        assert_equal 'BlogPosting', schema['@type'], slug
        authors = schema['author'].is_a?(Array) ? schema['author'] : [schema['author']]
        expected_names = %w[default empty-authors].include?(slug) ? ['Trent Sterling (Tront)'] : labels
        assert_equal expected_names, authors.map { |a| a['name'] }, slug
        assert_equal urls, authors.map { |a| a['url'] }, slug
        assert_equal %w[default empty-authors].include?(slug) ? [ID] : [nil] * authors.size, authors.map { |a| a['@id'] }, slug
        assert_equal '2020-01-01T00:00:00+00:00', schema['datePublished'], slug
      end
      about = Nokogiri::HTML(File.read(File.join(source, '_site/about/index.html')))
      schema = JSON.parse(about.at_css('script[type="application/ld+json"]').content)
      assert_equal 'WebSite', schema['@type']
      assert_nil schema['author']['@id'], 'Non-post metadata is untouched'
      # Optional fixture output for independent browser/reviewer checks; not published.
      FileUtils.cp_r(File.join(source, '_site'), ENV['AUTHOR_FIXTURE_OUTPUT']) if ENV['AUTHOR_FIXTURE_OUTPUT']
    end
  end
end
