from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import AsyncOpenAI

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = """You are Rocky, a friendly AI assistant for people in Philadelphia who need community support resources. You help users find:
- Food banks, free meals, and grocery assistance
- Homeless shelters and housing resources
- Free health clinics and medical care
- Mental health services and counseling
- SEPTA transit information and stop locations
- Support groups (AA, NA, recovery programs)
- Campus resources for students at Drexel, Temple, UPenn, CCP, Saint Joseph's, and LaSalle

Keep responses concise (2-4 sentences max). Be warm, non-judgmental, and direct. Focus on practical, actionable information.
If someone seems to be in crisis or mentions self-harm, always remind them they can call or text 988 (Suicide & Crisis Lifeline) anytime.
You are NOT a substitute for professional medical or mental health advice. Always encourage users to seek professional help when appropriate."""


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI chat not configured")

    client = AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": req.message},
        ],
        max_tokens=200,
        temperature=0.7,
    )
    reply = response.choices[0].message.content or "I'm here to help. What do you need?"
    return ChatResponse(reply=reply)
