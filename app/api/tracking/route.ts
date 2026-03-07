import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tracking = searchParams.get("numero");

  if (!tracking) {
    return NextResponse.json({ error: "Missing tracking number" }, { status: 400 });
  }

  const supabase = await createClient();

  const [pkgResult, eventsResult] = await Promise.all([
    supabase.rpc("get_package_by_tracking", {
      p_tracking_number: tracking.toUpperCase(),
    }),
    supabase
      .from("tracking_events")
      .select("*")
      .eq(
        "package_id",
        supabase
          .from("packages")
          .select("id")
          .eq("tracking_number", tracking.toUpperCase())
          .limit(1)
      )
      .order("created_at", { ascending: false }),
  ]);

  const packages = pkgResult.data;
  if (!packages || packages.length === 0) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  const pkg = packages[0];

  // Fetch tracking events separately
  const { data: events } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("package_id", pkg.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ package: pkg, events: events ?? [] });
}
