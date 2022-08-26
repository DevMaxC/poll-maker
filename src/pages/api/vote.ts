// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  const full = JSON.parse(req.body);
  const { answerId } = full;

  try {
    await prisma.answers.update({
      where: {
        id: answerId,
      },
      data: {
        votes: { increment: 1 },
      },
    });
    return res.status(200).json({ message: "Success" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export default examples;
