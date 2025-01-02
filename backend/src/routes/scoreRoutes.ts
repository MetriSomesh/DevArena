import express from "express";
import prisma from "../prisma/prismaClient";

const router = express.Router();

router.post("/calculate", async (req, res) => {
  const body = req.body;

  if (!body) {
    res.status(400).json({
      msg: "Invalid body",
    });
    return;
  }

  try {
    const userAnswers = body.userAnswers;
    const correctAnswers = body.correctAnswers;
    const userGameInfo = await prisma.userGameInfo.findUnique({
      where: {
        userid: body.userid
      }
    });


    const score = calculateScore(userAnswers, correctAnswers);
    const totalScore = userGameInfo?.score || 0 + score;

    const currentRank = determinRank(totalScore);
    res.status(200).json({
      score,
      currentRank
    })
    return
  } catch (error) {
    console.log("Some Error occured: ",error)
    res.status(500).json({
      msg: "Internal Server Error",
      error:error
    })
    return;
  }
});

function calculateScore(userAnswers:string[], correctAnswers:string[]) {
  let score = 0;
  userAnswers.forEach((ans,index) => {
    if (userAnswers[index] == correctAnswers[index]) {
      score += 10;
    }
  })
  return score;
}

function determinRank(totalScore:number) {
  
  if (totalScore <= 50)
  {
    return 'plastic';
  } else if (totalScore <= 100)
  {
    return 'bronze';
  } else if (totalScore <= 200)
  {
    return 'silver'
  } else if (totalScore <= 350)
  {
    return 'gold'
  }else if(totalScore<=550)
  {
    return 'platinium'
  } else {
    return 'plastic'
  }
}
