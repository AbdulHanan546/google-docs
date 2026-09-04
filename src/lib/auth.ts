export const SEEDED_USERS = [
  {
    id: "user_alice",
    name: "Alice Chen",
    email: "alice@ajaia.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    roleTitle: "Product Lead",
  },
  {
    id: "user_bob",
    name: "Bob Miller",
    email: "bob@ajaia.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    roleTitle: "Staff Designer",
  },
  {
    id: "user_charlie",
    name: "Charlie Patel",
    email: "charlie@ajaia.internal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    roleTitle: "Founding Engineer",
  },
];

export function getUserById(userId: string) {
  return SEEDED_USERS.find((u) => u.id === userId) || SEEDED_USERS[0];
}
