import { useState, useEffect } from "react";
import "./App.css";
import { soundManager } from "./utils/sound";

// Types
type CellState = boolean;
type GridState = CellState[][];
type GameMode = "menu" | "1p" | "2p";
type MirrorType = "none" | "horizontal" | "vertical" | "both";
type ScreenState =
  | "menu"
  | "playing"
  | "roundTransition"
  | "gameover"
  | "victory";

interface PlayerState {
  round: number;
  score: number;
  lives: number;
  pattern: GridState;
  answer: GridState;
  gridSize: number;
  mirrorType: MirrorType;
  status: "playing" | "correct" | "wrong" | "finished";
}

interface GameState {
  p1: PlayerState;
  p2: PlayerState;
  winner: 0 | 1 | 2;
}

// Constants
const MAX_ROUNDS = 10;
const MAX_LIVES = 3;

// Generate random pattern
const generatePattern = (size: number, density: number = 0.4): GridState => {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => Math.random() < density),
    );
};

// Create empty grid
const createEmptyGrid = (size: number): GridState => {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));
};

// Apply mirror transformation
const applyMirror = (grid: GridState, mirrorType: MirrorType): GridState => {
  let result = grid.map((row) => [...row]);

  switch (mirrorType) {
    case "horizontal":
      result = result.map((row) => [...row].reverse());
      break;
    case "vertical":
      result = [...result].reverse();
      break;
    case "both":
      result = result.map((row) => [...row].reverse()).reverse();
      break;
    default:
      break;
  }

  return result;
};

// Check if grids match
const gridsMatch = (a: GridState, b: GridState): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
};

// Get grid size for round
const getGridSizeForRound = (round: number): number => {
  if (round <= 2) return 3;
  if (round <= 4) return 4;
  if (round <= 6) return 5;
  return 6;
};

// Get mirror type for round (only horizontal mirror)
const getMirrorTypeForRound = (round: number): MirrorType => {
  if (round <= 7) return "none";
  return "horizontal";
};

// Get mirror label
const getMirrorLabel = (mirrorType: MirrorType): string => {
  switch (mirrorType) {
    case "horizontal":
      return "MIRROR";
    default:
      return "";
  }
};

// Create initial player state
const createPlayerState = (round: number = 1): PlayerState => {
  const gridSize = getGridSizeForRound(round);
  const mirrorType = getMirrorTypeForRound(round);
  return {
    round,
    score: 0,
    lives: MAX_LIVES,
    pattern: generatePattern(gridSize),
    answer: createEmptyGrid(gridSize),
    gridSize,
    mirrorType,
    status: "playing",
  };
};

// Cell Component
interface CellProps {
  isOn: boolean;
  onClick?: () => void;
  isInteractive: boolean;
  delay?: number;
  size?: number;
}

const Cell = ({
  isOn,
  onClick,
  isInteractive,
  delay = 0,
  size = 70,
}: CellProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const cellSize = size < 5 ? 60 : size < 6 ? 50 : 42;

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      className={`
        retro-cell
        ${isOn ? "cell-on" : "cell-off"}
        ${!isInteractive ? "pattern-cell" : ""}
        ${isVisible ? "cell-appear" : ""}
      `}
      style={{
        width: cellSize,
        height: cellSize,
        boxShadow: isOn
          ? "0 0 15px rgba(0, 245, 212, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)"
          : "inset 0 0 10px rgba(0, 0, 0, 0.5)",
      }}
    />
  );
};

// Grid Component
interface GridProps {
  grid: GridState;
  onCellClick?: (row: number, col: number) => void;
  isInteractive: boolean;
  baseDelay?: number;
  className?: string;
}

const Grid = ({
  grid,
  onCellClick,
  isInteractive,
  baseDelay = 0,
  className = "",
}: GridProps) => {
  const size = grid.length;

  return (
    <div
      className={`retro-grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: size > 4 ? "3px" : "6px",
        padding: size > 4 ? "6px" : "10px",
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <Cell
            key={`${i}-${j}`}
            isOn={cell}
            onClick={() => onCellClick?.(i, j)}
            isInteractive={isInteractive}
            delay={baseDelay + (i * size + j) * 25}
            size={size}
          />
        )),
      )}
    </div>
  );
};

// Hearts Display Component
interface HeartsProps {
  lives: number;
  maxLives?: number;
  color?: "cyan" | "pink";
}

const Hearts = ({ lives, maxLives = 3, color = "cyan" }: HeartsProps) => {
  return (
    <div className="hearts-container">
      {Array(maxLives)
        .fill(null)
        .map((_, i) => (
          <span
            key={i}
            className={`heart ${i < lives ? "heart-full" : "heart-empty"} heart-${color}`}
          >
            {i < lives ? "❤️" : "🤍"}
          </span>
        ))}
    </div>
  );
};

// Mode Badge Component
interface ModeBadgeProps {
  mirrorType: MirrorType;
}

const ModeBadge = ({ mirrorType }: ModeBadgeProps) => {
  if (mirrorType === "none") {
    return (
      <div className="mode-badge mode-copy">
        <span>📋 COPY MODE</span>
      </div>
    );
  }
  return (
    <div className="mode-badge mode-mirror">
      <span>🪞 {getMirrorLabel(mirrorType)}</span>
    </div>
  );
};

// Team Panel Component (for 2P mode)
interface TeamPanelProps {
  player: PlayerState;
  teamName: string;
  color: "cyan" | "pink";
  onCellClick: (row: number, col: number) => void;
  onCheck: () => void;
  flash: "success" | "error" | null;
  isWinner?: boolean;
}

const TeamPanel = ({
  player,
  teamName,
  color,
  onCellClick,
  onCheck,
  flash,
  isWinner,
}: TeamPanelProps) => {
  return (
    <div className={`team-panel ${isWinner ? "team-winner" : ""}`}>
      <div className="team-header">
        <h3 className={color === "cyan" ? "neon-text-cyan" : "neon-text-pink"}>
          {teamName}
        </h3>
        <ModeBadge mirrorType={player.mirrorType} />
        <div className="team-round">
          <span
            className={color === "cyan" ? "neon-text-cyan" : "neon-text-pink"}
          >
            ROUND {player.round}/10
          </span>
        </div>
      </div>

      <div className="team-grids">
        <div className="team-grid-section">
          <span className="retro-label">PATTERN</span>
          <Grid grid={player.pattern} isInteractive={false} baseDelay={0} />
        </div>
        <div className="team-grid-section">
          <span className="retro-label">ANSWER</span>
          <Grid
            grid={player.answer}
            onCellClick={onCellClick}
            isInteractive={player.status === "playing"}
            baseDelay={30}
            className={
              flash === "success"
                ? "success-glow"
                : flash === "error"
                  ? "error-glow"
                  : ""
            }
          />
        </div>
      </div>

      <button
        onClick={onCheck}
        className={`retro-btn ${color === "cyan" ? "retro-btn-primary" : "retro-btn-secondary"} team-check-btn`}
        disabled={player.status !== "playing"}
      >
        CHECK ✓
      </button>

      {player.status === "wrong" && (
        <div className="team-status neon-text-pink">TRY AGAIN!</div>
      )}
      {player.status === "correct" && (
        <div className="team-status neon-text-cyan">CORRECT!</div>
      )}
      {player.status === "finished" && (
        <div className="team-status neon-text-yellow">FINISHED!</div>
      )}
    </div>
  );
};

// Victory Screen Component
interface VictoryScreenProps {
  winner: 1 | 2;
  p1Rounds: number;
  p2Rounds: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

const VictoryScreen = ({
  winner,
  p1Rounds,
  p2Rounds,
  onPlayAgain,
  onMenu,
}: VictoryScreenProps) => {
  return (
    <div className="victory-screen">
      <div className="victory-content">
        <div className="victory-trophy">🏆</div>
        <h2 className="victory-title">
          <span className={winner === 1 ? "neon-text-cyan" : "neon-text-pink"}>
            TEAM {winner} WINS!
          </span>
        </h2>
        <div className="victory-stats">
          <div className="victory-stat">
            <span className="neon-text-cyan">TEAM 1</span>
            <span className="victory-rounds">
              {p1Rounds}/{MAX_ROUNDS} ROUNDS
            </span>
          </div>
          <div className="victory-vs">VS</div>
          <div className="victory-stat">
            <span className="neon-text-pink">TEAM 2</span>
            <span className="victory-rounds">
              {p2Rounds}/{MAX_ROUNDS} ROUNDS
            </span>
          </div>
        </div>
        <div className="victory-buttons">
          <button onClick={onPlayAgain} className="retro-btn retro-btn-primary">
            PLAY AGAIN
          </button>
          <button onClick={onMenu} className="retro-btn retro-btn-secondary">
            MAIN MENU
          </button>
        </div>
      </div>
      <div className="confetti-container">
        {Array(20)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ["#00f5d4", "#ff006e", "#fee440", "#00bb9f"][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
      </div>
    </div>
  );
};

// Game Over Screen Component (1P)
interface GameOverScreenProps {
  score: number;
  roundsCompleted: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

const GameOverScreen = ({
  score,
  roundsCompleted,
  onPlayAgain,
  onMenu,
}: GameOverScreenProps) => {
  return (
    <div className="gameover-screen">
      <div className="gameover-content">
        <div className="gameover-skull">💀</div>
        <h2 className="gameover-title neon-text-pink">GAME OVER</h2>
        <p className="gameover-subtitle">OUT OF LIVES</p>
        <div className="gameover-stats">
          <div className="gameover-stat">
            <span className="stat-label">ROUNDS</span>
            <span className="stat-value neon-text-cyan">
              {roundsCompleted}/{MAX_ROUNDS}
            </span>
          </div>
          <div className="gameover-stat">
            <span className="stat-label">SCORE</span>
            <span className="stat-value neon-text-yellow">{score}</span>
          </div>
        </div>
        <div className="gameover-buttons">
          <button onClick={onPlayAgain} className="retro-btn retro-btn-primary">
            TRY AGAIN
          </button>
          <button onClick={onMenu} className="retro-btn retro-btn-secondary">
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

// 1P Win Screen Component
interface WinScreenProps {
  score: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

const WinScreen = ({ score, onPlayAgain, onMenu }: WinScreenProps) => {
  return (
    <div className="win-screen">
      <div className="win-content">
        <div className="win-crown">👑</div>
        <h2 className="win-title neon-text-cyan">VICTORY!</h2>
        <p className="win-subtitle">ALL ROUNDS COMPLETED</p>
        <div className="win-score">
          <span className="win-score-label">FINAL SCORE</span>
          <span className="win-score-value neon-text-yellow">{score}</span>
        </div>
        <div className="win-buttons">
          <button onClick={onPlayAgain} className="retro-btn retro-btn-primary">
            PLAY AGAIN
          </button>
          <button onClick={onMenu} className="retro-btn retro-btn-secondary">
            MAIN MENU
          </button>
        </div>
      </div>
      <div className="stars-container">
        {Array(15)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              ⭐
            </div>
          ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [screen, setScreen] = useState<ScreenState>("menu");
  const [gameState, setGameState] = useState<GameState>({
    p1: createPlayerState(1),
    p2: createPlayerState(1),
    winner: 0,
  });
  const [p1Flash, setP1Flash] = useState<"success" | "error" | null>(null);
  const [p2Flash, setP2Flash] = useState<"success" | "error" | null>(null);

  const getYear = new Date().getFullYear();

  // Start new game
  const startGame = (mode: "1p" | "2p") => {
    soundManager.resume();
    soundManager.playMenuClick();
    setGameMode(mode);
    setScreen("playing");
    setGameState({
      p1: createPlayerState(1),
      p2: createPlayerState(1),
      winner: 0,
    });
    setP1Flash(null);
    setP2Flash(null);
  };

  // Reset to menu
  const goToMenu = () => {
    setGameMode("menu");
    setScreen("menu");
    setGameState({
      p1: createPlayerState(1),
      p2: createPlayerState(1),
      winner: 0,
    });
  };

  // Handle 1P cell click
  const handle1PCellClick = (row: number, col: number) => {
    if (gameState.p1.status !== "playing") return;

    soundManager.playCellClick();
    setGameState((prev) => {
      const newAnswer = prev.p1.answer.map((r) => [...r]);
      newAnswer[row][col] = !newAnswer[row][col];
      return {
        ...prev,
        p1: { ...prev.p1, answer: newAnswer },
      };
    });
  };

  // Handle 2P P1 cell click
  const handleP1CellClick = (row: number, col: number) => {
    if (gameState.p1.status !== "playing") return;

    soundManager.playCellClick();
    setGameState((prev) => {
      const newAnswer = prev.p1.answer.map((r) => [...r]);
      newAnswer[row][col] = !newAnswer[row][col];
      return {
        ...prev,
        p1: { ...prev.p1, answer: newAnswer },
      };
    });
  };

  // Handle 2P P2 cell click
  const handleP2CellClick = (row: number, col: number) => {
    if (gameState.p2.status !== "playing") return;

    soundManager.playCellClick();
    setGameState((prev) => {
      const newAnswer = prev.p2.answer.map((r) => [...r]);
      newAnswer[row][col] = !newAnswer[row][col];
      return {
        ...prev,
        p2: { ...prev.p2, answer: newAnswer },
      };
    });
  };

  // 1P Check answer
  const handle1PCheck = () => {
    const targetPattern = applyMirror(
      gameState.p1.pattern,
      gameState.p1.mirrorType,
    );
    const isCorrect = gridsMatch(targetPattern, gameState.p1.answer);

    if (isCorrect) {
      soundManager.playCorrect();
      setP1Flash("success");

      setTimeout(() => {
        if (gameState.p1.round >= MAX_ROUNDS) {
          // Player won!
          setGameState((prev) => ({
            ...prev,
            p1: { ...prev.p1, score: prev.p1.score + 10, status: "finished" },
          }));
          setScreen("victory");
          soundManager.playVictory();
        } else {
          // Next round
          const newRound = gameState.p1.round + 1;
          const gridSize = getGridSizeForRound(newRound);
          const mirrorType = getMirrorTypeForRound(newRound);

          setGameState((prev) => ({
            ...prev,
            p1: {
              ...prev.p1,
              round: newRound,
              score: prev.p1.score + 10,
              gridSize,
              mirrorType,
              pattern: generatePattern(gridSize),
              answer: createEmptyGrid(gridSize),
              status: "playing",
            },
          }));
        }
        setP1Flash(null);
      }, 500);
    } else {
      soundManager.playWrong();
      setP1Flash("error");
      const newLives = gameState.p1.lives - 1;

      setGameState((prev) => ({
        ...prev,
        p1: { ...prev.p1, lives: newLives, status: "wrong" },
      }));

      setTimeout(() => {
        if (newLives <= 0) {
          setScreen("gameover");
          soundManager.playGameOver();
        } else {
          setGameState((prev) => ({
            ...prev,
            p1: { ...prev.p1, status: "playing" },
          }));
        }
        setP1Flash(null);
      }, 600);
    }
  };

  // 2P P1 Check
  const handleP1Check = () => {
    const targetPattern = applyMirror(
      gameState.p1.pattern,
      gameState.p1.mirrorType,
    );
    const isCorrect = gridsMatch(targetPattern, gameState.p1.answer);

    if (isCorrect) {
      soundManager.playCorrect();
      setP1Flash("success");

      setTimeout(() => {
        const newRound = gameState.p1.round + 1;

        // Check if P1 reached 10 rounds first - they win!
        if (newRound > MAX_ROUNDS) {
          setGameState((prev) => ({
            ...prev,
            p1: { ...prev.p1, status: "finished" },
            winner: 1,
          }));
          setScreen("victory");
          soundManager.playVictory();
          setP1Flash(null);
          return;
        }

        const gridSize = getGridSizeForRound(newRound);
        const mirrorType = getMirrorTypeForRound(newRound);

        setGameState((prev) => ({
          ...prev,
          p1: {
            ...prev.p1,
            round: newRound,
            gridSize,
            mirrorType,
            pattern: generatePattern(gridSize),
            answer: createEmptyGrid(gridSize),
            status: "playing",
          },
        }));
        setP1Flash(null);
      }, 500);
    } else {
      soundManager.playWrong();
      setP1Flash("error");
      setGameState((prev) => ({
        ...prev,
        p1: { ...prev.p1, status: "wrong" },
      }));
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          p1: { ...prev.p1, status: "playing" },
        }));
        setP1Flash(null);
      }, 600);
    }
  };

  // 2P P2 Check
  const handleP2Check = () => {
    const targetPattern = applyMirror(
      gameState.p2.pattern,
      gameState.p2.mirrorType,
    );
    const isCorrect = gridsMatch(targetPattern, gameState.p2.answer);

    if (isCorrect) {
      soundManager.playCorrect();
      setP2Flash("success");

      setTimeout(() => {
        const newRound = gameState.p2.round + 1;

        // Check if P2 reached 10 rounds first - they win!
        if (newRound > MAX_ROUNDS) {
          setGameState((prev) => ({
            ...prev,
            p2: { ...prev.p2, status: "finished" },
            winner: 2,
          }));
          setScreen("victory");
          soundManager.playVictory();
          setP2Flash(null);
          return;
        }

        const gridSize = getGridSizeForRound(newRound);
        const mirrorType = getMirrorTypeForRound(newRound);

        setGameState((prev) => ({
          ...prev,
          p2: {
            ...prev.p2,
            round: newRound,
            gridSize,
            mirrorType,
            pattern: generatePattern(gridSize),
            answer: createEmptyGrid(gridSize),
            status: "playing",
          },
        }));
        setP2Flash(null);
      }, 500);
    } else {
      soundManager.playWrong();
      setP2Flash("error");
      setGameState((prev) => ({
        ...prev,
        p2: { ...prev.p2, status: "wrong" },
      }));
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          p2: { ...prev.p2, status: "playing" },
        }));
        setP2Flash(null);
      }, 600);
    }
  };

  // Render Menu Screen
  if (gameMode === "menu" || screen === "menu") {
    return (
      <div className="retro-bg min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="retro-title mb-2 text-3xl md:text-5xl">
          PATTERN MIRROR
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mb-12 text-center max-w-md">
          COPY THE PATTERN • MIND THE MIRROR • RACE TO WIN
        </p>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => startGame("1p")}
            className="retro-btn retro-btn-primary px-12 py-6 text-base md:text-lg rounded-lg min-w-[280px]"
          >
            👤 1 PLAYER
          </button>
          <button
            onClick={() => startGame("2p")}
            className="retro-btn retro-btn-secondary px-12 py-6 text-base md:text-lg rounded-lg min-w-[280px]"
          >
            👥 2 PLAYERS
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-xs">POWERED BY ALFAN FAUZY</p>
          <p className="text-gray-600 text-xs mt-2">
            © {getYear} PATTERN MIRROR
          </p>
        </div>
      </div>
    );
  }

  // Render Game Over Screen (1P)
  if (screen === "gameover" && gameMode === "1p") {
    return (
      <GameOverScreen
        score={gameState.p1.score}
        roundsCompleted={gameState.p1.round - 1}
        onPlayAgain={() => startGame("1p")}
        onMenu={goToMenu}
      />
    );
  }

  // Render Victory Screen (1P completed all rounds)
  if (screen === "victory" && gameMode === "1p") {
    return (
      <WinScreen
        score={gameState.p1.score}
        onPlayAgain={() => startGame("1p")}
        onMenu={goToMenu}
      />
    );
  }

  // Render 2P Victory Screen
  if (screen === "victory" && gameMode === "2p") {
    return (
      <VictoryScreen
        winner={gameState.winner as 1 | 2}
        p1Rounds={gameState.p1.round}
        p2Rounds={gameState.p2.round}
        onPlayAgain={() => startGame("2p")}
        onMenu={goToMenu}
      />
    );
  }

  // Render 1P Game Screen
  if (gameMode === "1p") {
    return (
      <div className="retro-bg min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <header className="w-full max-w-2xl flex justify-between items-center mb-4">
          <div className="retro-stat neon-text-cyan">
            ROUND {gameState.p1.round}/{MAX_ROUNDS}
          </div>
          <div className="retro-stat neon-text-yellow">
            SCORE: {gameState.p1.score}
          </div>
        </header>

        {/* Lives */}
        <div className="mb-4">
          <Hearts lives={gameState.p1.lives} color="cyan" />
        </div>

        {/* Grid Size & Mirror */}
        <h1 className="retro-title mb-2 text-lg md:text-xl">
          {gameState.p1.gridSize}×{gameState.p1.gridSize} GRID
        </h1>
        {gameState.p1.mirrorType !== "none" && (
          <div className="mb-4 text-center">
            <span className="neon-text-pink text-sm animate-pulse">
              {getMirrorLabel(gameState.p1.mirrorType)}
            </span>
          </div>
        )}

        {/* Copy Button */}
        <button
          onClick={() =>
            setGameState((prev) => ({
              ...prev,
              p1: {
                ...prev.p1,
                answer: prev.p1.pattern.map((row) => [...row]),
              },
            }))
          }
          className="retro-btn retro-btn-secondary px-4 py-2 text-xs rounded mb-4"
        >
          COPY PATTERN
        </button>

        {/* Grids */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
          <div className="flex flex-col items-center">
            <span className="retro-label mb-2">PATTERN</span>
            <Grid
              grid={gameState.p1.pattern}
              isInteractive={false}
              baseDelay={0}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="retro-label mb-2">ANSWER</span>
            <Grid
              grid={gameState.p1.answer}
              onCellClick={handle1PCellClick}
              isInteractive={gameState.p1.status === "playing"}
              baseDelay={30}
              className={
                p1Flash === "success"
                  ? "success-glow"
                  : p1Flash === "error"
                    ? "error-glow"
                    : ""
              }
            />
          </div>
        </div>

        {/* Check Button */}
        <button
          onClick={handle1PCheck}
          className="retro-btn retro-btn-primary px-10 py-4 text-sm md:text-base rounded-full mt-6"
          disabled={gameState.p1.status !== "playing"}
        >
          CHECK ✓
        </button>

        {/* Status */}
        {gameState.p1.status === "wrong" && (
          <div className="mt-4 text-center">
            <span className="neon-text-pink text-sm animate-pulse">
              WRONG! -1 LIFE
            </span>
          </div>
        )}
        {gameState.p1.status === "correct" && (
          <div className="mt-4 text-center">
            <span className="neon-text-cyan text-sm animate-pulse">
              CORRECT! +10 POINTS
            </span>
          </div>
        )}

        {/* Back */}
        <button
          onClick={goToMenu}
          className="mt-8 text-gray-500 text-xs hover:text-gray-300"
        >
          ← BACK TO MENU
        </button>
      </div>
    );
  }

  // Render 2P Game Screen
  return (
    <div className="retro-bg min-h-screen flex flex-col items-center justify-center p-2 md:p-4">
      {/* Title */}
      <h1 className="retro-title mb-2 text-lg md:text-2xl">BATTLE MODE</h1>

      {/* VS Indicator with Progress */}
      <div className="vs-header mb-4">
        <div className="vs-teams">
          <span className="neon-text-cyan">TEAM 1</span>
          <span className="vs-text">⚔️</span>
          <span className="neon-text-pink">TEAM 2</span>
        </div>
        {/* Combined Progress Bar */}
        <div className="vs-progress-container">
          <div className="vs-progress-track">
            <div
              className="vs-progress-p1"
              style={{ width: `${(gameState.p1.round / MAX_ROUNDS) * 50}%` }}
            />
            <div
              className="vs-progress-p2"
              style={{ width: `${(gameState.p2.round / MAX_ROUNDS) * 50}%` }}
            />
          </div>
          <div className="vs-progress-labels">
            <span className="neon-text-cyan">{gameState.p1.round}/10</span>
            <span className="vs-progress-target">FIRST TO 10 WINS</span>
            <span className="neon-text-pink">{gameState.p2.round}/10</span>
          </div>
        </div>
      </div>

      {/* Team Panels */}
      <div className="teams-container">
        <TeamPanel
          player={gameState.p1}
          teamName="TEAM 1"
          color="cyan"
          onCellClick={handleP1CellClick}
          onCheck={handleP1Check}
          flash={p1Flash}
          isWinner={gameState.winner === 1}
        />
        <TeamPanel
          player={gameState.p2}
          teamName="TEAM 2"
          color="pink"
          onCellClick={handleP2CellClick}
          onCheck={handleP2Check}
          flash={p2Flash}
          isWinner={gameState.winner === 2}
        />
      </div>

      {/* Back */}
      <button
        onClick={goToMenu}
        className="mt-4 text-gray-500 text-xs hover:text-gray-300"
      >
        ← BACK TO MENU
      </button>
    </div>
  );
}

export default App;
