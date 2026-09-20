import { analyzeMeeting, meetingError } from "../apps/api/src/meetings.js";
export default {
  async fetch(request: Request) {
    if (request.method !== "POST") return Response.json({}, { status: 405 });
    try {
      return Response.json(await analyzeMeeting(await request.json()));
    } catch (error) {
      const failure = meetingError(error);
      return Response.json(failure, { status: failure.status });
    }
  },
};
