import { NextResponse } from "next/server";
import { packs } from "@/lib/packs";

export async function GET() {
  return NextResponse.json(packs);
}
