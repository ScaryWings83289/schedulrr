import { db } from "@/lib/prisma";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";

const toUsername = (name: string, userId: string) =>
  `${name.split(" ").join("-")}${userId.slice(-4)}`;

export const checkUser = async (): Promise<User | null> => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const username = toUsername(name || "user", user.id);
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("Clerk user is missing an email address");
    }

    const client = await clerkClient();
    await client.users.updateUser(user.id, { username });

    return db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || null,
        imageUrl: user.imageUrl,
        email,
        username,
      },
    });
  } catch (error) {
    console.error("checkUser failed", error);
    return null;
  }
};
