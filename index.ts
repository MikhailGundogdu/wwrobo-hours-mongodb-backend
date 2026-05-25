import { serve, env, file } from "bun";
import { MongoClient } from "mongodb";

import { process } from "./logging";
import {
  getEveryoneAggHrsForType,
  getMemberAggHrsForType,
  getSessionAggHrs,
  getSessionIndvHrs,
} from "./fetching";

// MARK: - MongoDB Client
//
const uri = `mongodb://${env.USERNAME}:${env.PASSWORD}@${env.HOST}:27017/?authSource=logs&tls=true&tlsCAFile=${env.CA_PATH}`;
const client = new MongoClient(uri);

// MARK: - Logs
//
const logs = client.db("logs");
const practice = logs.collection("practice");
const outreach = logs.collection("outreach");
const competition = logs.collection("competition");

// MARK: - CORS Headers
//
const headers = new Headers({
  "Access-Control-Allow-Origin": "https://hours.westwoodrobots.org",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

// MARK: - HTTP Server
//
serve({
  port: env.PORT,
  routes: {
    // MARK: - GET Everyone
    //
    "/everyone/aggregate/practice": async (req) => {
      try {
        return Response.json(await getEveryoneAggHrsForType(practice, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/everyone/aggregate/outreach": async (req) => {
      try {
        return Response.json(await getEveryoneAggHrsForType(outreach, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/everyone/aggregate/competition": async (req) => {
      try {
        return Response.json(await getEveryoneAggHrsForType(competition, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    // MARK: - GET Aggregates
    //
    "/aggregate/member/practice/:id": async (req) => {
      try {
        return Response.json(await getMemberAggHrsForType(practice, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/aggregate/member/outreach/:id": async (req) => {
      try {
        return Response.json(await getMemberAggHrsForType(outreach, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/aggregate/member/competition/:id": async (req) => {
      try {
        return Response.json(await getMemberAggHrsForType(competition, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    // MARK: - GET Aggregate Session Hours
    //
    "/practice/:session/aggregate/:id": async (req) => {
      try {
        return Response.json(await getSessionAggHrs(practice, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/outreach/:session/aggregate/:id": async (req) => {
      try {
        return Response.json(await getSessionAggHrs(outreach, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/competition/:session/aggregate/:id": async (req) => {
      try {
        return Response.json(await getSessionAggHrs(competition, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    // MARK: - GET Individual Session Hours
    //
    "/practice/:session/individual/:id": async (req) => {
      try {
        return Response.json(await getSessionIndvHrs(practice, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/outreach/:session/individual/:id": async (req) => {
      try {
        return Response.json(await getSessionIndvHrs(outreach, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    "/competition/:session/individual/:id": async (req) => {
      try {
        return Response.json(await getSessionIndvHrs(competition, req), {
          status: 200,
          headers,
        });
      } catch (error) {
        return Response.json({ message: error }, { status: 500, headers });
      }
    },

    // MARK: - GET Sessions Listing
    //
    "/practice/sessions": async (req) => {
      return Response.json(["Practice"], {
        status: 200,
        headers,
      });
    },

    "/outreach/sessions": async (_) => {
      return Response.json(
        [
          "Robocamp W1D1",
          "Robocamp W1D2",
          "Robocamp W1D3",
          "Robocamp W1D4",
          "Robocamp W1D5",
          "Robocamp W2D1",
          "Robocamp W2D2",
          "Robocamp W2D3",
          "Robocamp W2D4",
          "Robocamp W2D5",
          "Robocamp W3D1",
          "Robocamp W3D2",
          "Robocamp W3D3",
          "Robocamp W3D4",
          "Robocamp W3D5",
          "Back to School Bash",
          "Patsy Sommer Spooky STEAM Night",
          "Scrimmage 1 Volunteering",
          "LM1 Volunteering",
          "Deer Park STEAM Night",
          "Anderson Mill Carnival",
          "Scrimmage 2 Volunteering",
          "Grisham FTC Outreach",
          "LM2 Volunteering",
          "Minibots Session 1",
          "LM3 Volunteering",
          "Minibots Session 2",
          "LT Volunteering",
        ],
        {
          status: 200,
          headers,
        }
      );
    },

    "/competition/sessions": async (req) => {
      return Response.json(["FTC LM1", "FTC LM2", "FTC LM3", "FTC LT"], {
        status: 200,
        headers,
      });
    },

    // MARK: - ADD Hours
    //
    "/practice/add/:id": {
      POST: async (req) => {
        const processed = await process(req, env.AUTH_KEY);

        if (processed.response) {
          return processed.response;
        }

        try {
          const result = await practice.insertOne(processed.log!);

          return Response.json(
            { created: true, insertedId: result.insertedId },
            { status: 200, headers }
          );
        } catch (error) {
          return Response.json({ message: error }, { status: 500, headers });
        }
      },
    },

    "/outreach/add/:id": {
      POST: async (req) => {
        const processed = await process(req, env.AUTH_KEY);

        if (processed.response) {
          return processed.response;
        }

        try {
          const result = await outreach.insertOne(processed.log!);

          return Response.json(
            { created: true, insertedId: result.insertedId },
            { status: 200, headers }
          );
        } catch (error) {
          return Response.json({ message: error }, { status: 500, headers });
        }
      },
    },

    "/competition/add/:id": {
      POST: async (req) => {
        const processed = await process(req, env.AUTH_KEY);

        console.log(processed);

        if (processed.response) {
          return processed.response;
        }

        try {
          const result = await competition.insertOne(processed.log!);

          return Response.json(
            { created: true, insertedId: result.insertedId },
            { status: 200, headers }
          );
        } catch (error) {
          return Response.json({ message: error }, { status: 500, headers });
        }
      },
    },

    // MARK: - Misc.
    //
    "/members": async () => {
      return Response.json(await file("./id_name_map.json").json(), {
        status: 200,
        headers,
      });
    },
    "/status": new Response("OK", { status: 200, headers }),
    "/*": {
      OPTIONS: () => new Response(null, { status: 204, headers }),
    },
  },
});
