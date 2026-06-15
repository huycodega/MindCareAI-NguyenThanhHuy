"""
Modal LLM service — Huysun29/cbt-qwen2.5-7b-v2
(Qwen2.5-7B-Instruct + CBT SFT, FULL MERGED model — best model @ M4 eval)

Endpoints used by backend/app/services/llm_client.py:
    POST /generate   { messages, n_responses, temperature, top_p,
                        max_new_tokens } → { responses, timing }
    GET  /health     → { status, model, gpu }

Deploy:
    pip install modal
    modal token new                # one-time
    modal deploy modal/llm_service.py

After deploy, Modal prints two HTTPS URLs. Add them to your .env:
    MODAL_LLM_ENDPOINT=https://<workspace>--cbt-llm-generate.modal.run
    MODAL_HEALTH_ENDPOINT=https://<workspace>--cbt-llm-health.modal.run
    MOCK_LLM=false

Notes
-----
- v2 is a FULL MERGED model: loaded directly via AutoModelForCausalLM
  (LLM_IS_MERGED=true). Set LLM_IS_MERGED=false + HF_MODEL_REPO=<adapter>
  to fall back to base + LoRA (the old Llama path).
- Qwen2.5 uses a native system role — no message merging needed.
- flash_attention_2 enabled when available for ~2× throughput.
- HF_TOKEN: Qwen2.5 base is ungated, but the token lets private repos load.
  Create a modal secret named "hf-secret" with key HF_TOKEN.
"""
import os
import time

import modal

# ─────────────────────────────────────────────────────────────────────────────
# Container image: CUDA + transformers + peft (LoRA merge)
# ─────────────────────────────────────────────────────────────────────────────
image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.1.0-devel-ubuntu22.04",
        add_python="3.11",
    )
    .pip_install(
        "torch==2.4.1",
        "transformers==4.45.2",
        "peft==0.13.2",
        "accelerate==1.0.1",
        "huggingface-hub==0.25.2",
        "fastapi==0.115.0",
        "pydantic==2.9.2",
        "packaging",
    )
    .run_commands(
        "pip install wheel ninja && pip install flash-attn --no-build-isolation"
    )
)

app = modal.App("cbt-llm")

HF_REPO = os.environ.get("HF_MODEL_REPO", "Huysun29/cbt-qwen2.5-7b-v2")
HF_BASE = os.environ.get("HF_BASE_MODEL", "Qwen/Qwen2.5-7B-Instruct")
# v2 ships as a full merged model → load HF_REPO directly. Set to "false"
# (string) to use the legacy base + LoRA adapter path.
LLM_IS_MERGED = os.environ.get("LLM_IS_MERGED", "true").lower() != "false"

hf_secret = modal.Secret.from_name("huggingface", required_keys=["HF_TOKEN"])


# ─────────────────────────────────────────────────────────────────────────────
# Modal class: loads models once per cold-start, stays warm 5 min
# ─────────────────────────────────────────────────────────────────────────────
model_cache = modal.Volume.from_name("cbt-model-cache", create_if_missing=True)

@app.cls(
    gpu="A100-80GB",
    image=image,
    secrets=[hf_secret],
    scaledown_window=300,
    timeout=900,
    volumes={"/root/.cache/huggingface": model_cache},
)
class CBTLLMService:
    @modal.enter()
    def load(self):
        """Run once per cold start. Merged → load HF_REPO directly;
        otherwise load HF_BASE + attach the LoRA adapter at HF_REPO."""
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from huggingface_hub import login

        login(os.environ["HF_TOKEN"])

        tok_src = HF_REPO if LLM_IS_MERGED else HF_BASE
        print(f"Loading tokenizer: {tok_src}")
        self.tokenizer = AutoTokenizer.from_pretrained(tok_src)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        weights_src = HF_REPO if LLM_IS_MERGED else HF_BASE
        print(f"Loading model weights: {weights_src} (merged={LLM_IS_MERGED})")
        model = None
        for attn_impl in ("flash_attention_2", "sdpa", "eager"):
            try:
                model = AutoModelForCausalLM.from_pretrained(
                    weights_src,
                    torch_dtype=torch.bfloat16,
                    device_map="auto",
                    attn_implementation=attn_impl,
                )
                print(f"Model loaded with attn={attn_impl}")
                break
            except Exception as e:
                print(f"attn={attn_impl} failed ({e}), trying next")

        if not LLM_IS_MERGED:
            from peft import PeftModel
            print(f"Attaching LoRA adapter: {HF_REPO}")
            model = PeftModel.from_pretrained(model, HF_REPO)

        self.model = model
        self.model.eval()
        print(f"CBT responder ready: {HF_REPO}")

    @modal.method()
    def generate(self, messages: list, n_responses: int = 3,
                  temperature: float = 0.8, top_p: float = 0.9,
                  max_new_tokens: int = 400) -> dict:
        import torch
        t0 = time.time()

        # Llama 3.1 natively supports the system role — pass messages directly
        prompt = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True)

        inputs = self.tokenizer(
            prompt, return_tensors="pt",
            truncation=True, max_length=4096,
        ).to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=temperature,
                top_p=top_p,
                num_return_sequences=n_responses,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        prompt_len = inputs["input_ids"].shape[1]
        responses = [
            self.tokenizer.decode(
                seq[prompt_len:], skip_special_tokens=True).strip()
            for seq in outputs
        ]
        total = time.time() - t0
        return {
            "responses": responses,
            "timing": {
                "total_seconds": total,
                "per_response_seconds": total / max(n_responses, 1),
            },
            "mode": "modal",
            "model": HF_REPO,
        }


# ─────────────────────────────────────────────────────────────────────────────
# HTTP endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def generate(body: dict):
    """POST /generate"""
    svc = CBTLLMService()
    return svc.generate.remote(
        messages=body.get("messages", []),
        n_responses=int(body.get("n_responses", 3)),
        temperature=float(body.get("temperature", 0.8)),
        top_p=float(body.get("top_p", 0.9)),
        max_new_tokens=int(body.get("max_new_tokens", 400)),
    )


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health():
    """GET /health"""
    return {
        "status": "ok",
        "model": HF_REPO,
        "base": HF_BASE,
        "role": "primary_responder",
    }
