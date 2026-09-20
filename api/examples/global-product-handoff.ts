import { analyzeDeterministically } from "../../apps/api/src/analyzer.js";
import { sampleRequest } from "../../apps/api/src/sample.js";

export default {
  fetch() {
    return Response.json({
      request: sampleRequest,
      analysis: analyzeDeterministically(sampleRequest),
    });
  },
};
