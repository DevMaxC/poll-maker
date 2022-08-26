import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import Router from "next/router";
import Link from "next/link";

const submit = async (array: string[], question: string) => {
  const response = await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify({ question, answers: array }),
  });
  const data = await response.json();

  Router.push(`/${data.slug}`);
};

const Create: NextPage = () => {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const questionRef = useRef<HTMLInputElement>(null);
  return (
    <div className="bg-gray-800 px-4">
      <Head>
        <title>Create Poll</title>
        <meta name="description" content="Create a poll" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen max-w-sm mx-auto relative">
        <div>
          <h1 className="text-2xl text-gray-200 text-center mx-auto py-4">
            Poll
          </h1>
          <div className="mt-2 absolute right-0 top-4 cursor-pointer hover:scale-105 transition">
            <Link href="https://github.com/DevMaxC/poll-maker">
              <Image src="/github.png" height={24} width={24} alt="logo" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center w-full">
          <div className="mb-6 w-full">
            <label
              htmlFor="large-input"
              className="block mb-2 text-sm font-medium text-gray-200 dark:text-gray-300"
            >
              Poll Question
            </label>
            <input
              type="text"
              ref={questionRef}
              id="large-input"
              className="block p-4 w-full text-gray-900 bg-gray-50 rounded-lg overflow-hidden  sm:text-md focus:ring-blue-500 "
            ></input>
          </div>
          <div
            ref={animationParent}
            className=" rounded-lg overflow-hidden w-full"
          >
            {options.map((option, index) => (
              <div key={index} className="w-full relative">
                <input
                  type="text"
                  id="large-input"
                  placeholder={"Option " + index}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  className="multi block p-4 w-full text-gray-900 bg-gray-50 border-b border-gray-300 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                ></input>
                <button
                  onClick={() => {
                    setOptions([
                      ...options.slice(0, index),
                      ...options.slice(index + 1),
                    ]);
                  }}
                  className="absolute top-1/2 -translate-y-1/2 text-red-500 right-4"
                >
                  <XMarkIcon height={24} width={24} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setOptions([...options, ""]);
              }}
              className="w-full bg-blue-500 text-white flex justify-center p-4 hover:bg-blue-600 transition"
            >
              <PlusIcon height={24} width={24} />
            </button>
          </div>
          <div className="my-6 w-full">
            <button
              onClick={() => {
                if (questionRef.current !== null) {
                  submit(options, questionRef.current.value);
                }
              }}
              className="w-full text-center bg-green-500 p-4 text-gray-200 rounded-lg hover:bg-green-600 transition font-semibold hover:shadow-md delay-100 duration-300"
            >
              Create
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Create;
