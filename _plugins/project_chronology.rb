# Project chronology is separate from the article's publication date.
# A year-only item follows day-dated items in that year; a range uses its end
# year. These are ordering buckets, never fabricated January/December dates.
module ProjectChronology
  def self.fields(post)
    period = post.data['work_period']
    unless period
      return { 'chronology_year' => post.date.year,
               'chronology_sort' => "#{post.date.year}:1:#{post.date.strftime('%m%d%H%M%S')}:#{post.path}" }
    end

    match = /\A([1-9][0-9]{3})(?:-([1-9][0-9]{3}))?\z/.match(period.to_s)
    if !match || (match[2] && match[2].to_i <= match[1].to_i)
      raise Jekyll::Errors::FatalException, "#{post.path}: work_period must be YYYY or YYYY-YYYY in ascending order"
    end
    year = (match[2] || match[1]).to_i
    { 'chronology_year' => year, 'chronology_sort' => "#{year}:0:#{post.path}",
      'work_period_label' => period.to_s.tr('-', "\u2013") }
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each { |post| post.data.merge!(ProjectChronology.fields(post)) }
end
