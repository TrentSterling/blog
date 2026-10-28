require 'json'
require 'digest'
require 'kramdown'
require 'kramdown-parser-gfm'

# Keep the copy exception tied to complete source snapshots. The existing
# generated-page check still compares all surrounding body and metadata fields.
module AboutCopyReview
  REVIEW = JSON.parse(File.read(File.join(__dir__, 'about.json')))
  %w[before after].each do |side|
    raise "Corrupt About #{side} snapshot" unless Digest::SHA256.hexdigest(REVIEW.fetch(side)) == REVIEW.fetch("#{side}Sha256")
  end

  def self.fragment(side)
    markdown = REVIEW.fetch(side).split(/^---\s*$\n?/, 3).last
    Nokogiri::HTML.fragment(Kramdown::Document.new(markdown, input: 'GFM', syntax_highlighter: nil).to_html)
  end

  def self.content_key(node)
    copy = node.dup
    copy.css('h2 > a.anchor, h3 > a.anchor, h4 > a.anchor, h5 > a.anchor, h6 > a.anchor').remove
    copy.css('h2 > span.me-2, h3 > span.me-2, h4 > span.me-2, h5 > span.me-2, h6 > span.me-2').each { |span| span.replace(span.children) }
    copy.traverse { |child| child.remove if child.text? && child.text.strip.empty? }
    copy.children.map { |child| child.to_html(save_with: 0) }.join
  end

  def self.description(side)
    value = if side == 'after'
      REVIEW.fetch(side)[/^description: "(.*)"$/, 1]
    else
      'Trent Sterling, or Tront, is a game developer with a decade of experience in the industry. He specializes in Unity, C#, and VR development.'
    end
    Nokogiri::HTML.fragment(Kramdown::Document.new(value).to_html).text.strip
  end

  def self.normalize_pair(original, current)
    old = original.at_css('main article > .content')
    new = current.at_css('main article > .content')
    raise 'About content container missing' unless old && new
    expected = content_key(fragment('after'))
    raise 'About rendered copy differs from reviewed source' unless content_key(new) == expected
    raise 'Unknown rendered About baseline' unless [content_key(fragment('before')), expected].include?(content_key(old))
    new.inner_html = old.inner_html
    ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].each do |selector|
      a, b = original.at_css(selector), current.at_css(selector)
      next unless a || b
      raise "About description missing: #{selector}" unless a && b
      raise 'Unexpected About description' unless b['content'] == description('after') && %w[before after].map { |side| description(side) }.include?(a['content'])
      a['content'] = b['content']
    end
  end
end
