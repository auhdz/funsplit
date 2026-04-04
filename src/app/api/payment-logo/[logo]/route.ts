import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

const assetMap: Record<string, string> = {
  barcode:
    "C:/Users/Adrian/.cursor/projects/c-Users-Adrian-funsplit/assets/c__Users_Adrian_AppData_Roaming_Cursor_User_workspaceStorage_7a7629d74c24b665506984d5279e6f50_images_image-5188c388-ff2f-4523-8b86-910fc83fa1fa.png",
  venmo:
    "C:/Users/Adrian/.cursor/projects/c-Users-Adrian-funsplit/assets/c__Users_Adrian_AppData_Roaming_Cursor_User_workspaceStorage_7a7629d74c24b665506984d5279e6f50_images_image-c366152b-c51d-46fd-b896-c6fdc96503d2.png",
  apple:
    "C:/Users/Adrian/.cursor/projects/c-Users-Adrian-funsplit/assets/c__Users_Adrian_AppData_Roaming_Cursor_User_workspaceStorage_7a7629d74c24b665506984d5279e6f50_images_image-16c4a06e-21e1-4ce9-b64f-c304219c39a8.png",
  zelle:
    "C:/Users/Adrian/.cursor/projects/c-Users-Adrian-funsplit/assets/c__Users_Adrian_AppData_Roaming_Cursor_User_workspaceStorage_7a7629d74c24b665506984d5279e6f50_images_image-37f20be4-2e59-4d5f-96cc-d9eea91a5732.png",
  cash:
    "C:/Users/Adrian/.cursor/projects/c-Users-Adrian-funsplit/assets/c__Users_Adrian_AppData_Roaming_Cursor_User_workspaceStorage_7a7629d74c24b665506984d5279e6f50_images_image-371a63c9-6e60-4c58-b94d-2b5149410a51.png",
};

export async function GET(_request: Request, { params }: { params: Promise<{ logo: string }> }) {
  const { logo } = await params;
  const key = logo.toLowerCase();
  const filePath = assetMap[key];
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch {
    return new NextResponse("Asset unavailable", { status: 404 });
  }
}
