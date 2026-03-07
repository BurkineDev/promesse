import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendStatusNotification } from "@/lib/email/notifications";
import { PackageStatus } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status, location } = body as {
      status: PackageStatus;
      location?: string;
    };

    const supabase = await createClient();

    // Fetch package with client info
    const { data: pkg } = await supabase
      .from("packages")
      .select("*, client:clients(name, email)")
      .eq("id", id)
      .single();

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const client = pkg.client as { name: string; email?: string } | null;

    if (client?.email) {
      await sendStatusNotification({
        clientEmail: client.email,
        clientName: client.name,
        trackingNumber: pkg.tracking_number,
        status,
        destination: pkg.destination,
        location,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notification error:", err);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
