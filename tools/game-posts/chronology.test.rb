require 'jekyll'
require 'minitest/autorun'
require_relative '../../_plugins/project_chronology'

class ProjectChronologyTest < Minitest::Test
  Post = Struct.new(:data, :date, :path)

  def test_partial_precision_never_changes_publication_date
    post = Post.new({ 'work_period' => '2009' }, Time.utc(2026, 10, 14, 15, 16, 48), 'bombertank')
    before = [post.date, post.data.dup]
    fields = ProjectChronology.fields(post)
    assert_equal 2009, fields['chronology_year']
    assert_equal '2009', fields['work_period_label']
    assert_equal before, [post.date, post.data]
    refute_match(/2009-\d\d-\d\d/, fields.values.join(' '))
  end

  def test_range_uses_end_year_without_an_invented_day
    fields = ProjectChronology.fields(Post.new({ 'work_period' => '2024-2025' }, Time.utc(2026), 'scamper'))
    assert_equal 2025, fields['chronology_year']
    assert_equal "2024\u20132025", fields['work_period_label']
    assert_equal '2025:0:scamper', fields['chronology_sort']
  end

  def test_chronology_keeps_existing_day_order_and_buckets_unknown_days
    posts = [Post.new({ 'work_period' => '2009' }, Time.utc(2026), 'bomber'),
             Post.new({}, Time.utc(2014, 6, 1), 'june'),
             Post.new({}, Time.utc(2014, 2, 1), 'february'),
             Post.new({ 'work_period' => '2014' }, Time.utc(2026), 'isaac')]
    ordered = posts.sort_by { |post| ProjectChronology.fields(post)['chronology_sort'] }.reverse
    assert_equal %w[june february isaac bomber], ordered.map(&:path)
    assert_equal 2014, ProjectChronology.fields(posts[1])['chronology_year']
  end

  def test_rejects_false_precision_and_invalid_ranges
    ['2009-01-01', 'unknown', '2025-2024', '2025-2025'].each do |period|
      assert_raises(Jekyll::Errors::FatalException) do
        ProjectChronology.fields(Post.new({ 'work_period' => period }, Time.utc(2026), 'example'))
      end
    end
  end
end
