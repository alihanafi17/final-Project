// export const checkAuth = async () => {
//   try {
//     const response = await fetch("http://localhost:8801/users/check-auth", {
//       credentials: "include",
//     });
//     return await response.json();
//   } catch (err) {
//     console.error("Auth check failed:", err);
//     return { loggedIn: false };
//   }
// };

// export const logout = async () => {
//   await fetch("http://localhost:8801/users/logout", {
//     method: "POST",
//     credentials: "include",
//   });
// };
export const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:8801/users/check-auth", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Auth check failed with status " + response.status);
    }

    const data = await response.json();

    const authenticated = data.loggedIn ?? false;
    const email = data.user?.email ?? null;

    if (authenticated && email) {
      localStorage.setItem("userEmail", email);
    } else {
      localStorage.removeItem("userEmail");
    }

    return { authenticated, email };
  } catch (err) {
    console.error("Auth check failed:", err);
    localStorage.removeItem("userEmail");
    return { authenticated: false, email: null };
  }
};

export const logout = async () => {
  try {
    const res = await fetch("http://localhost:8801/users/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn("Logout failed with status:", res.status);
    }
  } catch (err) {
    console.error("Logout request failed:", err);
  }

  localStorage.removeItem("userEmail");
  window.dispatchEvent(new Event("storage"));
};
