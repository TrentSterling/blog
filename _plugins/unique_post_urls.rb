# Fail before rendering instead of silently overwriting another post's HTML.
Jekyll::Hooks.register :site, :post_read do |site|
  duplicates = site.posts.docs.group_by { |post| post.destination(site.dest) }
                   .select { |_destination, posts| posts.length > 1 }
  next if duplicates.empty?

  details = duplicates.map do |destination, posts|
    "#{destination}: #{posts.map(&:relative_path).join(', ')}"
  end
  raise Jekyll::Errors::FatalException,
        "Posts share an output file. Give each a unique permalink or slug:\n#{details.join("\n")}"
end
