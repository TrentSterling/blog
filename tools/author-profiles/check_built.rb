require 'nokogiri'
require 'json'
require 'pathname'

root = File.expand_path(ARGV.fetch(0))
baseline = ARGV[1] && File.expand_path(ARGV[1])
files = Dir.glob(File.join(root, '**/*.html')).map { |file| file.delete_prefix(root + '/') }.sort
abort 'Generated HTML route inventory changed' if baseline && files != Dir.glob(File.join(baseline, '**/*.html')).map { |file| file.delete_prefix(baseline + '/') }.sort
posts = 0
profiles = 0
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
  # Exclude only the intended byline markup; all other body elements/text survive.
  [original, doc].each do |page|
    page.css('article > header .post-meta > .d-flex > span').remove
    page.at_css('body')&.traverse { |node| node.remove if node.text? && node.text.strip.empty? }
  end
  abort "Body changed outside byline: #{relative}" unless original.at_css('body')&.to_html == doc.at_css('body')&.to_html
  %w[link meta].each do |tag|
    old = original.css("head #{tag}").map(&:to_html)
    new = doc.css("head #{tag}").map(&:to_html)
    # Jekyll assigns a build-time date to tabs, independent of this change.
    unless relative.start_with?('posts/')
      old.reject! { |value| value.include?('property="article:') }
      new.reject! { |value| value.include?('property="article:') }
    end
    if relative == 'about/index.html' && tag == 'meta'
      old.map! { |value| value.sub('property="og:type" content="article"', 'property="og:type" content="website"') }
    end
    abort "Unrelated head #{tag} changed: #{relative}" unless old == new
  end
  before = original.css('script[type="application/ld+json"]').map { |script| JSON.parse(script.content) }
  abort "Schema count changed: #{relative}" unless before.length == schemas.length
  before.zip(schemas).each do |old, current|
    if relative == 'about/index.html'
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
      [old, current].each { |node| %w[datePublished dateModified].each { |key| node.delete(key) } }
      abort "Non-post schema changed: #{relative}" unless old == current
    end
  end
end
abort 'No built author bylines checked' if posts.zero?
abort 'Expected exactly one About profile route' unless profiles == 1
puts "PASS: #{posts} author bylines/schema; #{profiles} About profile; #{files.length} HTML pages#{baseline ? ', bodies and metadata preserved outside byline, post author ID, and exact About profile fields (other non-post generated build dates ignored)' : ''}."
