// app/dashboard/page.tsx
"use client";
import UpgradeButton from "@/components/upgradebutton";
import { useSession, signIn, signOut } from "next-auth/react";
//import UpgradeButton from "@/components/UpgradeButton";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return (
    <div>
      <p>You are not signed in.</p>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );

    const isPremium = session.user?.isPremium;

  return (
    <div>
      <h1>Welcome, {session.user?.name ?? session.user?.email}</h1>
      <p>Subscription: {isPremium ? 'Premium ✅' : 'Free'}</p>
      {!isPremium && <UpgradeButton />}
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
