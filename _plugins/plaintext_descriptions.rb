# Description fields are plain text. Do not render or expose copied Liquid tags.
module Tront
  module PlaintextDescriptions
    def self.clean(value)
      return value unless value.is_a?(String) && value.match?(/\{[%{]/)

      value.gsub(/\{%.*?%\}|\{\{.*?\}\}/m, ' ')
           .sub(/\{[%{].*\z/m, '')
           .gsub(/[[:space:]\u00a0]+/, ' ').strip
    end
  end
end

if defined?(Jekyll::Hooks)
  Jekyll::Hooks.register :site, :post_read do |site|
    site.posts.docs.each do |post|
      post.data['description'] = Tront::PlaintextDescriptions.clean(post.data['description'])
    end
  end
end
