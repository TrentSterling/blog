require 'nokogiri'
require 'json'
require 'pathname'
require 'time'

root = File.expand_path(ARGV.fetch(0))
baseline = ARGV[1] && File.expand_path(ARGV[1])
files = Dir.glob(File.join(root, '**/*.html')).map { |file| file.delete_prefix(root + '/') }.sort
abort 'Generated HTML route inventory changed' if baseline && files != Dir.glob(File.join(baseline, '**/*.html')).map { |file| file.delete_prefix(baseline + '/') }.sort
posts = 0
profiles = 0
navigation_tabs = 0
tab_types = { 'archives/index.html' => 'CollectionPage', 'tags/index.html' => 'CollectionPage', 'discord/index.html' => 'WebPage' }
generated_dates = %w[datePublished dateModified]
article_dates = %w[article:published_time article:modified_time]
person = { '@type' => 'Person', 'name' => 'Trent Sterling (Tront)', 'url' => 'https://tront.xyz/', '@id' => 'https://tront.xyz/#trent-sterling' }
files.each do |relative|
  doc = Nokogiri::HTML(File.read(File.join(root, relative)))
  schemas = doc.css('script[type="application/ld+json"]').map { |script| JSON.parse(script.content) }
  profile_nodes = schemas.select { |node| node['@type'] == 'ProfilePage' }
  if relative == 'about/index.html'
    profiles += 1
    abort 'About must have one SEO-owned ProfilePage' unless schemas.length == 1 && profile_nodes.length == 1
    profile = profile_nodes.first
    abort 'About profile ID differs' unless profile['@id'] == 'https://tront.xyz/blog/about/#profile-page'
    abort 'About canonical differs' unless profile['url'] == 'https://tront.xyz/blog/about/' && doc.at_css('link[rel="canonical"]')&.[]('href') == profile['url']
    abort 'About Person identity differs' unless profile['mainEntity'] == person && profile['author'] == person
    abort 'About contains unproven dates' if %w[dateCreated datePublished dateModified].any? { |key| profile.key?(key) }
    abort 'About retains Article page identity' if profile.key?('mainEntityOfPage')
    abort 'About retains article Open Graph metadata' unless doc.css('meta[property^="article:"]').empty?
    abort 'About Open Graph type differs' unless doc.at_css('meta[property="og:type"]')&.[]('content') == 'website'
  else
    abort "Unexpected ProfilePage: #{relative}" unless profile_nodes.empty?
  end
  if tab_types.key?(relative)
    navigation_tabs += 1
    abort "Expected one SEO-owned navigation schema: #{relative}" unless schemas.length == 1 && schemas.first['@type'] == tab_types.fetch(relative)
    tab = schemas.first
    canonical = "https://tront.xyz/blog/#{relative.delete_suffix('index.html')}"
    abort "Navigation canonical differs: #{relative}" unless tab['url'] == canonical && doc.at_css('link[rel="canonical"]')&.[]('href') == canonical
    abort "Navigation tab contains dates or invented identity: #{relative}" if %w[dateCreated datePublished dateModified mainEntityOfPage @id mainEntity].any? { |key| tab.key?(key) }
    abort "Navigation author gained an identity: #{relative}" if tab.fetch('author').key?('@id')
    abort "Navigation retains article Open Graph metadata: #{relative}" unless doc.css('meta[property^="article:"]').empty?
    abort "Navigation Open Graph type differs: #{relative}" unless doc.at_css('meta[property="og:type"]')&.[]('content') == 'website'
  end
  if relative.start_with?('posts/') && doc.at_css('article .post-authors')
    posts += 1
    byline = doc.at_css('article .post-authors')
    articles = schemas.select { |node| %w[BlogPosting Article NewsArticle].include?(node['@type']) }
    abort "Expected one existing Article in #{relative}" unless articles.length == 1
    authors = articles.first['author']
    authors = [authors] unless authors.is_a?(Array)
    abort "Author count differs in #{relative}" unless authors.length == byline.css('em').length
    authors.zip(byline.css('em')).each do |author, em|
      labels = [author['name']]
      labels << 'Trent Sterling' if author['@id'] == 'https://tront.xyz/#trent-sterling' && author['name'] == 'Trent Sterling (Tront)'
      abort "Author name differs in #{relative}" unless labels.include?(em.text)
      link = em.at_css('a')
      abort "Author URL differs in #{relative}" unless link&.[]('href') == author['url']
      abort "Missing author relation in #{relative}" if link && link['rel'] != 'author'
    end
  end
  next unless baseline

  original = Nokogiri::HTML(File.read(File.join(baseline, relative)))
  # Historical pre-author baselines may differ only in their reviewed bylines.
  # Released/current baselines already have those bylines, which must match too.
  legacy_byline = !original.at_css('article .post-authors') && doc.at_css('article .post-authors')
  [original, doc].each do |page|
    page.css('article > header .post-meta > .d-flex > span').remove if legacy_byline
    page.at_css('body')&.traverse { |node| node.remove if node.text? && node.text.strip.empty? }
  end
  abort "Body changed outside byline: #{relative}" unless original.at_css('body')&.to_html == doc.at_css('body')&.to_html
  # These tabs are the only additional routes allowed to lose article timestamps.
  if tab_types.key?(relative)
    original.css('meta').each { |node| node.remove if article_dates.include?(node['property']) }
    node = original.at_css('meta[property="og:type"]')
    abort "Unknown navigation Open Graph baseline: #{relative}" unless node && %w[article website].include?(node['content'])
    node['content'] = 'website'
  end
  %w[link meta].each do |tag|
    # Other non-post dates can change between builds, but date presence, tag
    # attributes and every unrelated article property must remain unchanged.
    if !relative.start_with?('posts/') && !tab_types.key?(relative) && relative != 'about/index.html'
      article_dates.each do |property|
        old_nodes = original.css("meta[property='#{property}']")
        new_nodes = doc.css("meta[property='#{property}']")
        abort "Generated timestamp presence changed: #{relative}" unless old_nodes.length == new_nodes.length
        old_nodes.zip(new_nodes).each do |old_node, new_node|
          [old_node, new_node].each { |node| Time.iso8601(node['content']) }
          old_node['content'] = new_node['content']
        end
      end
    elsif relative == 'about/index.html'
      original.css('meta').each { |node| node.remove if article_dates.include?(node['property']) }
    end
    old = original.css("head #{tag}").map(&:to_html)
    new = doc.css("head #{tag}").map(&:to_html)
    if relative == 'about/index.html' && tag == 'meta'
      old.map! { |value| value.sub('property="og:type" content="article"', 'property="og:type" content="website"') }
    end
    abort "Unrelated head #{tag} changed: #{relative}" unless old == new
  end
  other_head = lambda do |page|
    page.at_css('head').children.reject do |node|
      %w[link meta].include?(node.name) || (node.name == 'script' && node['type'] == 'application/ld+json') || (node.text? && node.text.strip.empty?)
    end.map(&:to_html)
  end
  abort "Unrelated head content changed: #{relative}" unless other_head.call(original) == other_head.call(doc)
  before = original.css('script[type="application/ld+json"]').map { |script| JSON.parse(script.content) }
  abort "Schema count changed: #{relative}" unless before.length == schemas.length
  before.zip(schemas).each do |old, current|
    if tab_types.key?(relative)
      expected = Marshal.load(Marshal.dump(old))
      abort "Unknown navigation schema baseline: #{relative}" unless ['BlogPosting', tab_types.fetch(relative)].include?(expected['@type'])
      if expected['@type'] == 'BlogPosting'
        canonical = "https://tront.xyz/blog/#{relative.delete_suffix('index.html')}"
        abort "Unexpected navigation Article identity: #{relative}" unless expected['mainEntityOfPage'] == { '@type' => 'WebPage', '@id' => canonical }
      end
      expected['@type'] = tab_types.fetch(relative)
      (generated_dates + ['mainEntityOfPage']).each { |key| expected.delete(key) }
      abort "Navigation schema changed outside exact type/date/article fields: #{relative}" unless expected == current
    elsif relative == 'about/index.html'
      expected = Marshal.load(Marshal.dump(old))
      abort 'Unknown About schema baseline' unless %w[WebSite ProfilePage].include?(expected['@type'])
      expected['@type'] = 'ProfilePage'
      expected['@id'] = 'https://tront.xyz/blog/about/#profile-page'
      expected['author'] = person
      expected['mainEntity'] = person
      %w[datePublished dateModified].each { |key| expected.delete(key) }
      abort 'About schema changed outside the reviewed identity and date fields' unless expected == current
    elsif relative.start_with?('posts/') && doc.at_css('article')
      expected = Marshal.load(Marshal.dump(old))
      if expected['@type'] == 'BlogPosting'
        expected.fetch('author')['@id'] = 'https://tront.xyz/#trent-sterling'
      end
      abort "Article field changed outside author ID: #{relative}" unless expected == current
    else
      generated_dates.each do |key|
        abort "Generated date presence changed: #{relative}" unless old.key?(key) == current.key?(key)
        next unless old.key?(key)

        [old, current].each { |node| Time.iso8601(node.fetch(key)) }
        old[key] = current[key]
      end
      abort "Non-post schema changed: #{relative}" unless old == current
    end
  end
end
abort 'No built author bylines checked' if posts.zero?
abort 'Expected exactly one About profile route' unless profiles == 1
abort 'Expected exactly three undated navigation tabs' unless navigation_tabs == tab_types.length
puts "PASS: #{posts} author bylines/schema; #{profiles} About profile; #{navigation_tabs} undated navigation tabs; #{files.length} HTML pages#{baseline ? ', bodies and metadata preserved outside reviewed historical author/About changes and exact navigation type/date/article fields (other non-post generated date values normalized)' : ''}."
