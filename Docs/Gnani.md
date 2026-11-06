> ## Documentation Index
> Fetch the complete documentation index at: https://docs.gnani.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Introduction – Gnani Speech APIs

> Speech-to-text, text-to-speech, and voice cloning APIs for Indian languages — REST, streaming, and batch.

Build with Gnani Speech APIs when you need transcription or synthesis in production — REST for short clips, WebSocket for live audio, and Batch for long or multi-file jobs.

| Product | When to use it |
| - | - |
| **This section** | Integrate STT, TTS, or voice cloning directly in your app |
| [Agent Builder](https://docs.gnani.ai/introduction.md) | Configure agents in the console |
| [Agent Builder Platform API](https://docs.gnani.ai/Platform/platform-introduction.md) | Manage agents, FAQs, and conversations over REST |

## Base URL

```text theme={null}
https://api.vachana.ai
```

All paths in this documentation are relative to this base URL.

## Authentication

Send your API key on every request:

```bash theme={null}
X-API-Key-ID: <your_api_key>
```

Generate a key from the [Gnani API dashboard](https://app.gnani.ai/voice). Missing or invalid keys return `401 Unauthorized`.

> [!TIP]
>
> Store keys in environment variables or a secrets manager. Do not commit them to source control.

## Available APIs

### Speech-to-Text — Gnani Prisma

| Model | Use it for | Guide |
| - | - | - |
| Prisma v2.5 (default) | Transcription in the language you specify | [Models](https://docs.gnani.ai/api/STT/models/overview.md) |
| Prisma v3.0 (`model=prisma-v3.0`) | Multilingual speech-to-text with automatic language detection | [Prisma v3.0](https://docs.gnani.ai/api/STT/models/prisma-v3.md) |

Choose a model, then choose how to send audio. See the [Speech-to-Text overview](https://docs.gnani.ai/api/STT/overview.md).

| API | Best for | Guide |
| - | - | - |
| STT REST | Audio up to 30 seconds, single HTTP response | [Speech-to-Text REST](https://docs.gnani.ai/api/STT/speech-to-text.md) |
| STT Realtime | Live microphone or streaming audio | [STT Realtime](https://docs.gnani.ai/api/STT/stt-websocket.md) |
| STT Batch | Long files, many files, offline pipelines | [Batch STT](https://docs.gnani.ai/api/STTBatch/Introduction.md) |

### Text-to-Speech — Gnani Timbre v2.5

> [!TIP]
>
> Timbre v2.5 is the recommended model. Timbre v2.0 is deprecated and will be removed in a future release.

| API | Best for | Guide |
| - | - | - |
| TTS REST | Full audio in one response | [TTS REST](https://docs.gnani.ai/api/TTS/tts-inference.md) |
| TTS Streaming | Progressive playback via SSE | [TTS Streaming](https://docs.gnani.ai/api/TTS/tts-sse.md) |
| TTS Realtime | Lowest latency over WebSocket | [TTS Realtime](https://docs.gnani.ai/api/TTS/tts-websocket.md) |
| Voice catalog | Pick a voice before you integrate | [Available Voices](https://docs.gnani.ai/api/TTS/available-voices.md) |

### Voice cloning

| API | Best for | Guide |
| - | - | - |
| VC Embeddings | Create a `speaker_embedding` from reference audio | [Voice Clone Embeddings](https://docs.gnani.ai/api/VC/voice-clone-embeddings.md) |
| VC REST | Cloned voice in one HTTP response | [VC REST](https://docs.gnani.ai/api/VC/vc-inference.md) |
| VC Streaming | Cloned voice over SSE | [VC Streaming](https://docs.gnani.ai/api/VC/vc-sse.md) |
| VC Realtime | Cloned voice over WebSocket | [VC Realtime](https://docs.gnani.ai/api/VC/vc-websocket.md) |

## Key capabilities

| Capability | Details |
| - | - |
| Languages | 10 Indian languages plus English, with native-script output |
| Language detection | Automatic, on Prisma v3.0 |
| Audio formats | WAV, MP3, OGG, FLAC, AAC, M4A (STT) |
| Voice cloning | Clone from a short reference sample |
| Latency | P95 \~200 ms for STT; streaming TTS supported |
| Modes | Real-time, REST, and batch |
| Formatting | Auto-punctuation and text normalization on supported endpoints |
| SSML | Supported on TTS for fine-grained control |

## Integrations

| Plugin | Guide |
| - | - |
| LiveKit | [LiveKit plugin](https://docs.gnani.ai/livekit/introduction.md) |
| Pipecat | [Pipecat plugin](https://docs.gnani.ai/pipecat/introduction.md) |

## Use case guides

| Guide | Description |
| - | - |
| [Podcast transcription](https://docs.gnani.ai/api/use-cases/podcast-transcription.md) | Speaker-separated batch transcription |
| [Call analytics](https://docs.gnani.ai/api/use-cases/call-analytics.md) | Batch STT plus LLM analysis |
| [Real-time compliance](https://docs.gnani.ai/api/use-cases/real-time-compliance.md) | Live WebSocket monitoring |

## Get started

New to the APIs? Start here: [Quick Start](https://docs.gnani.ai/api/introduction/quick-start.md)

Handling failures: [Error Reference](https://docs.gnani.ai/api/introduction/errors.md).

***

## Docs feedback

Docs feedback: [Gnani APIs docs feedback](https://discord.com/channels/1511338519899930634/1515991436229611571)

**Last verified:** 5 August 2026


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

================================================================
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.gnani.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Call Analytics Pipeline

> A production-ready Python pipeline for call analytics using the Gnani Prisma v2.5 Batch STT API. Covers async transcription with two-speaker diarization, segment-level sentiment, and LLM-powered analysis via Claude or OpenAI.

## Overview

Every customer call contains signal that most teams never act on. This pipeline surfaces that signal automatically — agent effectiveness, customer sentiment, resolution quality, and upsell opportunities — using the Batch STT API for transcription and an LLM for structured analysis.

| Industry | What the pipeline enables |
| - | - |
| **BFSI / Collections** | Monitor agent compliance, detect customer distress early, flag missed EMI restructuring opportunities. |
| **Insurance** | Analyze claim support calls, track resolution rates, identify policy renewal signals. |
| **Contact Centers / BPOs** | Automate QA at scale, reduce manual call review, improve agent training with structured feedback. |
| **Healthcare** | Analyze patient support calls, surface unresolved queries, track sentiment across touchpoints. |
| **Telecom** | Detect churn signals, identify upsell triggers, monitor service complaint patterns. |

> [!TIP]
>
> **Sentiment via LLM.** The Batch STT API returns speaker-separated segments with timestamps. Derive sentiment arcs, emotion shifts, and resolution quality in the LLM analysis step — no native sentiment fields are returned from the transcription layer.

***

## Prerequisites & Installation

```bash theme={null}
# HTTP client for Batch STT
pip install requests

# Install whichever LLM provider you intend to use
pip install anthropic       # Claude
pip install openai          # OpenAI / ChatGPT
```

> [!WARNING]
>
> **ffmpeg for audio prep.** If you need to compress or convert audio before upload (10 MB per-file limit), install ffmpeg with `brew install ffmpeg` on macOS or `apt install ffmpeg` on Linux.

***

## Authentication

Every request to the Batch STT API requires the `X-API-Key-ID` header. Store all credentials in environment variables.

| Header | Required | Description |
| - | - | - |
| `X-API-Key-ID` | Yes | Your Gnani Prisma v2.5 API key. Required on every Batch STT request. |
| `X-API-Request-ID` | No | A UUID trace ID you assign. Used to correlate your logs with platform logs or support tickets. |

```bash .env theme={null}
# Vachana
GNANI_API_KEY=your-api-key

# LLM provider — set whichever you will use
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Switch between "claude" and "openai"
LLM_PROVIDER=claude
```

> [!WARNING]
>
> **Never hardcode API keys.** Do not commit API keys to version control. Use environment variables, a secrets manager, or a vault. Rotate keys immediately if exposed.

***

## Supported Languages

| Language | Code | Script |
| - | - | - |
| **Bengali (Bangladesh)** | `bn-BD` | Bengali |
| **Bengali (India)** | `bn-IN` | Bengali |
| **English (India)** | `en-IN` | Latin |
| **Gujarati** | `gu-IN` | Gujarati |
| **Hindi** | `hi-IN` | Devanagari |
| **Hinglish** | `hi-en` | Latin + Devanagari |
| **Kannada** | `kn-IN` | Kannada |
| **Malayalam** | `ml-IN` | Malayalam |
| **Marathi** | `mr-IN` | Devanagari |
| **Punjabi** | `pa-IN` | Gurmukhi |
| **Tamil** | `ta-IN` | Tamil |
| **Telugu** | `te-IN` | Telugu |

> [!NOTE]
>
> **ITN not supported on Batch STT.** Transcripts are returned verbatim. Use [REST STT](https://docs.gnani.ai/api/STT/speech-to-text.md) if you need Inverse Text Normalization on short clips.

***

## Batch API Flow

Creating a job does **not** start transcription. You must call `/start` after upload.

| Step | Method | Endpoint | Reference |
| - | - | - | - |
| **1. Create job** | `POST` | `/stt/v3/batch/jobs` | [Create job](https://docs.gnani.ai/api/STTBatch/Create_Job.md) |
| **2. Start job** | `POST` | `/stt/v3/batch/jobs/{job_id}/start` | [Start job](https://docs.gnani.ai/api/STTBatch/Start_Job.md) |
| **3. Poll status** | `GET` | `/stt/v3/batch/jobs/{job_id}` | [Get job status](https://docs.gnani.ai/api/STTBatch/Get_Job.md) |
| **4. List files** | `GET` | `/stt/v3/batch/jobs/{job_id}/files?status=COMPLETED` | [Get job files](https://docs.gnani.ai/api/STTBatch/Get_Job_Files.md) |
| **5. Download** | `GET` | `<transcript_url>` | JSON with `full_transcript` + `segments` |

**1. Create — POST /stt/v3/batch/jobs**

Upload 1–100 audio files as multipart form data with a `config` JSON field (`model`, `language_code`, diarization settings). Receive a `job_id` with status `CREATED`. Transcription has not started yet.

**2. Start — POST /stt/v3/batch/jobs/\{job\_id}/start**

Trigger processing. Status transitions: `STARTING` → `QUEUED` → `IN_PROGRESS` → `COMPLETED` (or a terminal failure state).

**3. Poll — GET /stt/v3/batch/jobs/\{job\_id}**

Call the status endpoint every **10 seconds** until status reaches a terminal state. Job status and file counts are returned — not transcript text.

**4. Fetch transcript URLs — GET /files?status=COMPLETED**

Each completed file includes a `transcript_url` (valid for 1 hour). Download each URL to retrieve `full_transcript` and `segments`.

**5. Parse and analyze**

Build speaker-separated conversation threads and talk-time logs from segments. Send the parsed transcript to Claude or OpenAI for structured analysis including sentiment arc.

> [!WARNING]
>
> **Minimum poll interval: 10 seconds.** Do not poll more frequently than every 10 seconds for the same `job_id`.

***

## Pipeline Implementation

### Imports & Setup

```python imports and config theme={null}
import os, json, time, hashlib, requests
from pathlib  import Path
from datetime import datetime
from typing   import List, Dict, Optional

try:
    import anthropic
except ImportError:
    anthropic = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

OUTPUT_DIR    = "outputs"
BATCH_JOBS    = "https://api.vachana.ai/stt/v3/batch/jobs"
BATCH_START   = "https://api.vachana.ai/stt/v3/batch/jobs/{job_id}/start"
BATCH_STATUS  = "https://api.vachana.ai/stt/v3/batch/jobs/{job_id}"
BATCH_FILES   = "https://api.vachana.ai/stt/v3/batch/jobs/{job_id}/files"
POLL_INTERVAL = 10   # seconds — minimum recommended interval

TERMINAL_STATUSES = {"COMPLETED", "PARTIAL_FAILURE", "FAILED", "START_FAILED", "CANCELLED"}

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "claude")

Path(OUTPUT_DIR).mkdir(exist_ok=True)
```

### Create, Start & Poll

```python process_audio_files + _poll_until_complete theme={null}
def process_audio_files(
    self,
    audio_paths: List[str],
    language_code: str = "hi-IN",
) -> Dict[str, dict]:
    """Create a Batch STT job, start it, poll until complete, and download transcripts."""
    if not audio_paths:
        return {}

    config = {
        "model": "prisma-v2.5",
        "language_code": language_code,
        "mode": "transcribe",
        "with_diarization": True,
        "num_speakers": 2,
        "is_multi_channel": False,
    }

    files = [("config", (None, json.dumps(config), "application/json"))]
    for path in audio_paths:
        files.append(("files", (Path(path).name, open(path, "rb"), "audio/wav")))

    resp = requests.post(BATCH_JOBS, headers=self.headers, files=files)
    for key, (_, fh, _) in files:
        if key == "files":
            fh.close()
    resp.raise_for_status()
    job_id = resp.json()["job_id"]
    print(f"Job created: {job_id}")

    start_resp = requests.post(BATCH_START.format(job_id=job_id), headers=self.headers)
    start_resp.raise_for_status()
    print(f"Job started. status: {start_resp.json()['status']}")

    if not self._poll_until_complete(job_id):
        return {}

    output_dir = Path(OUTPUT_DIR) / f"job_{job_id}"
    output_dir.mkdir(parents=True, exist_ok=True)

    transcriptions = self._download_and_parse(job_id, output_dir)
    self.transcriptions.update(transcriptions)
    print(f"Transcribed {len(transcriptions)} file(s).")

    for fname, d in transcriptions.items():
        self.analyze_transcription(d["conversation_path"], output_dir, fname)

    return transcriptions


def _poll_until_complete(self, job_id: str) -> bool:
    """Poll the job status endpoint every 10 s until a terminal state is reached."""
    url = BATCH_STATUS.format(job_id=job_id)
    print("Polling for completion (every 10 s)...")
    while True:
        time.sleep(POLL_INTERVAL)
        r = requests.get(url, headers=self.headers)
        r.raise_for_status()
        payload = r.json()
        status  = payload["status"]
        progress = payload.get("progress", {})
        print(f"  status={status}  {progress.get('completed_files', 0)}/{progress.get('total_files', '?')} files")
        if status == "COMPLETED":
            return True
        if status in TERMINAL_STATUSES:
            print(f"Job ended with status: {status}")
            return False
```

### Download & Parse — Speaker Transcripts & Talk Time

`_download_and_parse` fetches completed file entries, downloads each `transcript_url`, and writes two output files per call: a speaker-labelled conversation transcript and a per-speaker talk-time log.

```python _download_and_parse theme={null}
def _download_and_parse(self, job_id: str, output_dir: Path) -> Dict[str, dict]:
    """Download transcript URLs and parse per-file segment data."""
    transcriptions = {}

    resp = requests.get(
        BATCH_FILES.format(job_id=job_id),
        headers=self.headers,
        params={"status": "COMPLETED"},
    )
    resp.raise_for_status()
    file_entries = resp.json().get("data", [])

    for entry in file_entries:
        transcript_url = entry.get("transcript_url")
        if not transcript_url:
            continue

        transcript = requests.get(transcript_url).json()
        fname        = Path(entry["original_path"]).stem
        segments     = transcript.get("segments", [])

        if not segments:
            print(f"No segments returned for {fname}, skipping.")
            continue

        lines, speaker_times = [], {}

        for seg in segments:
            spk  = seg.get("speaker_id", "UNKNOWN")
            text = seg.get("text", "").strip()
            s    = seg.get("start_time", 0.0)
            e    = seg.get("end_time",   0.0)

            lines.append(f"SPEAKER_{spk}: {text}")
            speaker_times[spk] = speaker_times.get(spk, 0.0) + (e - s)

        conv_path   = output_dir / f"{fname}_conversation.txt"
        timing_path = output_dir / f"{fname}_timing.json"

        conv_path.write_text("\n".join(lines), encoding="utf-8")
        timing_path.write_text(json.dumps(speaker_times, indent=2), encoding="utf-8")

        transcriptions[fname] = {
            "conversation_path": str(conv_path),
            "timing_path":       str(timing_path),
        }

    return transcriptions
```

> [!TIP]
>
> **Files produced per call:** `{name}_conversation.txt` — speaker-labelled transcript · `{name}_timing.json` — talk time per speaker in seconds

### LLM Analysis

The analysis step sends the parsed conversation to your chosen LLM with a structured prompt. Sentiment arc, resolution quality, and upsell signals are inferred here — not from the STT response. Switch providers by changing the `LLM_PROVIDER` environment variable.

```python analysis prompt theme={null}
ANALYSIS_PROMPT = """
Analyze this call transcription from start to finish.

TRANSCRIPTION:
{transcription}

Provide a structured response covering each of the following:

1. Speaker identification — which speaker is the customer, which is the agent?
2. Customer type — new/potential customer or existing customer?
3. Opening problem — what issue or query did the customer raise initially?
4. Products or services — what was the customer inquiring about or facing issues with?
5. Agent response — how did the agent handle and resolve the issue throughout the call?
6. Resolution outcome — was the issue resolved? Was the customer satisfied at the end?
7. Sentiment arc — how did the customer's sentiment shift across the call? Infer this from the conversation content.
8. Upsell or cross-sell signals — any opportunities the agent identified or missed?
9. Competitor mentions — were any competitors referenced?
10. Summary — two-sentence outcome summary.
"""
```

```python analyze_transcription + _call_llm theme={null}
def analyze_transcription(self, conversation_path: str, output_dir: Path, file_name: str) -> dict:
    """Run LLM analysis on a parsed conversation file."""
    transcript = Path(conversation_path).read_text(encoding="utf-8")
    analysis   = self._call_llm(
        system="You are a call analytics expert. Provide structured, actionable insights.",
        user=ANALYSIS_PROMPT.format(transcription=transcript),
    )
    out = output_dir / f"{file_name}_analysis.txt"
    out.write_text(analysis.strip(), encoding="utf-8")
    print(f"Analysis saved: {out}")
    return {"file_name": file_name, "analysis_path": str(out)}


def _call_llm(self, system: str, user: str) -> str:
    """Route to Claude or OpenAI based on LLM_PROVIDER env variable."""
    if LLM_PROVIDER == "claude":
        if anthropic is None:
            raise ImportError("Install the anthropic package: pip install anthropic")
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg    = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text

    elif LLM_PROVIDER == "openai":
        if OpenAI is None:
            raise ImportError("Install the openai package: pip install openai")
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        resp   = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
        )
        return resp.choices[0].message.content

    raise ValueError(f"Unknown LLM_PROVIDER '{LLM_PROVIDER}'. Set to 'claude' or 'openai'.")
```

### Ad-hoc Q\&A

Ask any question against a transcribed call — useful for targeted investigation after bulk processing.

```python answer_question theme={null}
def answer_question(self, question: str) -> None:
    """Answer a question for every transcribed call in the current session."""
    for fname, data in self.transcriptions.items():
        transcript = Path(data["conversation_path"]).read_text(encoding="utf-8")
        answer     = self._call_llm(
            system="",
            user=f"TRANSCRIPT:\n{transcript}\n\nQUESTION: {question}",
        )
        q_hash = hashlib.sha1(question.encode()).hexdigest()[:6]
        out    = Path(data["conversation_path"]).parent / f"{fname}_q_{q_hash}.txt"
        out.write_text(f"Q: {question}\n\nA:\n{answer}", encoding="utf-8")
        print(f"Answer saved: {out}")
```

### Summary Report

Generate a single summary report across all analyzed calls in the session.

```python get_summary theme={null}
SUMMARY_PROMPT = """
Based on this call analysis, provide a concise 2–3 word answer for each point:

{analysis_text}

1. Customer and Agent
2. Customer Type
3. Main Issue
4. Service Discussed
5. Agent Response Quality
6. Customer Satisfaction
7. Overall Sentiment
8. Competitor or Upsell Signal
9. Resolution Status
"""


def get_summary(self) -> None:
    """Generate a single summary report across all calls in the session."""
    ts  = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = Path(OUTPUT_DIR) / f"summary_{ts}.txt"

    with open(out, "w", encoding="utf-8") as f:
        f.write(f"CALL ANALYTICS SUMMARY\n{'='*60}\n")
        f.write(f"Generated : {datetime.now()}\n")
        f.write(f"Total calls: {len(self.transcriptions)}\n{'='*60}\n\n")

        for fname, data in self.transcriptions.items():
            af = Path(data["conversation_path"]).parent / f"{fname}_analysis.txt"
            if not af.exists():
                print(f"No analysis file found for {fname}, skipping.")
                continue
            summary = self._call_llm(
                system="You are a call analytics expert. Be concise.",
                user=SUMMARY_PROMPT.format(analysis_text=af.read_text(encoding="utf-8")),
            )
            f.write(f"Call: {fname}\n{'-'*30}\n{summary.strip()}\n\n")

    print(f"Summary saved: {out}")
```

***

## Full Pipeline

```python call_analytics_pipeline.py theme={null}
import os, json, time, hashlib, requests
from pathlib  import Path
from datetime import datetime
from typing   import List, Dict, Optional

try:
    import anthropic
except ImportError:
    anthropic = None

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

OUTPUT_DIR    = "outputs"
BATCH_JOBS    = "https://api.vachana.ai/stt/v3/batch/jobs"
BATCH_START   = "https://api.vachana.ai/stt/v3/batch/jobs/{job_id}/start"
BATCH_STATUS  = "https://api.vachana.ai/stt/v3/batch/jobs/{job_id}"
BATCH_FILES   = "https://api.vachana.ai/stt/v3/batch/jobs/{job_id}/files"
POLL_INTERVAL = 10
LLM_PROVIDER  = os.getenv("LLM_PROVIDER", "claude")

TERMINAL_STATUSES = {"COMPLETED", "PARTIAL_FAILURE", "FAILED", "START_FAILED", "CANCELLED"}

Path(OUTPUT_DIR).mkdir(exist_ok=True)

ANALYSIS_PROMPT = """
Analyze this call transcription from start to finish.

TRANSCRIPTION:
{transcription}

Provide a structured response covering each of the following:

1. Speaker identification — which speaker is the customer, which is the agent?
2. Customer type — new/potential customer or existing customer?
3. Opening problem — what issue or query did the customer raise initially?
4. Products or services — what was the customer inquiring about or facing issues with?
5. Agent response — how did the agent handle and resolve the issue throughout the call?
6. Resolution outcome — was the issue resolved? Was the customer satisfied at the end?
7. Sentiment arc — how did the customer's sentiment shift across the call? Infer this from the conversation content.
8. Upsell or cross-sell signals — any opportunities the agent identified or missed?
9. Competitor mentions — were any competitors referenced?
10. Summary — two-sentence outcome summary.
"""

SUMMARY_PROMPT = """
Based on this call analysis, provide a concise 2–3 word answer for each point:

{analysis_text}

1. Customer and Agent
2. Customer Type
3. Main Issue
4. Service Discussed
5. Agent Response Quality
6. Customer Satisfaction
7. Overall Sentiment
8. Competitor or Upsell Signal
9. Resolution Status
"""


class CallAnalytics:

    def __init__(self, api_key: str):
        self.headers        = {"X-API-Key-ID": api_key}
        self.transcriptions: Dict[str, dict] = {}

    def process_audio_files(self, audio_paths: List[str], language_code: str = "hi-IN") -> Dict[str, dict]:
        if not audio_paths:
            return {}

        config = {
            "model": "prisma-v2.5",
            "language_code": language_code,
            "mode": "transcribe",
            "with_diarization": True,
            "num_speakers": 2,
            "is_multi_channel": False,
        }

        files = [("config", (None, json.dumps(config), "application/json"))]
        for path in audio_paths:
            files.append(("files", (Path(path).name, open(path, "rb"), "audio/wav")))

        resp = requests.post(BATCH_JOBS, headers=self.headers, files=files)
        for key, (_, fh, _) in files:
            if key == "files":
                fh.close()
        resp.raise_for_status()
        job_id = resp.json()["job_id"]
        print(f"Job created: {job_id}")

        start_resp = requests.post(BATCH_START.format(job_id=job_id), headers=self.headers)
        start_resp.raise_for_status()
        print(f"Job started. status: {start_resp.json()['status']}")

        if not self._poll_until_complete(job_id):
            return {}

        output_dir = Path(OUTPUT_DIR) / f"job_{job_id}"
        output_dir.mkdir(parents=True, exist_ok=True)
        transcriptions = self._download_and_parse(job_id, output_dir)
        self.transcriptions.update(transcriptions)
        print(f"Transcribed {len(transcriptions)} file(s).")
        for fname, d in transcriptions.items():
            self.analyze_transcription(d["conversation_path"], output_dir, fname)
        return transcriptions

    def _poll_until_complete(self, job_id: str) -> bool:
        url = BATCH_STATUS.format(job_id=job_id)
        print("Polling every 10 s...")
        while True:
            time.sleep(POLL_INTERVAL)
            r = requests.get(url, headers=self.headers)
            r.raise_for_status()
            p = r.json()
            progress = p.get("progress", {})
            print(f"  [{p['status']}] {progress.get('completed_files', 0)}/{progress.get('total_files', '?')} files")
            if p["status"] == "COMPLETED":
                return True
            if p["status"] in TERMINAL_STATUSES:
                print(f"Job ended: {p['status']}")
                return False

    def _download_and_parse(self, job_id: str, output_dir: Path) -> Dict[str, dict]:
        transcriptions = {}
        resp = requests.get(
            BATCH_FILES.format(job_id=job_id),
            headers=self.headers,
            params={"status": "COMPLETED"},
        )
        resp.raise_for_status()

        for entry in resp.json().get("data", []):
            transcript_url = entry.get("transcript_url")
            if not transcript_url:
                continue
            transcript = requests.get(transcript_url).json()
            fname    = Path(entry["original_path"]).stem
            segments = transcript.get("segments", [])
            if not segments:
                continue
            lines, speaker_times = [], {}
            for seg in segments:
                spk = seg.get("speaker_id", "UNKNOWN")
                txt = seg.get("text", "").strip()
                s, e = seg.get("start_time", 0.0), seg.get("end_time", 0.0)
                lines.append(f"SPEAKER_{spk}: {txt}")
                speaker_times[spk] = speaker_times.get(spk, 0.0) + (e - s)
            cp = output_dir / f"{fname}_conversation.txt"
            tp = output_dir / f"{fname}_timing.json"
            cp.write_text("\n".join(lines), encoding="utf-8")
            tp.write_text(json.dumps(speaker_times, indent=2), encoding="utf-8")
            transcriptions[fname] = {"conversation_path": str(cp), "timing_path": str(tp)}
        return transcriptions

    def _call_llm(self, system: str, user: str) -> str:
        if LLM_PROVIDER == "claude":
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            msg    = client.messages.create(model="claude-opus-4-8", max_tokens=2000,
                         system=system, messages=[{"role": "user", "content": user}])
            return msg.content[0].text
        elif LLM_PROVIDER == "openai":
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            resp   = client.chat.completions.create(model="gpt-4o",
                         messages=[{"role": "system", "content": system},
                                   {"role": "user",   "content": user}])
            return resp.choices[0].message.content
        raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")

    def analyze_transcription(self, conversation_path: str, output_dir: Path, fname: str):
        transcript = Path(conversation_path).read_text(encoding="utf-8")
        analysis   = self._call_llm(system="You are a call analytics expert. Provide structured, actionable insights.",
                                     user=ANALYSIS_PROMPT.format(transcription=transcript))
        out = output_dir / f"{fname}_analysis.txt"
        out.write_text(analysis.strip(), encoding="utf-8")
        print(f"Analysis: {out}")

    def answer_question(self, question: str):
        for fname, data in self.transcriptions.items():
            transcript = Path(data["conversation_path"]).read_text(encoding="utf-8")
            answer     = self._call_llm(system="",
                user=f"TRANSCRIPT:\n{transcript}\n\nQUESTION: {question}")
            q_hash = hashlib.sha1(question.encode()).hexdigest()[:6]
            out    = Path(data["conversation_path"]).parent / f"{fname}_q_{q_hash}.txt"
            out.write_text(f"Q: {question}\n\nA:\n{answer}", encoding="utf-8")
            print(f"Q&A: {out}")

    def get_summary(self):
        ts  = datetime.now().strftime("%Y%m%d_%H%M%S")
        out = Path(OUTPUT_DIR) / f"summary_{ts}.txt"
        with open(out, "w", encoding="utf-8") as f:
            f.write(f"CALL ANALYTICS SUMMARY\n{'='*60}\nGenerated: {datetime.now()}\n{'='*60}\n\n")
            for fname, data in self.transcriptions.items():
                af = Path(data["conversation_path"]).parent / f"{fname}_analysis.txt"
                if not af.exists(): continue
                summary = self._call_llm(system="Be concise.",
                    user=SUMMARY_PROMPT.format(analysis_text=af.read_text(encoding="utf-8")))
                f.write(f"Call: {fname}\n{'-'*30}\n{summary.strip()}\n\n")
        print(f"Summary: {out}")


if __name__ == "__main__":
    analytics = CallAnalytics(api_key=os.getenv("GNANI_API_KEY"))

    analytics.process_audio_files(
        audio_paths=["./call_001.wav"],
        language_code="hi-IN",
    )

    analytics.answer_question("Did the agent offer any EMI or payment extension options?")
    analytics.get_summary()
```

***

## Sample Output

```text theme={null}
outputs/
└── job_019fa79e-81f9-7a8a-a446-6eff16ddec30/
    ├── call_001_conversation.txt    ← speaker-labelled transcript
    ├── call_001_timing.json         ← talk time per speaker (seconds)
    ├── call_001_analysis.txt        ← LLM structured analysis (includes sentiment arc)
    └── call_001_q_a3f9b2.txt        ← ad-hoc Q&A answer
summary_20251226_143052.txt          ← batch summary across all calls
```

**call\_001\_conversation.txt**

```text theme={null}
SPEAKER_1: नमस्ते, मेरा नाम रोहन है। मेरी EMI अगले हफ्ते due है।
SPEAKER_2: नमस्ते रोहन जी, आपका loan account number बताइए।
SPEAKER_1: हाँ, 45000 rupees की EMI है। क्या मुझे extension मिल सकता है?
SPEAKER_2: आपकी request process करते हैं। 3 दिन का extension approve हो सकता है।
SPEAKER_1: ठीक है, शुक्रिया।
```

**call\_001\_analysis.txt (excerpt)**

```text theme={null}
1. Speaker Identification
   SPEAKER_1 — Customer (Rohan)
   SPEAKER_2 — Agent

2. Customer Type
   Existing customer with an active loan account and an upcoming EMI.

3. Opening Problem
   Customer called to request an EMI payment extension due to cash flow constraints.

6. Resolution Outcome
   Resolved within the call. Customer expressed satisfaction before closing.

7. Sentiment Arc
   Started neutral-to-anxious. Shifted to relieved after the extension was confirmed.

8. Upsell / Cross-sell Signals
   No signals identified or pursued. Loan restructuring or a credit health check
   could have been offered — it was not.

10. Summary
    The customer's EMI extension request was resolved within a single call.
    Agent resolution quality was high; a potential upsell moment was missed.
```

***

## Limits & Notes

| Constraint | Value | What to do |
| - | - | - |
| **Max file size** | 10 MB per file | Compress or re-encode before upload. |
| **Max files per job** | 100 files | Group calls into jobs of up to 100 and submit sequentially for larger batches. |
| **Poll interval** | 10 seconds minimum | Do not poll more frequently than every 10 s per `job_id`. |
| **Speaker diarization** | Max 2 speakers | Designed for two-party calls (agent + customer). Set `num_speakers: 2`. |
| **`transcript_url` expiry** | 1 hour | Re-call [Get job files](https://docs.gnani.ai/api/STTBatch/Get_Job_Files.md) if a URL expires. |
| **ITN** | Not supported on Batch | Transcripts are verbatim. |
| **LLM token limits** | Varies by provider | For calls over 30 minutes, chunk the transcript before sending to the LLM analysis step. |

> [!NOTE]
>
> **Related docs:** [Batch transcription](https://docs.gnani.ai/api/STTBatch/Introduction.md) · [Create job](https://docs.gnani.ai/api/STTBatch/Create_Job.md) · [Start job](https://docs.gnani.ai/api/STTBatch/Start_Job.md) · [Get job status](https://docs.gnani.ai/api/STTBatch/Get_Job.md) · [Get job files](https://docs.gnani.ai/api/STTBatch/Get_Job_Files.md) · [REST STT for short clips](https://docs.gnani.ai/api/STT/speech-to-text.md)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.