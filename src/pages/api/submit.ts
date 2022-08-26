// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import { generateSlug } from "random-word-slugs";

type bodyType = {
  answers: string[];
  question: string;
};

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  const props: bodyType = JSON.parse(req.body);
  console.log(props);
  //create new question

  let tempSlug = generateSlug();
  while ((await prisma.questions.count({ where: { slug: tempSlug } })) != 0) {
    tempSlug = generateSlug();
    console.log("Random Clash");
  }
  try {
    await prisma.questions.create({
      data: {
        title: props.question,
        slug: tempSlug,
        answers: {
          create: props.answers.map((answer) => ({
            title: answer,
            votes: 0,
          })),
        },
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
  return res.status(200).json({
    message: "Success",
    slug: tempSlug,
  });
};

export default examples;
