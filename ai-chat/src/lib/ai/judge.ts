import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function judgeConsistency(
  question: string,
  answer1: string,
  answer2: string,
  answer3: string
): Promise<boolean> {
  const prompt = `以下の3つのAI回答を比較してください。
表現・文体・詳しさが違っても、3つの回答が同じ核心的な事実・情報を伝えている場合はYESと答えてください。
1つでも他と矛盾する事実・明らかに異なる情報が含まれている場合のみNOと答えてください。
YESまたはNOだけ答えてください。それ以外のテキストは含めないでください。

【質問】
${question}

【回答1】
${answer1}

【回答2】
${answer2}

【回答3】
${answer3}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 10,
  });

  const text = response.choices[0]?.message?.content?.trim().toUpperCase() ?? "";
  return text.startsWith("YES");
}
