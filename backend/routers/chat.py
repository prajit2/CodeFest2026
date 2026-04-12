from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import AsyncOpenAI

router = APIRouter(prefix="/chat", tags=["chat"])

_client: Optional[AsyncOpenAI] = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        _client = AsyncOpenAI(api_key=api_key)
    return _client


SYSTEM_PROMPT = (
    "You are Rocky, a friendly and knowledgeable community resource assistant for Philadelphia. "
    "You help residents find food banks, shelters, clinics, mental health services, SEPTA transit, "
    "support groups, and campus resources. Always be empathetic, concise, and direct. "
    "When suggesting resources, include the name, address, and hours when you know them. "
    "If you do not know a specific resource, say so and encourage the user to check 211PA.org "
    "or call 2-1-1 for local social services."
)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    university: Optional[str] = None  # optional context: drexel, temple, upenn, ccp, etc.


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a conversation to GPT-4o and receive Rocky's response.
    Accepts a full message history so the client controls context length.
    """
    if not request.messages:
        raise HTTPException(status_code=422, detail="messages list must not be empty")

    # Build system prompt with optional university context
    system_content = SYSTEM_PROMPT
    if request.university:
        system_content += (
            f" The user is affiliated with {request.university.title()} University in Philadelphia, "
            "so prioritize campus-specific resources when relevant."
        )

    openai_messages = [{"role": "system", "content": system_content}]
    for msg in request.messages:
        if msg.role not in {"user", "assistant"}:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid role '{msg.role}'. Must be 'user' or 'assistant'.",
            )
        openai_messages.append({"role": msg.role, "content": msg.content})

    try:
        client = _get_client()
        completion = await client.chat.completions.create(
            model="gpt-4o",
            messages=openai_messages,
            max_tokens=512,
            temperature=0.7,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI API error: {exc}")

    reply = completion.choices[0].message.content
    if reply is None:
        raise HTTPException(status_code=502, detail="OpenAI returned an empty response")

    return ChatResponse(reply=reply)
