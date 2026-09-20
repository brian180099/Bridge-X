import { transcribeAudio, meetingError } from "../apps/api/src/meetings.js";
export default {
  async fetch(request: Request) {
    if (request.method !== "POST") return Response.json({}, { status: 405 });
    if (Number(request.headers.get("content-length")) > 4_000_000)
      return Response.json(
        { message: "4MB 이하 파일을 선택해 주세요." },
        { status: 413 },
      );
    try {
      return Response.json(
        await transcribeAudio(
          new Uint8Array(await request.arrayBuffer()),
          request.headers.get("content-type") || "",
        ),
      );
    } catch (error) {
      const failure = meetingError(error);
      return Response.json(failure, { status: failure.status });
    }
  },
};
