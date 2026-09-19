import { NextResponse } from "next/server";
import { databaseUrl, storageKind, withStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Shows where data is coming from and how much is there. Counts only, no names or secrets.
export async function GET() {
  try {
    const counts = await withStore((store) => ({
      bettors: store.users.filter((u) => u.username !== "market_maker").length,
      admins: store.admins.length,
      markets: store.markets.length,
    }));
    return NextResponse.json({
      ok: true,
      app: "cowshi",
      storage: storageKind(),
      databaseUrlSet: Boolean(databaseUrl()),
      adminPasswordSet: Boolean((process.env.ADMIN_PASSWORD ?? "").trim()),
      secretKeySet: Boolean(process.env.SECRET_KEY || process.env.FLASK_SECRET_KEY),
      ...counts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ ok: false, app: "cowshi", error: message }, { status: 500 });
  }
}
