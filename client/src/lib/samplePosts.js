// Sample posts matching the featured stories on the homepage.
// Replace with a Supabase query once stories are saved in the database.
export const posts = {
  1: { title: "Population Growth", author: "@user1_data", views: 1245, likes: 32 },
  2: { title: "Monthly Expenses", author: "@user2_stats", views: 982, likes: 27 },
  3: { title: "Favorite Foods", author: "@user3_visuals", views: 756, likes: 19 },
  4: { title: "Climate Trends", author: "@user4_charts", views: 654, likes: 15 },
  5: { title: "Movie Ratings", author: "@user5_data", views: 842, likes: 21 },
  6: { title: "Fitness Progress", author: "@user6_stats", views: 712, likes: 18 },
};

// Object.hasOwn so ids like "constructor" don't match inherited properties
export function getPost(id) {
  return Object.hasOwn(posts, id) ? posts[id] : undefined;
}
