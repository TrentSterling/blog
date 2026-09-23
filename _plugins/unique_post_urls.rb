# Fail before rendering instead of silently overwriting another post's HTML.
Jekyll::Hooks.register :site, :post_read do |site|
  { 'tags' => site.tags, 'categories' => site.categories }.each do |kind, taxonomy|
    collisions = taxonomy.keys.group_by { |label| Jekyll::Utils.slugify(label) }
                         .select { |_slug, labels| labels.length > 1 }
    next if collisions.empty?

    details = collisions.map { |slug, labels| "#{kind}/#{slug}: #{labels.join(', ')}" }
    raise Jekyll::Errors::FatalException,
          "Taxonomy labels share a URL. Use one spelling for each label:\n#{details.join("\n")}"
  end

  duplicates = site.posts.docs.group_by { |post| post.destination(site.dest) }
                   .select { |_destination, posts| posts.length > 1 }
  next if duplicates.empty?

  details = duplicates.map do |destination, posts|
    "#{destination}: #{posts.map(&:relative_path).join(', ')}"
  end
  raise Jekyll::Errors::FatalException,
        "Posts share an output file. Give each a unique permalink or slug:\n#{details.join("\n")}"
end
