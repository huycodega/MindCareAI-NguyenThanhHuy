import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).parent / ".env", override=True)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
)

response = client.chat.completions.create(
    model=os.getenv("DEFAULT_MODEL", "gpt-oss-20b"),
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
    max_tokens=500,
)

msg = response.choices[0].message
print("Model:", response.model)
print("Finish reason:", response.choices[0].finish_reason)
print("Content:", msg.content)
if hasattr(msg, "reasoning") and msg.reasoning:
    print("Reasoning:", msg.reasoning)
