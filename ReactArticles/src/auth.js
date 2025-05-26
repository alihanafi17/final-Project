export const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:8801/users/check-auth", {
      credentials: "include",
    });
    return await response.json();
  } catch (err) {
    console.error("Auth check failed:", err);
    return { loggedIn: false };
  }
};

export const logout = async () => {
  await fetch("http://localhost:8801/users/logout", {
    method: "POST",
    credentials: "include",
  });
};
