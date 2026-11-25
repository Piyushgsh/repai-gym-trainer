import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    machine: { type: "string" },
    confidence: { type: "string", enum: ["High", "Medium", "Low"] },
    notes: { type: "string" },
    exercises: {
      type: "array", minItems: 1, maxItems: 8,
      items: {
        type: "object", additionalProperties: false,
        properties: {
          name: { type: "string" }, muscles: { type: "string" },
          setup: { type: "string" },
          instructions: { type: "array", items: { type: "string" } },
          tips: { type: "array", items: { type: "string" } }
        },
        required: ["name","muscles","setup","instructions","tips"]
      }
    }
  },
  required: ["machine","confidence","notes","exercises"]
};

export async function POST(req: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({error:"AI is not configured yet. Add OPENAI_API_KEY to your deployment environment variables."},{status:503});
    const form = await req.formData();
    const image = form.get("image");
    if (!(image instanceof File)) return NextResponse.json({error:"Please upload a machine photo."},{status:400});
    if (!image.type.startsWith("image/")) return NextResponse.json({error:"The uploaded file must be an image."},{status:400});
    if (image.size > 12 * 1024 * 1024) return NextResponse.json({error:"Image must be 12 MB or smaller."},{status:400});
    const bytes = Buffer.from(await image.arrayBuffer());
    const dataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;
    const client = new OpenAI({apiKey:key});
    const response = await client.chat.completions.create({
      model:"gpt-4o-mini",
      temperature:0.2,
      response_format:{type:"json_schema",json_schema:{name:"gym_machine_analysis",strict:true,schema}},
      messages:[
        {role:"system",content:"You are a cautious gym equipment identification assistant. Inspect the supplied photo and identify the machine only when reasonably supported by visible features. Suggest only exercises that can genuinely be performed safely on that exact machine and its visible attachments. If identification is uncertain, say so in notes and use Low confidence. Never invent capabilities. Include concise setup and step-by-step instructions, plus safety/form reminders. Avoid medical claims. If it is not gym equipment, clearly say so and return a conservative single exercise entry explaining that no exercise can be recommended."},
        {role:"user",content:[
          {type:"text",text:"Identify this gym machine. Return its likely name, confidence, brief identification notes, and up to 8 compatible exercises. For each exercise include target muscles, setup, 3–5 steps, and 1–3 form/safety tips."},
          {type:"image_url",image_url:{url:dataUrl,detail:"high"}}
        ]}
      ]
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("The AI returned an empty response.");
    return NextResponse.json(JSON.parse(content));
  } catch (error:any) {
    console.error("REP//AI machine analysis error:",error);
    return NextResponse.json({error:error?.message?.includes("API key")?"AI service authentication failed. Check your API key.":"Could not analyse this photo. Try a clearer image showing the full machine."},{status:500});
  }
}
