import re


_CONTROL_CHAR_PATTERN = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
_LINE_SPACE_PATTERN = re.compile(r"[ \t]+")
_EXCESSIVE_NEWLINES_PATTERN = re.compile(r"\n{3,}")


class TextCleaner:
    def clean(self, text: str) -> str:
        text = _CONTROL_CHAR_PATTERN.sub("", text)
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = "\n".join(_LINE_SPACE_PATTERN.sub(" ", line).strip() for line in text.split("\n"))
        text = _EXCESSIVE_NEWLINES_PATTERN.sub("\n\n", text)
        return text.strip()
