require 'json'
require_relative '../_plugins/plaintext_descriptions'

fixtures = JSON.parse(File.read(File.join(__dir__, 'description-rendering/fixtures.json')))
fixtures.each do |entry|
  actual = Tront::PlaintextDescriptions.clean(entry.fetch('description'))
  raise "Incorrect description: #{entry.fetch('path')}" unless actual == entry.fetch('expected')
end
{
  'Unchanged prose & credits.' => 'Unchanged prose & credits.',
  'Before {{ site.secret }} after.' => 'Before after.',
  'Before {% include missing.html %} after.' => 'Before after.',
  "Before {% include\nmissing.html %} after." => 'Before after.',
  'Before {% include truncated...' => 'Before',
  'Before {{ truncated...' => 'Before',
  '{% include only.html %}' => ''
}.each do |source, expected|
  raise "Unexpected result for #{source}" unless Tront::PlaintextDescriptions.clean(source) == expected
end
raise 'Nil descriptions must stay nil' unless Tront::PlaintextDescriptions.clean(nil).nil?
puts "Plain-text descriptions passed: #{fixtures.length} archived cases and 8 edge cases"
