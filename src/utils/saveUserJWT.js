import fs from "fs/promises";

export const saveUserJWT = async (user, token) => {
    console.log('started')
  let users = [];

  // Step 1: Read file safely
  try {
    const raw = await fs.readFile("usersJWT.json", "utf-8");
    users = JSON.parse(raw);
  } catch {
    // file doesn't exist or is empty → start fresh
    users = [];
  }

  // Step 2: Check if user already exists
  const index = users.findIndex((u) => u.user === user);

  if (index !== -1) {
    // Update existing user
    users[index].token = token;
  } else {
    // Add new user
    users.push({ user, token });
    }
    
    // Step 3: Save back to file
    await fs.writeFile("usersJWT.json", JSON.stringify(users, null, 2));
    console.log(users)
    console.log('saved')
};
