import { NextResponse } from "next/server";
import { storageKind, withStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Shows where data is coming from and how much is there. Counts only, no names or secrets.
export async function GET() {
  try {
    const counts = await withStore((store) => ({
      users: store.users.filter((u) => u.username !== "market_maker").length,
      admins: store.admins.length,
      markets: store.markets.length,
    }));
    return NextResponse.json({ ok: true, storage: storageKind(), ...counts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
