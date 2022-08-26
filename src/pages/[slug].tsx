import { prisma } from "../server/db/client";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { Router, useRouter } from "next/router";
import Link from "next/link";
import { setCookie, getCookie } from "cookies-next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const questionData = await prisma.questions.findUnique({
    where: {
      slug: context.params?.slug?.toString(),
    },
    select: {
      id: true,
      title: true,
      answers: {
        select: {
          id: true,
          title: true,
          votes: true,
        },
      },
    },
  });

  if (questionData !== null) {
    return {
      props: { questionData }, // will be passed to the page component as props
    };
  } else {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

type Props = {
  questionData: {
    answers: {
      id: string;
      title: string;
      votes: number;
    }[];
    id: string;
    title: string;
  } | null;
};

export default function ViewPost(p: Props) {
  const [whichToggled, setWhichToggled] = useState<number | null>(null);
  const info = p.questionData;
  const [answers, setAnswers] = useState(info?.answers || []);

  const [showResults, setShowResults] = useState(false);

  const router = useRouter();

  const [alreadyVoted, setAlreadyVoted] = useState(false);

  useEffect(() => {
    setAlreadyVoted(getCookie(router.asPath) == true);
    if (getCookie(router.asPath) == true) {
      setShowResults(true);
    }
  }, []);

  const Submit = async () => {
    if (whichToggled !== null) {
      //increment local votes
      setCookie(router.asPath, true);
      const newAnswers = answers.map((answer) => {
        if (answer.id === answers[whichToggled]?.id) {
          return {
            ...answer,
            votes: answer.votes + 1,
          };
        } else {
          return answer;
        }
      });

      setAnswers(newAnswers);

      await fetch("/api/vote", {
        method: "POST",
        body: JSON.stringify({
          answerId: info?.answers[whichToggled]?.id,
        }),
      });
    }
  };

  //function to get the sum of all votes
  const getSum = (arr: { votes: number }[]) => {
    return arr.reduce((a, b) => a + b.votes, 0);
  };

  return (
    <div className="bg-gray-800 text-gray-200 min-h-screen">
      <div className="min-h-screen max-w-sm mx-auto ">
        <h1 className="text-2xl text-gray-200 text-center  mx-auto py-4">
          {info?.title}
        </h1>
        <ul className="flex flex-col overflow-hidden rounded-lg my-4">
          {answers.map((answer, index) => (
            <li key={answer.title}>
              <button
                onClick={() => {
                  if (whichToggled === index) {
                    setWhichToggled(null);
                  } else {
                    setWhichToggled(index);
                  }
                }}
                disabled={alreadyVoted || showResults}
                className={`w-full relative border-b disabled:pointer-events-none border-gray-900/10 overflow-hidden  text-gray-800 text-center ${
                  whichToggled !== index || showResults
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-800 "
                    : "bg-blue-700 hover:bg-blue-600 text-gray-300 border-blue-700 hover:border-blue-600 "
                }  p-4  transition duration-300`}
              >
                <div
                  style={{
                    width: `${(answer.votes / getSum(answers)) * 100}%`,
                  }}
                  className={`absolute transition duration-300 delay-75 top-0 ease-in-out left-0 h-72 bg-blue-300 ${
                    showResults
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full"
                  }`}
                ></div>
                <h1 className="drop-shadow-md">{answer.title}</h1>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            Submit();
            setAlreadyVoted(true);
            setWhichToggled(null);
            setShowResults(true);
          }}
          disabled={showResults || alreadyVoted}
          className="w-full mt-4 bg-green-500 disabled:opacity-50 disabled:pointer-events-none font-semibold p-4 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Submit Vote
        </button>
        <button
          onClick={() => {
            setShowResults(!showResults);
          }}
          className="w-full mt-4 bg-gray-500 font-semibold p-4 rounded-lg hover:bg-gray-600 transition duration-300"
        >
          {showResults ? "Hide Results" : "Show Results"}
        </button>
      </div>
    </div>
  );
}
