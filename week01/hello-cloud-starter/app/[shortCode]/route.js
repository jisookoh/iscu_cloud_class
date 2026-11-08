import { getOriginalUrl } from "../../lib/cache";
import { recordClick } from "../../lib/stats";

export async function GET(request, { params }) {
  const { shortCode } = await params;

  const t0 = performance.now();

  const { originalUrl, cacheStatus } = await getOriginalUrl(shortCode);

  const t1 = performance.now();

  // TODO
  // originalUrl이 존재하지 않는 경우
  // 404 Not Found 응답을 반환하세요.
  if (!originalUrl) {
    console.warn("Short URL not found", { shortCode });

    return new Response("Not Found", { status: 404 });
  }

  try {
    await recordClick(shortCode);
  } catch (error) {
    console.error("Failed to record click", { shortCode });
  }

  const t2 = performance.now();

  console.log({
    shortCode,
    cacheStatus,
    lookupMs: (t1 - t0).toFixed(1), // originalUrl 조회 완료까지의 시간
    updateMs: (t2 - t1).toFixed(1), // clickCount 업데이터 완료까지의 시간
    totalMs: (t2 - t0).toFixed(1), // 두 DB 작업에 사용된 전체 시간
  });

  return new Response(null, {
    status: 307,
    headers: {
      Location: originalUrl,
      "Cache-Control": "no-store",
      "X-Cache": cacheStatus,
    },
  });
}
