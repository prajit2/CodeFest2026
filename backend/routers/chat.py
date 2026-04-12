from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from google import genai
from google.genai import types

router = APIRouter(prefix="/chat", tags=["chat"])

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set")
        _client = genai.Client(api_key=api_key)
    return _client


SYSTEM_PROMPT = (
    "You are Rocky, a friendly and knowledgeable community resource assistant for Philadelphia. "
    "You help residents find food banks, shelters, clinics, mental health services, SEPTA transit, "
    "support groups, and campus resources. Always be empathetic, concise, and direct. "
    "When suggesting resources, include the name, address, and hours when you know them. "
    "If you do not know a specific resource, say so and encourage the user to check 211PA.org "
    "or call 2-1-1 for local social services."
)


class ChatRequest(BaseModel):
    message: str
    university: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=422, detail="message must not be empty")

    system = SYSTEM_PROMPT
    if request.university:
        system += (
            f" The user is affiliated with {request.university.title()} University in Philadelphia, "
            "so prioritize campus-specific resources when relevant."
        )

    try:
        client = _get_client()
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=512,
                temperature=0.7,
            ),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {exc}")

    reply = response.text
    if not reply:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response")

    return ChatResponse(reply=reply)
