import { Collection, type Document } from "mongodb";
import type { BunRequest } from "bun";

export async function getSessionIndvHrs(
  collection: Collection<Document>,
  req: BunRequest
): Promise<{
  session: string;
  id: string;
  logs: {
    minutes: number;
    timestamp: string;
  }[];
}> {
  // @ts-ignore
  const session = req.params.session;
  // @ts-ignore
  const id = req.params.id;

  const logs = await collection.find({ session: session, id: id }).toArray();

  const results = logs.map((log) => {
    return {
      minutes: log.minutes,
      timestamp: new Date(log.timestamp).toISOString(),
    };
  });

  return {
    session: session,
    id: id,
    logs: results,
  };
}

export async function getSessionAggHrs(
  collection: Collection<Document>,
  req: BunRequest
): Promise<{
  session: string;
  id: string;
  minutes: number;
}> {
  // @ts-ignore
  const session = req.params.session;
  // @ts-ignore
  const id = req.params.id;

  const aggregate = await collection
    .aggregate([
      {
        $match: {
          session: session,
          id: id,
        },
      },
      {
        $group: {
          _id: id,
          minutes: {
            $sum: "$minutes",
          },
        },
      },
    ])
    .toArray();

  return {
    session: session,
    id: id,
    minutes: aggregate[0]?.minutes,
  };
}

export async function getMemberAggHrsForType(
  collection: Collection<Document>,
  req: BunRequest
): Promise<{
  id: string;
  minutes: number;
}> {
  // @ts-ignore
  const id = req.params.id;

  const params = new URLSearchParams(req.url.split("?")[1]);
  const month: number = parseInt(params.get("month") || "0");
  const startYear = month <= 4 ? "2025" : "2026";
  const startMonth = `${month <= 4 ? month + 8 : month - 4}`.padStart(2, "0");
  const endYear = month + 1 <= 4 ? "2025" : "2026";
  const endMonth = `${month + 1 <= 4 ? month + 9 : month - 3}`.padStart(2, "0");
  const startDst = parseInt(startMonth) >= 4 && parseInt(startMonth) <= 11;
  const endDst = parseInt(endMonth) >= 4 && parseInt(endMonth) <= 11;

  const pipeline: Document[] = [];

  if (month > 0) {
    const start = new Date(
      month <= 0
        ? 0
        : `${startYear}-${startMonth}-01T0${startDst ? 5 : 6}:00:00Z`
    );
    const end = new Date(
      month <= 0
        ? Infinity
        : `${endYear}-${endMonth}-01T0${endDst ? 5 : 6}:00:00Z`
    );

    pipeline.push({
      $match: {
        timestamp: { $gte: start, $lt: end },
      },
    });
  }

  pipeline.push({
    $match: {
      id: id,
    },
  });

  pipeline.push({
    $group: {
      _id: id,
      minutes: {
        $sum: "$minutes",
      },
    },
  });

  const aggregate = await collection.aggregate(pipeline).toArray();

  return {
    id: id,
    minutes: aggregate[0]?.minutes,
  };
}

export async function getEveryoneAggHrsForType(
  collection: Collection<Document>,
  req: BunRequest
): Promise<
  {
    id: string;
    minutes: number;
  }[]
> {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const month: number = parseInt(params.get("month") || "0");
  const day: number = parseInt(params.get("day") || "0");
  const startYear = month <= 4 ? "2025" : "2026";
  const startMonth = `${month <= 4 ? month + 8 : month - 4}`.padStart(2, "0");
  const endYear = day == 0 ? (month + 1 <= 4 ? "2025" : "2026") : startYear
  const endMonth = day == 0 ? (`${month + 1 <= 4 ? month + 9 : month - 3}`.padStart(2, "0")) : startMonth;
  const startDst = day == 0 ? (parseInt(startMonth) >= 4 && parseInt(startMonth) <= 11) : (parseInt(startMonth) + day / 31 >= 3.29 && parseInt(startMonth) + day / 31 <= 11.07);
  const endDst = day == 0 ? (parseInt(endMonth) >= 4 && parseInt(endMonth) <= 11) : (parseInt(endMonth) + day / 31 >= 3.29 && parseInt(endMonth) + day / 31 <= 11.06);

  const pipeline: Document[] = [];

  if (month > 0) {
    const start = new Date(
      month <= 0
        ? 0
        : `${startYear}-${startMonth}-${day == 0 ? "01" : day.toString().padStart(2, "0")}T00:00:00-0${startDst ? 5 : 6}:00`
    );
    const end = new Date(
      month <= 0
        ? Infinity
        : `${endYear}-${endMonth}-${day == 0 ? "01" : day.toString().padStart(2, "0")}T${day == 0 ? "00:00:00" : "23:59:59"}-0${endDst ? 5 : 6}:00`
    );

    pipeline.push({
      $match: {
        timestamp: { $gte: start, $lt: end },
      },
    });
  }

  pipeline.push({
    $group: {
      _id: "$id",
      minutes: {
        $sum: "$minutes",
      },
    },
  });

  const aggregate = await collection.aggregate(pipeline).toArray();

  return aggregate.map((item) => ({
    id: item._id,
    minutes: item.minutes,
  }));
}