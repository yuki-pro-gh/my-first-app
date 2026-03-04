import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function judgeConsistency(
  question: string,
  answer1: string,
  answer2: string
): Promise<boolean> {
  const prompt = `以下の2つのAI回答を比較してください。
表現や文字数が異なっていても、伝えている事実や概要が矛盾していなければYESと答えてください。
明らかに異なる事実や矛盾する情報が含まれている場合のみNOと答えてください。
YESまたはNOだけ答えてください。それ以外のテキストは含めないでください。

【質問】
${question}

【回答1】
${answer1}

【回答2】
${answer2}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 10,
  });

  const text = response.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
  return text.startsWith("YES");
}
