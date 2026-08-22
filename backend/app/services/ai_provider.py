import os
import time
from dotenv import load_dotenv
from google import genai

load_dotenv()


class GeminiProvider:
    def __init__(self):
        self._client = None
        self.models_pool = [
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite-preview",
        ]
        self.vision_model = "gemini-3.6-flash"
        self.text_model = "gemini-3.6-flash"

    @property
    def client(self):
        if self._client is None:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not set")
            self._client = genai.Client(api_key=api_key)
        return self._client

    def analyze_image(self, image_path: str) -> str:
        """Extract description and OCR text from an image."""
        try:
            uploaded_file = self.client.files.upload(file=image_path)
            prompt = (
                "Analyze this image. Provide a detailed description of what you see. "
                "If there is any text, extract it completely. "
                "Format your response as a clear, concise paragraph."
            )

            for model_name in self.models_pool:
                try:
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=[uploaded_file, prompt],
                    )
                    return response.text.strip()
                except Exception as e:
                    if any(k in str(e) for k in ["429", "503", "RESOURCE_EXHAUSTED", "UNAVAILABLE"]):
                        continue
                    raise e
        except Exception as e:
            return f"Error analyzing image: {str(e)}"
        return "Error analyzing image: All available models exhausted quota."

    def extract_entities(self, text: str) -> list[str]:
        """Extract key entities (people, places, concepts) for cross-modal linking."""
        prompt = (
            "Extract a comma-separated list of the most important entities "
            "(people, places, specific concepts) from this text. "
            "Output ONLY the comma-separated list, nothing else. "
            f"Text: {text}"
        )
        for model_name in self.models_pool:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                entities = [e.strip().lower() for e in response.text.split(",") if e.strip()]
                return list(set(entities))
            except Exception:
                continue
        return []

    def synthesize_answer(self, question: str, context: str) -> str:
        """Synthesize a grounded answer with multi-model fallback chain (Level 6)."""
        prompt = (
            "You are an intelligent knowledge engine. Answer the user's question "
            "based ONLY on the provided evidence context below.\n\n"
            "STRICT GROUNDING RULES:\n"
            "1. Answer ONLY using facts directly mentioned in the provided context.\n"
            "2. If the provided evidence does not contain enough information to answer the question, "
            "or if the question is outside the scope of the context, reply EXACTLY with: "
            "'The provided evidence does not contain enough information to answer.'\n"
            "3. Do NOT extrapolate, speculate, or fabricate numbers, names, or unsupported claims.\n\n"
            f"Question: {question}\n\n"
            f"Context:\n{context}\n\n"
            "Provide a clear, accurate, and grounded response."
        )

        last_error = None
        for model_name in self.models_pool:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                continue

        return f"Error synthesizing answer: {str(last_error)}"


# Singleton instance
ai_provider = GeminiProvider()

