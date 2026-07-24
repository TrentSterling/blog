# frozen_string_literal: true

source "https://rubygems.org"

# PINNED EXACTLY: the custom theme cycler (assets/js/tront-theme.js), the TRONT
# palettes (assets/css/tront-themes.css), and the overridden _includes were all
# written against Chirpy 7.2's internals (Theme.flip + data-mode). Chirpy 7.3+
# replaced that API (Theme.update + Bootstrap data-bs-theme), and because this
# was "~> 7.2" with no lockfile, the 2026-07-02 rebuild silently pulled 7.6.0
# and broke the theme picker for three weeks. Bump ONLY together with a port of
# the cycler/CSS/includes to the new API.
gem "jekyll-theme-chirpy", "7.2.4"

gem "html-proofer", "~> 5.0", group: :test

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.2.0", :platforms => [:mingw, :x64_mingw, :mswin]
