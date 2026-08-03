from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class AgentContext:
    task: str
    data: dict[str, str] = field(default_factory=dict)


class BaseAgent(ABC):
    name: str

    @abstractmethod
    async def run(self, context: AgentContext) -> str:
        raise NotImplementedError

