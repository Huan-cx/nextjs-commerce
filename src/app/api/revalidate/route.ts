import {revalidatePath} from "next/cache";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {path} = body;

    if (path) {
      revalidatePath(path);
      return NextResponse.json({revalidated: true, path});
    }

    return NextResponse.json(
        {revalidated: false, error: 'Path is required'},
        {status: 400}
    );
  } catch (_error) {
    return NextResponse.json(
        {revalidated: false, error: 'Invalid request'},
        {status: 400}
    );
  }
}