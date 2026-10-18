# Keep visible post credits and the existing SEO tag's author field in agreement.
# The actual About tab opts into a profile through the same SEO tag owner.
require 'jekyll-seo-tag'
require 'uri'

module Tront
  module AuthorProfiles
    def self.web_url(value)
      return unless value.is_a?(String) && !value.strip.empty?

      uri = URI.parse(value)
      value if %w[http https].include?(uri.scheme) && uri.host && !uri.userinfo
    rescue URI::InvalidURIError
      nil
    end

    def self.resolve(page, site)
      source = [page['author'], page['authors']].find { |value| value && !value.empty? }
      default_author = source.nil?
      source ||= site['author'] || site['social']['name']
      entries = source.is_a?(Array) ? source : [source]
      registry = site['data']['authors'] || {}
      entries.filter_map do |entry|
        record = entry.is_a?(Hash) ? entry : { 'name' => entry }.merge(registry[entry] || {})
        name = record['name']
        next unless name.is_a?(String) && !name.strip.empty?

        author = { 'name' => name, 'label' => default_author ? site['social']['name'] || name : name,
                   'type' => record['type'] || 'Person' }
        url = web_url(record['url'])
        author['url'] = url if url
        # IDs are explicit author metadata, never inferred from a display name.
        id = web_url(record['@id'])
        author['@id'] = id if url && id
        author
      end
    end

    module Filters
      def post_authors(page)
        Tront::AuthorProfiles.resolve(page, @context.registers[:site].site_payload['site'])
      end
    end

    module SeoAuthors
      def about_profile?
        page['collection'] == 'tabs' && page['path'] == '_tabs/about.md' &&
          page['layout'] == 'page' && page['url'] == '/about/' && page_seo['type'] == 'ProfilePage'
      end

      def about_author_profiles
        Tront::AuthorProfiles.resolve({}, site) if about_profile?
      end

      def undated_navigation_tab?
        return false unless page['collection'] == 'tabs'

        expected = {
          '_tabs/archives.md' => ['archives', '/archives/', 'CollectionPage'],
          '_tabs/tags.md' => ['tags', '/tags/', 'CollectionPage'],
          '_tabs/discord.md' => ['page', '/discord/', 'WebPage']
        }[page['path']]
        expected && [page['layout'], page['url'], page_seo['type']] == expected
      end

      # Tabs receive a build-time date from Jekyll, not a proven publication date.
      # Suppress it at the SEO owner so neither JSON-LD nor Open Graph invent dates.
      def date_published
        super unless about_profile? || undated_navigation_tab?
      end

      def date_modified
        super unless about_profile? || undated_navigation_tab?
      end

      def post_author_profiles
        return unless page['collection'] == 'posts' && page['layout'] == 'post'

        Tront::AuthorProfiles.resolve(page, site)
      end
    end

    module StructuredAuthors
      define_method(:'@id') do
        "#{page_drop.canonical_url}#profile-page" if page_drop.about_profile?
      end

      def mainEntity
        author if page_drop.about_profile?
      end

      def author
        authors = page_drop.post_author_profiles || page_drop.about_author_profiles
        return super unless authors

        nodes = authors.filter_map do |author|
          next unless %w[Person Organization].include?(author['type'])

          node = { '@type' => author['type'], 'name' => author['name'] }
          %w[url @id].each { |key| node[key] = author[key] if author[key] }
          node
        end
        nodes.length == 1 ? nodes.first : nodes
      end
    end
  end
end

Liquid::Template.register_filter(Tront::AuthorProfiles::Filters)
Jekyll::SeoTag::Drop.prepend(Tront::AuthorProfiles::SeoAuthors)
Jekyll::SeoTag::JSONLDDrop.prepend(Tront::AuthorProfiles::StructuredAuthors)
