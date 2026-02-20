-- VIEWS for common queries
CREATE VIEW campground_stats AS
SELECT
  c.id,
  c.name,
  COUNT(DISTINCT je.id) as total_visits,
  COUNT(DISTINCT r.id) as total_reviews,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT p.id) as total_photos
FROM campgrounds c
LEFT JOIN journal_entries je ON c.id = je.campground_id
LEFT JOIN reviews r ON c.id = r.campground_id
LEFT JOIN photos p ON c.id = p.campground_id
GROUP BY c.id, c.name;

CREATE VIEW user_stats AS
SELECT
  p.id,
  p.username,
  COUNT(DISTINCT je.id) as campgrounds_visited,
  COUNT(DISTINCT r.id) as reviews_written,
  COUNT(DISTINCT ph.id) as photos_uploaded
FROM profiles p
LEFT JOIN journal_entries je ON p.id = je.user_id
LEFT JOIN reviews r ON p.id = r.user_id
LEFT JOIN photos ph ON p.id = ph.user_id
GROUP BY p.id, p.username;
