"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Circle, Trophy, Frown, Handshake, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

// ============================================
// TYPES
// ============================================

type CellValue = "X" | "O" | null;
type BoardState = CellValue[];
type GameStatus = "playing" | "won" | "lost" | "draw";

interface TicTacToeProps {
  onGameEnd: (result: "won" | "lost" | "draw") => void;
  onAIMove: (board: BoardState, playerSymbol: "X" | "O") => Promise<number>;
  userName?: string;
  locale?: string;
}

// ============================================
// WINNING COMBINATIONS
// ============================================

const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal
  [2, 4, 6], // anti-diagonal
];

// ============================================
// COMPONENT
// ============================================

export function TicTacToe({ onGameEnd, onAIMove, userName, locale = "ru" }: TicTacToeProps) {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiComment, setAiComment] = useState<string | null>(null);

  const playerSymbol: CellValue = "X";
  const aiSymbol: CellValue = "O";

  // Check for winner
  const checkWinner = useCallback((currentBoard: BoardState): { winner: CellValue; cells: number[] } | null => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], cells: combo };
      }
    }
    return null;
  }, []);

  // Check for draw
  const checkDraw = useCallback((currentBoard: BoardState): boolean => {
    return currentBoard.every((cell) => cell !== null);
  }, []);

  // Handle player move
  const handleCellClick = async (index: number) => {
    if (board[index] || !isPlayerTurn || gameStatus !== "playing" || isAIThinking) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);

    // Check if player won
    const result = checkWinner(newBoard);
    if (result) {
      setWinningCells(result.cells);
      setGameStatus("won");
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#00ffff", "#ff00ff", "#00ff00"],
      });
      onGameEnd("won");
      return;
    }

    // Check for draw
    if (checkDraw(newBoard)) {
      setGameStatus("draw");
      onGameEnd("draw");
      return;
    }

    // AI turn
    setIsPlayerTurn(false);
    setIsAIThinking(true);
    setAiComment(locale === "ro" ? "Hmm, lasă-mă să mă gândesc..." : "Хмм, дай подумаю...");

    try {
      // Get AI move from API
      const aiMoveIndex = await onAIMove(newBoard, playerSymbol);

      // Validate AI move
      if (aiMoveIndex >= 0 && aiMoveIndex < 9 && newBoard[aiMoveIndex] === null) {
        const boardAfterAI = [...newBoard];
        boardAfterAI[aiMoveIndex] = aiSymbol;
        setBoard(boardAfterAI);

        // Check if AI won
        const aiResult = checkWinner(boardAfterAI);
        if (aiResult) {
          setWinningCells(aiResult.cells);
          setGameStatus("lost");
          setAiComment(locale === "ro" ? "Ha-ha! Am câștigat! 😎" : "Ха-ха! Я победил! 😎");
          onGameEnd("lost");
          return;
        }

        // Check for draw
        if (checkDraw(boardAfterAI)) {
          setGameStatus("draw");
          setAiComment(locale === "ro" ? "Remiză! Joci bine!" : "Ничья! Неплохо играешь!");
          onGameEnd("draw");
          return;
        }

        setAiComment(null);
      }
    } catch (error) {
      console.error("AI move error:", error);
      // Fallback: random move
      const emptyCells = newBoard.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);
      if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const boardAfterAI = [...newBoard];
        boardAfterAI[randomIndex] = aiSymbol;
        setBoard(boardAfterAI);
      }
      setAiComment(null);
    } finally {
      setIsAIThinking(false);
      setIsPlayerTurn(true);
    }
  };

  // Render cell content
  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winningCells.includes(index);

    return (
      <motion.button
        whileHover={!value && gameStatus === "playing" ? { scale: 1.05 } : {}}
        whileTap={!value && gameStatus === "playing" ? { scale: 0.95 } : {}}
        onClick={() => handleCellClick(index)}
        disabled={!!value || gameStatus !== "playing" || isAIThinking}
        className={`
          w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 transition-all duration-300
          flex items-center justify-center text-4xl font-bold
          ${isWinningCell
            ? "border-green-500 bg-green-500/20 shadow-[0_0_20px_rgba(0,255,0,0.5)]"
            : "border-border bg-card hover:border-primary/50"
          }
          ${!value && gameStatus === "playing" && !isAIThinking ? "cursor-pointer hover:bg-primary/5" : "cursor-default"}
          disabled:opacity-70
        `}
      >
        <AnimatePresence mode="wait">
          {value && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {value === "X" ? (
                <X className={`w-10 h-10 md:w-12 md:h-12 ${isWinningCell ? "text-green-400" : "text-primary"}`} strokeWidth={3} />
              ) : (
                <Circle className={`w-10 h-10 md:w-12 md:h-12 ${isWinningCell ? "text-green-400" : "text-accent"}`} strokeWidth={3} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  // Game status message
  const getStatusMessage = () => {
    switch (gameStatus) {
      case "won":
        return {
          icon: <Trophy className="w-8 h-8 text-yellow-400" />,
          title: locale === "ro"
            ? `Felicitări${userName ? `, ${userName}` : ""}! Ai câștigat! 🎉`
            : `Поздравляю${userName ? `, ${userName}` : ""}! Ты победил! 🎉`,
          subtitle: locale === "ro"
            ? "Reducerea de 10% e a ta! O să-l rog pe dezvoltator..."
            : "Скидка 10% твоя! Я попрошу разработчика...",
          color: "text-green-400",
        };
      case "lost":
        return {
          icon: <Frown className="w-8 h-8 text-red-400" />,
          title: locale === "ro" ? "Am câștigat! 😎" : "Я победил! 😎",
          subtitle: locale === "ro"
            ? "Data viitoare vei avea mai mult noroc!"
            : "В следующий раз повезёт больше!",
          color: "text-red-400",
        };
      case "draw":
        return {
          icon: <Handshake className="w-8 h-8 text-yellow-400" />,
          title: locale === "ro" ? "Remiză!" : "Ничья!",
          subtitle: locale === "ro" ? "Joc demn! 🤝" : "Достойная игра! 🤝",
          color: "text-yellow-400",
        };
      default:
        return {
          icon: <Sparkles className="w-6 h-6 text-primary" />,
          title: isPlayerTurn
            ? (locale === "ro" ? "Rândul tău!" : "Твой ход!")
            : (locale === "ro" ? "Mă gândesc..." : "Думаю..."),
          subtitle: locale === "ro" ? "Joci cu X" : "Ты играешь за X",
          color: "text-foreground",
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          {status.icon}
          <h3 className={`text-lg font-bold ${status.color}`}>{status.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{status.subtitle}</p>
      </motion.div>

      {/* AI Comment */}
      <AnimatePresence>
        {aiComment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2"
          >
            <p className="text-sm text-primary">{aiComment}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i}>{renderCell(i)}</div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-primary" />
          <span>{locale === "ro" ? "Tu" : "Ты"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-accent" />
          <span>AI</span>
        </div>
      </div>

      {/* Loading indicator */}
      {isAIThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="text-sm text-muted-foreground">{locale === "ro" ? "AI se gândește..." : "AI думает..."}</span>
        </motion.div>
      )}
    </div>
  );
}
