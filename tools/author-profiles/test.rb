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

  def test_actual_about_tab_is_the_only_identity_and_date_opt_in
    original = File.read(File.join(ROOT, '_tabs/about.md'))
    front, body = original.split(/^---\s*$\n?/, 3).drop(1)
    defaults = YAML.safe_load(front).merge('layout' => 'page', 'permalink' => '/about/')
    fixtures = {
      'actual-about' => ['_tabs/about.md', {}],
      'unopted-about' => ['_tabs/about.md', { 'seo' => {} }],
      'other-tab' => ['_tabs/other.md', {}],
      'other-collection' => ['_people/about.md', {}],
      'other-layout' => ['_tabs/about.md', { 'layout' => 'default' }],
      'other-url' => ['_tabs/about.md', { 'permalink' => '/other/' }],
      'ordinary-page' => ['about.html', {}]
    }
    fixtures.each do |label, (relative, overrides)|
      Dir.mktmpdir('about-profile') do |source|
        %w[_tabs _people _layouts _plugins].each { |dir| FileUtils.mkdir_p(File.join(source, dir)) }
        FileUtils.cp(File.join(ROOT, '_plugins/author_profiles.rb'), File.join(source, '_plugins/author_profiles.rb'))
        File.write(File.join(source, '_layouts/default.html'), '<!doctype html><html><head>{% seo %}</head><body>{{ content }}</body></html>')
        File.write(File.join(source, '_layouts/page.html'), "---\nlayout: default\n---\n{{ content }}")
        data = defaults.merge(overrides)
        data['date'] = '2001-02-03' unless label == 'actual-about'
        File.write(File.join(source, relative), "#{data.to_yaml}---\n#{body}")
        config = Jekyll.configuration('source' => source, 'destination' => File.join(source, '_site'), 'config' => [], 'quiet' => true,
          'plugins' => ['jekyll-seo-tag'], 'url' => 'https://tront.xyz', 'baseurl' => '/blog', 'timezone' => 'UTC',
          'collections' => { 'tabs' => { 'output' => true }, 'people' => { 'output' => true } },
          'author' => { 'name' => 'Trent Sterling (Tront)', 'url' => 'https://tront.xyz/', '@id' => ID },
          'social' => { 'name' => 'Trent Sterling' })
        Jekyll::Site.new(config).process
        route = data.fetch('permalink').delete_prefix('/')
        doc = Nokogiri::HTML(File.read(File.join(source, '_site', route, 'index.html')))
        scripts = doc.css('script[type="application/ld+json"]')
        assert_equal 1, scripts.length, label
        schema = JSON.parse(scripts.first.content)
        assert_equal "https://tront.xyz/blog#{data.fetch('permalink')}", doc.at_css('link[rel="canonical"]')['href'], label
        if label == 'actual-about'
          person = { '@type' => 'Person', 'name' => 'Trent Sterling (Tront)', 'url' => 'https://tront.xyz/', '@id' => ID }
          assert_equal 'ProfilePage', schema['@type']
          assert_equal 'https://tront.xyz/blog/about/#profile-page', schema['@id']
          assert_equal person, schema['mainEntity']
          assert_equal person, schema['author']
          %w[dateCreated datePublished dateModified mainEntityOfPage].each { |key| refute schema.key?(key), key }
          assert_empty doc.css('meta[property^="article:"]')
          assert_equal 'website', doc.at_css('meta[property="og:type"]')['content']
          assert_includes doc.at_css('body').text, 'contract Network Programmer and Unity Generalist'
        else
          # Upstream seo.type remains supported, but the identity/date exception
          # requires every guard, not merely an About title, URL, or type marker.
          assert_nil schema['@id'], label
          assert_nil schema['mainEntity'], label
          assert_nil schema['author']['@id'], label
          assert_equal '2001-02-03T00:00:00+00:00', schema['datePublished'], label
          assert_equal 'article', doc.at_css('meta[property="og:type"]')['content'], label
          assert_equal '2001-02-03T00:00:00+00:00', doc.at_css('meta[property="article:published_time"]')['content'], label
        end
      end
    end
  end

  def test_actual_navigation_tabs_require_every_date_opt_in_guard
    { 'archives' => ['archives', 'CollectionPage'], 'tags' => ['tags', 'CollectionPage'], 'discord' => ['page', 'WebPage'] }.each do |slug, (layout, type)|
      original = File.read(File.join(ROOT, "_tabs/#{slug}.md"))
      front, body = original.split(/^---\s*$\n?/, 3).drop(1)
      defaults = { 'layout' => layout, 'permalink' => "/#{slug}/" }.merge(YAML.safe_load(front))
      fixtures = {
        'actual-tab' => ["_tabs/#{slug}.md", {}],
        'missing-opt-in' => ["_tabs/#{slug}.md", { 'seo' => {} }],
        'wrong-path' => ['_tabs/other.md', {}],
        'wrong-collection' => ["_people/#{slug}.md", {}],
        'wrong-layout' => ["_tabs/#{slug}.md", { 'layout' => 'default' }],
        'wrong-url' => ["_tabs/#{slug}.md", { 'permalink' => '/other/' }],
        'wrong-type' => ["_tabs/#{slug}.md", { 'seo' => { 'type' => 'ProfilePage' } }],
        'ordinary-page' => ["#{slug}.html", {}],
        'ordinary-post' => ["_posts/2001-02-03-#{slug}.md", { 'layout' => 'post', 'seo' => {} }]
      }
      fixtures.each do |label, (relative, overrides)|
        context = "#{slug}: #{label}"
        Dir.mktmpdir('navigation-tab') do |source|
          %w[_tabs _people _posts _layouts _plugins].each { |dir| FileUtils.mkdir_p(File.join(source, dir)) }
          FileUtils.cp(File.join(ROOT, '_plugins/author_profiles.rb'), File.join(source, '_plugins/author_profiles.rb'))
          File.write(File.join(source, '_layouts/default.html'), '<!doctype html><html><head>{% seo %}</head><body>{{ content }}</body></html>')
          %w[archives tags page post].each { |name| File.write(File.join(source, "_layouts/#{name}.html"), "---\nlayout: default\n---\n{{ content }}") }
          data = defaults.merge(overrides)
          unless label == 'actual-tab'
            data['date'] = '2001-02-03'
            data['last_modified_at'] = '2002-03-04'
          end
          File.write(File.join(source, relative), "#{data.to_yaml}---\n#{body}")
          config = Jekyll.configuration('source' => source, 'destination' => File.join(source, '_site'), 'config' => [], 'quiet' => true,
            'plugins' => ['jekyll-seo-tag'], 'url' => 'https://tront.xyz', 'baseurl' => '/blog', 'timezone' => 'UTC',
            'collections' => { 'tabs' => { 'output' => true }, 'people' => { 'output' => true } },
            'author' => { 'name' => 'Trent Sterling (Tront)', 'url' => 'https://tront.xyz/', '@id' => ID },
            'social' => { 'name' => 'Trent Sterling' })
          Jekyll::Site.new(config).process
          route = data.fetch('permalink').delete_prefix('/')
          doc = Nokogiri::HTML(File.read(File.join(source, '_site', route, 'index.html')))
          scripts = doc.css('script[type="application/ld+json"]')
          assert_equal 1, scripts.length, context
          schema = JSON.parse(scripts.first.content)
          assert_equal "https://tront.xyz/blog#{data.fetch('permalink')}", doc.at_css('link[rel="canonical"]')['href'], context
          assert_nil schema['@id'], context
          assert_nil schema['mainEntity'], context
          assert_nil schema['dateCreated'], context
          if label == 'ordinary-post'
            assert_equal ID, schema['author']['@id'], context
          else
            assert_nil schema['author']['@id'], context
          end
          if label == 'actual-tab'
            assert_equal type, schema['@type'], context
            %w[datePublished dateModified mainEntityOfPage].each { |key| refute schema.key?(key), "#{context}: #{key}" }
            assert_empty doc.css('meta[property^="article:"]'), context
            assert_equal 'website', doc.at_css('meta[property="og:type"]')['content'], context
          else
            assert_equal '2001-02-03T00:00:00+00:00', schema['datePublished'], context
            assert_equal '2002-03-04T00:00:00+00:00', schema['dateModified'], context
            assert_equal 'article', doc.at_css('meta[property="og:type"]')['content'], context
            assert_equal '2001-02-03T00:00:00+00:00', doc.at_css('meta[property="article:published_time"]')['content'], context
            assert_equal '2002-03-04T00:00:00+00:00', doc.at_css('meta[property="article:modified_time"]')['content'], context
          end
        end
      end

      # Isolate each guard as well: moving a real document to another collection
      # necessarily changes its path too, so integration fixtures alone cannot
      # prove that the collection check itself is required.
      probe = Object.new.extend(Tront::AuthorProfiles::SeoAuthors)
      page = { 'collection' => 'tabs', 'path' => "_tabs/#{slug}.md", 'layout' => layout, 'url' => "/#{slug}/" }
      seo = { 'type' => type }
      probe.define_singleton_method(:page) { page }
      probe.define_singleton_method(:page_seo) { seo }
      assert probe.undated_navigation_tab?, slug
      { 'collection' => 'people', 'path' => '_tabs/other.md', 'layout' => 'default', 'url' => '/other/' }.each do |key, wrong|
        original_value = page[key]
        page[key] = wrong
        refute probe.undated_navigation_tab?, "#{slug}: isolated #{key} guard"
        page[key] = original_value
      end
      [nil, 'ProfilePage'].each do |wrong|
        seo['type'] = wrong
        refute probe.undated_navigation_tab?, "#{slug}: isolated type guard"
      end
    end
  end
end
