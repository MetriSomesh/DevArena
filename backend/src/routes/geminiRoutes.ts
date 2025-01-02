import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import QUESTION_PROMPT from "../prompts/mcqPrompt";
import ANSWERS_PROMPT from "../prompts/mcqPrompt";

dotenv.config();
const router = express.Router();

const GEMENI_APIKEY = process.env.GEMINI_APIKEY || "";

const genAI = new GoogleGenerativeAI(GEMENI_APIKEY);

router.post("/getquestions", async (req, res) => {
  const body = req.body;
  if (!body) {
    res.status(400).json({
      msg: "Invalid body",
    });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 5000,
        candidateCount: 1,
      },
      systemInstruction: {
        parts: [
          {
            text: "Return only mcq questions along with there answers based on the provided instructions in the prompt. Do not return anything extra. Do not return answers with the prompt ",
          },
        ],
        role: "model",
      },
    });
    const prompt =
      JSON.stringify(QUESTION_PROMPT) + "The topic is " + body.prompt;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();

    // console.log("AI Generated response is: ", response);

    res.status(200).json({
      msg: "Questions are here",
      ai: response,
    });
    return;
  } catch (error) {
    console.log("SOME ERR OCCURRED: ", error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
    return;
  }
});

router.post("/getanswers", async (req, res) => {
  const body = req.body;
  if (!body) {
    res.status(400).json({
      msg: "Invalid body",
    });
    return;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        maxOutputTokens: 1000,
        candidateCount: 1,
      },
      systemInstruction: {
        parts: [
          {
            text: "Returning only the answers of the given questions more instruction is given in the prompt",
          },
        ],
        role: "model",
      },
    });
    const prompt = body.prompt + ANSWERS_PROMPT;
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();

    res.status(200).json({
      msg: "Answers are here",
      ai: response,
    });
    return;
  } catch (error) {
    console.log("SOME ERR OCCURRED: ", error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
    return;
  }
});

export default router;
