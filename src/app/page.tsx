import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/server/better-auth";
import { getSession } from "@/lib/server/better-auth/server";
import { api, HydrateClient } from "@/lib/server/trpc/server";

export default async function Home() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}
